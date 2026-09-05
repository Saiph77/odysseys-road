# Pear.no 参考实现技术手册（总览 / 索引）

> 范围：对 `references/pear-no/` 快照（上游 amasun/Pear-no，基础提交 `c9c094c`，快照日 2026-09-05）的**技术实现**逐文件研读。目标是提炼可迁移到《归航 / Odyssey's Road》的动效、转场与交互技术，附带可直接参考的代码片段（Few-shot）。
> 边界：只研究技术，不复用品牌素材、文案与 Shader 中的品牌逻辑（`REFERENCE_SNAPSHOT.md` 使用边界）。
> 撰写方式：全部结论均来自本人对源码的直接阅读，每条附 `文件:行号`。未读取的部分会明确标注。

## 0. 文档分册

| 分册 | 内容 | 对应源码 |
| --- | --- | --- |
| 本文 | 总体架构、Road 时间轴、层叠与 handoff、素材规格、迁移结论 | `App.jsx` `timeline.js` `index.css` `films.js` |
| [`PEAR_TECH_01_WEBGL_SHADER.md`](PEAR_TECH_01_WEBGL_SHADER.md) | Hero WebGL 宿主、cover-fit 数学、序列帧纹理、GLSL 转场效果库（breathe / slabs / halftone / warp / static wave / ring / burn / paper） | `HeroCanvas.jsx` `hero_main_fragment.glsl` `FooterTransitionCanvas.jsx` `transition_fragment.glsl` |
| [`PEAR_TECH_02_CANVAS_DOM_FX.md`](PEAR_TECH_02_CANVAS_DOM_FX.md) | Canvas 2D 序列帧、蓝天 chromakey 遮罩、网格线/星形、SVG 水墨 Ink 滤镜、DOM 章节联动、校准器 | `SequenceCanvas.jsx` `TermsNarrative.jsx` `MaskCalibrator.jsx` |
| [`PEAR_TECH_03_SPATIAL_HEAD_TRACKING.md`](PEAR_TECH_03_SPATIAL_HEAD_TRACKING.md) | **HTML-in-Canvas 纹理、Three.js 空间卡片、off-axis 投影、MediaPipe 头部追踪与"看哪张选哪张"** ——与本项目 Track 选择直接相关 | `spatial/*` |

## 1. 一句话架构

```text
window.scroll ──► App.jsx handleScroll ──► timeline.mapScrollProgress ──► scrollProgress ∈ [0,1]
                                                                          │
              ┌───────────────────────────────────────────────────────────┼─────────────────────────┐
              ▼                     ▼                    ▼                ▼                          ▼
        HeroCanvas(WebGL)   SequenceCanvas(2D)   SpatialWork(Three)  TermsNarrative(DOM+SVG)  FooterTransition(WebGL)
        road 0~3900         road 3900~5350       road 1200~1800      road 2100~3300           road 4650~5350
```

- **单一输入**：只有 `App.jsx:97-131` 一个 `scroll` 监听，把 `progress` 用 React state 下发给所有层。
- **逻辑时间**：所有层内部把 `progress` 乘回 `5350`（"Road" 单位）再按各自区间切片，见 `HeroCanvas.jsx:204`、`SequenceCanvas.jsx:146`、`SpatialWork.jsx:96`、`TermsNarrative.jsx:7`、`FooterTransitionCanvas.jsx:85`。
- **物理滚动**：`.stage{height:5350vh}`，手机 `7300vh`；`.pin{position:sticky;top:0;height:100dvh;overflow:clip}` 把所有画布钉在视口（`index.css` `.stage/.pin` 规则）。滚动条被 `scrollbar-width:none` 隐藏。

## 2. Road 时间轴（`src/timeline.js`）

### 2.1 核心机制

```js
// timeline.js:1
export const TOTAL_ROAD = 5350;
// timeline.js:47-58  物理 raw(0..1) → 逻辑 progress(0..1)
export function mapScrollProgress(rawProgress, isMobile = false) {
  const raw = clamp(rawProgress);
  if (!isMobile) return raw;                 // 桌面：恒等映射
  for (let index = 1; index < mobileMap.length; index += 1) {
    if (raw <= mobileMap[index][0]) {        // 分段线性插值
      const [x0, y0] = mobileMap[index - 1];
      const [x1, y1] = mobileMap[index];
      return y0 + (raw - x0) * (y1 - y0) / Math.max(0.000001, x1 - x0);
    }
  }
  return 1;
}
// timeline.js:60-71  逆映射：给定逻辑进度，求应滚到的物理位置（导航/seek 用）
export function rawProgressFromMapped(progress, isMobile = false) { /* 对称实现 */ }
```

- `mobileMap`（`timeline.js:7-45`）是一张 `[physical, logical]` 折线表：每段 `[logicalSpan, physicalSpan]` 累加得到控制点，最后强制 `[1,1]`。手机端把某些章节（如 reel 段）的物理滚动拉长、其他压缩，但**逻辑节点不变**，所以所有渲染层的阈值无需改动。
- 逆映射在两处用到：`App.jsx:156-161 scrollToProgress()`（导航按钮）和 `MaskCalibrator.jsx:130-134 seekToProgress()`（调试拖拽）。

### 2.2 章节锚点

| 用途 | 值 | 位置 |
| --- | --- | --- |
| 导航章节切换阈值 | `0.012 / 0.232 / 0.4 / 0.628` | `App.jsx:107-118`，`Navigation.jsx:19 CHAPTER_AT` |
| Hero 段长（占 TOTAL_ROAD 比例） | model 1200、pan 600、coda 300、paper 900、handoff 300、faq 600 | `HeroCanvas.jsx:18-25` |
| Spatial 区间 | `(road-1200)/600` | `SpatialWork.jsx:97` |
| Terms 区间 | paper `(road-2100)/900`，tree `(road-2775)/525` | `TermsNarrative.jsx:8-11` |
| Sequence 区间 | FLY 3900→4400，crossfade end 4760，TRANSITION 4650→5290 | `SequenceCanvas.jsx:11-15` |
| Footer 转场 | `(road-4650)/700`，再取 `(t-0.74)/0.18` 做混合 | `FooterTransitionCanvas.jsx:85,91` |
| Spatial 懒挂载 | `progress > 0.16` | `App.jsx:150` |

> ⚠️ 这些常量在 ≥6 个文件中重复出现（`5350`、`1200`、`2100`……）。这是参考项目公认的坏味道（其 `L4_DEVELOPMENT_PROGRESS.md` 也提到），我们的 `ARCHITECTURE.md` 已要求改为 `story.config` 单一来源。**迁移时只保留"逻辑 Road + 分段线性映射 + 逆映射"三个思想。**

### 2.3 通用缓动

所有层都用同一个 Hermite 平滑，值得作为项目公共函数：

```js
const clamp  = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const smooth = (v) => { const t = clamp(v); return t * t * (3 - 2 * t); };   // = smoothstep(0,1,t)
// 用法：区间归一化后再 smooth
const enter = smooth(sectionProgress / 0.08);
const leave = 1 - smooth((sectionProgress - 0.88) / 0.12);
const reveal = enter * leave;              // createSpatialScene.js:183-185
```

## 3. 渲染层叠与 handoff

| 层 | 技术 | 可见 Road | 进/出方式 | 证据 |
| --- | --- | --- | --- | --- |
| `.boot` | `<img>` poster + `blur(26px) saturate(.62)` | 资源就绪前 | `.boot.off{opacity:0}` 0.6s | `index.css .boot` |
| HeroCanvas | WebGL 全屏三角形 | 0 → 3900 | `canvas.style.opacity = road>3900?0:1` | `HeroCanvas.jsx:338` |
| SpatialWork | Three.js（alpha:true） | 1200 → 1800 | `visibility` 由 smooth 进出算出，直接设 `opacity` | `SpatialWork.jsx:98,221` |
| TermsNarrative | DOM + SVG filter + mask-image | 2100 → ~3300 | `opacity` + `mask-image` 线性擦除 | `TermsNarrative.jsx:24-30` |
| SequenceCanvas flysky | Canvas 2D | 3900 → 4760 | 与 trans 序列在 4650~4760 交叉淡化 | `SequenceCanvas.jsx:162` |
| SequenceCanvas trans | Canvas 2D | 4650 → 5350 | `positionX` 由 smoothstep 平移取景 | `SequenceCanvas.jsx:189-203` |
| FooterTransitionCanvas | WebGL 混合 t1(尾帧)→t2(footer 视频) | mix∈(0,1) 时 | 两纹理都就绪前 `opacity:0` 防黑屏 | `FooterTransitionCanvas.jsx:94` |

**handoff 原则（可直接迁移）**：
1. 相邻两层的可见区间要有 overlap，且 overlap 内两者都在渲染，用 opacity/mask 交接；
2. WebGL `alpha:false` 画布在纹理未就绪时是**纯黑**，必须用 `opacity:0` 藏住（`FooterTransitionCanvas.jsx:92-94` 的注释）；
3. 序列帧未加载到时保留**上一帧**而不是清空（`SequenceCanvas.jsx:117-119`、`HeroCanvas.jsx:161-167` 最近帧兜底）。

## 4. 共享媒体时钟（video → 两个消费者）

```jsx
// App.jsx:76-95
const notifyFrame = (_now, metadata) => {
  videoFrameRef.current = { presentedFrames: metadata.presentedFrames, mediaTime: metadata.mediaTime, ready: true };
  video.requestVideoFrameCallback(notifyFrame);
};
video.requestVideoFrameCallback(notifyFrame);
```

- 同一个 `<video>`（`App.jsx:209-210` 注释 "One video clock shared by WebGL and the chroma-key mask"）被 HeroCanvas 当 WebGL 纹理、被 SequenceCanvas 当 chromakey 源。
- HeroCanvas 只在 `presentedFrames` 变化时才 `texSubImage2D`（`HeroCanvas.jsx:219-223`），避免每 rAF 重复上传。
- 不支持 `requestVideoFrameCallback` 的浏览器退回 `readyState>=2` 判断（`HeroCanvas.jsx:217`）。
- **迁移**：《归航》若有视频章节，应建 `MediaClock` service 拥有这个 ref，Renderer 只读。

## 5. 资源加载与启动

- `LoadingState` + `.boot` 模糊 poster：`posterReady || videoReady` 任一成立即撤掉遮罩（`App.jsx:154`）；10 秒都没就绪则 `bootError`（`App.jsx:136-138`）。
- 浏览器可能在 React 挂载前恢复 scrollY，因此挂载后**立即手动调用一次** `handleScroll()`（`App.jsx:132-134`）。
- 序列帧：**按需 + 预取 3 帧 + 最近帧兜底**，见 `HeroCanvas.jsx:154-168`：

```js
const frame = (kind, index, count) => {
  const safeIndex = Math.round(clamp(index, 0, count - 1));
  if (!caches[kind].has(safeIndex)) caches[kind].set(safeIndex, loadImage(sequencePath(kind, safeIndex)));
  for (let offset = 1; offset <= 3; offset += 1) {                     // 预取后 3 帧
    const next = Math.min(count - 1, safeIndex + offset);
    if (!caches[kind].has(next)) caches[kind].set(next, loadImage(sequencePath(kind, next)));
  }
  const exact = caches[kind].get(safeIndex);
  if (exact?.complete && exact.naturalWidth) return exact;
  for (let offset = 1; offset < count; offset += 1) {                  // 向两侧找最近已解码帧
    const nearby = caches[kind].get(Math.max(0, safeIndex - offset)) || caches[kind].get(Math.min(count - 1, safeIndex + offset));
    if (nearby?.complete && nearby.naturalWidth) return nearby;
  }
  return null;
};
```
  `loadImage` 设置 `image.decoding = 'async'`（`HeroCanvas.jsx:27-32`）。快速 seek 时用最近帧防黑帧，但缓存无上限（几百帧全驻留内存）——迁移时应加 LRU。

## 6. 素材规格（实测，`public/films/`）

| 目录 | 帧数 | 桌面尺寸 | 手机 tier | 单帧体积 |
| --- | --- | --- | --- | --- |
| `flysky/` `plan/` `tree/` `trans/` | 121 | 1920×1080 | `768/` 768×432 | ~91KB / ~28KB |
| `model/renaissance/` | 362 | `1440/` 1440×810 | `768/` 768×432 | ~71KB / ~22KB |
| `model/v28|v51|v61/` (bridge) | 121 | 同上 | 同上 | — |
| `coda/` | 89 | 1664×1248（4:3） | 无 | ~111KB |
| 视频 | `signal.mp4` 11M、`reveal.mp4` 13M、`colossus.mp4` 5.3M、`footer-loop.mp4` 7.2M | | | |
| MediaPipe | `mediapipe/wasm` 34M、`models/face_landmarker.task` 3.6M | | | |

- 帧命名 `f_001.webp` 起始 1，代码中 `String(frame + 1).padStart(3,'0')`。
- tier 切换阈值不统一：Hero 用 `innerWidth <= 820`（`HeroCanvas.jsx:60`），Sequence 用 `w <= 820`，timeline 用 `<= 720`——迁移时统一到 manifest。
- 每部 film 有自己的 `origin`（转场环心，归一化到视频帧）、`pos`（三档视口宽度的水平取景 0..1）、`bridge` 序列与 `bridgeJoin` 接合帧（`films.js:3-31`）。这就是"素材配置表"，应对应我们的 asset manifest。

## 7. 工程化

- Vite 插件 `raw-glsl-loader`（`vite.config.js:8-17`）把 `.glsl` 转成字符串导出；组件用 `import src from './x.glsl?raw'`。
- 依赖：`three ^0.185.1`、`@mediapipe/tasks-vision ^1.0.1`、`html2canvas ^1.4.1`、React 19、Vite 6（`package.json`）。
- 移动端 GLSL 用 `#define PHONE 1` 前缀注入（`HeroCanvas.jsx:64`），Shader 内 `#ifdef PHONE` 降噪声八度（`hero_main_fragment.glsl:87-99`）。
- `OES_standard_derivatives` 可用时定义 `AAW(e)=fwidth(e)*10`，否则常量 `0.006`（`HeroCanvas.jsx:63`）——抗锯齿宽度的运行时降级范例。

## 8. 对《归航》的迁移结论

**保留的思想**
1. 逻辑 Road + 分段线性映射 + 逆映射（含手机独立节奏）。
2. 每层用 `smooth(区间归一化)` 计算 enter/leave，opacity 交接，overlap 显式。
3. 单一 rAF 循环 + `useRef` 同步最新 props（避免闭包过期与 HMR hook 失步，`handoff.md §C`）。
4. 序列帧：按需 + 预取 + 最近帧兜底 + desktop/mobile tier。
5. 共享 video 时钟、`presentedFrames` 去重上传。
6. WebGL 未就绪 → opacity 0；`alpha:false` 黑屏陷阱。
7. 渐进增强：WebGL 失败 `console.warn` 返回、摄像头失败退回指针、原生 HTML-in-Canvas 失败退回 html2canvas。

**丢弃的部分**
- 所有 Road 裸数字散落在组件里；`films.js` 之外仍有硬编码路径（如 `/art/scaffold_expand.jpg`）。
- 949 行的单体 Shader 承载整段叙事（详见分册 01，我们应按效果拆函数、按章节拼装）。
- `SpatialWork` 把章节文案、Road 常量、Three 场景、摄像头 UI 全放一个组件。

**与现有设计文档的对接**
- `docs/ARCHITECTURE.md` §5 `story.config` ↔ 本文 §2.2 常量表。
- `docs/TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md` ↔ 分册 03。
- `docs/HEAD_COUPLED_PEEK_TECHNICAL_DESIGN.md` ↔ 分册 01 §cover-fit/uPanPx 与分册 03 §头部→视差。
