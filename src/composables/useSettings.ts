import { ref, watch } from 'vue'
import type { Settings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

const STORAGE_KEY = 'api-benchmark-settings'

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>
      // Backward compatibility: switch to relative path to use proxy and avoid CORS
      if (parsed.pricingApiUrl === 'https://yunwu.ai/api/pricing_new') {
        parsed.pricingApiUrl = '/api/pricing_new'
      }
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_SETTINGS }
}

function save(s: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // ignore
  }
}

export function useSettings() {
  const settings = ref<Settings>(load())

  watch(
    settings,
    (val) => save(val),
    { deep: true }
  )

  function reset() {
    settings.value = { ...DEFAULT_SETTINGS }
  }

  return { settings, reset }
}
