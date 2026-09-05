# 《归航 / NOSTOS》空间 Track 选择技术设计

> **V2 说明（2026-09-05）**：本文描述 V1「三面神谕镜」交互的**技术模式**（累计停留、HTML 镜面、InteractionFrame 消费），供 V2 重做 UX 时参考；**具体镜数、文案、章节名不绑定 V2**。V1 产品决策见 `archive/v1-60s-ai-roadshow/docs/DECISIONS.md`。

> 版本：V2.1（选择机制改为三区累计停留，吸收 D-001/D-002/D-003/D-010）
> 状态：**技术参考** — V2 交互待重新设计
> 目标：三面真实 HTML 神谕镜（第一版 DOM/CSS 3D，预留 HTML-in-Canvas + Three.js），通过头部朝向的累计停留或常规输入选择 Track
> 架构约束：本模块只接收 `SceneFrame`、`InteractionFrame` 与 `SelectionState`，不拥有 Road、章节顺序或完成状态
> 更新日期：2026-09-05

> 第一版口径（见 `DECISIONS.md`）：三镜均可胜出；Track 1/2 胜出进入 `memory-pending` 占位章（D-001）。选择规则是 §7 的三区累计，不是早期的"连续停留 + 确认"两段式（D-002）。摄像头全程运行，不在选中后停止（D-003）。神谕镜第一版走 `SemanticDomBridge`（D-010）。

## 1. 结论先行

这个体验技术上可行，但必须纠正 V1 的一个关键表述：

> HTML-in-Canvas 原生能力不是“把 HTML 截成 CanvasTexture”。它让 Canvas 后代参与真实 DOM layout 和 accessibility，再把 `drawable` 子树绘制到 Canvas/WebGL，并通过 geometry 同步保留 hit testing。

`html2canvas` 仍可作为像素回退，但它没有原生路径的交互和可访问性能力，不能与原生 HTML-in-Canvas 视为同一个层级。

推荐架构：

```text
Scroll -> StoryDirector -> SceneFrame ------------------------┐
                                                              ├-> OracleMirrorsRenderer
Pointer/Keyboard/Camera -> InteractionEngine -> InteractionFrame ┘

HTML subtree -> HtmlCanvasBridge -> THREE.HTMLTexture -> Mesh
Mesh projection -> GeometrySync -> DOM hit testing/accessibility
ZoneDwellSelector -> winnerId -> StoryRouter
```

首发不做精确眼动追踪，以头部 yaw 为注视代理。第一版就同时提供 pointer/keyboard/MediaPipe 三种 provider（T2）；神谕镜用 DOM/CSS 3D（T4）；HTML-in-Canvas 原生路径与 Three.js 是第二波（T14）。虹膜方向只有在真实测试证明优于纯头部方案时才作为小权重增强。

## 2. 用户体验设计

### 2.1 叙事定位

选择不是菜单，而是“已经发生的三股记忆在海面上重新获得深度”。三块画卷固定为左、中、右，不因关注排名交换位置：

| 位置 | 稳定 ID | 主题 | 符号 |
| --- | --- | --- | --- |
| 左 | `track-a` | 智慧与傲慢 | 莲花、独眼、风袋 |
| 中 | `track-b` | 诱惑与死亡 | 石港、金杯、冥界石碑 |
| 右 | `track-c` | 歌声与牺牲 | 音波、双崖、黑色太阳 |

排名只能改变 Z 深度、亮度、清晰度、轻微比例、声音和停留环。目标位置移动会制造错误反馈循环，因此禁止换位。

### 2.2 输入不是门槛

默认支持 pointer、keyboard；摄像头在页面加载后立即请求（D-004 V2，无按钮），活画底部显示：

> 影像只在本机处理，不录制、不上传。

权限拒绝、设备缺失、无脸或性能不足时不弹阻断对话框，保留三块 HTML button，并提示已切换到指针航向。

### 2.3 体验状态

1. **Rise**（滚动驱动）：三镜升起；hover/focus/头部偏向已有 5–8% 靠近反馈，但不累计。
2. **Collect**（真实时间 4.5s）：滚动被锁；按头部/指针所在区累计停留；镜面远近、亮度、金纹随累计比例变化。
3. **Freeze**（真实时间 0.5s）：停止累计，排名显形。
4. **Resolved**：产出一次 `winnerId`；解锁滚动；摄像头继续运行。

鼠标点击某镜或键盘 Enter 在任意阶段立即 Resolved，不必等 5 秒。没有触摸路径（D-008）。

## 3. 原生 HTML-in-Canvas 能力边界

### 3.1 五组原语

根据 WICG 当前 explainer：

| 原语 | 用途 | 本项目责任 |
| --- | --- | --- |
| `<canvas layoutsubtree>` | 让 Canvas 后代参与 layout/accessibility | bridge 创建或配置宿主 |
| `drawable` | 声明可绘制的 HTML 子树 | 每张 Track 卡片根元素 |
| `paint` / `requestPaint()` | DOM 快照改变时同步绘制 | 触发 HTMLTexture 更新 |
| `drawElementImage` / WebGL upload | 把快照画入 2D 或纹理 | Three/bridge 实现 |
| `updateElementGeometry` / `clearElementGeometry` | 把绘制位置同步到 DOM hit testing | 每帧投影和销毁清理 |

HTML 子树仍是原生 DOM，可包含 button、input、link、国际化排版和辅助技术语义；它不是一张失去事件能力的截图。

### 3.2 与 Three.js r185 的版本风险

2026-09-05 的可验证状态：

- WICG README 仍写明 Chromium flag：`chrome://flags/#canvas-draw-element`。
- WICG 当前 WebGL 名称是 `texElementSubImage2D`。
- Three.js r185 已有 `HTMLTexture` 和 `InteractionManager`，但 `WebGLTextures.js` 仍检查 `texElementImage2D`。
- Three 官方 example 在原生能力缺失时加载 `three-html-render` polyfill。

因此不能只检测 `requestPaint` 就断言“Three native path 可用”。capability probe 至少输出：

```ts
type HtmlCanvasCapabilities = {
  layout: boolean;
  draw2d: boolean;
  geometry: boolean;
  threeExpectedUpload: boolean; // texElementImage2D
  currentSpecUpload: boolean;   // texElementSubImage2D
  mode: 'native' | 'polyfill' | 'dom';
};
```

Three.js 使用精确版本锁，不用 caret 自动升级。API 名称只出现在 `capabilities/htmlInCanvas.ts`；业务 Scene、Router、Director 和 Prompt 均不允许探测浏览器方法。

### 3.3 三条运行路径

```text
Native
  layoutsubtree + drawable + paint
  -> THREE.HTMLTexture
  -> Three Mesh
  -> InteractionManager projection
  -> updateElementGeometry

Polyfill
  semantic DOM + three-html-render rasterization/event bridge
  -> same OracleMirrorsRenderer contract

DOM fallback
  same semantic card content
  -> CSS layout, no WebGL depth
  -> same focus/confirm callbacks
```

三条路径共享同一份 card definition 和 DOM factory，禁止为 fallback 手写第二份文案或 Track 顺序。

### 3.4 paint 与 geometry 是两条不同同步方向

```text
DOM content/style changed
    --paint event--> GPU texture needs update

Mesh/camera transform changed
    --projection matrix--> DOM geometry needs update
```

停留环、深度排名和海浪不应触发整张 HTML 重绘；它们由 Three transform、material uniform 或独立 Canvas overlay 更新。只有语言、文本、状态铭牌和响应式断点改变时才更新 HTML 快照。

### 3.5 隐私限制与内容约束

浏览器必须防止把敏感像素变成可导出的 Canvas 内容。跨域 image/iframe、外部 SVG 资源、visited link 状态、拼写检查和 autofill preview 可能不会绘制。生产卡片使用同源素材；捕获结果不得作为“所见即所得导出”承诺。

不可见子树必须 `inert`、`aria-hidden` 或移除。仅将 opacity 设为 0 会留下 accessibility ghost content。

## 4. 模块设计

```text
src/
├── capabilities/htmlInCanvas.ts
├── interaction/
│   ├── InteractionEngine.ts
│   ├── ZoneDwellSelector.ts
│   └── providers/
│       ├── PointerProvider.ts
│       ├── KeyboardProvider.ts
│       └── MediaPipeProvider.ts
├── renderers/OracleMirrorsRenderer.ts   （第一版 DOM/CSS 3D；T14 接 Three）
└── content/trackCards.ts
```

| 模块 | 唯一职责 | 禁止知道 |
| --- | --- | --- |
| `HtmlCanvasBridge` | 能力探测、native/polyfill/fallback、geometry cleanup | Road、Track 完成状态 |
| `OracleMirrorsRenderer` | 三镜 DOM、CSS 3D 变换（第二波：Mesh/HTMLTexture）生命周期 | `scrollY`、MediaPipe landmarks |
| `InteractionEngine` | 输入归一、平滑、切换 provider | story config、Renderer 实现 |
| `MediaPipeProvider` | 摄像头/模型/landmarks → sample | Track ID、dwell、路由 |
| `ZoneDwellSelector` | 三区累计、冻结、胜者判定状态机 | Three.js、摄像头 |
| `StoryRouter` | 接收 confirmed Track ID 并切章 | focusX、mesh、landmarks |

## 5. 数据接口

```ts
type InteractionSample = Readonly<{
  x: number;          // -1 左，0 中，1 右
  y: number;          // 轻微视差
  z: number;          // 与屏幕相对距离
  confidence: number; // 0..1
  source: 'pointer' | 'keyboard' | 'head' | 'head-gaze';
  detected: boolean;
  timestamp: number;
}>;

type Zone = 'left' | 'center' | 'right';

type SelectionState = Readonly<{
  phase: 'idle' | 'collect' | 'freeze' | 'resolved';
  zone: Zone | null;
  dwellMs: Readonly<Record<Zone, number>>;
  elapsedMs: number;
  winnerId: string | null;   // track-a | track-b | track-c
}>;
```

`InteractionSample` 与 ARCHITECTURE §5.1 的 `InteractionFrame` 同构，另含 `yaw` 与 `focusX`。Router 只允许接触 `winnerId`；原始视频、landmarks、头部轨迹和逐帧 dwell 永远不进入故事状态或服务端接口。

## 6. 头部方向与眼球方向

### 6.1 第一版：头部方向（T2）

参考快照的 `MediaPipeHeadTracker` 已验证一条可研究路径：太阳穴 landmark 估计脸部中心和宽度、变换矩阵估计 yaw、推理约 24Hz、GPU 失败退 CPU。目标项目应从零实现 provider，而不是复制品牌组件和 Road 常量。

头部方向适合三块横向大目标：对普通摄像头更稳定，也更容易向用户解释“轻微转头选择”。输出只保留低维归一值。

### 6.2 实验（未排期）：虹膜小权重修正

```text
gazeX = robustMean(leftIrisRatio, rightIrisRatio)
focusX = headPoseX * 0.65 + calibratedGazeX * 0.35
```

上式只是初始实验假设，不是准确率事实。需要三点校准、眨眼过滤、单眼降级、眼镜/背光/低分辨率测试。若没有显著优于纯头部方案，则不发布该增强，也不称为“精确眼动追踪”。

## 7. 焦点、停留和确认

本节是 D-002 的实现细则。所有数值是初始值，只能放在 `src/config/interaction.config.ts`（T2 拥有），实机可调。

### 7.1 输入到分区

```text
focusX = clamp(x * 0.42 + yaw * 0.78)      // 头部；位置权重低、转头权重高
focusX = viewportX                          // 指针，-1..1
focusX ← ←/→ 键平滑推动的虚拟焦点            // 键盘
```

三区带迟滞：

```text
center -> left    focusX < -0.30      left  -> center   focusX > -0.14
center -> right   focusX >  0.30      right -> center   focusX <  0.14
```

### 7.2 累计规则

- 只在 `phase = collect` 累计；`detected && confidence ≥ 0.55` 的帧才计入。
- 每步 `dt = min(now - prev, 50ms)`，后台恢复不会一次补满。
- `dwellMs[zone] += dt`；不衰减、不归一化。
- 视觉只读 `dwellMs[z] / max(sum, 1)` 的平滑值与当前 `zone`，不显示数字。

### 7.3 时序

| 阶段 | 驱动 | 时长 | 进入条件 | 期间滚动 |
| --- | --- | ---: | --- | --- |
| `idle` | 滚动 | — | 章节开始 | 正常 |
| `collect` | 真实时间 | 4500ms | Road 到达 `chapter.gate.atRoad` | **锁住**（ScrollGate） |
| `freeze` | 真实时间 | 500ms | collect 超时 | 锁住 |
| `resolved` | 一次 | — | freeze 超时，或任意时刻 `confirm()` | 解锁 |

### 7.4 胜者判定

```text
if confirmed(zone)             -> winner = track(zone)            // click / Enter
else if sum(dwellMs) < 1000    -> winner = release.defaultTrackId // 几乎无人看："海替你决定"
else                           -> winner = argmax(dwellMs)
                                  tie -> zone at freeze
                                  still tie -> release.defaultTrackId
```

`winner ∉ enabledTrackIds` → Router 路由到 `memory-pending`（D-001）。

### 7.5 初始参数

| 参数 | 初始值 | 作用 |
| --- | ---: | --- |
| `ZONE_ENTER` | ±0.30 | 进入左/右区 |
| `ZONE_EXIT` | ±0.14 | 回到中区 |
| `COLLECT_MS` | 4500 | 累计窗口 |
| `FREEZE_MS` | 500 | 冻结显形 |
| `MIN_TOTAL_MS` | 1000 | 低于此值走默认 Track |
| `MIN_CONFIDENCE` | 0.55 | 参与累计的最低置信 |
| `MAX_DT_MS` | 50 | 单步上限 |
| `SMOOTH_MS` | 140–220 | focusX 视觉平滑（不影响累计） |
| `LOST_RECENTER_MS` | 500–800 | 丢脸后 focusX 回中 |

### 7.6 为什么不用"连续停留 + 确认"

早期 V2.0 采用 `1.8s + 0.6s` 两段式并警告"纯累计会误选"。这里明确接受纯累计，理由：① 窗口只有 5 秒且有 0.5s 冻结，"先看左 3 秒再看右 1 秒选左"正是剧本想表达的"海记住你停留最久的地方"；② 现场只有一人、目标只有三个，误选的代价是进入占位章而非丢失剧情；③ 规则对观众可解释。若 T15 实测发现体验差，再以新决策取代 D-002。

### 7.7 状态机

```text
idle ──road ≥ gate──> collect ──4500ms──> freeze ──500ms──> resolved
  │                      │                  │
  └──── confirm() ───────┴──────────────────┘ ───────────> resolved
```

页面隐藏时暂停计时（dt 上限保证恢复后不跳）。`resolved` 只发出一次。

## 8. Three.js 渲染与交互

### 8.1 卡片职责

每张卡片是 `drawable article`，内部有真实 button、标题、简介、完成状态和可访问名称。Three.js 只把它映射到 Mesh，不复制语义。

推荐每帧顺序：

```text
read latest InteractionFrame
-> smooth camera/mesh target
-> update matrixWorld + camera
-> InteractionManager projection
-> updateElementGeometry for each active drawable
-> renderer.render
```

DOM event（click / Enter）进入统一 action callback → `ZoneDwellSelector.confirm(zone)`；Renderer 不直接写 journey store。

### 8.2 视觉反馈

- 当前候选前移 `0.12–0.22` 世界单位，scale `1.035–1.055`。
- 非候选降低亮度而不完全消失，保持空间定位。
- `dwellMs` 比例调深度/亮度/金纹闭合；当前 `zone` 额外给 5–8% 靠近。
- reduced motion 取消大幅 Z 位移和镜头漂移，保留边框、亮度与线性进度。

数值属于可调 interaction/renderer config，不写进 JSX，也不影响章节 Road。第一版用 CSS `perspective` + `transform3d` 实现同样的反馈（T4），Three.js 版本沿用同一组参数（T14）。

### 8.3 Off-axis projection

头部 x/y/z 可轻微改变相机投影，让屏幕像“窗口”而不是随鼠标旋转的相册。强度必须小；头部追踪失败时相机缓慢回中心，不能突然跳变。第一版用 CSS 整体 `rotateY(focusX * 少量角度)` 近似。

## 9. StoryRouter 与完成状态

```ts
type JourneyState = Readonly<{
  currentChapterId: string;
  completedTrackIds: readonly string[];
  selectionOrder: readonly string[];
  selectionMethod: 'head-dwell' | 'pointer-dwell' | 'pointer-confirm' | 'keyboard' | 'default' | null;
}>;
```

进入 Track 只写 `currentChapterId`。`winnerId ∈ enabledTrackIds` → 进入该 Track 章节序列（Track 3：sirens → scylla → cattle → homecoming）；否则进入 `memory-pending` 占位章，页面提供「返回神谕镜」「继续 Track 3」两个真实按钮（D-001）。

只持久化 JourneyState 的非生物特征字段。摄像头样本、attention score、精确 dwell 轨迹不保存。重新开始只清理本项目自己的 namespaced key。

## 10. 隐私、安全与无障碍

- `getUserMedia()` 只在用户点击后调用，只运行于 HTTPS/localhost。
- 明确显示本地处理，不录制、不上传；第一版摄像头全程运行（D-003），页面隐藏时暂停推理，页面关闭时释放。
- 不把视频、landmarks、yaw、gaze、脸宽、逐帧坐标写日志、analytics、localStorage 或 Prompt。
- 若未来需要统计，只发 coarse event：Track ID、输入方法、dwell bucket；需单独隐私评审。
- HTML button 的焦点顺序、名称和 Enter/Escape 行为必须可用；canvas 本身不吞掉键盘通道。
- `prefers-reduced-motion` 不改变确认语义，只减少空间运动。

## 11. 性能与资源策略

参考快照的素材与 MediaPipe 体积说明了一个原则：Hub 不能同时预加载三条完整 Track。

1. 序章只加载 Hub 三张卡片与轻量海面。
2. 浏览器 idle 时可预取 WASM/model，但不启动摄像头。
3. attention 第一名只预热首屏 poster、音频头和少量帧。
4. resolved 后只预取胜者 Track 的首屏；其余取消。
5. MediaPipe 约 24Hz，Three 前台最高 60Hz；不可见时暂停。
6. 尽量复用一个 WebGL renderer；不为三卡片各建 canvas。
7. DOM 未改变时不重绘 HTMLTexture；GPU transform 不触发 DOM snapshot。

具体资源大小会随项目变化，必须在接入正式素材后重新测量，不能沿用参考快照数字作为预算。

## 12. 测试与验收

### 12.1 Capability 集成测试

- 输出 native/polyfill/dom mode 和每个被探测的原语；不只输出一个布尔值。
- 在用户开启 flag 的 Chromium 检查动态文本、button、input、focus。
- Mesh 旋转、缩放、遮挡时 pointer hit 与视觉位置一致。
- DOM 更新触发 texture 更新；纯 Mesh 动画不重复截图。
- API 不兼容时进入 polyfill，不出现透明黑屏。
- WebGL/context 丢失时回到 DOM，仍可选择。

### 12.2 输入与状态机

- 摄像头允许/拒绝/撤销；没有人脸时 dwell 不增长。
- 快速扫过只贡献很短的累计；冻结后移动不改结果。
- 明亮、低光、背光、眼镜、45–90cm、多脸背景。
- 三块卡片各选择 10 次的准确率、误选率、完成时间记录为实验数据。
- Track 1/2 胜出进入 `memory-pending`，两个按钮路由正确；Track 3 胜出解锁滚动并进入 sirens。

### 12.3 生命周期

- 页面关闭/`restart` 时调用 media track `stop()`；章节切换不停摄像头（D-003）。
- animation frame、observer、event listener、geometry、material、texture 全部释放。
- StrictMode mount/unmount 不重复打开摄像头。
- 浏览器后退/刷新不把“已进入”误记为“已完成”。

## 13. 实施阶段

以 `docs/TASKS.md` 为准：

| 任务卡 | 本文对应 | 进入下一步的条件 |
| --- | --- | --- |
| T2 Interaction | §5–§7：providers、`ZoneDwellSelector`、校准 | 单测通过；真实摄像头三区 250ms 内响应 |
| T4 Mirrors | §8 的 DOM/CSS 3D 版本、`HtmlCanvasBridge` 接口 | 鼠标/键盘/假 `SelectionState` 驱动正确 |
| I1 集成 | §9 与 Router 接线 | 60 秒占位版可选出 Track 3 与占位章 |
| T14 HTML-in-Canvas | §3、§8 的 native/polyfill 路径 | 三路径可诊断且 Renderer 契约不变 |
| T15 设备实测 | §7.5 全部参数 | 三镜各选 10 次的准确率、完成时间记录 |

不在同一张卡里同时引入 Three、MediaPipe 与 Shader。

## 14. 已知、假设、待验证

### 已确认

- 参考快照含 Three.js 空间卡片、off-axis projection、pointer fallback 与 MediaPipe 头部方向实验。
- 参考实现把 HTML 变成静态 CanvasTexture，未完整实现当前 WICG geometry 模型。
- WICG 与 Three r185 存在 WebGL API 命名兼容风险。
- 摄像头不应成为故事入口门槛。

### 设计假设

- 只面向桌面 Chromium（D-008）。
- 三个大横向目标适合头部方向而非精确眼动。
- 原生能力失败时，视觉降级比功能阻断更可接受。

### 待真实验证

- 用户本机 Chromium 的具体原语集合与 Three r185 实际兼容性。
- 5 秒累计窗口是否自然；迟滞边界是否适合镜面尺寸；纯累计的误选感受（§7.6）。
- Polyfill 在中文字体、表单、动态状态和目标设备上的性能。
- 眼镜、背光、低端设备下 MediaPipe 的净收益。
- 用户是否理解“停留最久者胜出”，剧本中一行说明是否足够。

## 15. 来源

### 仓库内

- `references/pear-no/src/spatial/htmlTexture.js`
- `references/pear-no/src/spatial/createSpatialScene.js`
- `references/pear-no/src/spatial/MediaPipeHeadTracker.js`
- `references/pear-no/src/spatial/SpatialWork.jsx`
- `docs/ROADSHOW_60S_CUT.md`
- `docs/ARCHITECTURE.md`

### 官方（2026-09-05 查询）

- WICG HTML-in-Canvas：https://github.com/WICG/html-in-canvas
- Chrome Status：https://chromestatus.com/feature/5172548013916160
- Three.js HTML texture example：https://threejs.org/examples/webgl_materials_texture_html.html
- Three.js HTMLTexture PR：https://github.com/mrdoob/three.js/pull/31233
- MediaPipe Face Landmarker Web：https://developers.google.com/mediapipe/solutions/vision/face_landmarker/web_js
- MDN `getUserMedia()`：https://developer.mozilla.org/docs/Web/API/MediaDevices/getUserMedia
- MDN Page Visibility：https://developer.mozilla.org/docs/Web/API/Page_Visibility_API
