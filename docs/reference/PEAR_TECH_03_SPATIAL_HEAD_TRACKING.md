# 分册 03 · HTML-in-Canvas 纹理、Three.js 空间卡片、头部追踪与"看哪张选哪张"

> 源码：`references/pear-no/src/spatial/htmlTexture.js`（87 行）、`createSpatialScene.js`（273 行）、`MediaPipeHeadTracker.js`（111 行）、`SpatialWork.jsx`（259 行）、`SpatialWork.css`。四个文件全文阅读。
> 与本项目的关系：这是 `docs/TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md`（Track 卡片的注视选择）与 `docs/HEAD_COUPLED_PEEK_TECHNICAL_DESIGN.md`（头部耦合探视）的**已运行参考实现**。参考项目用它来展示 3 张"作品"卡片，我们把它换成《归航》的航线/章节卡片即可。

## 0. 数据流

```text
<video getUserMedia> ──► MediaPipe FaceLandmarker (24Hz) ──► sample{x,y,z,focusX,detected}
pointermove (fallback) ──► pointerRef{x,y,focusX}          ──┘
                                                              │ SpatialWork rAF：一阶低通 0.082 / 0.11
                                                              ▼
DOM 卡片 (768×1680, 屏外) ──► htmlTexture.js ──► CanvasTexture ──► createSpatialScene.update({now, head, focusX, sectionProgress})
                                                                     ├─ focusByX(focusX)  带滞回的三态选择
                                                                     ├─ 每卡 lerp 缩放/透明/位置/纹理 offset
                                                                     └─ off-axis 投影矩阵 ← head
```

## 1. HTML → 纹理（`htmlTexture.js`）

### 1.1 能力检测与三条路径

```js
// htmlTexture.js:15-19
const nativeContext = (context) => {
  if (typeof context?.drawElementImage === 'function') return 'drawElementImage';   // 新提案 API
  if (typeof context?.drawElement === 'function') return 'drawElement';             // 旧提案 API
  return null;
};
```

```js
// :22-52  原生路径
const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
canvas.setAttribute('layoutsubtree', '');                     // :26  让 canvas 的子树参与布局但不绘制
const clone = element.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); canvas.appendChild(clone);
if (method === 'drawElementImage') {
  Object.assign(canvas.style, { position:'fixed', zIndex:-100, pointerEvents:'none' });   // 必须在文档里才有布局
  document.body.appendChild(canvas);
  await waitForPaint();                                        // :4-8 双 rAF，等一次真实布局/绘制
  await context.drawElementImage(drawable, 0, 0);              // :44
  canvas.remove();
} else {
  await context.drawElement(element, 0, 0, width, height);     // :49
}
```

```js
// :55-66  兜底：html2canvas
await document.fonts.ready;                                    // :56 字体未就绪会截出回退字体
const canvas = await html2canvas(element, { width, height, scale: 1, backgroundColor: null, logging: false, useCORS: false, removeContainer: true });
```

返回 `{ texture: CanvasTexture(colorSpace = SRGBColorSpace), rendererName: 'Native HTML-in-Canvas' | 'Fallback DOM capture' }`（:10, :75, :84）。`rendererName` 被 UI 显示出来——**调试期把"走了哪条路径"暴露在界面上**。

### 1.2 与规范现状的对照（重要）

本项目 `TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md §3` 已梳理 WICG explainer：Chromium 需 `chrome://flags/#canvas-draw-element`；WebGL 侧当前名称是 `texElementSubImage2D`，而 Three r185 `WebGLTextures.js` 仍检查 `texElementImage2D`。参考项目**绕开了这个不一致**：它不走 WebGL 直传，而是先画到 2D canvas，再作为普通 `CanvasTexture` 上传——2D `drawElementImage/drawElement` + `CanvasTexture` 对 Three 版本无要求。代价是多一次 canvas 拷贝、且**快照是一次性的**（参考项目只在挂载时截一次，之后卡片内容不变；滚动是靠移动 `texture.offset`，见 §2.2）。

若《归航》卡片需要实时更新（悬停高亮、文字打字机），需要 `requestPaint`/重复 `drawElementImage` + `texture.needsUpdate = true`，并按设计文档 §3 的 capability probe 区分 `threeExpectedUpload / currentSpecUpload`。

## 2. Three.js 卡片场景（`createSpatialScene.js`）

### 2.1 尺寸与"长页面、短视口"纹理

```js
// createSpatialScene.js:30-42
const CARD_WIDTH = 768, CARD_HEIGHT = 1680, VIEWPORT_HEIGHT = 920;   // DOM 卡片 768 宽 1680 高，只露出 920
const height = width * (VIEWPORT_HEIGHT / CARD_WIDTH);               // 网格宽高比 = 视口比
const viewportRatio = VIEWPORT_HEIGHT / CARD_HEIGHT;                  // 0.548
texture.repeat.set(1, viewportRatio);                                 // 只采样纹理的一段
texture.offset.set(0, 1 - viewportRatio);                             // 初始在顶端
```

- 三张卡宽 `[1.58, 1.68, 1.8]`，位置 `[-2.08,-0.05,-0.22] / [0,0.1,-0.82] / [2.08,-0.02,-1.42]`，`rotation.y = [0.13, 0, -0.13]`——中间卡最远、两侧略转向观众。
- `MeshBasicMaterial({ map, transparent:true, opacity:0 })`，无光照，颜色即纹理。
- `WebGLRenderer({ alpha:true, antialias:true })`，`setPixelRatio(min(dpr, 1.5))`，`PerspectiveCamera(43, 1, 0.1, 40)`——`alpha:true` 使 WebGL 层可叠在 Hero 之上（与分册 01 `alpha:false` 的 Hero 相反）。

### 2.2 卡片内滚动 = 移动纹理 offset

```js
// :169-176
const scrollFocused = (delta) => { focusedCard.userData.scrollTarget = clamp(focusedCard.userData.scrollTarget + delta); ... };
// :199-201  update 内
data.scrollCurrent += (data.scrollTarget - data.scrollCurrent) * 0.105;
card.material.map.offset.y = maxOffset * (1 - data.scrollCurrent);     // maxOffset = 1 - viewportRatio
```

wheel 在 `SpatialWork.jsx:149` 换算成 `deltaY / 1150`。**不重截 DOM**，只滑动采样窗——这是"一次快照 + 纯 GPU 滚动"能成立的原因，也是设计文档 §7 "GPU transform 不触发 DOM snapshot" 的实例。

### 2.3 带滞回的三态焦点选择（**Track 选择核心**）

```js
// :160-167
const focusByX = (value) => {                       // value ∈ [-1,1]：来自头部 focusX 或指针 x
  if      (focusedIndex === 0 && value > -0.14) focusedIndex = 1;
  else if (focusedIndex === 1 && value < -0.3 ) focusedIndex = 0;
  else if (focusedIndex === 1 && value >  0.3 ) focusedIndex = 2;
  else if (focusedIndex === 2 && value <  0.14) focusedIndex = 1;
  focusedCard = cards[focusedIndex];
};
```

- 从中间到两侧的门限 `±0.3`，从两侧回中间的门限 `∓0.14`：**离开当前卡比进入它更难**，抖动的头部不会来回切。
- 每帧调用一次；结合 §4 的 0.11 一阶低通，实际切换有 ~10 帧的惯性。
- 迁移到"看哪张选哪张"：把 `focusedIndex` 的变化再加一个**停留时间（dwell）**门限（例如 400ms）后才触发"选择确认"，滞回负责稳定候选，dwell 负责确认——设计文档 `TRACK_SELECTION_GAZE` 中的 confirm 阶段可直接落在这里。

### 2.4 每帧动画（:181-215）

```js
const enter  = smooth(sectionProgress / 0.08);
const leave  = 1 - smooth((sectionProgress - 0.88) / 0.12);
const reveal = enter * leave;
const compact = aspect < 0.9;                                      // 竖屏：三张排成一行，只看焦点卡附近
cards.forEach((card, index) => {
  const active = index === focusedIndex;
  const targetScale = (active ? 1.045 : 0.965) * enter;            // 焦点卡略大
  scale += (targetScale - scale) * 0.115;
  card.material.opacity += ((active ? 1 : 0.48) * reveal - card.material.opacity) * 0.12;   // 非焦点半透明
  const layoutX = compact ? (index - focusedIndex) * 2.15 : data.baseX;
  // 位置/旋转在 (1-enter) 权重下从"散开"混到"就位"；rotation.z 加 sin(now*0.00025 + depth) 微晃
});
```

三个 lerp 系数不同（0.105 / 0.115 / 0.12），让缩放、透明、滚动到位时间略错开，比统一系数更"有机"。

### 2.5 Off-axis（头部耦合）投影（:223-244）

```js
const eyeX = head.x * 0.82, eyeY = head.y * 0.58, eyeZ = 5.8 - head.z * 0.72;   // 头部归一化 → 眼睛世界坐标
const near = 0.1, far = 40, screenZ = 1.15;                                        // 虚拟"窗口"平面
const screenHeight = 4.35, screenWidth = screenHeight * aspect;
const scale = near / Math.max(1.6, eyeZ - screenZ);                                // 把窗口边界投到近平面
camera.position.set(eyeX, eyeY, eyeZ); camera.rotation.set(0, 0, 0);               // 相机不转，只平移
camera.projectionMatrix.makePerspective(
  (-screenWidth*0.5 - eyeX) * scale, ( screenWidth*0.5 - eyeX) * scale,          // left, right
  ( screenHeight*0.5 - eyeY) * scale, (-screenHeight*0.5 - eyeY) * scale,        // top, bottom
  near, far);
camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();             // Three 需要手动同步逆矩阵
```

这是经典的 generalized perspective projection（Kooima）简化版：把屏幕当作固定窗口，眼睛移动时**平移相机 + 非对称视锥**，窗口内物体产生真实视差、窗口边缘保持贴合。`Math.max(1.6, ...)` 防止头凑太近时视锥爆掉。**`HEAD_COUPLED_PEEK_TECHNICAL_DESIGN.md` 的"探视"就是这段** —— 参数含义：`0.82/0.58` 是头部位移到眼睛位移的增益，`5.8` 是默认观看距离，`screenHeight` 决定视差强度。

### 2.6 装饰与释放

- 梨形 `LatheGeometry` 线框 + 180 点黄金角（2.399963）螺旋"信号场"（:70-105），随 `now*0.000025` 慢转——纯装饰，可换成星图/罗盘。
- `dispose()`（:260-271）：遍历场景释放 geometry/material、`CanvasTexture.dispose()`、`renderer.dispose()`、移除 canvas。**章节离开后必须释放**，否则多 WebGL 上下文会让 Hero 掉帧。

## 3. MediaPipe 头部追踪（`MediaPipeHeadTracker.js`）

### 3.1 初始化与降级

```js
// :28-35
this.stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30, max: 30 } }, audio: false });
// :43-60
const vision = await FilesetResolver.forVisionTasks(`${base}mediapipe/wasm`);         // 自托管 wasm（34MB）
const options = { baseOptions: { modelAssetPath: `${base}models/face_landmarker.task`, delegate: 'GPU' },   // 3.6MB
  runningMode: 'VIDEO', numFaces: 1,
  minFaceDetectionConfidence: 0.55, minFacePresenceConfidence: 0.55, minTrackingConfidence: 0.55,
  outputFacialTransformationMatrixes: true };
try { this.landmarker = await FaceLandmarker.createFromOptions(vision, options); }
catch { this.landmarker = await FaceLandmarker.createFromOptions(vision, { ...options, baseOptions: { ...options.baseOptions, delegate: 'CPU' } }); }
```

- `SpatialWork.jsx:113` 用 `await import('./MediaPipeHeadTracker')` **动态加载**，只有用户点击"启用摄像头"才下载 tasks-vision 与 wasm。
- 640×480@30 足够；分辨率越高推理越慢且无收益。

### 3.2 每帧采样与归一化（:64-100）

```js
getSample(now) {
  if (this.video.readyState < HAVE_CURRENT_DATA) return this.sample;
  if (now - this.lastInference < 1000 / 24) return this.sample;          // :66 限 24Hz，rAF 60Hz 复用旧样本
  const result = this.landmarker.detectForVideo(this.video, now);
  const lm = result.faceLandmarks?.[0]; if (!lm) { this.sample.detected = false; return this.sample; }
  const leftTemple = lm[234], rightTemple = lm[454], forehead = lm[10], chin = lm[152];   // :76-79
  const faceWidth = Math.abs(rightTemple.x - leftTemple.x);
  const centerX = (leftTemple.x + rightTemple.x) * 0.5, centerY = (forehead.y + chin.y) * 0.5;
  if (this.calibrationFrames < 24) { baseline = 累加平均(faceWidth); }   // :84-89 前 24 帧当作"正常距离"
  this.sample.x = clamp((0.5 - centerX) * 2.4);                         // 归一化坐标是镜像的，故 0.5-cx
  this.sample.y = clamp((0.5 - centerY) * 2.4);
  this.sample.z = clamp((faceWidth / Math.max(baseline, 0.001) - 1) * 2.8);   // 脸变大=靠近=+z
  const matrix = result.facialTransformationMatrixes?.[0]?.data;
  const yaw = matrix?.length >= 16 ? Math.atan2(matrix[8], matrix[10]) : 0;    // :96 列主序旋转矩阵取 yaw
  const normalizedYaw = clamp(-yaw / 0.48);                                    // ±0.48rad(≈27°) 饱和
  this.sample.focusX = clamp(this.sample.x * 0.42 + normalizedYaw * 0.78);     // :98 位置 42% + 转头 78%
  this.sample.detected = true;
}
```

**关键设计**：
- `focusX` 混合"头在画面里的位置"和"头的朝向"，朝向权重更高——用户不需要真的把头移到屏幕边缘，**转头**即可选卡。这正是用户设想的"看哪张选哪张"：不是眼动追踪（MediaPipe FaceLandmarker 也不可靠地提供注视点），而是**头部 yaw 作为注视代理**。
- 基线自校准 24 帧：免去让用户"坐正"的步骤，但意味着启动时若用户已凑近，`z` 基线偏移——迁移时可加"重置基线"或用中值。
- 只用 4 个 landmark，其余 474 个忽略；如需 pitch，可用 `matrix[9]/matrix[10]`。

### 3.3 生命周期与隐私

`stop()`（:103-109）：`landmarker.close()`、`stream.getTracks().forEach(t => t.stop())`、`video.srcObject = null`。UI 文案 "Local processing · no recording"（`SpatialWork.jsx:244`）。全部推理在本地 wasm/WebGPU 完成，无上传。

## 4. 宿主组件（`SpatialWork.jsx`）

```js
// :91-97
const pointerRef = useRef({ x:0, y:0, z:0, focusX:0, detected:true });   // 指针始终是可用的兜底
const road = scrollProgress * 5350, sectionProgress = clamp((road - 1200) / 600);
const visibility = smooth(sectionProgress / 0.1) * (1 - smooth((sectionProgress - 0.9) / 0.1));
// :142-146  指针 → 归一化
pointerRef.current.x = (clientX / innerWidth) * 2 - 1; pointerRef.current.y = 1 - (clientY / innerHeight) * 2; pointerRef.current.focusX = x;
// :170-174  渲染循环里的一阶低通
const sample = tracked?.detected ? tracked : pointerRef.current;      // 没检测到脸就无缝回到指针
smoothHead.x += (sample.x - smoothHead.x) * 0.082;  // y、z 同
smoothFocusX += (sample.focusX - smoothFocusX) * 0.11;
scene.update({ now, head: smoothHead, focusX: smoothFocusX, sectionProgress });
```

- `cameraState: 'pointer' | 'loading' | 'active' | 'unavailable'`（:92）；按钮在 `road > 1030 && road < 1900` 或已激活时显示（:214）；`onLight`（:208）在 1900~2890 切换浅色 UI 以配合纸张章节。
- 源 DOM 放在 `.spatial-source-host{ position:fixed; left:-10000px; width:768px }` 且 `aria-hidden`（:224）：**屏外但有布局**，供 §1 截图；屏幕阅读器不会读到重复内容。
- 场景模块 `import('./createSpatialScene')` 也是动态加载（:157），`App.jsx:150` 在 `progress > 0.16` 才挂载本组件——Three.js 不进首包。
- `SpatialWork.css`：`.spatial-work{ position:absolute; inset:0; z-index:2; pointer-events:none }`，canvas `opacity` 过渡 0.25s。
- 低通系数 0.082（头部）比 0.11（焦点）更慢：视差要稳，选择要跟手。

## 5. 与本项目设计文档的对接

| 本项目文档 | 参考实现对应 | 需要补的部分 |
| --- | --- | --- |
| `TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md` capability probe（§3） | `htmlTexture.js:15-19` 只探测 2D API | 增加 `texElementImage2D / texElementSubImage2D / requestPaint` 探测；参考实现的 2D→CanvasTexture 路径可作为**第三级降级**，位于 Three 原生 HTMLTexture 与 html2canvas 之间 |
| 同上，注视选择流程 | `focusByX` 滞回 + `focusX = 0.42·位置 + 0.78·yaw` | dwell 计时确认、选中后的"锁定"与取消手势、无摄像头时的键盘/指针等价路径 |
| `HEAD_COUPLED_PEEK_TECHNICAL_DESIGN.md` off-axis | `createSpatialScene.js:223-244` | 把 `head` 同时喂给 Hero 的 `coverFit` panPx（分册 01 §1.4）与 Three 相机，保证两层视差方向一致 |
| `ARCHITECTURE.md` 服务划分 | `MediaPipeHeadTracker` 已是独立类 | 抽成 `HeadTrackingService`，输出统一 `HeadSample{x,y,z,yaw,focusX,detected,ts}`，Renderer 不依赖 MediaPipe 类型 |

## 6. 对《归航》的迁移要点

1. **保留**：一次快照 + `texture.offset` 滚动；三态滞回选择；yaw 主导的 `focusX`；24Hz 推理节流；GPU→CPU 委托降级；指针始终在线的兜底；动态 import；屏外 `aria-hidden` 源 DOM；`dispose()` 完整释放。
2. **改进**：
   - 卡片数量参数化（参考项目硬编码 3 张与 4 个门限）——门限可由 `index/(n-1)` 生成，滞回宽度作为配置项。
   - 加 dwell 确认与视觉反馈（选中卡边缘发光由 Shader 或 CSS 变量驱动，避免重截 DOM）。
   - 基线校准改为中值/可重置；加 `detected=false` 持续 >1s 时的"回到指针"提示。
   - 移动端：MediaPipe GPU 委托在部分 Android WebView 不可用，需实测；竖屏 `compact` 布局已有雏形。
   - 首次请求摄像头前显示说明（本地处理、不录制），被拒后不再重复弹出。
3. **不要**：把章节文案、Road 常量、Three 场景、摄像头 UI 放同一组件（参考项目 `SpatialWork.jsx` 就是这样）；把 34MB wasm 放进首屏依赖。
