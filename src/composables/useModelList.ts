import { ref, computed } from 'vue'
import type { PricingApiResponse } from '../types'
import { useSettings } from './useSettings'
import { useBenchmarkStore } from '../stores/benchmark'

export function useModelList() {
  const { settings } = useSettings()
  const store = useBenchmarkStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const searchQuery = ref('')
  const tagFilter = ref<string>('')

  async function fetchModels() {
    loading.value = true
    error.value = null
    try {
      const url = settings.value.pricingApiUrl
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as PricingApiResponse
      if (!Array.isArray(data.data)) throw new Error('Invalid response format')
      store.setModelList(data.data)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  const filteredTextModels = computed(() => {
    let list = store.textModels
    const q = searchQuery.value.trim().toLowerCase()
    if (q) {
      list = list.filter((m) => m.model_name.toLowerCase().includes(q))
    }
    const tag = tagFilter.value.trim()
    if (tag) {
      list = list.filter((m) => m.tags.includes(tag))
    }
    return list
  })

  const allTags = computed(() => {
    const set = new Set<string>()
    for (const m of store.textModels) {
      m.tags.split(',').forEach((t) => {
        set.add(t.trim())
      })
    }
    return Array.from(set).filter(Boolean).sort()
  })

  return {
    loading,
    error,
    searchQuery,
    tagFilter,
    filteredTextModels,
    allTags,
    fetchModels,
  }
}
