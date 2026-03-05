<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import type { TestResult } from '../types'
import { useBenchmarkStore } from '../stores/benchmark'
import { useSettings } from '../composables/useSettings'

const store = useBenchmarkStore()
const { settings } = useSettings()

type SortKey = 'model' | 'successRate' | 'avgTTFT' | 'avgThroughput'
const sortKey = ref<SortKey>('avgTTFT')
const sortAsc = ref(true)
const chartTTFTSortAsc = ref(true)
const chartThroughputSortAsc = ref(true)

const sortedResults = computed(() => {
  const list = [...store.resultsList]
  list.sort((a, b) => {
    let va: number | string
    let vb: number | string
    switch (sortKey.value) {
      case 'model':
        va = a.model
        vb = b.model
        break
      case 'successRate':
        va = a.successRate
        vb = b.successRate
        break
      case 'avgTTFT':
        va = a.avgTTFT
        vb = b.avgTTFT
        break
      case 'avgThroughput':
        va = a.avgThroughput
        vb = b.avgThroughput
        break
      default:
        return 0
    }
    const cmp = typeof va === 'string' ? va.localeCompare(vb as string) : va - (vb as number)
    return sortAsc.value ? cmp : -cmp
  })
  return list
})

function toggleSort(key: SortKey) {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value
  else {
    sortKey.value = key
    sortAsc.value = key === 'model'
  }
}

function statusClass(status: TestResult['status']) {
  switch (status) {
    case 'done':
      return 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-600/20'
    case 'running':
      return 'text-blue-700 bg-blue-50 ring-1 ring-blue-600/20 animate-pulse'
    case 'error':
      return 'text-red-700 bg-red-50 ring-1 ring-red-600/20'
    default:
      return 'text-slate-600 bg-slate-100 ring-1 ring-slate-500/20'
  }
}

function statusLabel(status: TestResult['status']) {
  switch (status) {
    case 'done':
      return '完成'
    case 'running':
      return '测试中'
    case 'error':
      return '失败'
    default:
      return '待测'
  }
}

function exportJSON() {
  const data = store.resultsList.map((r) => ({
    model: r.model,
    successRate: r.successRate,
    avgTTFT: r.avgTTFT,
    avgThroughput: r.avgThroughput,
    minTTFT: r.minTTFT,
    maxTTFT: r.maxTTFT,
    rounds: r.rounds.length,
  }))
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `benchmark-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function exportCSV() {
  const headers = ['model', 'successRate', 'avgTTFT(ms)', 'avgThroughput(chars/s)', 'minTTFT', 'maxTTFT', 'rounds']
  const rows = store.resultsList.map((r) =>
    [r.model, r.successRate, r.avgTTFT.toFixed(2), r.avgThroughput.toFixed(2), r.minTTFT ?? '', r.maxTTFT ?? '', r.rounds.length].join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `benchmark-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

let chartTTFT: ECharts | null = null
let chartThroughput: ECharts | null = null
const chartTTFTEl = ref<HTMLDivElement | null>(null)
const chartThroughputEl = ref<HTMLDivElement | null>(null)

function getChartSeries(metric: 'avgTTFT' | 'avgThroughput', asc: boolean) {
  const list = store.resultsList
    .slice()
    .sort((a, b) => (asc ? a[metric] - b[metric] : b[metric] - a[metric]))

  return {
    models: list.map((r) => r.model),
    values: list.map((r) => Math.round(r[metric])),
  }
}

function updateCharts() {
  const ttftSeries = getChartSeries('avgTTFT', chartTTFTSortAsc.value)
  const throughputSeries = getChartSeries('avgThroughput', chartThroughputSortAsc.value)

  if (chartTTFT) {
    chartTTFT.setOption({
      grid: { left: '18%', right: 20, top: 20, bottom: 20 },
      xAxis: { type: 'value', axisLine: { lineStyle: { color: '#94a3b8' } }, splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } } },
      yAxis: { type: 'category', data: ttftSeries.models, axisLine: { lineStyle: { color: '#cbd5e1' } }, axisLabel: { color: '#475569', fontSize: 11, width: 120, overflow: 'truncate' } },
      series: [{ 
        type: 'bar', 
        data: ttftSeries.values, 
        itemStyle: { color: '#3b82f6', borderRadius: [0, 4, 4, 0] },
        barMaxWidth: 32
      }],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      animationDuration: 300,
      animationDurationUpdate: 300,
    })
  }
  if (chartThroughput) {
    chartThroughput.setOption({
      grid: { left: '18%', right: 20, top: 20, bottom: 20 },
      xAxis: { type: 'value', axisLine: { lineStyle: { color: '#94a3b8' } }, splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } } },
      yAxis: { type: 'category', data: throughputSeries.models, axisLine: { lineStyle: { color: '#cbd5e1' } }, axisLabel: { color: '#475569', fontSize: 11, width: 120, overflow: 'truncate' } },
      series: [{ 
        type: 'bar', 
        data: throughputSeries.values, 
        itemStyle: { color: '#10b981', borderRadius: [0, 4, 4, 0] },
        barMaxWidth: 32
      }],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      animationDuration: 300,
      animationDurationUpdate: 300,
    })
  }
}

watch(chartTTFTEl, (el) => {
  if (el) {
    chartTTFT = echarts.init(el)
    updateCharts()
  } else if (chartTTFT) {
    chartTTFT.dispose()
    chartTTFT = null
  }
}, { flush: 'post' })

watch(chartThroughputEl, (el) => {
  if (el) {
    chartThroughput = echarts.init(el)
    updateCharts()
  } else if (chartThroughput) {
    chartThroughput.dispose()
    chartThroughput = null
  }
}, { flush: 'post' })

watch(() => store.resultsList, () => updateCharts(), { deep: true })

function handleResize() {
  chartTTFT?.resize()
  chartThroughput?.resize()
}

window.addEventListener('resize', handleResize)

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartTTFT?.dispose()
  chartThroughput?.dispose()
})
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm min-h-[calc(100vh-8rem)]">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-slate-900">
          测试结果看板
        </h2>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          :disabled="store.resultsList.length === 0"
          @click="exportJSON"
        >
          <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          JSON
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          :disabled="store.resultsList.length === 0"
          @click="exportCSV"
        >
          <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          CSV
        </button>
      </div>
    </div>

    <div v-if="store.resultsList.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <svg class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="text-sm font-medium text-slate-900">暂无测试结果</h3>
      <p class="mt-1 text-sm text-slate-500">请在左侧配置并选择模型后，点击开始测试</p>
    </div>

    <template v-else>
      <div class="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="bg-slate-50">
              <tr class="text-slate-600 font-medium border-b border-slate-200 whitespace-nowrap">
                <th class="cursor-pointer px-4 py-3 hover:bg-slate-100 transition-colors" @click="toggleSort('model')">
                  <div class="flex items-center gap-1">
                    模型
                    <span v-if="sortKey === 'model'" class="text-blue-600">{{ sortAsc ? '↑' : '↓' }}</span>
                    <span v-else class="text-slate-300">↕</span>
                  </div>
                </th>
                <th class="cursor-pointer px-4 py-3 hover:bg-slate-100 transition-colors" @click="toggleSort('successRate')">
                  <div class="flex items-center gap-1">
                    成功率
                    <span v-if="sortKey === 'successRate'" class="text-blue-600">{{ sortAsc ? '↑' : '↓' }}</span>
                    <span v-else class="text-slate-300">↕</span>
                  </div>
                </th>
                <th class="cursor-pointer px-4 py-3 hover:bg-slate-100 transition-colors" @click="toggleSort('avgTTFT')">
                  <div class="flex items-center gap-1">
                    首字延迟(ms)
                    <span v-if="sortKey === 'avgTTFT'" class="text-blue-600">{{ sortAsc ? '↑' : '↓' }}</span>
                    <span v-else class="text-slate-300">↕</span>
                  </div>
                </th>
                <th class="cursor-pointer px-4 py-3 hover:bg-slate-100 transition-colors" @click="toggleSort('avgThroughput')">
                  <div class="flex items-center gap-1">
                    吞吐量(字/s)
                    <span v-if="sortKey === 'avgThroughput'" class="text-blue-600">{{ sortAsc ? '↑' : '↓' }}</span>
                    <span v-else class="text-slate-300">↕</span>
                  </div>
                </th>
                <th class="px-4 py-3 text-slate-500 font-medium">
                  最小/最大(ms)
                </th>
                <th class="px-4 py-3 text-slate-500 font-medium">轮次</th>
                <th class="px-4 py-3 text-slate-500 font-medium">状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              <tr
                v-for="r in sortedResults"
                :key="r.model"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="px-4 py-3 max-w-[260px]">
                  <div class="font-mono text-sm font-medium text-slate-900 truncate" :title="r.model">{{ r.model }}</div>
                  <div v-if="r.error" class="mt-1 text-xs text-red-500 font-normal whitespace-normal break-all line-clamp-2" :title="r.error">{{ r.error }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <div class="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        class="h-full rounded-full" 
                        :class="r.successRate > 0.8 ? 'bg-emerald-500' : (r.successRate > 0.5 ? 'bg-amber-500' : 'bg-red-500')"
                        :style="{ width: `${r.successRate * 100}%` }"
                      ></div>
                    </div>
                    <span class="text-slate-700">{{ (r.successRate * 100).toFixed(0) }}%</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-700 whitespace-nowrap">
                  {{ r.status === 'error' || r.successRate === 0 ? '-' : r.avgTTFT.toFixed(0) }}
                </td>
                <td class="px-4 py-3 text-slate-700 whitespace-nowrap">
                  {{ r.status === 'error' || r.successRate === 0 ? '-' : r.avgThroughput.toFixed(1) }}
                </td>
                <td class="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                  {{ r.minTTFT != null && r.maxTTFT != null && r.successRate > 0 ? `${r.minTTFT.toFixed(0)} / ${r.maxTTFT.toFixed(0)}` : '-' }}
                </td>
                <td class="px-4 py-3 text-slate-700 whitespace-nowrap">
                  {{ r.rounds.length }} / {{ settings.roundsPerModel }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="inline-flex items-center justify-center min-w-[4em] px-2 py-1 rounded-md text-xs font-medium" :class="statusClass(r.status)">
                    {{ statusLabel(r.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-8 grid gap-6 xl:grid-cols-2">
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-800">首字延迟 (ms)</h3>
            <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                class="rounded-md px-2 py-1 text-xs font-medium transition-colors"
                :class="chartTTFTSortAsc ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                @click="chartTTFTSortAsc = true; updateCharts()"
              >
                升序
              </button>
              <button
                type="button"
                class="rounded-md px-2 py-1 text-xs font-medium transition-colors"
                :class="!chartTTFTSortAsc ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                @click="chartTTFTSortAsc = false; updateCharts()"
              >
                降序
              </button>
            </div>
          </div>
          <div ref="chartTTFTEl" class="h-80 w-full" />
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-800">吞吐量 (字符/秒)</h3>
            <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                class="rounded-md px-2 py-1 text-xs font-medium transition-colors"
                :class="chartThroughputSortAsc ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                @click="chartThroughputSortAsc = true; updateCharts()"
              >
                升序
              </button>
              <button
                type="button"
                class="rounded-md px-2 py-1 text-xs font-medium transition-colors"
                :class="!chartThroughputSortAsc ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                @click="chartThroughputSortAsc = false; updateCharts()"
              >
                降序
              </button>
            </div>
          </div>
          <div ref="chartThroughputEl" class="h-80 w-full" />
        </div>
      </div>
    </template>
  </div>
</template>

</template>
