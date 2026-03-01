<script setup lang="ts">
import { computed } from 'vue'
import { useSettings } from '../composables/useSettings'
import { useBenchmark } from '../composables/useBenchmark'
import { useBenchmarkStore } from '../stores/benchmark'

const { settings } = useSettings()
const { runBenchmark } = useBenchmark()
const store = useBenchmarkStore()

async function start() {
  await runBenchmark(settings.value)
}

function stop() {
  store.requestStop()
}

const progressPercent = computed(() => {
  const { done, total } = store.progress
  return total > 0 ? Math.round((done / total) * 100) : 0
})
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 class="mb-4 text-base font-semibold text-slate-900 flex items-center gap-2">
      <svg class="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      运行控制
    </h2>

    <div class="flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="flex-1 inline-flex justify-center items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
        :disabled="store.isRunning || store.selectedModels.length === 0"
        @click="start"
      >
        <svg v-if="!store.isRunning" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <svg v-else class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ store.isRunning ? '测试进行中...' : '开始测试' }}
      </button>
      
      <button
        v-if="store.isRunning"
        type="button"
        class="inline-flex justify-center items-center rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
        @click="stop"
      >
        停止
      </button>
    </div>

    <div v-if="store.isRunning || store.progress.total > 0" class="mt-5 space-y-2">
      <div class="flex justify-between text-sm font-medium">
        <span class="text-slate-700">整体进度</span>
        <span class="text-blue-600">{{ store.progress.done }} / {{ store.progress.total }}</span>
      </div>
      <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          class="h-full bg-blue-600 transition-all duration-500 ease-out"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
      <div v-if="store.currentModel" class="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm border border-slate-100">
        <span class="text-slate-500 mr-2">正在测试:</span>
        <span class="font-mono font-medium text-slate-900">{{ store.currentModel }}</span>
      </div>
    </div>

  </div>
</template>
