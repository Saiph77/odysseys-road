# Odyssey's Road / 《归航》

基于《奥德赛》的**滚动驱动互动叙事**实验项目：序列帧 / 视频 scrub、多层 Renderer、可选本地头部追踪（MediaPipe），架构上预留 HTML-in-Canvas、Three.js、Web Audio。

> **当前状态（2026-09-05）**：**V2 MVP 实施中**，本次范围仅 Phase 0–3。
> Phase 0 主体与 Phase 1 序列渲染已实现；Phase 2 切点精修、Phase 3 shader 与部分验收待完成。
> 云端接续入口：[`V2_MVP_CLOUD_HANDOFF.md`](docs/handoff/V2_MVP_CLOUD_HANDOFF.md)。源码、配置和基线截图在 Git；完整序列帧须单独恢复。

## 先读什么

| 顺序 | 文档 | 内容 |
| --- | --- | --- |
| 1 | [`docs/TRAILER_INDEX.md`](docs/TRAILER_INDEX.md) | **宣传片最终索引**：四幕、43 锚点、标签、转场挂钩 |
| 2 | [`docs/REDESIGN.md`](docs/REDESIGN.md) | V2 工作区与待办 |
| 3 | [`docs/README.md`](docs/README.md) | 活跃文档索引 |
| 4 | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | 模块边界、契约、story.config schema |
| 4 | [`AGENTS.md`](AGENTS.md) | Agent 协作约束 |
| 5 | [`docs/reference/`](docs/reference/README.md) | Pear.no 技术参考索引 |
| 6 | [`tools/README.md`](tools/README.md) | 预告片抽帧与滚动预览 |
| — | [`archive/v1-60s-ai-roadshow/`](archive/v1-60s-ai-roadshow/) | V1 剧本 / Prompt / 决策（只读） |

## V1 归档说明

以下内容**不再作为活跃规格**，仅供查阅：

- 剧本：`archive/.../docs/scripts/`
- Prompt：`archive/.../prompts/`
- 决策与任务卡：`archive/.../docs/DECISIONS.md`、`TASKS.md`
- AI 抽帧素材：`archive/.../assets/ch01-opening/`

## 工具链

- **抽帧**：`tools/extract-sequence-frames.mjs`（ffmpeg）
- **预览**：`tools/sequence-scroll-preview/` + 本地 `python3 -m http.server`
- **参考实现**：`references/pear-no/`（只研究，不复用 Pear 素材）

运行时：Vite 6 + TypeScript + React 19。安装依赖后运行 `pnpm dev`；静态检查与单测用 `pnpm check`，构建用 `pnpm build`。素材恢复、Chromium 安装与截图注意事项见云端交接文档；不要把仅克隆仓库的缺帧状态当作渲染器故障。
