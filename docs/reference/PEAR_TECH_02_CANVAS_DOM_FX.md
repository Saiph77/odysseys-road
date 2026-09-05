# 分册 02 · Canvas 2D 序列帧、Chromakey 遮罩、SVG 水墨与 DOM 章节联动

> 源码：`references/pear-no/src/components/SequenceCanvas.jsx`（~380 行）、`TermsNarrative.jsx`（72 行）、`MaskCalibrator.jsx`、`ApplicationScene.jsx`、`Navigation.jsx`、`index.css`（单行压缩 61KB，只按选择器抽取规则）、`REPLICATION_LESSONS.md`。
> 全部结论来自直接阅读源码，附 `文件:行号`。`index.css` 只读取了本册涉及的选择器（`.fin*`、`.ln`、`.cf-f`、`.boot`、`.stage/.pin`），其余 keyframes 仅列名。

## 1. Canvas 2D 序列帧播放（`SequenceCanvas.jsx`）

### 1.1 章节常量与两条序列的交叉淡化

```js
// SequenceCanvas.jsx:11-15
const FLY_START = 3900, FLY_SEQUENCE_END = 4400, TRANSITION_START = 4650, FLY_CROSSFADE_END = 4760, TRANSITION_END = 5290;
// :371-375  两个 <canvas> 各自算 opacity，在 4650~4760 交叉
const flyOpacity   = road > FLY_START && road < FLY_CROSSFADE_END ? 1 - smoothstep((road - TRANSITION_START) / (FLY_CROSSFADE_END - TRANSITION_START)) : 0;
const transOpacity = road > TRANSITION_START && road < TRANSITION_END ? smoothstep((road - TRANSITION_START) / (FLY_CROSSFADE_END - TRANSITION_START)) : 0;
```

- flysky 序列 3900→4400 播完（121 帧），4400→4650 停在末帧等待，4650→4760 与 trans 序列 crossfade。**"播完后停帧等待"是常用节奏手段**——把动作与转场分离，滚动快慢不影响视觉连贯。
- 两条序列用两个独立 canvas，而不是在一个 canvas 里 `globalAlpha` 混合：这样每帧只需重绘变化的那一层。

### 1.2 cover 取景函数

```js
// SequenceCanvas.jsx:17-25
const drawCoverFrame = (ctx, image, width, height, positionX = 50, scale = 1) => {
  const coverScale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * scale;
  const drawWidth = image.naturalWidth * coverScale, drawHeight = image.naturalHeight * coverScale;
  const offsetX = (width - drawWidth) * (positionX / 100);      // 0=贴左 50=居中 100=贴右
  const offsetY = (height - drawHeight) * 0.5;
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
};
```

`positionX` 在滚动过程中被动画化（"运镜"）：
- fly：手机 `50 + (20-50)*flyProgress`，桌面 `50 + (0-50)*smoothstep((flyProgress-0.26)/0.34)`（:164-175 附近）——序列本身不动，靠取景点移动制造横移。
- trans：`sequenceProgress = transitionProgress/0.62`，`positionX = startX + (50-startX)*smoothstep((seq-0.12)/0.6)`，`startX` 手机 20 否则 0（:190-203）。前一段结束在"贴左"，后一段从"贴左"回到居中——**两段序列在同一个取景点交接**，这是 crossfade 不跳的前提。

### 1.3 帧索引、兜底帧与 tier

```js
// :164-171
const frameIndex = Math.min(121, Math.max(1, Math.round(flyProgress * 120) + 1));   // f_001..f_121
const img = flyFrames[frameIndex];
const drawable = img?.complete && img.naturalWidth ? img : lastFlyFrame || (flyFallback.complete && flyFallback.naturalWidth ? flyFallback : null);
if (drawable) { lastFlyFrame = drawable; drawCoverFrame(...); }
```

- `lastFlyFrame / lastTransFrame`（:118-119）：未解码时保留上一帧；再退一步用单张 fallback 图。**永远不清空画布。**
- `reportPhase(lastFlyFrame ? '' : 'FLY SEQUENCE')`（:352-356）向 App 报告"当前章节缺帧"，供 LoadingState 显示——加载状态由消费方上报，而非集中的进度条。
- tier：`w <= 820` 用 `768/` 目录（768×432），否则 1920×1080。与 Hero 的 `innerWidth <= 820` 一致，但 timeline 用 `<= 720`——迁移时统一。

### 1.4 主循环结构

单个 rAF 循环读取 `stateRef.current`（props 镜像到 ref），每帧：计算 road → 决定哪几层可见 → 只对可见层 `drawImage` → 更新 `canvas.style.opacity`。与 HeroCanvas 相同模式（分册 01 §1.3、总览 §8-3）。

## 2. 蓝天 Chromakey 遮罩 + 网格线（`SequenceCanvas.jsx:210-345`）

这是参考项目最"手工"的一段：把 hero 视频里的蓝天抠出来，作为**网格线和星形的可见区域**——线只在天空里出现，被前景（建筑）遮住。

### 2.1 低分辨率 keying

```js
// :112  一次性创建 320×180 离屏 canvas
const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
// :285-320  每帧
offCtx.fillStyle = '#fff'; offCtx.fillRect(0, 0, 320, 180);
offCtx.drawImage(mediaSource, 0, 0, 320, 180);            // video 或 poster
const data = offCtx.getImageData(0, 0, 320, 180);
for (let i = 0; i < data.data.length; i += 4) {
  const r = data.data[i], g = data.data[i+1], b = data.data[i+2];
  const blueDiff = (b - Math.max(r, g) - sens) / 34;      // :297  sens 默认 30，可校准
  data.data[i+3] = blueDiff <= 0 ? 0 : 255;               // 硬阈值，非天空→透明
  // debug 模式：命中涂 rgba(244,63,94,220)，未命中涂 rgba(56,189,248,40)
}
offCtx.putImageData(data, 0, 0);
```

- 关键：**keying 在 320×180 做，合成时再放大**。`getImageData` 在全分辨率上每帧读回是不可接受的；低分辨率遮罩边缘会有些许软化，反而合适。
- `willReadFrequently: true` 提示浏览器把该 canvas 放在 CPU 侧，避免每帧 GPU→CPU 回读。

### 2.2 与视频 cover 数学对齐，再 `destination-in`

```js
// :322-342
const scale = Math.max(w / vw, h / vh);                        // 视频在屏幕上的 cover 尺寸
const positionTier = w < 768 ? 0 : w < 1180 ? 1 : 2;
const posX = clamp01(currentConfig.pos[positionTier] + maskPosX - 0.5);   // 与 HeroCanvas 同一取景锚点
const baseZoom = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 1.06;
const effectiveZoom = (zoomScaleRef.current ?? 1) * baseZoom;
const zoomedSw = sw * effectiveZoom, zoomedSh = sh * effectiveZoom;
const tx = (w - zoomedSw) * posX, ty = (h - zoomedSh) * 0.5;
linesCtx.globalCompositeOperation = 'destination-in';        // :340
linesCtx.drawImage(offscreen, tx, ty, zoomedSw, zoomedSh);    // 用遮罩 alpha 裁掉网格线
```

- 网格线先画在 `linesCtx` 上（§2.3），随后用 `destination-in` 一次性裁切——比先算遮罩再逐线判断简单得多。
- `posX/zoom` 与 WebGL 侧 `coverFit()`（分册 01 §1.4）使用**同一组参数**，否则遮罩与画面错位。`REPLICATION_LESSONS.md` 第 2 条强调：任何图层都要显式写出 cover/anchor 数学并核对首末帧。
- `maskOpacity = 1 - min(1, modelProgress/0.0032)`（:148）：网格线在 Hero 序列开始的瞬间（0.32% 的 model 段）消失——**网格线是"场景状态"而非固定 UI**（`REPLICATION_LESSONS.md` 第 3 条）。

### 2.3 hairline 网格 + 四角星

```js
// :236-266  线的位置优先读 DOM 参考元素 rect，无则按比例兜底
const v1 = rV1?.left > 0 ? rV1.left : (w * 0.05357 + 20);
const v2 = rV2?.left > 0 ? rV2.left : (w - (w * 0.05357 + 20));
const h1 = rH1?.top  > 0 ? rH1.top  : 64;
const h2 = rH2?.top  > 0 ? rH2.top  : (h * 0.653 + 50);
linesCtx.strokeStyle = 'rgba(255,255,255,0.32)'; linesCtx.lineWidth = 1;
// 左竖线全高；右竖线从 h1 起（不突出顶线）；两条横线全宽
// :85-105  四角星：四段 quadraticCurveTo 都经过中心点，size=9 → 18px
const drawSparkleStar = (ctx, cx, cy, size = 9, opacity = 1) => {
  ctx.beginPath(); ctx.moveTo(cx, cy - size);
  ctx.quadraticCurveTo(cx, cy, cx + size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + size);
  ctx.quadraticCurveTo(cx, cy, cx - size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - size);
  ctx.fill();
};
drawSparkleStar(linesCtx, v1, h2); drawSparkleStar(linesCtx, v2, h2);      // :270-271 只画底线两个交点
```

**用 DOM 元素的 `getBoundingClientRect` 决定 Canvas 线的位置**，让排版（CSS）与画布（JS）共用一套栅格，不用重复写断点。

### 2.4 校准器（`MaskCalibrator.jsx`）

开发期工具，值得保留思想：
- `window.addEventListener('dblclick', ...)`（:102）切换显示；面板可拖拽。
- 三个滑块 `maskPosX / zoomScale / sensitivity` 通过 App 的 `useState` 初始化器从 `localStorage`（`pear_mask_pos_x` 等，`App.jsx:46-73`）读写，刷新后保留。
- 时间轴 scrub：`seekToProgress(mapped)` → `rawProgressFromMapped(progress, innerWidth<=720)` → `window.scrollTo({top: maxScroll*raw, behavior:'auto'})`（:130-139），`setPointerCapture` 支持拖动（:147）。**依赖逆映射**——这是总览 §2.1 强调保留逆映射的原因之一。

## 3. DOM 章节文字：Terms 段（`TermsNarrative.jsx`）

### 3.1 进度切片

```js
// TermsNarrative.jsx:7-19
const road = scrollProgress * 5350;
const paper    = clamp((road - 2100) / 900);                      // 与 Hero 的 paper 段同步
const plan     = clamp((road - 2100) / 420);
const planText = clamp((plan - 0.72) / 0.28);                     // plan 窗口退回页边后文字才进
const tree     = clamp((road - 2775) / 525);
const intro    = clamp(tree / 0.45);
const ink      = clamp((paper - 420/900) / (1 - 420/900));         // 水墨擦除：paper 后半段
const treeCurve = tree < 0.45 ? tree/0.45*0.12 : 0.12 + (tree-0.45)/0.55*0.88;   // 先慢后快的分段线性
const laterFade = ink > 0.5 ? smooth((treeCurve - 0.26)/0.24) : 0;
const firstOpacity  = smooth(planText / 0.22);
const secondOpacity = smooth(intro / 0.02) * (1 - laterFade);
const panelScale = innerWidth > 820 ? innerWidth / 1516 : 1;      // 设计稿 1516px 整体缩放
```

DOM 文字层与 WebGL 层**共享同一个 road 切片**（paper 2100~3000、tree 2775~3300），所以纸出现→字浸开→树揭示的顺序永远对齐。

### 3.2 逐行抬起（line reveal）

```js
// :20-23
const lineStyle = (opacity, lineIndex) => ({
  transform: `translateY(${120 * (1 - smooth((opacity - lineIndex * 0.12) / 0.62))}%)`
});
```

```css
/* index.css */
.fin-h .ln { display:block; overflow:hidden; margin:-.14em 0 -.2em; padding:.14em 0 .2em }
.fin-h .ln i { display:block; white-space:nowrap; font-style:normal; transform:translateY(120%) }
```

每行是 `<span class="ln"><i>text</i></span>`，外层 `overflow:hidden` 做裁切窗，内层 `translateY(120%)` 藏在下方；行 `k` 的进度比上一行晚 `0.12`。负 margin + 正 padding 是为了裁切窗不吃掉字的上下出头。**滚动驱动而非 CSS animation**——可倒放。

### 3.3 mask-image 直线擦除

```js
// :26-30 附近
const wipe = (1.52 - 2.04 * ink) * 100;                                        // % 位置，从下往上
const firstMask  = `linear-gradient(to top, transparent ${100 - wipe - 1.5}%, #000 ${100 - wipe + 3}%)`;
const secondMask = /* 相反方向 */;
<div className="fin-g" style={{ opacity: firstOpacity, WebkitMaskImage: firstMask, maskImage: firstMask }}>   // :49
```

4.5% 宽的渐变带做软边；两组文字用互补 mask，同一刻一组消失一组出现。第二组还叠加 `scale(${1 + 0.62*(1-secondSettle)})` 和 `filter: blur(${laterFade*13}px)`（:59-60）作为退场。

### 3.4 SVG 水墨滤镜 `#inkf`（**可直接复用**）

```jsx
// :40-46
<svg className="inkdef" aria-hidden><filter id="inkf" x="-18%" y="-30%" width="136%" height="160%">
  <feTurbulence type="fractalNoise" baseFrequency="0.011 0.017" numOctaves="4" seed="9" result="cl" />
  <feColorMatrix in="cl" type="matrix" result="clA" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" />   {/* 噪声 R → alpha */}
  <feComponentTransfer in="clA" result="m">
    <feFuncA type="linear" slope={9 - 5 * soak} intercept={-7.4 + 8.4 * clamp(planText * 1.12)} />         {/* 阈值随进度抬高 */}
  </feComponentTransfer>
  <feDisplacementMap in="SourceGraphic" in2="cl" scale={(1 - soak) * 34} xChannelSelector="R" yChannelSelector="G" result="warp" />
  <feComposite in="warp" in2="m" operator="in" />                                                         {/* 真正的 alpha 裁切 */}
</filter></svg>
```

```css
.fin-soak { filter: url(#inkf) blur(var(--soak,0px)) contrast(var(--bite,1)) }
/* JS: --soak = (1-soak)*3.4px；--bite = 1 + (1-soak)*6；soak = smooth(planText) */
```

工作原理（`REPLICATION_LESSONS.md` 第 4 条也强调"必须真的做 alpha 合成，只有位移看不出墨感"）：
1. `feTurbulence` 生成云状噪声 `cl`；
2. `feColorMatrix` 把噪声 R 通道搬到 alpha；
3. `feComponentTransfer` 用 `slope/intercept` 做可调阈值——`intercept` 随 `planText` 从 -7.4 升到 +1.0，噪声高于阈值的区域才可见，所以文字像**从噪声最浓处开始渗出、逐渐连片**；
4. `feDisplacementMap` 用同一噪声扭曲文字本体，`scale` 从 34 收到 0——先歪后正；
5. `feComposite operator="in"` 把扭曲后的文字按噪声 alpha 裁切。
外层再叠 CSS `blur/contrast`：`contrast` 高（1+6）时模糊的边缘被重新压硬，得到墨迹"晕开又收紧"的观感。

参数化建议：`baseFrequency` 决定墨团尺寸（越小越大团）、`slope` 决定边缘软硬、`filter` 区域要放大到 136%/160% 避免位移后被裁。

## 4. 表单场景的 3D 悬停（`ApplicationScene.jsx`）

```js
// ApplicationScene.jsx:20-35
const fly = clamp((road - 3900)/500), transition = clamp((road - 4650)/700);
const reveal = smooth((fly - 0.69)/0.3), exit = smooth(transition/0.34);
const live = reveal > 0.001 && exit < 0.999;                          // 不可见时 aria-hidden + opacity 0
const sceneTransform = `translate(${sceneX}px, ${sceneY - exit*height*1.22}px) scale(${baseScale*(1+exit*0.1)}) rotateX(6deg) rotateY(9deg) rotateZ(1.6deg)`;
// :76-100  每个字段
const item = smooth((reveal - index*0.18)/0.34) * (1 - exit);          // 逐个进场
const hoverDepth = hoveredIndex < 0 ? 0 : isHovered ? 34 : -14;       // 悬停者前推，其余后退
const hoverScale = isHovered ? 1.045 : hoveredIndex >= 0 ? 0.988 : 1;
const z = (1 - item) * -180 + (fields.length - index) * 7 + hoverDepth;
style.transform = `translate3d(${(1-item)*(index===1?90:-55)}px, ${(1-item)*(index===2?30:-5) + hoverLift}px, ${z}px) rotateZ(${(1-item)*(3-index*1.7)}deg) scale(${hoverScale})`;
style.filter = hoveredIndex >= 0 && !isHovered ? 'brightness(0.9)' : undefined;
```

- 容器 `perspective:1700px`，字段用 `translate3d(z)` 表达深度——**全部在合成器属性上**（transform/opacity/filter），无 layout 抖动。
- 悬停状态由 React state 维护，但只影响 style 字串，不触发重排。
- 玻璃质感来自 CSS 变量：`.cf-f{ background: linear-gradient(157deg, rgb(255 255 255/calc(var(--fill)*1.7)) ...); backdrop-filter: blur(var(--blur)) saturate(var(--sat)); box-shadow: inset 0 var(--insY) var(--insB) rgb(6 20 46/var(--ins)) }`，每个字段用 inline 变量（`--blur:9.5px --fill:0.1 --rim:0.41 ...`）调质感。
- `REPLICATION_LESSONS.md` 第 5 条记录的历史 bug：悬停无效是因为选择器作用域写错（`.cf .cf-f` 与实际 DOM 不匹配），提醒**动效失效先查选择器命中，再查动画逻辑**。

## 5. 导航与章节锚点（`Navigation.jsx`）

```js
const CHAPTER_AT   = [0.012, 0.232, 0.4, 0.628];                      // 点击跳转到的逻辑进度
const BEAT_WINDOWS = [[0, 0.045], [0.26, 0.4], [0.44, 0.55], [0.56, 0.65]];   // 高亮当前章节的窗口
onNavigate(CHAPTER_AT[idx]);   // → App.scrollToProgress → rawProgressFromMapped → scrollTo
```

跳转目标与高亮窗口是两张表：跳到章节**开头略后**（0.012 而不是 0），高亮窗口比章节窄——避免边界抖动。

## 6. 启动遮罩与 CSS 动画清单

- `.boot{ filter: blur(26px) saturate(.62) brightness(.92); transform: scale(1.06) }`，就绪后 `.boot.off{ opacity:0 }` 0.6s 过渡：用海报的模糊放大版盖住黑屏，`scale(1.06)` 抵消 blur 的透明边缘。
- `.fin{ pointer-events:none; z-index:3; position:absolute; inset:0; overflow:hidden }`：所有覆盖层都 `pointer-events:none`，只有导航/表单接收事件。
- `index.css` 中的 keyframes（仅列名，未逐条阅读）：`cfArc cfGlow cfRim cfRimP cross draw hdrIn menuIn ruleH ruleV settle settleFull shine`——命名上 `ruleH/ruleV` 是标尺线绘制、`draw` 是 SVG 描边、`cf*` 为表单玻璃高光。它们是少数**不由滚动驱动**的时间动画（悬停/进场装饰）。

## 7. 对《归航》的迁移要点

1. **Canvas 2D 序列帧层**可原样迁移为 `SequenceLayer`：`drawCoverFrame + positionX 运镜 + 最近帧兜底 + tier`，加 LRU（参考项目缓存无上限）。
2. **Chromakey 思路**在没有蓝天时仍有用：任何"只在某个颜色区域显示 UI"的需求（例如只在海面上出现航迹线）都可用 320×180 低分 key + `destination-in`。若素材可控，更好的做法是**离线导出 alpha 遮罩序列**，运行时省掉 `getImageData`。
3. **Ink 滤镜**是本册最值得直接复用的资产：5 步 SVG filter + `--soak/--bite` 两个变量，可做"羊皮纸上的墨字渗出/褪去"。注意 Safari 上 `feDisplacementMap` 与 `filter:url()` 叠 `blur()` 的性能，限制作用元素尺寸。
4. **line reveal + mask-image wipe** 用滚动进度驱动而非 CSS animation，保证可倒放，与 WebGL 层同源 road。
5. **DOM 栅格 → Canvas 位置**：以 DOM 参考元素 rect 为准，画布随排版走。
6. 保留 **校准器**模式：dblclick 唤出、localStorage 持久化、逆映射 scrub。在《归航》里可扩展为"章节节点表编辑器"。
7. 表单/卡片类 3D 悬停：全部走 transform/opacity/filter，深度用 `translate3d(z)` + 容器 `perspective`。
