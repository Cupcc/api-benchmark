import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { ModelInfo, TestResult } from '../types'

const MODEL_LIST_STORAGE_KEY = 'api-benchmark-model-list'

function loadModelList(): ModelInfo[] {
  try {
    const raw = localStorage.getItem(MODEL_LIST_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as ModelInfo[]
  } catch {
    return []
  }
}

function saveModelList(list: ModelInfo[]) {
  try {
    localStorage.setItem(MODEL_LIST_STORAGE_KEY, JSON.stringify(list))
  } catch {
    // ignore persistence errors
  }
}

export const useBenchmarkStore = defineStore('benchmark', () => {
  const modelList = ref<ModelInfo[]>(loadModelList())
  const selectedModelNames = ref<Set<string>>(new Set())
  const results = ref<Map<string, TestResult>>(new Map())
  const isRunning = ref(false)
  const stopRequested = ref(false)
  const currentModel = ref<string | null>(null)
  const progress = ref({ done: 0, total: 0 })

  const textModels = computed(() =>
    modelList.value.filter((m) => m.model_type === '文本')
  )

  const selectedModels = computed(() =>
    textModels.value.filter((m) => selectedModelNames.value.has(m.model_name))
  )

  const resultsList = computed(() => Array.from(results.value.values()))

  function setModelList(list: ModelInfo[]) {
    modelList.value = list
  }

  function toggleModel(name: string) {
    const next = new Set(selectedModelNames.value)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    selectedModelNames.value = next
    syncResultsWithSelection()
  }

  function selectAll(modelNames?: string[]) {
    if (modelNames) {
      selectedModelNames.value = new Set(modelNames)
      syncResultsWithSelection()
      return
    }
    selectedModelNames.value = new Set(textModels.value.map((m) => m.model_name))
    syncResultsWithSelection()
  }

  function selectNone() {
    selectedModelNames.value = new Set()
    syncResultsWithSelection()
  }

  function setResult(model: string, result: TestResult) {
    const next = new Map(results.value)
    next.set(model, result)
    results.value = next
  }

  function clearResults() {
    results.value = new Map()
  }

  function initResults(models: string[]) {
    const next = new Map(results.value)
    for (const m of models) {
      next.set(m, {
        model: m,
        rounds: [],
        avgTTFT: 0,
        avgThroughput: 0,
        successRate: 0,
        status: 'pending',
      })
    }
    results.value = next
  }

  function syncResultsWithSelection() {
    const selected = selectedModelNames.value
    const next = new Map<string, TestResult>()

    for (const modelName of selected) {
      const existing = results.value.get(modelName)
      next.set(
        modelName,
        existing ?? {
          model: modelName,
          rounds: [],
          avgTTFT: 0,
          avgThroughput: 0,
          successRate: 0,
          status: 'pending',
        }
      )
    }

    results.value = next
  }

  function requestStop() {
    stopRequested.value = true
  }

  watch(
    modelList,
    (list) => saveModelList(list),
    { deep: true }
  )

  return {
    modelList,
    selectedModelNames,
    results,
    isRunning,
    stopRequested,
    currentModel,
    progress,
    requestStop,
    textModels,
    selectedModels,
    resultsList,
    setModelList,
    toggleModel,
    selectAll,
    selectNone,
    setResult,
    clearResults,
    initResults,
    syncResultsWithSelection,
  }
})
