# 《归航 / NOSTOS》目标架构与开发规范

> [Rebuilt by dev-trace init: 2026-09-05 from fresh repository scan]
> 状态：设计草案，尚未实现
> 范围：滚动叙事运行时、分支章节路由、多渲染层、HTML-in-Canvas、Three.js、MediaPipe、素材与 Prompt 管理
> 权威材料：`docs/ROADSHOW_60S_CUT.md`、`docs/TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md`、`references/pear-no/src/`
> 姊妹文档：`docs/PROMPT_SYSTEM_DESIGN.md`、`docs/reference/PEAR_ARCHITECTURE_AUDIT.md`
> 更新日期：2026-09-05

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
| 已确认 | 当前只制作 60 秒路演；Hub 展示三 Track，仅 Track 3 可确认 | `ROADSHOW_60S_CUT.md` |
| 已确认 | WICG API 仍位于 Chromium flag 后 | WICG README，2026-09-05 查询 |
| 已确认 | Three.js r185 的 `HTMLTexture` 仍探测 `texElementImage2D` | Three.js r185 `WebGLTextures.js` |
| 已确认 | WICG 当前说明使用 `texElementSubImage2D` | WICG README |
| 设计决策 | 每个章节使用独立 Road，Router 负责动态播放顺序 | 避免为六种 Track 顺序制造全局 magic number |
| 设计决策 | HTML-in-Canvas 经 capability adapter 接入 | 实验 API 改名不污染业务 Renderer |
| 待验证 | 当前用户 Chromium 是否同时保留新旧 WebGL API | 实现阶段在目标浏览器运行 capability probe |
| 待验证 | 头部停留阈值、低光准确率、移动端取舍 | 必须做真实用户测试，不在架构层宣称结论 |

## 2. 代码组织结构：组合优先，插件隔离

### 2.1 推荐目录（目标态）

```text
odysseys-road/
├── AGENTS.md
├── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ROADSHOW_60S_CUT.md
│   ├── TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md
│   ├── PROMPT_SYSTEM_DESIGN.md
│   └── reference/
├── prompts/
│   ├── prompt.registry.ts          # 双语共享锁与场景变量的唯一维护源
│   ├── README.md
│   └── generated/                  # 可直接发送给不同 AI 的完整文件
│       ├── zh/*.system.md
│       └── en/*.system.md
├── public/assets/
│   ├── images/<asset-id>/<tier>/
│   ├── sequences/<asset-id>/<tier>/
│   ├── video/<asset-id>/<tier>/
│   ├── audio/<asset-id>/
│   └── models/
├── scripts/
│   ├── validate-assets.mjs
│   ├── generate-prompts.mjs
│   └── validate-prompts.mjs
├── src/
│   ├── app/                        # React composition root；只接线
│   ├── config/
│   │   ├── story.config.ts         # release profile、章节、Road、overlap、renderer、asset ref
│   │   └── assets.manifest.ts      # 路径、帧数、tier、poster、预加载策略
│   ├── content/                    # 字幕/旁白/可访问文本；不含 timing
│   ├── core/
│   │   ├── StoryRouter.ts          # 分支顺序与完成状态
│   │   ├── StoryDirector.ts        # 输入进度 -> 当前章节 Road
│   │   ├── SceneRegistry.ts        # Road -> SceneFrame[]
│   │   ├── contracts.ts
│   │   └── validateStory.ts
│   ├── interaction/
│   │   ├── InteractionEngine.ts    # 多输入归一、平滑、可信度
│   │   ├── DwellController.ts      # 停留/确认状态机
│   │   └── providers/              # pointer、keyboard、MediaPipe
│   ├── capabilities/
│   │   └── htmlInCanvas.ts         # 原生 API、版本适配、polyfill、fallback
│   ├── renderers/
│   │   ├── SequenceRenderer.ts
│   │   ├── VideoRenderer.ts
│   │   ├── DomRenderer.ts
│   │   ├── ShaderRenderer.ts
│   │   ├── ThreeHtmlRenderer.ts
│   │   └── rendererRegistry.ts
│   ├── components/
│   │   ├── RendererStage.tsx
│   │   └── DevRoadPanel.tsx
│   └── styles/
└── tests/
    ├── config.test.ts
    ├── director.test.ts
    ├── router.test.ts
    └── interaction.test.ts
```

### 2.2 执行包含树（谁创建、谁持有）

```text
AppRoot  <<Root Aggregate / page lifetime>>
├── StoryRouter                  持有旅程级状态
├── ChapterRuntime              当前章节生命周期
│   ├── StoryDirector            无视觉状态
│   ├── SceneRegistry            纯场景解析
│   └── RendererStage
│       └── SceneRenderer[*]     各自持有 GPU/Canvas/Media 私有资源
├── InteractionEngine           持有实时交互样本
│   ├── PointerProvider
│   ├── KeyboardProvider
│   └── MediaPipeProvider?       用户授权后才存在
└── DevRoadPanel?               仅开发环境
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
| `InteractionProvider` | pointer、keyboard | MediaPipe head、head+gaze | pointer/keyboard |
| `HtmlCanvasBridge` | 能力探测后选择 | WICG native、polyfill | semantic DOM |
| `ProgressStore` | memory/localStorage | URL/session adapter | 新旅程状态 |
| `AssetLoader` | browser fetch/Image | cache/prefetch scheduler | poster/最近可用帧 |

### 2.5 设计模式（只使用有必要的名字）

| 模式 | 代码体现 | 解决的问题 |
| --- | --- | --- |
| Strategy/Plugin | `rendererRegistry[key] -> SceneRenderer` | 更换渲染技术不改 Director |
| Adapter | `htmlInCanvas`、各 `InteractionProvider` | 隔离浏览器 API 与输入设备差异 |
| State Machine | `StoryRouter`、`DwellController` | 分支完成状态与停留确认可测试 |
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
| dwell/armed/selected | `DwellController` | 一次选择仪式 | MediaPipe provider |
| texture、video、GPU buffer、最近帧 | 各 Renderer | scene mount→destroy | Director/App |
| 文件路径与 tier | asset manifest | build/config | JSX/Renderer |

## 3. 运行时调用图

### 3.1 主路径

```text
window scroll / DevRoadPanel seek
  -> ScrollInputAdapter.normalize()
  -> StoryDirector.frame(progress)
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
  -> DwellController.update()
       ├── preview/ranking -> ThreeHtmlRenderer visual feedback
       └── confirmed TrackId -> StoryRouter.selectTrack(trackId)
                                   -> destroy current ChapterRuntime
                                   -> create selected ChapterRuntime
                                   -> Road 从该章节 timeline.start 开始
```

关键 handoff：只有 `DwellController` 可以把“关注”升级成“确认”；只有 `StoryRouter` 可以把 Track ID 升级成章节切换。MediaPipe、Three.js Mesh 和 HTML button 都不能直接改 `completedTrackIds`。

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
5. 页面隐藏、章节离开或选择确认时，摄像头与动画循环必须停止。
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

```ts
type SceneDefinition = Readonly<{
  id: string;
  road: Readonly<{ start: number; end: number }>;
  blend: Readonly<{ in: number; out: number }>;
  layer: number;
  renderer: 'sequence' | 'video' | 'dom' | 'shader' | 'three-html';
  asset?: string;
  behavior?: Readonly<Record<string, unknown>>;
}>;

type ChapterDefinition = Readonly<{
  id: string;
  kind: 'linear' | 'hub' | 'track' | 'finale';
  timeline: Readonly<{ start: number; end: number }>;
  scroll: Readonly<{ screens: { desktop: number; mobile: number } }>;
  scenes: readonly SceneDefinition[];
}>;

interface StoryDirector {
  fromScroll(scrollTop: number, maxScroll: number): DirectorFrame;
  fromRoad(road: number, source?: 'debug'): DirectorFrame;
  scrollTopForRoad(road: number, maxScroll: number): number;
}

interface SceneRenderer {
  mount(host: HTMLElement, context: RendererContext): void | Promise<void>;
  update(scene: SceneFrame, interaction: InteractionFrame): void;
  destroy(): void;
}

interface InteractionProvider {
  start(publish: (sample: InteractionSample) => void): Promise<void> | void;
  stop(): void;
}
```

### 5.2 `story.config` 示例 schema

```ts
export const storyConfig = {
  release: {
    id: 'roadshow-60s',
    targetDurationSeconds: 60,
    enabledTrackIds: ['chapter-c'],
    disabledChoiceBehavior: 'preview-only'
  },
  flow: {
    entry: 'intro',
    hub: 'chapter-hub',
    choices: ['chapter-a', 'chapter-b', 'chapter-c'],
    finale: 'outro'
  },
  chapters: [
    {
      id: 'intro',
      kind: 'linear',
      timeline: { start: 0, end: 1200 },
      scroll: { screens: { desktop: 6, mobile: 7 } },
      scenes: [
        {
          id: 'intro-a',
          road: { start: 0, end: 700 },
          blend: { in: 0, out: 140 },
          layer: 10,
          renderer: 'sequence',
          asset: 'intro-sequence'
        },
        {
          id: 'intro-b',
          road: { start: 560, end: 1200 },
          blend: { in: 140, out: 0 },
          layer: 20,
          renderer: 'video',
          asset: 'intro-video'
        }
      ]
    }
  ]
} as const;
```

`release.enabledTrackIds` 控制当前可确认的 Track。路演版显示三张卡，但只有 `chapter-c`（Track 3）可确认；将来开放 Track 1/2 只改 release profile，不改 Renderer 或凝视算法。

Road 是章节局部逻辑时间。Router 决定当前章节，Director 决定章节内的场景进度。

### 5.3 config 校验必须拒绝

- 重复 chapter/scene ID；
- 无效或越界 Road；
- timeline 两端未覆盖或中间有 gap；
- blend 为负或超过场景长度；
- 未注册 Renderer；
- 缺失 asset ref；
- flow 指向不存在章节；
- release 启用不属于 flow choices 的 Track，或 preview-only 卡片仍可确认；
- Hub choices 重复、已完成 Track 仍可被主线选择。

## 6. HTML-in-Canvas + Three.js + MediaPipe

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
                                                         ├-> ThreeHtmlRenderer
Camera -> MediaPipe -> InteractionEngine -> InteractionFrame ┘
HTML subtree -> HtmlCanvasBridge -> HTMLTexture -> Mesh
Mesh projection -> geometry sync -> DOM hit testing
```

MediaPipe 只输出 `x/y/z/confidence/source/detected/timestamp`。Renderer 可以用它做视差；DwellController 可以用它做停留；Director 对摄像头完全无知。

### 6.4 可访问性和隐私

- 用户点击后才请求摄像头；localhost/HTTPS 才启用。
- 不录制、不上传、不保存视频帧、landmarks、脸宽、yaw、逐帧轨迹。
- 不可见 HTML subtree 必须 `inert`/`aria-hidden` 或移除，避免 ghost content。
- 跨域图片、iframe、visited link、spellcheck/autofill preview 等原生绘制受隐私限制；资产默认同源。
- pointer、touch、keyboard 使用相同选择状态机；点击可立即确认，不强制等待凝视时长。

详见 `TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md`。

## 7. 开发规范与迭代流程

### 7.1 推荐顺序与验收

| 阶段 | 只做什么 | 验收标准 |
| --- | --- | --- |
| MVP | release/config validator、Router、Director、DOM/色块、Road panel | 60 秒路演六章可达；只允许 Track 3；scroll/debug 同帧；无 WebGL 也能走完全程 |
| Sequence | manifest、帧加载、最近帧 fallback、tier | 首/中/尾帧正确；快速 seek 无黑帧；mobile 构图可读 |
| Overlap | registry 统一计算 active/opacity | 交界前/中/后无 gap；Renderer 无 handoff 常量 |
| DOM | 旁白、字幕、导航、无障碍 | 键盘可达；screen reader 语义稳定；reduced motion 可用 |
| Three HTML | 原生/polyfill/DOM 三路径 | button/input 原生交互；旋转时 hit testing 对齐；API 状态可诊断 |
| MediaPipe | 头部方向、dwell、隐私生命周期 | 拒绝权限仍完整；离场轨道停止；无脸不累计 |
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
public/assets/sequences/<asset-id>/
├── desktop/frame-0001.webp
└── mobile/frame-0001.webp
```

接入前检查：命名连续、大小写、首/中/尾帧、自然尺寸、色彩空间、cover anchor、前章尾帧与后章首帧构图、poster/fallback、许可来源。共享同一 tier 也必须在 manifest 显式声明。

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

必须由人或架构层复核：Road 表、Track 顺序、章节身份、handoff、移动端构图、无障碍、摄像头文案与隐私、素材许可、角色与世界观锁定。

Agent 提交 timing 变化时必须展示 config diff；禁止用藏在 JSX、CSS、GLSL 的阈值“修好”视觉偏差。项目级细则见根目录 `AGENTS.md`。

## 8. UI/UX 方向、测试与路线图

### 8.1 视觉系统草案

| Token | 值 | 角色 |
| --- | --- | --- |
| `cerulean` | `#1D5FA8` | 广阔天空、方向感 |
| `deep-sea` | `#0A3152` | 海与界面底色 |
| `aged-gold` | `#B58A3C` | 选择进度、稀缺强调 |
| `marble` | `#E6D8BD` | HTML 航海铭牌 |
| `oxblood` | `#6D2E2B` | 代价/危险，不作为普通 CTA |
| `charcoal` | `#15120F` | 字体与阴影 |

字体策略：正文优先高可读本地 serif（Iowan Old Style/Palatino/Source Han Serif 回退），控制和数据用克制 sans；不依赖网络字体完成首屏。标题不是装饰性全大写，希腊文只在真实叙事标识中出现。

唯一高记忆点是海平线上三块可交互真实 HTML 铭牌：

```text
┌────────────────────────── flat cerulean sky ──────────────────────────┐
│                           叙事提示 / 留白                              │
│        ╱ card A ╲          │ card B │          ╱ card C ╲             │
│       real HTML             selected Z-depth       real HTML           │
│──────────────────────────── sea horizon ──────────────────────────────│
│                        small persistent ship                          │
│ [quiet route/status]                         [consent/fallback action] │
└────────────────────── dev Road panel (development only) ──────────────┘
```

避免三项模板化倾向：不做等宽 SaaS 圆角卡片网格；不在每段堆“标签 + 大标题 + 渐变”；不为所有元素添加自动 fade-up。运动只响应滚动、视差、选择和确认。

### 8.2 自动检查

未来统一命令应覆盖：release/config、路演版 Track 3 单路径、Road 映射/边界吸附、overlap、素材连续性、Prompt 中英文 ID 对齐、production build。HTML-in-Canvas capability probe 作为浏览器集成测试，不冒充 Node 单测。

### 8.3 人工验收清单

- 每章开始/中点/结束；每个 overlap 前/中/后；快速滚动与连续 seek。
- 390×844 与至少一个桌面视口；desktop/mobile tier 和 crop。
- 键盘、pointer、touch、reduced motion；摄像头拒绝/撤销/无人脸。
- 原生、polyfill、DOM fallback 三条路径；HTML input/button、focus、hit testing。
- 路演版 Track 1/2 只反馈不可确认，Track 3 确认后进入 finale。
- 生产 preview；context loss；离开选择页后摄像头灯与 track 状态。

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

- **P0：60 秒路演骨架。** release/config/manifest、Router/Director/Registry、六章 Road、Sequence placeholder、DOM、Road panel、Track 3 单路径与降级导航。
- **P1：空间选择。** ThreeHtmlRenderer、native/polyfill/DOM bridge、interaction engine、pointer/keyboard、真实 HTML hit testing。
- **P2：感知与路演润色。** 按需 MediaPipe、dwell UX、Video/Shader、空间音频、头部探视、性能预算和视觉回归。

停止条件：任何 P2 效果都不得迫使 P0 的 story schema、Router/Director 边界或 Renderer 生命周期重写。

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

`StoryRouter` 选章节，`StoryDirector` 只管章节内 Road；HTML-in-Canvas 原生路径保留真实 DOM，html2canvas 只是像素回退；Three.js 管空间与材质，MediaPipe 只提供低维输入；视觉行为与章节 config 不互相拥有。
