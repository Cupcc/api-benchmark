<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSettings } from '../composables/useSettings'

const { settings, reset } = useSettings()
const showApiKey = ref(false)

const baseUrl = computed({
  get: () => settings.value.baseUrl,
  set: (v: string) => { settings.value = { ...settings.value, baseUrl: v.trim() } },
})
const apiKey = computed({
  get: () => settings.value.apiKey,
  set: (v: string) => { settings.value = { ...settings.value, apiKey: v } },
})
const pricingApiUrl = computed({
  get: () => settings.value.pricingApiUrl,
  set: (v: string) => { settings.value = { ...settings.value, pricingApiUrl: v.trim() } },
})
const roundsPerModel = computed({
  get: () => settings.value.roundsPerModel,
  set: (v: number) => { settings.value = { ...settings.value, roundsPerModel: Math.max(1, Math.min(10, v)) } },
})
const testPrompt = computed({
  get: () => settings.value.testPrompt,
  set: (v: string) => { settings.value = { ...settings.value, testPrompt: v } },
})
const maxTokens = computed({
  get: () => settings.value.maxTokens,
  set: (v: number) => { settings.value = { ...settings.value, maxTokens: Math.max(10, Math.min(2000, v)) } },
})
const requestTimeoutMs = computed({
  get: () => settings.value.requestTimeoutMs,
  set: (v: number) => { settings.value = { ...settings.value, requestTimeoutMs: Math.max(5000, Math.min(120000, v)) } },
})
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-base font-semibold text-slate-900 flex items-center gap-2">
        <svg class="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        配置设置
      </h2>
      <button
        type="button"
        class="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline focus:outline-none"
        @click="reset"
      >
        恢复默认
      </button>
    </div>

    <div class="space-y-4">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700">Base URL</label>
        <input
          v-model="baseUrl"
          type="url"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow"
          placeholder="https://yunwu.ai"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700">API Key</label>
        <div class="relative">
          <input
            :type="showApiKey ? 'text' : 'password'"
            :value="apiKey"
            @input="apiKey = ($event.target as HTMLInputElement).value"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow"
            placeholder="Bearer token"
          />
          <button
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none"
            :aria-label="showApiKey ? '隐藏' : '显示'"
            @click="showApiKey = !showApiKey"
          >
            <svg v-if="!showApiKey" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </button>
        </div>
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700">模型列表 API</label>
        <input
          v-model="pricingApiUrl"
          type="url"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow"
          placeholder="https://yunwu.ai/api/pricing_new"
        />
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">每模型轮数</label>
          <input
            v-model.number="roundsPerModel"
            type="number"
            min="1"
            max="10"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Max Tokens</label>
          <input
            v-model.number="maxTokens"
            type="number"
            min="10"
            max="2000"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">超时 (ms)</label>
          <input
            v-model.number="requestTimeoutMs"
            type="number"
            min="5000"
            max="120000"
            step="1000"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow"
          />
        </div>
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700">测试 Prompt</label>
        <textarea
          v-model="testPrompt"
          rows="2"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow resize-none"
          placeholder="请用100字介绍一下人工智能"
        />
      </div>
    </div>
  </div>
</template>
