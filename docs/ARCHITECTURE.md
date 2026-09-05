# 《归航 / NOSTOS》目标架构与开发规范

> [Rebuilt by dev-trace init: 2026-09-05 from fresh repository scan]
> 状态：设计已收敛，按 `docs/TASKS.md` 进入 MVP 实现
> 范围：滚动叙事运行时、分支章节路由、多渲染层、神谕镜（DOM/CSS 3D，预留 HTML-in-Canvas + Three.js）、MediaPipe、素材与 Prompt 管理
> 决策来源：`docs/DECISIONS.md`（与本文冲突时以它为准）
> 权威材料：`docs/scripts/60s-roadshow/`、`docs/TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md`、`references/pear-no/src/`
> 姊妹文档：`docs/TASKS.md`、`docs/PROMPT_SYSTEM_DESIGN.md`、`docs/reference/PEAR_ARCHITECTURE_AUDIT.md`
> 更新日期：2026-09-05（V2：吸收 D-001…D-016）

## 0. 阅读地图

| 章节 | 视角 | 读者得到什么 |
| --- | --- | --- |
| 1 | 边界 | 系统到底是什么、什么不属于核心 |
| 2 | 结构/OOP | 模块依赖、接口实现、谁持有状态 |
| 3 | 调用 | scroll、分支、交互和 Renderer 如何协作 |
| 4 | 数据/FP | 不可变数据如何变换，为什么要拆 DTO |
| 5 | 配置 | 唯一真相源及新增章节的改动范围 |
| 6 | HTML-in-Canvas | 原生、polyfill、DOM fallback 的隔离方式 |
| 7 | 开发规范 | 迭代顺序、素材、转场、Agent 约束 |
| 8 | 验收 | 自动检查、视觉抽样、P0/P1/P2 路线图 |

## 1. 一句话边界

《归航》不是“一组滚动时播放动画的 React section”，而是：

> 一个由叙事路由选择当前章节、由局部逻辑时间解析场景、由互不依赖的 Renderer 消费不可变帧数据的多媒体播放系统。

最重要的分层规则：**Router 有叙事身份，Director 只有时间；Renderer 有视觉状态，不拥有故事边界。**

### 1.1 当前确定事实、设计决策与假设

| 类型 | 内容 | 证据/影响 |
| --- | --- | --- |
| 已确认 | 当前仓库只有文档和 Pear-no 参考快照，没有应用运行时 | 2026-09-05 仓库扫描 |
| 已确认 | 当前只制作 60 秒路演；三镜均可胜出，Track 1/2 进入 `memory-pending` 占位章 | D-001 |
| 已确认 | WICG API 仍位于 Chromium flag 后 | WICG README，2026-09-05 查询 |
| 已确认 | Three.js r185 的 `HTMLTexture` 仍探测 `texElementImage2D` | Three.js r185 `WebGLTextures.js` |
| 已确认 | WICG 当前说明使用 `texElementSubImage2D` | WICG README |
| 设计决策 | 每个章节使用独立 Road，Router 负责动态播放顺序 | 避免为六种 Track 顺序制造全局 magic number |
| 设计决策 | HTML-in-Canvas 经 capability adapter 接入 | 实验 API 改名不污染业务 Renderer |
| 待验证 | 当前用户 Chromium 是否同时保留新旧 WebGL API | 实现阶段在目标浏览器运行 capability probe |
| 设计决策 | 只支持桌面 Chromium，不做移动端 | D-008 |
| 设计决策 | 摄像头从 pre-roll 起全程运行 | D-003 |
| 设计决策 | 主时间轴滚动驱动；选择窗口与一次性事件用真实时间 | D-005 |
| 待验证 | 三区累计阈值、低光准确率 | 必须做真实用户测试，不在架构层宣称结论 |

## 2. 代码组织结构：组合优先，插件隔离

### 2.1 推荐目录（目标态）

目录与任务卡的对应关系见 `docs/TASKS.md` §2；这里只列结构与职责。

```text
odysseys-road/
├── AGENTS.md · README.md
├── docs/                          DECISIONS · TASKS · ARCHITECTURE · 技术设计 · scripts/ · reference/
├── prompts/image-prompts/         双语图像 Prompt（将来接 prompt.registry.ts）
├── public/
│   ├── assets/{posters,sequences,video,audio}/<asset-id>/   只有 desktop tier（D-008）
│   └── mediapipe/{wasm,models}/
├── src/
│   ├── app/                       React composition root、PreRoll、MemoryPending、EndState；只接线
│   ├── audio/                     AudioBus 接口 + NullAudioBus（D-009）
│   ├── capabilities/              htmlInCanvas.ts：HtmlCanvasBridge 接口 + SemanticDomBridge（D-010）
│   ├── components/                RendererStage、DevRoadPanel
│   ├── config/
│   │   ├── story.config.ts        release、flow、章节、Road、blend、renderer key、asset ref、behavior
│   │   ├── assets.manifest.ts     路径、帧数、poster、预加载策略
│   │   └── interaction.config.ts  三区迟滞、窗口时长、平滑、置信度等全部交互阈值
│   ├── content/                   字幕/旁白/镜面文案；不含 timing
│   ├── core/
│   │   ├── contracts.ts           全部跨层 DTO 与接口（唯一真相源，改动须经集成者）
│   │   ├── StoryRouter.ts         Track 路由与旅程状态
│   │   ├── StoryDirector.ts       进度 → 章节局部 Road
│   │   ├── SceneRegistry.ts       Road → active scenes + opacity
│   │   ├── ProgressSource.ts      scroll（P0）| autopilot | debug
│   │   ├── ScrollGate.ts          选择窗口期间锁滚动
│   │   ├── ChapterRuntime.ts      章节生命周期 + 一次性 latch
│   │   └── validateStory.ts
│   ├── interaction/
│   │   ├── InteractionEngine.ts   多输入归一、平滑、丢脸回中
│   │   ├── ZoneDwellSelector.ts   三区累计停留状态机（D-002）
│   │   └── providers/             Pointer、Keyboard、MediaPipe
│   ├── renderers/                 rendererRegistry · Sequence · Dom · OracleMirrors（+ 第二波 effects/）
│   └── styles/
└── tests/                         core/ · interaction/ · renderers/ · config/
```

### 2.2 执行包含树（谁创建、谁持有）

```text
AppRoot  <<Root Aggregate / page lifetime>>
├── StoryRouter                  持有旅程级状态
├── ProgressSource + ScrollGate  滚动 → 0..1 进度；选择窗口期间锁住
├── ChapterRuntime              当前章节生命周期，持有本章 latch
│   ├── StoryDirector            无视觉状态
│   ├── SceneRegistry            纯场景解析
│   ├── ZoneDwellSelector?       只在 selection 章存在
│   └── RendererStage
│       └── SceneRenderer[*]     各自持有 GPU/Canvas/Media 私有资源
├── InteractionEngine           持有实时交互样本，页面生命周期内常驻（D-003）
│   ├── PointerProvider
│   ├── KeyboardProvider
│   └── MediaPipeProvider?       pre-roll 授权成功后存在，直到页面关闭
├── AudioBus                    第一版为 NullAudioBus
└── DevRoadPanel?               仅 ?debug=1
```

### 2.3 代码依赖关系图

```text
story.config ───────────────┐
assets.manifest ────────┐   │
content.registry ────┐  │   │
                    v  v   v
UI Host ──owns──> StoryRouter ──selects──> ChapterDefinition
   │                                      │
   ├──owns──> InteractionEngine           ├──> StoryDirector
   │             ^                        └──> SceneRegistry
   │             │ InteractionFrame                 │ SceneFrame[]
   │             └────────providers                 v
   └──owns──────────────────────────────> RendererStage
                                                 │ creates by key
                          rendererRegistry <─────┤
                             ┌─────────┬─────────┼─────────┬──────────┐
                             v         v         v         v          v
                         Sequence    Video      DOM      Shader   ThreeHtml
                                                                    │
                                                     htmlInCanvas adapter
                                                                    │
                                                native / polyfill / DOM fallback

禁止方向：Renderer -X-> Router / Director / other Renderer / window.scrollY
```

### 2.4 接口与实现兼容性

| 抽象 | P0 生产实现 | 可选/预留实现 | 必须降级到 |
| --- | --- | --- | --- |
| `SceneRenderer` | Sequence、DOM | Video、Shader、ThreeHtml | DOM/poster |
| `InteractionProvider` | pointer、keyboard、MediaPipe head | head+gaze（实验） | pointer/keyboard |
| `HtmlCanvasBridge` | `SemanticDomBridge`（DOM/CSS 3D） | WICG native、polyfill（T14） | semantic DOM |
| `ProgressSource` | scroll | autopilot、debug | scroll |
| `AudioBus` | `NullAudioBus` | `WebAudioBus`（T13） | 无声 + 字幕 |
| `ProgressStore` | memory/localStorage | URL/session adapter | 新旅程状态 |
| `AssetLoader` | browser fetch/Image | cache/prefetch scheduler | poster/最近可用帧 |

### 2.5 设计模式（只使用有必要的名字）

| 模式 | 代码体现 | 解决的问题 |
| --- | --- | --- |
| Strategy/Plugin | `rendererRegistry[key] -> SceneRenderer` | 更换渲染技术不改 Director |
| Adapter | `htmlInCanvas`、各 `InteractionProvider` | 隔离浏览器 API 与输入设备差异 |
| State Machine | `StoryRouter`、`ZoneDwellSelector` | 分支状态与累计选择可测试 |
| Staged Orchestrator | App → Router/Director/Registry/Stage | 保留阶段接缝，不制造上帝组件 |
| Immutable DTO | `DirectorFrame`、`SceneFrame`、`InteractionFrame` | 跨层只传数据，不共享可变内部状态 |

刻意不用：Renderer 继承基类。统一契约只需要 interface；继承会把 Canvas、Video、WebGL 的无关生命周期强绑在一起。

### 2.6 状态所有权

| 状态 | 唯一持有者 | 生命周期 | 不应放在哪 |
| --- | --- | --- | --- |
| 当前章节、已完成 Track、选择顺序 | `StoryRouter` | 整次旅程 | Director/Renderer |
| road、dominant scene | `StoryDirector` 输出帧 | 单次 update | React 全局 store |
| active scenes、opacity | `SceneRegistry` 计算 | 单次 update | Renderer 常量 |
| pointer/head/gaze 样本 | `InteractionEngine` | 实时 session | Router/localStorage |
| zone/dwellMs/winner | `ZoneDwellSelector` | 一次选择窗口 | MediaPipe provider、Renderer |
| 一次性事件是否已触发 | `ChapterRuntime` latch | 单章 | Renderer |
| texture、video、GPU buffer、最近帧 | 各 Renderer | scene mount→destroy | Director/App |
| 文件路径与 tier | asset manifest | build/config | JSX/Renderer |

## 3. 运行时调用图

### 3.1 主路径

```text
window scroll / DevRoadPanel seek
  -> ProgressSource (scroll | debug) -> rawProgress 0..1
  -> ScrollGate.clamp(rawProgress)        // 选择窗口期间钳制在 gate
  -> StoryDirector.fromProgress(progress)
  -> SceneRegistry.resolve(road)
  -> DirectorFrame { road, sceneId, activeScenes[] }
  -> RendererStage.update(frame)
  -> 每个 SceneRenderer.update(SceneFrame, latest InteractionFrame)
  -> Canvas / Video / DOM / WebGL draw
```

### 3.2 分支选择路径

```text
pointer / keyboard / camera (需用户授权)
  -> InteractionProvider.sample()
  -> InteractionEngine.normalize + smooth
  -> InteractionFrame
  -> ZoneDwellSelector.update(frame, dtMs)       // 真实时间，D-002
       ├── SelectionState{zone, dwellMs} -> OracleMirrorsRenderer 视觉反馈
       └── phase=resolved, winnerId -> StoryRouter.selectTrack(winnerId)
                                   -> winner ∈ enabledTrackIds ? Track 章节序列 : memory-pending
                                   -> ScrollGate.unlock()
                                   -> 用户继续向下滚动进入新章节
```

关键 handoff：只有 `ZoneDwellSelector` 能产出 `winnerId`（pointer click / Enter 通过它的 `confirm()` 走同一出口）；只有 `StoryRouter` 能把 Track ID 变成章节切换。MediaPipe、DOM button 都不能直接改旅程状态。

### 3.3 资源加载异步边界

```text
Scene mount
  -> read asset entry
  -> request poster / first frame
  -> show deterministic fallback
  -> async decode / GPU upload
  -> mark renderer ready
  -> subsequent update uses nearest ready frame

Scene destroy
  -> abort fetch + remove listeners + stop media tracks
  -> dispose geometry/material/texture/context-owned resources
```

## 4. 数据流：把信息按“何时必须知道”拆开

### 4.1 信息分类

| 信息 | 何时必须已知 | 正确载体 | 不应放在 |
| --- | --- | --- | --- |
| 故事图与 Track 候选 | 进入应用前 | `StoryConfig.flow` | JSX click handler |
| 当前章节的时间边界 | 创建 ChapterRuntime 时 | `ChapterDefinition` | Renderer |
| 当前 Road/opacity | 每帧 | immutable frame DTO | mutable singleton |
| 文件路径/帧数/tier | mount/load 时 | `AssetManifest` | story config behavior |
| 头部/指针位置 | 实时 | `InteractionFrame` | narrative state |
| 摄像头权限 | 用户手势后 | MediaPipe provider 私有状态 | config |
| 视觉细节参数 | Renderer update 时 | `scene.behavior` | Director |

### 4.2 不变量

1. 一个章节的 Road 必须完整覆盖且无空洞；overlap 可以有多个 active scene。
2. 同一输入比例经 scroll 或 debug seek 必须得到相同 Road 和 SceneFrame。
3. Track 只有完成后才写入 `completedTrackIds`；进入或刷新不等于完成。
4. 任意 Track 顺序都在同一 Hub 汇合；Track 之间不建立两两转场。
5. 页面隐藏时暂停推理与动画循环；摄像头本身从 pre-roll 起全程运行到页面关闭（D-003），第一版不按章启停。
6. Shader/WebGL/摄像头失败不能阻断完整叙事。
7. 任何生物特征派生原始数据不得持久化、上报或进入 Prompt。

这些不变量推导出 Router、Director、Interaction 三个独立状态域；这不是代码风格偏好。

### 4.3 不可变数据流链

```text
RawScroll
  --normalize--> InputProgress
  --mapToChapterRoad(ChapterDefinition)--> Road
  --resolveScenes(SceneRegistry)--> DirectorFrame
  --projectEachScene--> SceneFrame[]
  --render(RendererRegistry, AssetManifest)--> pixels + semantic DOM

RawPointer | RawKeyboard | MediaPipeLandmarks(private)
  --providerMap--> InteractionSample
  --normalize/smooth--> InteractionFrame
  --dwellTransition--> SelectionState
  --confirm only--> TrackId
  --route(StoryGraph)--> JourneyState
```

### 4.4 为什么 frame 字段存在

| 字段 | 设计意图 |
| --- | --- |
| `road` | 调试和多层同步的共同逻辑时钟 |
| `localProgress` | Renderer 不知道章节绝对边界也能在 0..1 内工作 |
| `opacity` | overlap 权重集中计算，handoff 不再隐含于视觉代码 |
| `sceneId` | 稳定身份，用于资源、日志和调试，不依赖数组下标 |
| `source` | 区分 scroll/debug 以便诊断，但不改变视觉结果 |
| `confidence/detected` | 低可信输入暂停 dwell，不把噪声解释成选择 |
| `timestamp` | 用真实 dt，防后台恢复后一次性完成停留 |

生命周期原则：小于等于一次 update 的数据放不可变 DTO；等于章节/旅程的状态放有明确 owner 的对象；GPU 与媒体句柄只放 Renderer 私有字段。

## 5. 核心接口与唯一配置源

### 5.1 关键接口（目标 TypeScript）

以下是 `src/core/contracts.ts` 的目标内容。字段增删须经集成者（D-015）。

```ts
// ---- 进度与场景 ----
type ProgressSourceKind = 'scroll' | 'autopilot' | 'debug';

interface ProgressSource {
  readonly kind: ProgressSourceKind;
  start(publish: (rawProgress: number) => void): void;   // 0..1
  stop(): void;
}

interface ScrollGate {
  lock(atProgress: number): void;   // 钳制并拦截滚轮
  unlock(): void;
  clamp(rawProgress: number): number;
}

type SceneDefinition = Readonly<{
  id: string;
  road: Readonly<{ start: number; end: number }>;
  blend: Readonly<{ in: number; out: number }>;
  layer: number;
  renderer: 'sequence' | 'dom' | 'mirrors' | 'video' | 'shader';
  asset?: string;
  behavior?: Readonly<Record<string, unknown>>;  // 如 { interaction: 'head-coupled-peek', maxUvOffset: 0.035 }
}>;

type ChapterDefinition = Readonly<{
  id: string;
  kind: 'linear' | 'hub' | 'track' | 'finale' | 'placeholder';
  timeline: Readonly<{ start: number; end: number }>;   // 章节局部 Road 范围
  scroll: Readonly<{ screens: number }>;                // 只有桌面（D-008）
  gate?: Readonly<{ atRoad: number }>;                  // hub 章：滚到此处进入真实时间选择窗口
  scenes: readonly SceneDefinition[];
}>;

type DirectorFrame = Readonly<{
  chapterId: string;
  road: number;
  source: ProgressSourceKind;
  activeScenes: readonly SceneFrame[];
}>;

type SceneFrame = Readonly<{
  sceneId: string;
  renderer: SceneDefinition['renderer'];
  localProgress: number;   // 0..1
  opacity: number;
  layer: number;
  asset?: string;
  behavior?: Readonly<Record<string, unknown>>;
}>;

interface StoryDirector {
  fromProgress(rawProgress: number, source?: ProgressSourceKind): DirectorFrame;
  fromRoad(road: number): DirectorFrame;
}

// ---- 交互 ----
type InteractionFrame = Readonly<{
  x: number;          // 头/指针在视口的水平位置，-1..1
  y: number;
  z: number;          // 相对校准基线的靠近程度；前倾为正
  yaw: number;        // 头部水平转角归一化，-1..1；指针来源为 0
  focusX: number;     // 位置与 yaw 融合后的"看向哪里"，-1..1；选择与探视都用它
  confidence: number; // 0..1
  detected: boolean;
  source: 'pointer' | 'keyboard' | 'head';
  timestamp: number;
}>;

interface InteractionProvider {
  readonly source: InteractionFrame['source'];
  start(publish: (sample: InteractionFrame) => void, confirm: () => void): Promise<void> | void;
  stop(): void;
}

type Zone = 'left' | 'center' | 'right';

type SelectionState = Readonly<{
  phase: 'idle' | 'collect' | 'freeze' | 'resolved';
  zone: Zone | null;
  dwellMs: Readonly<Record<Zone, number>>;
  elapsedMs: number;
  winnerId: string | null;   // track-a | track-b | track-c
}>;

interface ZoneDwellSelector {
  begin(): void;                                          // 进入 collect
  update(frame: InteractionFrame, dtMs: number): SelectionState;
  confirm(zone: Zone): SelectionState;                    // click / Enter：立即 resolved
  readonly state: SelectionState;
}

// ---- 渲染 ----
interface SceneRenderer {
  mount(host: HTMLElement, context: RendererContext): void | Promise<void>;
  update(scene: SceneFrame, interaction: InteractionFrame, selection?: SelectionState): void;
  destroy(): void;
}

type RendererContext = Readonly<{
  assets: AssetManifest;
  content: ContentRegistry;
  latch: (id: string) => boolean;   // ChapterRuntime.fireOnce；首次返回 true
  audio: AudioBus;
  reducedMotion: boolean;
}>;

// ---- 神谕镜 / HTML-in-Canvas（D-010）----
interface HtmlCanvasBridge {
  readonly mode: 'dom' | 'polyfill' | 'native';
  mount(host: HTMLElement, elements: readonly HTMLElement[]): void;
  updateGeometry(elementId: string, transform: DOMMatrix): void;
  requestPaint(elementId: string): void;
  destroy(): void;
}

// ---- 音频（D-009）----
interface AudioBus {
  load(stemId: string): Promise<void>;
  play(stemIds: readonly string[], opts?: { syncAt?: number; loop?: boolean }): void;
  setMix(params: Readonly<Record<string, number>>): void;   // 如 { sirensLeft: 0.8, sirensRight: 0.2 }
  stop(stemIds?: readonly string[]): void;
}
```

### 5.2 `story.config` 示例 schema

```ts
export const storyConfig = {
  release: {
    id: 'roadshow-60s',
    targetDurationSeconds: 60,
    enabledTrackIds: ['track-c'],
    disabledChoiceBehavior: 'placeholder',   // D-001：可胜出，落到 placeholderChapterId
    placeholderChapterId: 'memory-pending',
    defaultTrackId: 'track-c'                // D-002：无输入时"海替你决定"
  },
  flow: {
    entry: 'troy',
    hub: 'selection',
    tracks: {
      'track-a': [],                          // 未制作
      'track-b': [],
      'track-c': ['sirens', 'scylla', 'cattle']
    },
    finale: 'homecoming'
  },
  chapters: [
    {
      id: 'troy',
      kind: 'linear',
      timeline: { start: 0, end: 1000 },
      scroll: { screens: 4 },
      scenes: [
        { id: 'troy-horse', road: { start: 0, end: 600 }, blend: { in: 0, out: 120 }, layer: 10, renderer: 'sequence', asset: 'troy-sequence' },
        { id: 'troy-captions', road: { start: 0, end: 1000 }, blend: { in: 0, out: 0 }, layer: 50, renderer: 'dom' },
        { id: 'troy-crack-to-sea', road: { start: 480, end: 1000 }, blend: { in: 120, out: 0 }, layer: 20, renderer: 'sequence', asset: 'crack-to-sea' }
      ]
    },
    {
      id: 'selection',
      kind: 'hub',
      timeline: { start: 0, end: 1000 },
      scroll: { screens: 4 },
      gate: { atRoad: 250 },                  // 镜升起后锁滚动，进入真实时间 5s 窗口
      scenes: [
        { id: 'selection-sea', road: { start: 0, end: 1000 }, blend: { in: 0, out: 0 }, layer: 10, renderer: 'sequence', asset: 'sea-hub' },
        { id: 'selection-mirrors', road: { start: 0, end: 1000 }, blend: { in: 150, out: 0 }, layer: 30, renderer: 'mirrors' }
      ]
    }
    // sirens / scylla / cattle / homecoming / memory-pending 由 T6 填写
  ]
} as const;
```

`release.enabledTrackIds` 控制哪些 Track 有真实后续章节；不在其中的胜者路由到 `placeholderChapterId`。将来开放 Track 1/2 只改 `enabledTrackIds` 与 `flow.tracks`，不改 Renderer 或选择算法。

Road 是章节局部逻辑时间。Router 决定当前章节，Director 决定章节内的场景进度。

### 5.3 config 校验必须拒绝

- 重复 chapter/scene ID；
- 无效或越界 Road；
- timeline 两端未覆盖或中间有 gap；
- blend 为负或超过场景长度；
- 未注册 Renderer；
- 缺失 asset ref；
- flow 指向不存在章节；
- `enabledTrackIds`、`defaultTrackId` 不是 `flow.tracks` 的 key；`placeholderChapterId` 不存在；
- `enabledTrackIds` 中的 Track 章节列表为空，或 `flow.tracks` 引用不存在章节；
- hub 章缺 `gate` 或 `gate.atRoad` 越界；
- 非 hub 章带 `gate`。

## 6. HTML-in-Canvas + Three.js + MediaPipe

> 第一版口径（D-010）：神谕镜走 `SemanticDomBridge`（真实 DOM + CSS 3D）。本节描述的原生/polyfill 路径是同一 `HtmlCanvasBridge` 契约下的第二波任务（T14），不阻塞 MVP。

### 6.1 正确的能力模型

原生 HTML-in-Canvas 不是截图库。Canvas 的 `layoutsubtree` 子元素仍是真实 DOM；`drawable` 指定可绘制子树；`paint` 告知内容快照改变；2D 用 `drawElementImage`，WebGL 当前 explainer 用 `texElementSubImage2D`；`updateElementGeometry` 把 3D 投影同步给 DOM hit testing 与 accessibility geometry。

```text
真实 semantic HTML (button/input/link)
  -> browser layout + accessibility tree
  -> drawable snapshot
  -> HTMLTexture / WebGL texture
  -> Three.js mesh + material/shader
  -> per-frame projected DOMMatrix
  -> updateElementGeometry
  -> 原生 pointer event / focus / screen reader geometry
```

### 6.2 capability adapter 决策树

```text
detect at runtime
├── native layout + draw + Three-compatible upload + geometry API
│     -> NativeThreeHtmlBridge
├── API 存在但 Three 版本不兼容，或 API 缺失
│     -> ThreeHtmlRenderPolyfillBridge
└── WebGL/context/polyfill 失败
      -> SemanticDomBridge（同一份 HTML、无 3D，仍可完成选择）
```

固定 Three.js 精确版本，不用 `^` 漂移；所有实验 API 名称只允许出现在 `capabilities/htmlInCanvas.ts`。升级 Chromium、Three.js 或 polyfill 时只改 adapter 与兼容性测试。

### 6.3 双输入并行，不塞进 Director

```text
Scroll -> StoryDirector -> SceneFrame -------------------┐
                                                         ├-> OracleMirrorsRenderer（经 HtmlCanvasBridge）
Camera -> MediaPipe -> InteractionEngine -> InteractionFrame ┘
HTML subtree -> HtmlCanvasBridge -> HTMLTexture -> Mesh
Mesh projection -> geometry sync -> DOM hit testing
```

MediaPipe 只输出 `x/y/z/yaw/focusX/confidence/source/detected/timestamp`。Renderer 可以用它做视差；`ZoneDwellSelector` 用它做三区累计；Director 对摄像头完全无知。

### 6.4 可访问性和隐私

- 用户点击后才请求摄像头；localhost/HTTPS 才启用。
- 不录制、不上传、不保存视频帧、landmarks、脸宽、yaw、逐帧轨迹。
- 不可见 HTML subtree 必须 `inert`/`aria-hidden` 或移除，避免 ghost content。
- 跨域图片、iframe、visited link、spellcheck/autofill preview 等原生绘制受隐私限制；资产默认同源。
- pointer、keyboard 使用相同选择状态机（`ZoneDwellSelector`）；点击 / Enter 通过 `confirm()` 立即结束窗口。

详见 `TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md`。

## 7. 开发规范与迭代流程

### 7.1 推荐顺序与验收

| 阶段 | 只做什么 | 验收标准 |
| --- | --- | --- |
| MVP（TASKS T0–T7 + I1） | validator、Router、Director、ProgressSource/ScrollGate、ZoneDwellSelector、DOM/色块、DOM 神谕镜、PreRoll、Road panel | 60 秒六章 + 占位章可达；三区累计选择可用；scroll/debug 同帧；无 WebGL 走完全程 |
| Sequence | manifest、帧加载、最近帧 fallback | 首/中/尾帧正确；快速 seek 无黑帧 |
| Overlap | registry 统一计算 active/opacity | 交界前/中/后无 gap；Renderer 无 handoff 常量 |
| DOM | 旁白、字幕、导航、无障碍 | 键盘可达；screen reader 语义稳定；reduced motion 可用 |
| Three HTML（T14） | native/polyfill 接入既有 `HtmlCanvasBridge` | button 原生交互；旋转时 hit testing 对齐；API 状态可诊断 |
| MediaPipe（T2/T15） | 头部方向、校准、三区累计、隐私 | 拒绝权限仍完整；无脸不累计；全程运行不泄漏 |
| Shader | 只做已批准润色 | context loss 有 fallback；不改 Road/Router；性能预算通过 |

### 7.2 加、改、删章节

新增同类章节：

1. 在 `story.config` 增加 chapter/scene 与 flow 引用。
2. 若复用素材与 Renderer，到此结束。
3. 有新素材时只增加 manifest 和文件。
4. 只有新渲染技术/生命周期无法由现有 `behavior` 表达时，才注册新 Renderer。
5. validator、Road 面板、导航必须从 config 自动出现，不手写第二份列表。

调整 overlap：只改相邻 scene 的 `road` 与 `blend`；不得在 CSS/GLSL/JSX 补第二个阈值。

删除章节：先删 flow 引用，再删 chapter，最后清理无引用 asset；校验器应报告悬空引用。

### 7.3 命名与常量

- 稳定 ID 用 kebab-case：`intro`、`chapter-a`、`outro`。
- `road` 是当前章节逻辑时间；`localProgress` 是场景归一化 0..1；`rawProgress` 是输入比例。
- 会随叙事节奏改变的数字只能在 config；帧数/路径/tier 只能在 manifest。
- DPR cap、采样数等纯渲染参数可留 Renderer；影响质量或性能时写注释和测试。
- 禁止用 scene 数组下标推断身份；禁止组件读取 `window.scrollY` 后自行算章节。

### 7.4 素材接入

```text
public/assets/sequences/<asset-id>/desktop/frame-0001.webp
public/assets/posters/<asset-id>.webp
```

第一版只有 `desktop` tier（D-008）；`tier` 字段保留以便扩展。接入前检查：命名连续、大小写、首/中/尾帧、自然尺寸、色彩空间、cover anchor、前章尾帧与后章首帧构图对齐、poster/fallback、许可来源。

### 7.5 转场分类

| 类型 | 用于 | 所有者 | 不要用在 |
| --- | --- | --- | --- |
| asset crossfade | 两镜头构图可直接衔接 | scene interval + blend | 主体轴线不一致 |
| procedural shader | 必须扭曲/遮罩/生成像素 | ShaderRenderer；progress 来自 frame | 普通 dissolve 足够时 |
| CSS/DOM | 文案、线条、控件、layout | DomRenderer | 重像素媒体 |
| spatial handoff | HTML 卡片从界面进入 3D/回到 DOM | ThreeHtmlRenderer + bridge | 没有 fallback 时 |

转场只有拥有独立素材/生命周期、需要 Road 寻址或横跨多个邻居时才建独立 scene。

### 7.6 AI / Vibe Coding 协作

可交给 Agent：按契约实现 Renderer、loading/fallback/cleanup、确定性 GLSL、validator、fixture、资产/Prompt 生成和一致性测试。

必须由人或架构层复核：Road 表、Track 顺序、章节身份、handoff、无障碍、摄像头文案与隐私、雷击亮度与时长、素材许可、角色与世界观锁定。

Agent 提交 timing 变化时必须展示 config diff；禁止用藏在 JSX、CSS、GLSL 的阈值“修好”视觉偏差。项目级细则见根目录 `AGENTS.md`。

## 8. UI/UX 方向、测试与路线图

### 8.1 视觉系统草案

采用剧本 01 §4 的美术方向（D-012）：镜外世界近黑、低饱和、安静；镜内世界高饱和油画 + 真实 HTML 字体。

| Token | 值（初始，T4 可调） | 角色 |
| --- | --- | --- |
| `sea-black` | `#070B10` | 选择页与全片底色 |
| `deep-sea` | `#0A2238` | 海面暗部、界面底 |
| `horizon` | `#6E8FA6` | 低亮海平线、星点 |
| `bronze` | `#8A6A3A` | 神谕镜边框主色 |
| `verdigris` | `#4F7A6A` | 边框绿锈、盐蚀 |
| `aged-gold` | `#C9A45C` | 金纹闭合、稀缺强调 |
| `ivory` | `#E9E1CF` | 镜内正文、占位章石灰白 |
| `oxblood` | `#6D2E2B` | 代价/危险，不作普通 CTA |

三 Track 色板（镜内）：I 孔雀蓝/赭石/暗金；II 酒红/紫黑/冷银；III 群青/象牙白/太阳金。

字体：正文优先本地 serif（Iowan Old Style / Palatino / Source Han Serif 回退），控件用克制 sans；不依赖网络字体完成首屏。希腊文只在真实叙事标识中出现。

```text
┌──────────────────────── near-black Aegean, sparse stars ────────────────────────┐
│                                                                                  │
│      ╭──────╮            ╭──────╮             ╭──────╮                          │
│      │  I   │            │  II  │             │ III  │   青铜边框、窄高、弧面   │
│      │ real │            │ real │             │ real │   左右镜朝中心内扣       │
│      │ HTML │            │ HTML │             │ HTML │   目标镜前移·放大·转正   │
│      ╰──────╯            ╰──────╯             ╰──────╯                          │
│────────────────────────── low-luminance horizon ─────────────────────────────────│
│  看向一段命运。海会替你记住停留。                       方向仅在本机即时计算。   │
└──────────────────────────── dev Road panel (?debug=1) ───────────────────────────┘
```

避免：等宽 SaaS 圆角卡片网格；每段"标签 + 大标题 + 渐变"；全元素自动 fade-up；百分比/倒计时数字。运动只响应滚动、头部/指针、累计与胜出。

### 8.2 自动检查

未来统一命令应覆盖：release/config、路演版 Track 3 单路径、Road 映射/边界吸附、overlap、素材连续性、Prompt 中英文 ID 对齐、production build。HTML-in-Canvas capability probe 作为浏览器集成测试，不冒充 Node 单测。

### 8.3 人工验收清单

- 每章开始/中点/结束；每个 overlap 前/中/后；快速滚动与连续 seek。
- 1920×1080 与 1440×900 两档桌面视口（D-008）。
- 键盘、pointer、reduced motion；摄像头拒绝/撤销/无人脸。
- 原生、polyfill、DOM fallback 三条路径；HTML input/button、focus、hit testing。
- Track 1/2 胜出进入 `memory-pending` 且两个按钮可用；Track 3 胜出后滚动进入 sirens 并最终到 homecoming。
- 选择窗口内滚轮被锁；resolved 后解锁；无输入 5s 落到 Track 3。
- 生产 preview；context loss；雷击只触发一次。

### 8.4 变更影响速查

| 想改什么 | 只需改 | 不该改 |
| --- | --- | --- |
| 章节时长/overlap | `story.config` | Renderer、CSS、GLSL |
| 换同类型素材 | manifest + asset | Director、Router |
| 加同类型 Track | config + 可选 manifest/content | Renderer registry |
| 调凝视权重 | Interaction provider/controller | Road、scene timing |
| 换 Three/WICG 版本 | capability adapter + integration tests | story config |
| 换故事文案 | content/Prompt registry | Renderer |

### 8.5 路线图

路线图已细化为任务卡，见 `docs/TASKS.md`：

- **第一波（T0–T7 → I1）**：60 秒占位版跑通——validator、Router/Director、ProgressSource/ScrollGate、ZoneDwellSelector、pointer/keyboard/MediaPipe、Sequence 占位、DOM 字幕、DOM/CSS 神谕镜、PreRoll、占位章、结束态、Prompt 重写。
- **第二波（T8–T15）**：塞壬显影、UV 探视、牛群与前倾、雷击 latch 与残影、autopilot、WebAudioBus、HTML-in-Canvas native/polyfill、设备实测调参。

停止条件不变：任何第二波效果都不得迫使 story schema、Router/Director 边界或 Renderer 生命周期重写。

## 9. 来源与验证入口

### 仓库证据

- `references/pear-no/src/App.jsx` 与 `src/timeline.js`：单一 scroll 入口、现有编排与逻辑 Road 映射。
- `references/pear-no/src/spatial/htmlTexture.js`：参考实现的 native probe + html2canvas 静态纹理路径。
- `references/pear-no/src/spatial/createSpatialScene.js`：Three.js 卡片、迟滞与 off-axis projection。
- `references/pear-no/src/spatial/MediaPipeHeadTracker.js`：本地摄像头、24Hz 推理、头部/yaw。
- `docs/reference/PEAR_ARCHITECTURE_AUDIT.md`：完整架构审计摘要。

### 官方来源（2026-09-05 查询）

- WICG HTML-in-Canvas README：https://github.com/WICG/html-in-canvas
- Chrome Status：https://chromestatus.com/feature/5172548013916160
- Three.js HTML texture example：https://threejs.org/examples/webgl_materials_texture_html.html
- Three.js `HTMLTexture` PR：https://github.com/mrdoob/three.js/pull/31233
- MediaPipe Face Landmarker Web：https://developers.google.com/mediapipe/solutions/vision/face_landmarker/web_js
- MDN `getUserMedia()`：https://developer.mozilla.org/docs/Web/API/MediaDevices/getUserMedia

## 10. 最易混淆的五件事

`StoryRouter` 选章节，`StoryDirector` 只管章节内 Road；选择窗口是真实时间、其余都是滚动（D-005）；神谕镜第一版就是真实 DOM + CSS 3D，HTML-in-Canvas / Three 只是同一契约下的增强路径；MediaPipe 只提供低维输入且全程运行；视觉行为与章节 config 不互相拥有。
