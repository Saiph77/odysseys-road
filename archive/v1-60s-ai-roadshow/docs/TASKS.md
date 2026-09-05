# 《归航 / NOSTOS》MVP 任务拆分

> 用途：把第一版（60 秒路演 MVP）拆成可以并行领取的任务卡。每卡列出**拥有的路径**、**依赖**、**验收**。
> 规则来源：`docs/DECISIONS.md`（D-015 协作方式）、`AGENTS.md`。
> 状态标记：`[ ]` 未开始 `[~]` 进行中 `[x]` 已合并
> 更新日期：2026-09-05

## 0. 一页看懂

```text
T0 Bootstrap（串行，先做）
   └─ 冻结 contracts.ts / story.config 骨架 / 工具链
        │
        ├─ T1 Core        Router · Director · ProgressSource · ScrollGate · latch
        ├─ T2 Interaction Engine · providers · ZoneDwellSelector
        ├─ T3 Renderers   registry · Sequence(placeholder) · Dom · Stage · DevRoadPanel
        ├─ T4 Mirrors     HtmlCanvasBridge 接口 · SemanticDomBridge · OracleMirrorsRenderer
        ├─ T5 App shell   PreRoll · AppRoot 接线 · memory-pending · 结束态
        ├─ T6 Content     story.config 七章 · captions · mirror 文案 · 占位素材
        └─ T7 Prompts     神谕镜/雷击/序章 Prompt 重写（纯文档）
        │
   I1 集成：合并第一波，跑通 60 秒占位版
        │
        ├─ T8  Ch.03 塞壬左右显影（无音频）
        ├─ T9  Ch.04 单序列 UV 探视
        ├─ T10 Ch.05 牛群单向靠近 + 前倾触碰
        ├─ T11 Ch.06 雷击 latch · 残影 · reduced-motion · 海浪循环
        ├─ T12 Autopilot ProgressSource + 滚动阻尼
        ├─ T13 WebAudioBus + 塞壬双声部
        ├─ T14 HtmlCanvasBridge native/polyfill + Three.js
        └─ T15 MediaPipe 目标设备实测调参
```

MVP 完成定义（I1）：从 pre-roll 第一次滚动开始 → 滚动经过 `troy` → 进入 `selection`，头部/指针三区累计 5 秒 → 胜者为 Track 3 时继续向下滚过 `sirens / scylla / cattle / homecoming`，胜者为 Track 1/2 时进入 `memory-pending`；全部章节用占位色块 + 章节名 + 字幕即可，无 WebGL、无音频。

---

## 1. 并行协作协议

1. **一卡一分支一 worktree**：`git worktree add ../nostos-T2 -b task/T2-interaction main`。
2. **只改自己拥有的路径**。需要改共享文件（下表）时，不直接改，而是在汇报中给出建议 diff，由集成者合并到 main 后其他分支 rebase。
3. **共享文件（只有 T0 / 集成者能改）**：
   - `src/core/contracts.ts`
   - `src/config/story.config.ts` 的 schema 部分（T6 可以填内容，不能改字段）
   - `package.json`、`tsconfig*.json`、`vite.config.ts`
4. 每张卡完成时汇报：改了哪些文件 / 跑了哪些命令及结果 / 未验证项 / 对共享文件的建议 diff。
5. 提交信息前缀用卡号：`T2: add ZoneDwellSelector state machine`。
6. 任何卡**不得**：读取 `window.scrollY` 自行算章节；在 Renderer/CSS/GLSL 里写业务秒数；在 Router/Director 里出现摄像头概念；保存生物特征数据。

## 2. 目标目录（T0 建立）

```text
src/
├── app/            AppRoot.tsx · PreRoll.tsx · MemoryPending.tsx · EndState.tsx · main.tsx   (T5)
├── audio/          AudioBus.ts（接口）· NullAudioBus.ts                                       (T0)
├── capabilities/   htmlInCanvas.ts（接口 + SemanticDomBridge）                               (T4)
├── components/     RendererStage.tsx · DevRoadPanel.tsx                                      (T3)
├── config/         story.config.ts · assets.manifest.ts · interaction.config.ts              (T0 骨架 / T6 内容)
├── content/        captions.ts · trackMirrors.ts                                             (T6)
├── core/           contracts.ts(T0) · StoryRouter · StoryDirector · SceneRegistry
│                   ProgressSource · ScrollGate · ChapterRuntime · validateStory              (T1)
├── interaction/    InteractionEngine.ts · ZoneDwellSelector.ts · providers/{Pointer,Keyboard,MediaPipe}Provider.ts (T2)
├── renderers/      rendererRegistry.ts · SequenceRenderer.ts · DomRenderer.ts (T3) · OracleMirrorsRenderer.ts (T4)
└── styles/         app.css (T5) · mirrors.css (T4) · stage.css (T3)
tests/              core/ (T1) · interaction/ (T2) · renderers/ (T3) · config/ (T0/T6)
public/
├── assets/         posters/ · sequences/（占位）                                              (T6)
└── mediapipe/      wasm/ · models/face_landmarker.task                                       (T2)
```

---

## 3. 任务卡

### T0 · Bootstrap（串行，集成者）

- [ ] 状态
- **做什么**：初始化 Vite + TS + React + pnpm；Vitest；ESLint 最小配置；`pnpm view` 查版本后精确锁定 `three`、`@mediapipe/tasks-vision`（D-014）。写 `src/core/contracts.ts`（见 ARCHITECTURE §5.1，含 `InteractionFrame`、`SceneFrame`、`SelectionState`、`ProgressSource`、`HtmlCanvasBridge`、`AudioBus`）。写 `story.config.ts` 骨架（七章 ID、timeline、空 scenes）和 `validateStory.ts` 最小版（ID 唯一、timeline 无 gap、flow 引用存在）。`NullAudioBus`。`package.json` scripts：`dev / build / test / typecheck / check`（check = typecheck + test）。
- **拥有**：根配置文件、`src/core/contracts.ts`、`src/audio/*`、`src/config/*.ts` 骨架、`tests/config/*`。
- **依赖**：无。
- **验收**：`pnpm install && pnpm check` 通过；`pnpm dev` 打开空白页无报错；contracts 里每个类型有一行注释说明所有者。

### T1 · Core：路由、导演、进度源

- [ ] 状态
- **做什么**：
  - `StoryRouter`：`JourneyState`，`selectTrack(trackId)`：`enabledTrackIds` 内 → 对应章节序列；否则 → `memory-pending`；`restart()`。
  - `StoryDirector`：`fromProgress(rawProgress) → DirectorFrame`，`fromRoad(road, 'debug')`；纯函数，可测。
  - `SceneRegistry`：Road → active scenes + opacity（blend 集中计算）。
  - `ProgressSource`：`ScrollProgressSource`（监听 scroll，输出 0..1）；预留 `'autopilot' | 'debug'` 类型但只实现 scroll。
  - `ScrollGate`：`lock(atProgress)` / `unlock()`；锁住时进度钳制、滚轮事件 `preventDefault`。
  - `ChapterRuntime`：持有本章 latch（`fireOnce(id)`）；章节切换时销毁。
- **拥有**：`src/core/*`（除 `contracts.ts`）、`tests/core/*`。
- **依赖**：T0。
- **验收**：单测覆盖：相同 rawProgress 经 scroll 与 debug 得到相同 Road；overlap 区 opacity 和为 1；`selectTrack('track-a')` 路由到 `memory-pending`；`ScrollGate` 锁住时 progress 不变；latch 只触发一次。

### T2 · Interaction：输入引擎与三区累计选择

- [ ] 状态
- **做什么**：
  - `InteractionEngine`：注册 providers，输出平滑后的 `InteractionFrame`（`x y z yaw focusX confidence detected source timestamp`）；平滑 140–220ms；丢脸 500–800ms 回中。
  - `PointerProvider`：视口 x → `focusX`；`pointerdown` → `confirm` 事件。
  - `KeyboardProvider`：←/→ 平滑推 `focusX`；Enter/Space → `confirm`。
  - `MediaPipeProvider`：`getUserMedia` 640×480 → FaceLandmarker（GPU 失败退 CPU）24Hz；脸宽/太阳穴/yaw 计算参考 `docs/reference/PEAR_TECH_03_SPATIAL_HEAD_TRACKING.md` §2.6，但**从零实现**；校准：前 24 帧脸宽中值 → z 基线，focusX 均值 → 中心偏置（D-004）；`visibilitychange` 暂停推理。
  - `ZoneDwellSelector`：实现 D-002 全部规则（迟滞分区、collect 4500 / freeze 500、dt ≤ 50ms、confidence ≥ 0.55、平局与 <1000ms 兜底、confirm 立即结束）。输出 `SelectionState { phase, zone, dwellMs, winnerId }`。所有数值在 `src/config/interaction.config.ts`（T2 拥有此文件）。
- **拥有**：`src/interaction/*`、`src/config/interaction.config.ts`、`tests/interaction/*`、`public/mediapipe/*`。
- **依赖**：T0。
- **验收**：单测：迟滞边界不抖动；先左 3s 再右 1s → 胜者左；后台恢复大 dt 不补满；无输入 5s → `defaultTrackId`；confirm 立即 resolve。真实摄像头手动验证：左/中/右转头 250ms 内 zone 变化。

### T3 · Renderers 与 Stage

- [ ] 状态
- **做什么**：
  - `rendererRegistry`：`key → factory`。
  - `SequenceRenderer`（占位版）：有 `asset` 时按 `localProgress` 取最近可用帧（Canvas 2D，cover 取景，预留 `uvOffsetX` behavior 参数给 T9）；无 asset 时画纯色 + 章节名。
  - `DomRenderer`：按 `SceneFrame` 显示字幕/旁白（内容来自 `content/captions.ts`，按 sceneId 查）。
  - `RendererStage`：按 `DirectorFrame.activeScenes` mount/update/destroy Renderer；把最新 `InteractionFrame` 一并传入。
  - `DevRoadPanel`：`?debug=1` 显示 Road、章节、zone、dwellMs；数字键 1–6 跳章。
- **拥有**：`src/renderers/rendererRegistry.ts`、`src/renderers/SequenceRenderer.ts`、`src/renderers/DomRenderer.ts`、`src/components/*`、`src/styles/stage.css`、`tests/renderers/*`。
- **依赖**：T0。
- **验收**：快速 seek 无黑帧（最近帧 fallback）；scene destroy 后无残留 DOM/listener；Renderer 内无业务秒数。

### T4 · 神谕镜（DOM/CSS 3D 路径）

- [ ] 状态
- **做什么**：
  - `capabilities/htmlInCanvas.ts`：`HtmlCanvasBridge` 接口（`mode: 'dom' | 'polyfill' | 'native'`、`mount(host, elements)`、`updateGeometry(id, matrix)`、`requestPaint(id)`、`destroy()`）+ `probeHtmlCanvasCapabilities()`（现在只返回 `dom`）+ `SemanticDomBridge` 实现。
  - `OracleMirrorsRenderer`（renderer key `mirrors`）：三面真实 DOM 镜（`<article drawable><button>`），CSS `perspective` 弧面排布，左右内扣；消费 `InteractionFrame.focusX` 做整体 off-axis 微旋 + 目标镜前移/放大/转正；消费 `SelectionState.dwellMs` 驱动远近、亮度、金纹闭合；`freeze` 阶段排名显形；`resolve` 后胜者放大到全屏（简单即可，D-001）。内容来自 `content/trackMirrors.ts`（T6 提供，T4 先用占位）。
  - `mirrors.css`：D-012 色板变量、青铜边框、镜内高饱和 / 镜外低饱和。
  - reduced-motion：取消旋转与冲镜头，只留亮度/层级。
- **拥有**：`src/capabilities/*`、`src/renderers/OracleMirrorsRenderer.ts`、`src/styles/mirrors.css`。
- **依赖**：T0（契约）；与 T2 只通过 `SelectionState` 类型耦合。
- **验收**：鼠标 hover / Tab focus / 点击三镜有效；无 WebGL 依赖；`SelectionState` 假数据驱动下三镜远近正确；不出现第二份文案。

### T5 · App shell、Pre-roll、占位章、结束态

- [ ] 状态
- **做什么**：
  - `main.tsx` / `AppRoot.tsx`：按 ARCHITECTURE §2.2 接线（Router、ChapterRuntime、InteractionEngine、RendererStage、ProgressSource、ScrollGate、AudioBus）。第一波期间用 T0 契约 + 本地 stub，I1 时替换为真实实现。
  - `PreRoll.tsx`：实现 D-004 V2 全流程（无按钮；加载即请求摄像头、状态小字、36 帧滚动校准窗口、首次滚动/按键开始、4s 失败转指针、两行小字）。
  - `MemoryPending.tsx`：「这段记忆尚未归来」+ 返回神谕镜 / 继续 Track 3 两个按钮。
  - `EndState`：海浪循环占位 + 「重新开始」（D-011）。
  - URL 参数：`?debug=1`、`?demo=track3`（跳过 pre-roll 摄像头，直接指针模式）。
- **拥有**：`src/app/*`、`index.html`、`src/styles/app.css`。
- **依赖**：T0。
- **验收**：无摄像头设备时首次滚动立即进入正片（不等待摄像头）；拒绝权限走指针；`memory-pending` 两个按钮路由正确；结束态不自动刷新。

### T6 · Content 与 story.config 内容

- [ ] 状态
- **做什么**：
  - 填满 `story.config.ts` 七章（`troy / selection / sirens / scylla / cattle / homecoming / memory-pending`）：每章 timeline、scroll 屏数（第一版等长）、scenes（renderer key、blend、layer、behavior 预留字段：`selection` 章的 gate 位置、`scylla` 的 `head-coupled-peek`、`homecoming` 的 `thunder` latch id）。
  - `content/captions.ts`：从两份剧本抄录旁白与 DOM 文字，按 sceneId 索引；不含 timing。
  - `content/trackMirrors.ts`：三镜标题、罗马数字、三章名、预言、色板 key（剧本 01 §4 表）；`sections[]` 预留。
  - `assets.manifest.ts`：占位 poster（纯色 SVG 即可）；tier 只有 `desktop`。
- **拥有**：`src/config/story.config.ts`（内容部分）、`src/config/assets.manifest.ts`、`src/content/*`、`public/assets/*`。
- **依赖**：T0。
- **验收**：`validateStory` 通过；六章 timeline 连续；每个 scene 的 asset 引用在 manifest 存在；文案与剧本逐句一致。

### T7 · Prompt 重写（纯文档）

- [ ] 状态
- **做什么**：`01b-track-selection.md` 由"三股记忆之流/大理石画板"改为青铜神谕镜（D-012；仍禁止画内文字）；`f-storm.md` 拆为 `f0-clear-morning.md`（雷击前晴空首帧）与 `f1-split-hull.md`（已裂船体），要求两图海平线与船位对齐；`00-prologue.md` 扩展为剧本 01 §3 的 6 个关键状态（可一文件多段）；更新 `prompts/image-prompts/README.md` 与 `docs/PROMPT_SYSTEM_DESIGN.md` 的 ID 表。
- **拥有**：`prompts/**`、`docs/PROMPT_SYSTEM_DESIGN.md`。
- **依赖**：无。
- **验收**：每个 Prompt 仍含完整系统风格段；ID 表与文件一一对应；没有"三股记忆之流"残留术语。

### I1 · 第一波集成（集成者）

- [ ] 状态
- 合并 T0–T7，替换 T5 的 stub，跑通"MVP 完成定义"。记录：实际总时长、每章滚动手感、选择窗口是否可感知。产出 `docs/DECISIONS.md` 追加条目（如需要）与第二波任务的调整。

### 第二波（I1 之后领取；接口已在第一波预留）

| 卡 | 范围 | 拥有 | 关键约束 |
| --- | --- | --- | --- |
| T8 Ch.03 塞壬显影 | 左右两侧塞壬轮廓按 `focusX` 连续显影（CSS mask / Canvas），无音频 | `src/renderers/effects/sirens*` | 船位不变；连续不硬切 |
| T9 Ch.04 探视 | `SequenceRenderer` 的 `head-coupled-peek` behavior：UV ±0.035、dead zone ±0.10、雾层反向 | `SequenceRenderer` behavior 分支 | 见 `HEAD_COUPLED_PEEK_TECHNICAL_DESIGN.md` §6 |
| T10 Ch.05 牛群 | 单向 attention 累积驱动靠近/金光；D-006 前倾触碰一次 | `src/renderers/effects/cattle*`、`InteractionEngine` 的 lean 事件 | 移开只减速不倒放 |
| T11 Ch.06 雷击 | latch 白帧（D-007）、反相残影、reduced-motion、海浪循环结束态 | `src/renderers/effects/thunder*`、`EndState` | 每会话一次 |
| T12 Autopilot | `AutopilotProgressSource` 按标称秒推进；滚动阻尼进 `chapter.scroll.damping` | `src/core/ProgressSource.ts` | Director 不变 |
| T13 WebAudioBus | 实现 `AudioBus`；塞壬双 stem 同步起播 + crossfade | `src/audio/WebAudioBus.ts` | 绝不重触发 |
| T14 HTML-in-Canvas | `NativeThreeHtmlBridge` / `PolyfillBridge`；Three.js 精确锁版 | `src/capabilities/*` | Renderer 契约不变 |
| T15 设备实测 | 目标笔记本摄像头下调 `interaction.config.ts` 全部阈值 | `interaction.config.ts` | 只改数值 |

---

## 4. 常见问题

- **我的任务需要另一张卡的实现才能跑？** 用 T0 契约写 stub / fixture；不要跨目录 import 别人的实现。
- **契约缺字段？** 汇报里给建议 diff，不要自己加。
- **剧本和技术文档冲突？** 看 `DECISIONS.md` D-013 顺序；仍不确定就停下来问。
- **要不要顺手优化性能？** 不要。第一版目标是跑通，性能问题记进汇报的"未验证项"。
