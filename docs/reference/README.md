# Pear 技术参考 · 索引

> 更新日期：2026-09-05  
> 类别：docs（技术参考，非 V2 叙事规格）  
> 源码快照：[`references/pear-no/`](../../references/pear-no/)（上游 amasun/Pear-no，基础提交 `c9c094c`，快照日 2026-09-05）

本目录是对 Pear.no **已运行参考实现**的研读笔记。目标是抽出可迁移到《归航》的滚动、合成、转场与交互**技术模式**，不是复用其品牌、文案或素材。

使用边界见 [`references/pear-no/REFERENCE_SNAPSHOT.md`](../../references/pear-no/REFERENCE_SNAPSHOT.md)。

## 先读什么

| 顺序 | 文档 | 何时打开 |
| --- | --- | --- |
| 1 | 本文 | 找文件、定阅读路径 |
| 2 | [`PEAR_TECH_REFERENCE.md`](PEAR_TECH_REFERENCE.md) | 要总览：Road 时间轴、层叠、迁移结论 |
| 3 | 分册 01–03 | 要落地某一层渲染或交互 |
| — | [`PEAR_ARCHITECTURE_AUDIT.md`](PEAR_ARCHITECTURE_AUDIT.md) | 对照本仓库模块边界，看哪些模式该抽象、哪些坏味道要避开 |
| — | [`PEAR_HERO_TRANSITION_STUDY.md`](PEAR_HERO_TRANSITION_STUDY.md) | 做开场 / 复合转场方案（视频 vs 实时叠加） |

V2 契约与交互设计不在本目录：入口见 [`../README.md`](../README.md)。

## 文件一览

| 文件 | 用途 | 主要对应源码 |
| --- | --- | --- |
| [`PEAR_TECH_REFERENCE.md`](PEAR_TECH_REFERENCE.md) | 手册总览：单一 scroll 入口、逻辑 Road、handoff、素材规格、迁移取舍 | `App.jsx` `timeline.js` `index.css` `films.js` |
| [`PEAR_TECH_01_WEBGL_SHADER.md`](PEAR_TECH_01_WEBGL_SHADER.md) | 分册 01：Hero WebGL 宿主、cover-fit、序列帧纹理、GLSL 转场库 | `HeroCanvas.jsx` `hero_main_fragment.glsl` `FooterTransitionCanvas.jsx` |
| [`PEAR_TECH_02_CANVAS_DOM_FX.md`](PEAR_TECH_02_CANVAS_DOM_FX.md) | 分册 02：Canvas 2D 序列、chromakey、网格/星形、SVG 水墨、DOM 联动、校准器 | `SequenceCanvas.jsx` `TermsNarrative.jsx` `MaskCalibrator.jsx` |
| [`PEAR_TECH_03_SPATIAL_HEAD_TRACKING.md`](PEAR_TECH_03_SPATIAL_HEAD_TRACKING.md) | 分册 03：HTML-in-Canvas、Three 空间卡片、off-axis 投影、MediaPipe 注视选择 | `spatial/*` |
| [`PEAR_ARCHITECTURE_AUDIT.md`](PEAR_ARCHITECTURE_AUDIT.md) | 架构审计：应抽象的模式、耦合点、与 `ARCHITECTURE.md` 的对照 | 全仓模块边界（不逐行读 GLSL） |
| [`PEAR_HERO_TRANSITION_STUDY.md`](PEAR_HERO_TRANSITION_STUDY.md) | 开场复合舞台：哪些效果在视频里、哪些由 WebGL / Canvas / DOM 实时叠加 | `films.js` + Hero / Sequence 层 |

## 按任务跳转

| 你在做… | 先看 |
| --- | --- |
| 滚动 → 逻辑时间 → 多层 Renderer | [`PEAR_TECH_REFERENCE.md`](PEAR_TECH_REFERENCE.md) §1–2，再对照 [`../ARCHITECTURE.md`](../ARCHITECTURE.md) §3 |
| WebGL 全屏宿主 / GLSL 转场 | [`PEAR_TECH_01_WEBGL_SHADER.md`](PEAR_TECH_01_WEBGL_SHADER.md) |
| 序列帧 scrub、遮罩、DOM 叠层 | [`PEAR_TECH_02_CANVAS_DOM_FX.md`](PEAR_TECH_02_CANVAS_DOM_FX.md) |
| 头部追踪、看哪张选哪张、HTML-in-Canvas | [`PEAR_TECH_03_SPATIAL_HEAD_TRACKING.md`](PEAR_TECH_03_SPATIAL_HEAD_TRACKING.md)，再对照 [`../TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md`](../TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md)、[`../HEAD_COUPLED_PEEK_TECHNICAL_DESIGN.md`](../HEAD_COUPLED_PEEK_TECHNICAL_DESIGN.md) |
| 新增 Renderer 还是复用现有 key | [`PEAR_ARCHITECTURE_AUDIT.md`](PEAR_ARCHITECTURE_AUDIT.md) + [`../ARCHITECTURE.md`](../ARCHITECTURE.md) §5 |
| 预告片开场如何「视频 + 实时效果」分工 | [`PEAR_HERO_TRANSITION_STUDY.md`](PEAR_HERO_TRANSITION_STUDY.md) |

## 与本仓库的关系

```text
references/pear-no/          只读快照（研究用，不复用品牌素材）
        │
        ▼
docs/reference/              本目录：研读笔记与迁移结论
        │
        ▼
docs/ARCHITECTURE.md         目标运行时契约（Router / Director / Renderer）
docs/TRACK_SELECTION_*       V1 验证过的交互模式（V2 UX 待重写）
docs/HEAD_COUPLED_PEEK_*
```

Pear 把 Road 数字散落在组件里；《归航》要求章节边界、blend、renderer key 只来自 `story.config`。读本目录时只保留**机制**，不要把 Pear 的秒数或 Road 裸数字抄进业务代码。

## 不在本目录

| 内容 | 去哪 |
| --- | --- |
| V2 大纲、四幕锚点 | [`../TRAILER_INDEX.md`](../TRAILER_INDEX.md) |
| V2 待办与阶段 | [`../REDESIGN.md`](../REDESIGN.md) |
| 抽帧 / 滚动预览工具 | [`../../tools/README.md`](../../tools/README.md) |
| V1 剧本与任务卡 | [`../../archive/v1-60s-ai-roadshow/`](../../archive/v1-60s-ai-roadshow/README.md)（只读） |
