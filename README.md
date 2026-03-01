# API Model Benchmark Tool

OpenAI 兼容 API 模型基准测试工具。支持从 yunwu.ai 获取模型列表，自定义 Base URL 与 API Key，批量测试模型的可达率、首字延迟（TTFT）、吞吐量（字符/秒）。

## 技术栈

- Vue 3 + Composition API + TypeScript
- Vite + Tailwind CSS + Pinia + ECharts

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

产物在 `dist/`，可部署到任意静态托管。

## 使用说明

1. 在左侧设置中填写 **Base URL** 和 **API Key**（若 API 需要）。
2. 点击 **获取列表** 拉取模型列表，勾选需要测试的模型。
3. 可选：调整测试轮数、Prompt、max_tokens、超时等。
4. 点击 **开始测试**，等待完成后在右侧查看结果表格与图表。
5. 支持导出 JSON/CSV、按列排序、深色/浅色主题切换。
