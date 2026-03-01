<script setup lang="ts">
import { useModelList } from '../composables/useModelList'
import { useBenchmarkStore } from '../stores/benchmark'

const {
  loading,
  error,
  searchQuery,
  tagFilter,
  filteredTextModels,
  allTags,
  fetchModels,
} = useModelList()

const store = useBenchmarkStore()

function isSelected(name: string) {
  return store.selectedModelNames.has(name)
}

function toggle(name: string) {
  store.toggleModel(name)
}

function selectFiltered() {
  const names = filteredTextModels.value.map((m) => m.model_name)
  store.selectAll(names)
}
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-h-0">
    <h2 class="mb-4 text-base font-semibold text-slate-900 flex items-center gap-2">
      <svg class="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      模型选择
      <span class="ml-auto text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
        已选 {{ store.selectedModels.length }} 项
      </span>
    </h2>

    <div class="mb-4 flex flex-wrap gap-2">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
        :disabled="loading"
        @click="fetchModels"
      >
        <svg v-if="loading" class="h-4 w-4 animate-spin text-slate-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ loading ? '加载中...' : '刷新列表' }}
      </button>
      <button
        type="button"
        class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        @click="selectFiltered"
      >
        全选
      </button>
      <button
        type="button"
        class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        @click="store.selectNone"
      >
        清空
      </button>
    </div>

    <div v-if="error" class="mb-3 rounded-md bg-red-50 p-3 border border-red-200">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <p class="ml-3 text-sm text-red-700">{{ error }}</p>
      </div>
    </div>

    <div class="mb-3 flex flex-col gap-2 sm:flex-row">
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          class="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow"
          placeholder="搜索模型名称..."
        />
      </div>
      <select
        v-model="tagFilter"
        class="w-full sm:w-auto sm:min-w-[7.5rem] sm:shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow"
      >
        <option value="">全部标签</option>
        <option v-for="t in allTags" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>

    <div class="flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50">
      <ul class="divide-y divide-slate-100">
        <li
          v-for="m in filteredTextModels"
          :key="m.model_name"
          class="group flex cursor-pointer items-center gap-2 px-3 py-2.5 transition-colors"
          :class="isSelected(m.model_name)
            ? 'bg-blue-50 border-l-2 border-blue-500 text-blue-900'
            : 'border-l-2 border-transparent hover:bg-slate-100'"
          @click="toggle(m.model_name)"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <span
                class="truncate text-sm font-medium transition-colors"
                :class="isSelected(m.model_name) ? 'text-blue-700' : 'text-slate-900 group-hover:text-blue-600'"
                :title="m.description"
              >
                {{ m.model_name }}
              </span>
              <span v-if="m.tags" class="shrink-0 text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200">
                {{ m.tags }}
              </span>
            </div>
          </div>
        </li>
        <li v-if="!loading && filteredTextModels.length === 0" class="px-4 py-8 text-center text-sm text-slate-500">
          <svg class="mx-auto h-8 w-8 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          {{ error ? '加载失败' : '没有找到匹配的模型' }}
        </li>
      </ul>
    </div>
  </div>
</template>
