/** Model item from pricing API (e.g. yunwu.ai/api/pricing_new) */
export interface ModelInfo {
  model_name: string
  description: string
  tags: string
  model_type: string
  vendor_id: number
  sort_order: number
  enable_groups?: string[]
  supported_endpoint_types?: string[]
}

/** API response from pricing_new */
export interface PricingApiResponse {
  auto_groups?: string[]
  data: ModelInfo[]
  success?: boolean
}

/** Single round of benchmark for one model */
export interface TestRound {
  success: boolean
  error?: string
  ttft: number       // ms, Time To First Token
  totalTime: number  // ms
  totalChars: number
  throughput: number // chars/s
}

/** Aggregated result for one model across rounds */
export type TestResultStatus = 'pending' | 'running' | 'done' | 'error'

export interface TestResult {
  model: string
  rounds: TestRound[]
  avgTTFT: number
  avgThroughput: number
  successRate: number  // 0-1
  status: TestResultStatus
  minTTFT?: number
  maxTTFT?: number
  error?: string
}

/** User settings persisted to localStorage */
export interface Settings {
  baseUrl: string
  apiKey: string
  pricingApiUrl: string
  roundsPerModel: number
  testPrompt: string
  maxTokens: number
  connectionTimeoutMs: number
  firstTokenTimeoutMs: number
}

export const DEFAULT_SETTINGS: Settings = {
  baseUrl: 'https://yunwu.ai',
  apiKey: '',
  pricingApiUrl: '/api/pricing_new',
  roundsPerModel: 3,
  testPrompt: '请用100字介绍一下人工智能',
  maxTokens: 200,
  connectionTimeoutMs: 5_000,   // 连接超时 5 秒
  firstTokenTimeoutMs: 30_000,  // 首字超时 30 秒
}
