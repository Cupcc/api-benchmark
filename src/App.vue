<script setup lang="ts">
import { ref } from 'vue'
import SettingsPanel from './components/SettingsPanel.vue'
import ModelSelector from './components/ModelSelector.vue'
import TestRunner from './components/TestRunner.vue'
import ResultsPanel from './components/ResultsPanel.vue'

const sidebarOpen = ref(true)
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6 shadow-sm">
      <div class="mx-auto flex max-w-[1800px] items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden transition-colors"
            aria-label="切换侧边栏"
            @click="sidebarOpen = !sidebarOpen"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-inner">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 class="text-xl font-bold tracking-tight text-slate-900">API Benchmark</h1>
          </div>
        </div>
      </div>
    </header>

    <div class="mx-auto flex max-w-[1800px] items-stretch p-4 md:p-6 gap-6">
      <aside
        class="w-96 shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0 md:h-[calc(100vh-8rem)] flex flex-col"
        :class="[
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'fixed inset-y-0 left-0 z-20 mt-[61px] overflow-y-auto bg-slate-50 p-4 md:static md:mt-0 md:bg-transparent md:p-0',
          'border-r border-slate-200 md:border-none shadow-xl md:shadow-none'
        ]"
      >
        <div class="flex flex-col gap-6 h-full min-h-0">
          <SettingsPanel />
          <ModelSelector class="flex-1 min-h-0" />
          <TestRunner />
        </div>
      </aside>

      <main class="min-w-0 flex-1">
        <ResultsPanel />
      </main>
    </div>

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-10 bg-slate-900/20 backdrop-blur-sm transition-opacity md:hidden"
      aria-hidden="true"
      @click="sidebarOpen = false"
    />
  </div>
</template>
