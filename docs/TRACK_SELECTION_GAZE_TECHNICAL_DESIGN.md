# 《归航 / NOSTOS》空间 Track 选择技术设计

> 版本：V2.0 设计草案
> 状态：待实现、待目标 Chromium 实测
> 目标：组合 HTML-in-Canvas、Three.js 与可选 MediaPipe，让三块真实 HTML 画卷进入 3D 空间，并通过凝视停留或常规输入选择 Track
> 架构约束：本模块只接收 `SceneFrame` 与 `InteractionFrame`，不拥有 Road、章节顺序或完成状态
> 更新日期：2026-09-05

> 第一版范围说明：60 秒路演只完整开放 Track 3；Track 1、Track 2 保留空间关注反馈，但不能确认进入。现场节奏、失败保护和十秒选路窗口以 [`ROADSHOW_60S_CUT.md`](ROADSHOW_60S_CUT.md) 为准。

## 1. 结论先行

这个体验技术上可行，但必须纠正 V1 的一个关键表述：

> HTML-in-Canvas 原生能力不是“把 HTML 截成 CanvasTexture”。它让 Canvas 后代参与真实 DOM layout 和 accessibility，再把 `drawable` 子树绘制到 Canvas/WebGL，并通过 geometry 同步保留 hit testing。

`html2canvas` 仍可作为像素回退，但它没有原生路径的交互和可访问性能力，不能与原生 HTML-in-Canvas 视为同一个层级。

推荐架构：

```text
Scroll -> StoryDirector -> SceneFrame ------------------------┐
                                                              ├-> ThreeHtmlRenderer
Pointer/Keyboard/Camera -> InteractionEngine -> InteractionFrame ┘

HTML subtree -> HtmlCanvasBridge -> THREE.HTMLTexture -> Mesh
Mesh projection -> GeometrySync -> DOM hit testing/accessibility
DwellController -> confirmed TrackId -> StoryRouter
```

首发不做精确眼动追踪。P1 先用 pointer/keyboard 证明真实 HTML 交互和 3D geometry；P2 再加入本地头部方向；虹膜方向只有在真实测试证明优于纯头部方案时才作为小权重增强。

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

默认立即支持 pointer、touch、keyboard；摄像头默认关闭。用户主动点击“启用凝视航向”后才请求权限，并显示：

> 影像只在本机处理，不录制、不上传。

权限拒绝、设备缺失、无脸或性能不足时不弹阻断对话框，保留三块 HTML button，并提示已切换到指针航向。

### 2.3 体验状态

1. **Pointer ready**：三块铭牌可 hover/focus/click。
2. **Permission pending**：只在用户手势后出现。
3. **Calibrating**：自然坐姿看向中心，采集短时基线。
4. **Tracking**：头部只驱动低幅视差和候选区域。
5. **Dwelling**：当前目标累计连续停留；金环增长。
6. **Armed**：目标稳定，进一步停留即确认；live region 宣布目标。
7. **Selected**：只输出一次 Track ID，停止摄像头并进入转场。

鼠标点击和键盘 Enter 可立即确认，不强迫等待凝视的 2.4 秒。触摸采用“第一次预览、第二次确认”或显式按钮，避免误触。

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
  -> same ThreeHtmlRenderer contract

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
│   ├── DwellController.ts
│   └── providers/
│       ├── PointerProvider.ts
│       ├── KeyboardProvider.ts
│       └── MediaPipeProvider.ts
├── renderers/ThreeHtmlRenderer.ts
└── content/trackCards.ts
```

| 模块 | 唯一职责 | 禁止知道 |
| --- | --- | --- |
| `HtmlCanvasBridge` | 能力探测、native/polyfill/fallback、geometry cleanup | Road、Track 完成状态 |
| `ThreeHtmlRenderer` | Mesh、相机、材质、HTMLTexture 生命周期 | `scrollY`、MediaPipe landmarks |
| `InteractionEngine` | 输入归一、平滑、切换 provider | story config、Renderer 实现 |
| `MediaPipeProvider` | 摄像头/模型/landmarks → sample | Track ID、dwell、路由 |
| `DwellController` | 连续停留、宽限、确认状态机 | Three.js、摄像头 |
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

type SelectionState = Readonly<{
  phase: 'ready' | 'calibrating' | 'tracking' | 'dwelling' | 'armed' | 'selected';
  candidateId: string | null;
  continuousDwellMs: number;
  attentionScores: Readonly<Record<string, number>>;
  confirmedTrackId: string | null;
}>;
```

Router 只允许接触 `confirmedTrackId`；原始视频、landmarks、头部轨迹和逐帧 attention score 永远不进入故事状态或服务端接口。

## 6. 头部方向与眼球方向

### 6.1 P2 首选：头部方向

参考快照的 `MediaPipeHeadTracker` 已验证一条可研究路径：太阳穴 landmark 估计脸部中心和宽度、变换矩阵估计 yaw、推理约 24Hz、GPU 失败退 CPU。目标项目应从零实现 provider，而不是复制品牌组件和 Road 常量。

头部方向适合三块横向大目标：对普通摄像头更稳定，也更容易向用户解释“轻微转头选择”。输出只保留低维归一值。

### 6.2 P3 实验：虹膜小权重修正

```text
gazeX = robustMean(leftIrisRatio, rightIrisRatio)
focusX = headPoseX * 0.65 + calibratedGazeX * 0.35
```

上式只是初始实验假设，不是准确率事实。需要三点校准、眨眼过滤、单眼降级、眼镜/背光/低分辨率测试。若没有显著优于纯头部方案，则不发布该增强，也不称为“精确眼动追踪”。

## 7. 焦点、停留和确认

### 7.1 迟滞

进入和离开候选使用不同边界，避免在卡片边缘抖动。阈值是 interaction config，不是 Road 常量。初始实验值可参考：

```text
center -> left   x < -0.30     left -> center   x > -0.14
center -> right  x >  0.30     right -> center  x <  0.14
```

所有值需实测；移动端不沿用桌面阈值。

### 7.2 两种时间不能混用

- `attentionScore`：可衰减的历史关注，只控制视觉排名。
- `continuousDwell`：当前目标连续停留，只控制确认。

仅用累计分数会误选：用户先看左边三秒，之后认真看右边一秒，系统可能突然进入左边。

### 7.3 初始参数（待真实验证）

| 参数 | 初始值 | 作用 |
| --- | ---: | --- |
| `ARM_MS` | 1800ms | 进入 armed |
| `CONFIRM_MS` | 600ms | armed 后继续停留 |
| `LEAVE_GRACE_MS` | 250ms | 短暂扫视宽限 |
| `LOST_FACE_CANCEL_MS` | 800ms | 丢脸后取消 |
| `MIN_CONFIDENCE` | 0.55 | 参与 dwell 的最低可信度 |
| `MAX_DT_MS` | 50ms | 防后台恢复跳时 |

### 7.4 状态机

```text
PointerReady
  └─ user consent -> PermissionPending
       ├─ failed/denied -> PointerReady
       └─ success -> Calibrating -> Tracking

Tracking -> Dwelling -> Armed -> Selected -> TrackTransition
    ^          |          |
    └──────────┴──────────┘ leave beyond grace / face lost
```

页面隐藏时暂停计时；超过丢失阈值取消 armed。selected 只能发出一次，随后停止 provider、清 geometry、销毁 Three 资源。

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

DOM event 进入统一 action callback，再交给 DwellController/Router；Renderer 不直接写 journey store。

### 8.2 视觉反馈

- 当前候选前移 `0.12–0.22` 世界单位，scale `1.035–1.055`。
- 非候选降低亮度而不完全消失，保持空间定位。
- attention ranking 调深度/材质；continuous dwell 单独画金色环。
- reduced motion 取消大幅 Z 位移和镜头漂移，保留边框、亮度与线性进度。

数值属于可调 interaction/renderer config，不写进 JSX，也不影响章节 Road。

### 8.3 Off-axis projection

头部 x/y/z 可轻微改变相机投影，让屏幕像“窗口”而不是随鼠标旋转的相册。强度必须小；头部追踪失败时相机缓慢回中心，不能突然跳变。移动端默认关闭摄像头与 off-axis，仅保留触摸布局。

## 9. StoryRouter 与完成状态

```ts
type JourneyState = Readonly<{
  currentChapterId: string;
  completedTrackIds: readonly string[];
  selectionOrder: readonly string[];
  selectionMethod: 'head-dwell' | 'head-gaze-dwell' | 'pointer' | 'keyboard' | null;
}>;
```

进入 Track 只写 `currentChapterId`；完成 Track 才追加 `completedTrackIds`。路演 release profile 中只有 Track 3 可确认，完成后直接进入 finale；Track 1/2 保留 hover/focus/dwell 反馈，但状态机必须在确认前输出“后续开放”并回到 tracking。长版 profile 才把完成卡片移到“已记起”区域，并在三条完成后进入 finale。

只持久化 JourneyState 的非生物特征字段。摄像头样本、attention score、精确 dwell 轨迹不保存。重新开始只清理本项目自己的 namespaced key。

## 10. 隐私、安全与无障碍

- `getUserMedia()` 只在用户点击后调用，只运行于 HTTPS/localhost。
- 明确显示本地处理，不录制、不上传；离场、隐藏过久、选择完成、用户关闭时 stop 所有 tracks。
- 不把视频、landmarks、yaw、gaze、脸宽、逐帧坐标写日志、analytics、localStorage 或 Prompt。
- 若未来需要统计，只发 coarse event：Track ID、输入方法、dwell bucket；需单独隐私评审。
- HTML button 的焦点顺序、名称和 Enter/Escape 行为必须可用；canvas 本身不吞掉键盘通道。
- `prefers-reduced-motion` 不改变确认语义，只减少空间运动。

## 11. 性能与资源策略

参考快照的素材与 MediaPipe 体积说明了一个原则：Hub 不能同时预加载三条完整 Track。

1. 序章只加载 Hub 三张卡片与轻量海面。
2. 浏览器 idle 时可预取 WASM/model，但不启动摄像头。
3. attention 第一名只预热首屏 poster、音频头和少量帧。
4. armed 后提高目标优先级；确认后取消其他预取。
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
- 快速扫过不会选择；armed 后移开会取消。
- 明亮、低光、背光、眼镜、45–90cm、多脸背景。
- 三块卡片各选择 10 次的准确率、误选率、完成时间记录为实验数据。
- 路演版只有 Track 3 能确认，Track 1/2 无法通过 click、keyboard 或 dwell 绕过；Track 3 完成后进入 finale。
- 长版 profile 的六种顺序都能进入 finale；Track 2/3 条件文案正确。

### 12.3 生命周期

- 章节退出 500ms 内调用 media track `stop()`（目标值，待实测）。
- animation frame、observer、event listener、geometry、material、texture 全部释放。
- StrictMode mount/unmount 不重复打开摄像头。
- 浏览器后退/刷新不把“已进入”误记为“已完成”。

## 13. 实施阶段

| 阶段 | 范围 | 进入下一阶段的条件 |
| --- | --- | --- |
| P0 | 路演 release、StoryRouter/Director、真实 DOM 卡片、pointer/keyboard | 无 WebGL 走完 60 秒；只有 Track 3 可确认 |
| P1 | capability adapter、HTMLTexture、Three scene、geometry sync | native/polyfill/dom 三路径可诊断且可交互 |
| P2 | MediaPipe 头部方向、校准、dwell、隐私生命周期 | 拒绝权限仍完整；真实设备指标达标 |
| P3 | 长版 Track 开放、虹膜小权重实验、shader 环、空间音频 | 长版路由通过；感知增强对照实验显著优于 P2 |

不得在 P0 同时引入 Three、MediaPipe 与 Shader。先证明故事图和降级路径，再逐层开启增强，才能知道问题来自哪一层。

## 14. 已知、假设、待验证

### 已确认

- 参考快照含 Three.js 空间卡片、off-axis projection、pointer fallback 与 MediaPipe 头部方向实验。
- 参考实现把 HTML 变成静态 CanvasTexture，未完整实现当前 WICG geometry 模型。
- WICG 与 Three r185 存在 WebGL API 命名兼容风险。
- 摄像头不应成为故事入口门槛。

### 设计假设

- 首发主要面向桌面 Chromium；移动端使用触摸路径。
- 三个大横向目标适合头部方向而非精确眼动。
- 原生能力失败时，视觉降级比功能阻断更可接受。

### 待真实验证

- 用户本机 Chromium 的具体原语集合与 Three r185 实际兼容性。
- `1.8s + 0.6s` 是否自然；迟滞边界是否适合卡片尺寸。
- Polyfill 在中文字体、表单、动态状态和目标设备上的性能。
- 眼镜、背光、低端设备下 MediaPipe 的净收益。
- 用户是否理解“凝视确认”，是否需要一次性引导。

## 15. 来源

### 仓库内

- `references/pear-no/src/spatial/htmlTexture.js`
- `references/pear-no/src/spatial/createSpatialScene.js`
- `references/pear-no/src/spatial/MediaPipeHeadTracker.js`
- `references/pear-no/src/spatial/SpatialWork.jsx`
- `docs/ODYSSEY_INTERACTIVE_SCRIPT.md`
- `docs/ARCHITECTURE.md`

### 官方（2026-09-05 查询）

- WICG HTML-in-Canvas：https://github.com/WICG/html-in-canvas
- Chrome Status：https://chromestatus.com/feature/5172548013916160
- Three.js HTML texture example：https://threejs.org/examples/webgl_materials_texture_html.html
- Three.js HTMLTexture PR：https://github.com/mrdoob/three.js/pull/31233
- MediaPipe Face Landmarker Web：https://developers.google.com/mediapipe/solutions/vision/face_landmarker/web_js
- MDN `getUserMedia()`：https://developer.mozilla.org/docs/Web/API/MediaDevices/getUserMedia
- MDN Page Visibility：https://developer.mozilla.org/docs/Web/API/Page_Visibility_API
