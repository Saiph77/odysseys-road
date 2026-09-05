# V2 重新设计 · 工作区

> 更新：2026-09-05  
> 状态：**编排已拍板，进入实施** — 见 [`V2_ORCHESTRATION_PROPOSAL.md`](V2_ORCHESTRATION_PROPOSAL.md) 与 [`V2_IMPLEMENTATION_PLAN.md`](V2_IMPLEMENTATION_PLAN.md)

## 背景

V1（60 秒 AI 油画路演）已归档，原因见 [`archive/v1-60s-ai-roadshow/README.md`](../archive/v1-60s-ai-roadshow/README.md)。

V2 方向：

- **素材**：官方《奥德赛》电影预告片（用户稍后提供片段 / 时间线）。
- **叙事**：全新剧本与章节结构（重写，不沿用 V1 六章表）。
- **交互**：全新 UX 流程（重写）；仅保留 V1 验证过的**技术模式**作参考（滚动驱动、序列帧、头部追踪、DOM/Canvas 分层等）。

## 已从 V1 保留的能力（技术）

| 能力 | 参考 |
| --- | --- |
| 滚动 → Road → SceneFrame → Renderer | `ARCHITECTURE.md` §3 |
| 视频 / 序列帧抽取与 scrub 预览 | `tools/` |
| 多平面选择 + 累计停留 | `TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md` |
| 固定帧 + 头部取景 | `HEAD_COUPLED_PEEK_TECHNICAL_DESIGN.md` |
| Pear 滚动 / WebGL / Canvas 合成 | `docs/reference/`、`references/pear-no/` |

## 待用户交付

- [x] 预告片源文件 + 全长序列 `official-trailer`（3522 帧 @ 24fps）
- [x] **最终索引大纲** → [`docs/TRAILER_INDEX.md`](TRAILER_INDEX.md)
- [x] V2 互动章节设计 → [`V2_ORCHESTRATION_PROPOSAL.md`](V2_ORCHESTRATION_PROPOSAL.md)（2026-09-05）
- [ ] 按章切分 6 个子段序列并滚动验收 → 实施计划 Phase 1（V2-1.1）

## Agent 收到大纲后的建议流程

1. 按时间线用 ffprobe 核对源片；必要时 `--start` / `--duration` 抽段。
2. `node tools/extract-sequence-frames.mjs` 导出到 `public/assets/sequences/<id>/`。
3. `tools/sequence-scroll-preview` 滚动验收密度与手感。
4. 起草 V2 `story.config` 骨架与新 DECISIONS / TASKS（**不**从 archive 复制叙事正文）。
5. 交互稿与 V1 技术模式对照，明确哪些保留、哪些废弃。

## 素材目录（V2）

```text
public/assets/
├── sequences/<asset-id>/desktop/frame-0001.*
├── video/                    # 可选：预告片片段
└── README.md
```

## 明确不做（直到新决策）

- 不恢复 V1 AI 油画 Prompt 与 `prompts/` 工作流（已归档）。
- 不假设仍为「60 秒 / 三 Track / 神谕镜」结构，除非新大纲写明。
