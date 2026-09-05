# Pear-no 类参考项目架构审计

> 范围：2026-09-04/05 对 `references/pear-no/` 的架构与模块边界审计。本文不逐行分析 GLSL，也不主张复用参考素材或品牌实现。

## 1. 现有数据流

```text
window scroll / debug seek
          |
          v
src/App.jsx                         持有 raw progress 和页面编排
          |
          +--> src/timeline.js      物理滚动 <-> 标准化逻辑进度
          |
          v
scrollProgress (0..1) 传给所有渲染层
          |
          +--> HeroCanvas           WebGL + GLSL + video + 多组序列帧
          +--> SequenceCanvas       Canvas 2D 序列 + mask + overlay
          +--> SpatialWork          HTML capture + Three.js + MediaPipe
          +--> Terms/Application    HTML + CSS + SVG
          +--> FooterTransition     WebGL 转场
          |
          v
src/films.js + public/films/*       video、poster、desktop/mobile 帧目录
```

`src/App.jsx` 有单一 scroll 事件入口，再把同一进度分发给各渲染层；`src/timeline.js` 提供逻辑映射及逆映射。方向正确，但“场景解析”和“分支章节路由”尚未成为独立边界。

## 2. 应保留并抽象的模式

| 模式 | 参考证据 | 目标抽象 |
| --- | --- | --- |
| 单一物理滚动入口 | `src/App.jsx` | `StoryDirector` 输入适配器 |
| 逻辑 Road 与像素解耦 | `src/timeline.js` | 纯函数、可逆映射 |
| 按渲染技术拆组件 | `HeroCanvas`、`SequenceCanvas` 等 | Renderer 插件契约 |
| 资源就绪与最近帧兜底 | `SequenceCanvas.jsx` | Renderer 私有加载状态 |
| desktop/mobile 素材分支 | Canvas 组件 | manifest tier |
| 可 seek 校准 UI | `MaskCalibrator.jsx` | config 生成 Road 面板 |
| 共享媒体时钟 | App 中 video callback | 显式 MediaClock service（需要时） |
| 本地感知 + 指针回退 | `SpatialWork.jsx` | Interaction provider + engine |

## 3. 耦合点与坏味道

| 问题 | 证据 | 后果 | 目标修正 |
| --- | --- | --- | --- |
| TOTAL_ROAD 重复 | `timeline.js`、多个 Canvas/DOM 文件 | 改总长要全仓 grep | 章节 config 唯一来源 |
| 场景边界重复 | App、Canvas、calibrator、footer | 导航/画面/调试漂移 | `SceneRegistry` 派生 |
| Renderer 决定 handoff | Canvas 内部计算 overlap | 转场修改侵入实现 | config 写 blend，registry 算权重 |
| Hero 宿主过宽 | Road、sequence、video、shader、素材混合 | 新章波及巨大组件 | Renderer/asset/config 分离 |
| App 状态过宽 | media、pointer、loading、navigation 共存 | 无关功能互相重渲染 | Router/Director/Interaction 分 owner |
| 素材仅部分集中 | film config 外仍有帧路径 | 换素材需改源码 | 完整 manifest |
| mobile mapping 懂场景语义 | timeline 重复段长 | 新章破坏移动端节奏 | 从 chapter config 派生 |
| SpatialWork 写死 Road | `5350/1200/600/1900/2890` | 空间技术无法复用 | ThreeHtmlRenderer 只消费 SceneFrame |
| HTML 纹理语义降级 | 静态 capture 后声称纹理不可交互 | 未使用原生 DOM hit testing | capability bridge + geometry sync |

参考项目自身 `L4_DEVELOPMENT_PROGRESS.md` 也指出章节常量分散，应统一 scene config。

## 4. 直接 fork 换素材的风险

| 风险 | 概率/影响 | 原因 | fork 前修正 |
| --- | --- | --- | --- |
| 新章显示但导航跳过 | 高/高 | 多份章节表 | config 生成 registry/navigation |
| 快速 seek 黑帧 | 高/高 | 序列按需加载 | 连续性校验 + 最近帧 |
| desktop 正常、mobile 失败 | 高/高 | tier/cover 分散 | manifest 双 tier + 构图验收 |
| crossfade 空档/过曝 | 高/高 | overlap 局部常量 | 集中计算 opacity |
| video/texture 失步 | 中/高 | 隐式共享 ref | 明确 MediaClock 所有权 |
| Shader 带入品牌逻辑 | 高/中 | Hero 宿主过大 | Shader 后期可选，不复制 |
| 分支顺序形成全局 Road 爆炸 | 高/高 | 线性模型套动态 Track | Router + chapter-local Road |
| 实验 API 改名导致黑屏 | 高/高 | 业务直接探测方法名 | capability adapter + fallback |
| build 通过但构图失败 | 高/中 | 构建不懂视觉连续性 | 首/中/尾 + overlap 截图 |

## 5. 结论

应保留参考项目的“单一输入、逻辑时间、多渲染层、可 seek 调试、感知输入回退”思想，丢弃故事边界、品牌素材、巨型 Shader 宿主和组件内 Road 常量。对《归航》还必须新增两个边界：`StoryRouter` 处理 Track 任意顺序；`HtmlCanvasBridge` 隔离实验浏览器 API。否则换素材只是把旧耦合换了主题。
