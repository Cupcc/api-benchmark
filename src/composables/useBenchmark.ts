import type { Settings, TestRound } from '../types'
import { useBenchmarkStore } from '../stores/benchmark'

interface StreamChunk {
  choices?: Array<{ delta?: { content?: string }; finish_reason?: string }>
}

function parseSSELine(line: string): StreamChunk | null {
  const trimmed = line.trim()
  if (trimmed.startsWith('data: ')) {
    const payload = trimmed.slice(6)
    if (payload === '[DONE]') return null
    try {
      return JSON.parse(payload) as StreamChunk
    } catch {
      return null
    }
  }
  return null
}

async function runOneStreamRound(
  model: string,
  settings: Settings
): Promise<TestRound> {
  const startTime = performance.now()
  let firstTokenTime: number | null = null
  let totalChars = 0
  const url = `${settings.baseUrl.replace(/\/$/, '')}/v1/chat/completions`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), settings.requestTimeoutMs)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: settings.apiKey ? `Bearer ${settings.apiKey}` : '',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: settings.testPrompt }],
        stream: true,
        max_tokens: settings.maxTokens,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const text = await res.text()
      let errMsg = `HTTP ${res.status}`
      try {
        const json = JSON.parse(text)
        if (json?.error?.message) errMsg = json.error.message
      } catch {
        if (text) errMsg += `: ${text.slice(0, 200)}`
      }
      return {
        success: false,
        error: errMsg,
        ttft: 0,
        totalTime: performance.now() - startTime,
        totalChars: 0,
        throughput: 0,
      }
    }

    const reader = res.body?.getReader()
    if (!reader) {
      return {
        success: false,
        error: 'No response body',
        ttft: 0,
        totalTime: performance.now() - startTime,
        totalChars: 0,
        throughput: 0,
      }
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const chunk = parseSSELine(line)
        if (!chunk) continue
        if (chunk.choices?.[0]?.delta?.content != null) {
          const content = chunk.choices[0].delta.content
          if (firstTokenTime == null) firstTokenTime = performance.now()
          totalChars += content.length
        }
      }
    }

    const endTime = performance.now()
    const totalTime = endTime - startTime

    if (totalChars === 0 || firstTokenTime == null) {
      return {
        success: false,
        error: 'No content received (empty stream)',
        ttft: 0,
        totalTime,
        totalChars: 0,
        throughput: 0,
      }
    }

    const ttft = firstTokenTime - startTime
    const throughput = totalTime > 0 ? (totalChars / totalTime) * 1000 : 0

    return {
      success: true,
      ttft,
      totalTime,
      totalChars,
      throughput,
    }
  } catch (e) {
    clearTimeout(timeoutId)
    const msg = e instanceof Error ? e.message : String(e)
    return {
      success: false,
      error: msg,
      ttft: 0,
      totalTime: performance.now() - startTime,
      totalChars: 0,
      throughput: 0,
    }
  }
}

export async function runBenchmark(settings: Settings) {
  const store = useBenchmarkStore()
  const models = store.selectedModels.map((m) => m.model_name)
  if (models.length === 0) return

  store.isRunning = true
  store.stopRequested = false
  store.clearResults()
  store.initResults(models)
  const total = models.length * settings.roundsPerModel
  store.progress = { done: 0, total }

  for (const model of models) {
    if (store.stopRequested) break
    store.currentModel = model
    const rounds: TestRound[] = []

    for (let r = 0; r < settings.roundsPerModel; r++) {
      if (store.stopRequested) break
      const result = await runOneStreamRound(model, settings)
      rounds.push(result)
      store.progress = { done: store.progress.done + 1, total }

      const successCount = rounds.filter((x) => x.success).length
      const successRounds = rounds.filter((x) => x.success)
      const avgTTFT =
        successRounds.length > 0
          ? successRounds.reduce((a, x) => a + x.ttft, 0) / successRounds.length
          : 0
      const avgThroughput =
        successRounds.length > 0
          ? successRounds.reduce((a, x) => a + x.throughput, 0) / successRounds.length
          : 0
      const ttfts = successRounds.map((x) => x.ttft)
      const minTTFT = ttfts.length ? Math.min(...ttfts) : 0
      const maxTTFT = ttfts.length ? Math.max(...ttfts) : 0

      store.setResult(model, {
        model,
        rounds: [...rounds],
        avgTTFT,
        avgThroughput,
        successRate: successCount / rounds.length,
        status: 'running',
        minTTFT,
        maxTTFT,
      })
    }

    const successRounds = rounds.filter((x) => x.success)
    const failedRounds = rounds.filter((x) => !x.success)
    const avgTTFT =
      successRounds.length > 0
        ? successRounds.reduce((a, x) => a + x.ttft, 0) / successRounds.length
        : 0
    const avgThroughput =
      successRounds.length > 0
        ? successRounds.reduce((a, x) => a + x.throughput, 0) / successRounds.length
        : 0
    const ttfts = successRounds.map((x) => x.ttft)
    const allFailed = successRounds.length === 0
    const firstError = failedRounds.find((x) => x.error)?.error

    store.setResult(model, {
      model,
      rounds,
      avgTTFT,
      avgThroughput,
      successRate: rounds.filter((x) => x.success).length / rounds.length,
      status: allFailed ? 'error' : 'done',
      minTTFT: ttfts.length ? Math.min(...ttfts) : undefined,
      maxTTFT: ttfts.length ? Math.max(...ttfts) : undefined,
      error: firstError,
    })
  }

  store.currentModel = null
  store.isRunning = false
}

export function useBenchmark() {
  return { runBenchmark }
}
