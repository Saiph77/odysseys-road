# V2 实施方案与验收标准

> 更新：2026-09-05  
> 前置：[`V2_ORCHESTRATION_PROPOSAL.md`](V2_ORCHESTRATION_PROPOSAL.md)（编排 / 转场 / 决策 D-V2-001…011）  
> 契约：[`ARCHITECTURE.md`](ARCHITECTURE.md) §5；本文 Phase 0 落地 §7.1 契约建议后契约以 `src/core/contracts.ts` 为准  
> 交接快照（2026-09-05）：Phase 0 主体与 Phase 1 序列渲染已实现，Phase 2/3 未完成；以下清单仍是目标，不是完成证明。实测与剩余任务见 [`handoff/V2_MVP_CLOUD_HANDOFF.md`](handoff/V2_MVP_CLOUD_HANDOFF.md)。当前 MVP 不做 Phase 4/5。

---

## 0. 总览

```text
Phase 0  工具链 + 核心骨架          无画面，只有数字（DevRoadPanel 显示 chapter/road/activeScenes）
Phase 1  素材 + 线性 scrub          6 个 asset 全部能滚；硬切；DOM 章名卡；章节点导航
Phase 2  编排精修                    3a 锚点槽 / 3b 五连切 / 边界复验 / 屏数调优
Phase 3  Shader 三家族               T4 burn → T7/T13/T15 ring → T2 memory
Phase 4  打磨与发布                  boot / 性能预算 / a11y / reduced-motion / 文档
Phase 5  (可选) 头部探视 P2          HEAD_COUPLED_PEEK 作为 behavior 接入
```

每个 Phase 的验收 = **自动检查全绿 + 人工清单逐项勾选**；未过不进下一 Phase。任务卡编号 `V2-<phase>.<n>`。

## 1. 技术选型

| 项 | 选择 | 依据 |
| --- | --- | --- |
| 构建 | Vite 6 + TypeScript strict + pnpm | Pear 同栈（`package.json`）；`?raw` 导入 GLSL 不需插件 |
| UI 宿主 | React 19（只做 composition root 与 DOM Renderer） | ARCHITECTURE §2.1 `src/app/`；渲染主循环不走 React 状态 |
| 测试 | Vitest（core / config / renderers 纯逻辑）+ Playwright（滚动截图抽样） | ARCHITECTURE §8.2 |
| Lint | eslint + typescript-eslint + prettier；`pnpm check` = tsc + lint + test | AGENTS 提交前要求 |
| 渲染 | WebGL1 全屏三角形（`HeroCanvas.jsx:53` 模式）+ Canvas 2D fallback | D-V2-004 |
| 目标平台 | 桌面 Chromium，1280×720 desktop tier | 沿用 D-008 |

## 2. Phase 0 · 工具链与核心骨架

### 2.1 任务

| 卡 | 内容 | 产出 |
| --- | --- | --- |
| V2-0.1 | 初始化 `package.json` / `vite.config.ts` / `tsconfig.json` / eslint / vitest；`pnpm check` 脚本 | 空页面可 `pnpm dev` |
| V2-0.2 | `src/core/contracts.ts`：落 ARCHITECTURE §5.1 + 提案 §7.1 的 `clip` / `clips` / `flow.order`；删除第一稿不用的 `SelectionState` 等到 `contracts.future.ts`（保留文件、不导出） | 契约单一真相源 |
| V2-0.3 | `src/config/story.config.ts`：按提案 §2.1 填 5 章全部 scene（asset 尚未抽帧时 manifest 用占位 count） | config 可被 validator 通过 |
| V2-0.4 | `src/config/assets.manifest.ts`：6 个 asset + `clips`；帧号由 `clipFromSeconds(assetStart, from, to)` 在**构建期**算出，运行时不出现秒 | manifest 可校验 |
| V2-0.5 | `src/core/validateStory.ts`：ARCHITECTURE §5.3 全部规则 + 提案 §7.1 新增规则 | 单测覆盖每条拒绝规则 |
| V2-0.6 | `src/core/StoryDirector.ts` + `SceneRegistry.ts`：rawProgress → chapter → road → `SceneFrame[]`（opacity 由 blend 算，smoothstep） | 单测：边界 / blend / 多层 |
| V2-0.7 | `src/core/ProgressSource.ts`（scroll）+ `timeline.ts`（`mapScrollProgress` / `rawProgressFromMapped` 逆映射，来自 Pear `timeline.js:47-71` 思想） | `.stage` 高度 = Σscreens×100vh |
| V2-0.8 | `src/core/ChapterRuntime.ts`（mount/destroy + latch）、`src/components/RendererStage.tsx`、`rendererRegistry` | 只注册 `dom` |
| V2-0.9 | `src/renderers/DomRenderer.ts`：读 `content.registry` 文案；line reveal 由 localProgress 驱动（可倒放） | 5 张章名卡 + 结尾 |
| V2-0.10 | `src/components/DevRoadPanel.tsx`（`?debug=1`）：显示 chapter / road / activeScenes / frameIndex；拖拽 seek 走逆映射 | 调参工具 |

### 2.2 验收

自动：
- [ ] `pnpm check` 全绿；`validateStory` 对 fixture（重复 id、gap、越界 road、未注册 renderer、缺 clip、transition 引用不存在 clip）各有一条失败用例
- [ ] `StoryDirector` 单测：rawProgress 0 → `origin` road 0；rawProgress 1 → `stinger` road 500；章边界前后 1e-6 归属正确
- [ ] `SceneRegistry` 单测：`origin-burn`（520–600, layer 20）与 `origin-memory`/`origin-alone` 同时 active，opacity 正确
- [ ] 全仓库 grep：`src/renderers/` `src/components/` `*.css` `*.glsl` 不含 `scrollY`、不含任何 Road 裸数字（允许 0 / 1 / DPR 等纯渲染常量）

人工：
- [ ] `?debug=1` 页面滚动 40 屏，面板数字连续、无跳变；点击章节点能 seek 到章首
- [ ] 5 张 DOM 卡在正确 Road 出现/消失，且**不在视口底部 12%**（避开烧录字幕，D-V2-010）

## 3. Phase 1 · 素材与线性 scrub

### 3.1 任务

| 卡 | 内容 |
| --- | --- |
| V2-1.1 | 按提案 §5 抽 6 个 asset（`--width 1280 --fps 24`）；每个目录生成 `manifest.json`；`public/assets/README.md` 更新表格 |
| V2-1.2 | `tools/verify-sequence.mjs`：检查帧号连续、尺寸一致、首/末帧非纯黑（亮度阈值）、count 与 manifest 一致 |
| V2-1.3 | `src/renderers/sequence/FrameStore.ts`：按需加载 + 预取 ±3 + 最近已解码帧兜底（`HeroCanvas.jsx:154-168`）+ **LRU（编码 Image ≤ 600 张）**；`decoding='async'` |
| V2-1.4 | `src/renderers/sequence/SequenceRendererGL.ts`：WebGL1 全屏三角形；纹理单元 0/1 = A/B；cover-fit 数学（PEAR_01 §1.4）；`localProgress → clip 帧号`；`texSubImage2D` 仅在帧变化时上传；`alpha:false` 未就绪 → `opacity:0` |
| V2-1.5 | `src/renderers/sequence/SequenceRenderer2D.ts`：`drawCoverFrame`（`SequenceCanvas.jsx:17-25`）；能力探测失败时由 registry 选它 |
| V2-1.6 | `src/capabilities/webgl.ts`：探测 + `prefers-reduced-motion` 读取；实验 API 名只出现在此目录 |
| V2-1.7 | Boot：`.boot` 模糊 poster（`002` 6.1s 帧导出为 `public/assets/posters/act-1-origin.jpg`）；首屏"向下滚动"提示；挂载后手动触发一次 `handleScroll`（Pear `App.jsx:132-134`） |
| V2-1.8 | 右侧 5 章节点导航（`Navigation.jsx` 模式）；键盘 ↑↓ PgUp PgDn Home End |
| V2-1.9 | Playwright：滚到每章 25% / 50% / 75% 截图，对比 `tests/fixtures/expected/*.png`（首次生成基线，人工确认后入库） |

### 3.2 验收

自动：
- [ ] `verify-sequence` 6 个 asset 全部通过；总帧数 3085 ± 6（fps 取整误差）
- [ ] 单测：`clipFrameIndex(localProgress, clip)` 首/末/中点正确；`scrub:{from,to}` 映射正确
- [ ] Playwright 15 张截图与基线 SSIM ≥ 0.98
- [ ] Chrome Performance 录制匀速滚动 origin 章 10s：长任务（>50ms）= 0；JS heap 峰值 < 300MB
- [ ] `chrome://gpu` 无 WebGL 时（`--disable-gpu`）页面用 2D 路径走完全程，无报错

人工：
- [ ] 6 个 asset 顺序滚完，**无黑帧、无白闪**；章间黑场只出现在 `ithaca` 尾（源片自带）和 DOM 卡处
- [ ] 快速 fling 时画面不清空、不卡死（最近帧兜底生效）
- [ ] 1280×720 素材在 1440/1920 宽视口 cover 无变形、水印位置稳定在右下
- [ ] 40 屏总长体感：记录用户"太长 / 合适 / 太短"，决定 Phase 2 是否调 `scroll.screens`

## 4. Phase 2 · 编排精修

### 4.1 任务

| 卡 | 内容 |
| --- | --- |
| V2-2.1 | strip 复验 `020`–`029`、`031`–`034` 切帧到 ±0.05s（方法：`extract-sequence-frames --fps 24 --width 240` → ffmpeg `tile`，同 TRAILER_INDEX §7）；结果写 `timeline.json` note 与 manifest `clips`，**不改 id/anchor** |
| V2-2.2 | `trials-020…029` 10 个锚点槽落 config；`scrub:{from:0.2,to:0.8}`；`021` 槽 100 Road + zoom treatment 参数占位 |
| V2-2.3 | `homeward` 五连切 9 个 scene 落 config；`037` 130 Road |
| V2-2.4 | `ithaca-redsail` 独立 pace 段（77.0–79.0 → 140 Road）；`ithaca-helmet` 尾段 |
| V2-2.5 | DevRoadPanel 增加"scene 时间尺"：横条显示当前章各 scene Road 区间与当前位置，便于用户看图调屏数 |
| V2-2.6 | 与用户一起过 5 章屏数；结论只改 `story.config`，提交 config diff |

### 4.2 验收

自动：
- [ ] validateStory：同章内 layer 10 的 sequence scene Road 不重叠、不留 gap（transition 层 20 除外）
- [ ] 单测：每个 3b scene 的 Road 长度 ≥ 70；`037` ≥ 130
- [ ] Playwright：在每个五连切 scene 的 10% / 90% 截图，两张属于**同一镜头**（SSIM ≥ 0.9，证明没滚过切点）

人工：
- [ ] 3a 十个槽逐个滚：槽内无切镜闪烁；槽间为干净硬切
- [ ] 3b 五连切：慢滚时每个镜头都能"停住看清"；`037` 有慢镜感
- [ ] 红帆① / ② / ③ 三处各自有 ≥1 屏 hold（Phase 3 前先用硬切验证节奏）
- [ ] 用户确认 5 章屏数（记录到提案 §8 开放问题 #5 关闭）

## 5. Phase 3 · Shader 三家族

### 5.1 任务

| 卡 | 内容 |
| --- | --- |
| V2-3.1 | GLSL 拆分（PEAR_01 §5 建议）：`src/renderers/sequence/glsl/common.glsl`（hash / fbm / cover uv）、`treat_memory.glsl`、`wipe_burn.glsl`、`wipe_ring.glsl`、`main.glsl`（按 `uMode` 组合，饱和短路早退）；**不复制 Pear 品牌相关逻辑** |
| V2-3.2 | **T4 burn POC**（D-V2-006）：`origin-burn` scene；A = `006-troy-fire` last，B = `007-go-home` first；`uT = localProgress`；参数：噪声频率、碳化宽度、余烬色 —— 全部来自 `behavior.transition` |
| V2-3.3 | ring：`ithaca-ring-1` / `homeward-ring-2` / `homeward-ring-3`；`uOrigin` 来自 manifest clip `origin`；`intensity 1/2/3` → 参数表 `{radiusScale, frontWidth, chroma}` 在 config 定义 |
| V2-3.4 | DevRoadPanel："点选 origin"模式：在画面上点一下把归一化坐标打印出来，人工写回 manifest（不自动写文件） |
| V2-3.5 | memory treatment：`origin-memory` scene；bloom + 颗粒 + 暗角 + 色差，`intensity = smooth(ramp in) × (1 − smooth(ramp out))` |
| V2-3.6 | `021` zoom treatment（`uv` 1.1→1.0） |
| V2-3.7 | 降级：`prefers-reduced-motion` 或 2D 路径 → 三家族全部替换为 opacity crossfade（A/B 双 canvas，`SequenceCanvas.jsx:371-375` 模式） |
| V2-3.8 | Shader 单测（headless-gl 或 Playwright WebGL 截图）：`uT=0` 全 A、`uT=1` 全 B、`uT=0.5` 既有 A 又有 B 像素 |

### 5.2 验收

自动：
- [ ] GLSL 文件均 < 200 行；`main.glsl` 无业务常量（origin / intensity / span 全部 uniform）
- [ ] 三家族各有 `uT ∈ {0, 0.5, 1}` 截图断言
- [ ] reduced-motion 模式 Playwright 全程截图与 Phase 1 基线一致（说明退化路径 = 无 shader）
- [ ] 转场进行中 GPU 帧时间 < 8ms（Chrome Performance，1440×900 视口，DPR ≤ 1.5 cap）

人工（用户看图拍板）：
- [ ] T4：火焰边缘噌噌"烧穿"露出木筏，前沿以外两侧画面清楚（Pear 审美原则：故障只在交界前沿）
- [ ] ring ①②③ 用**同一形态**，强度肉眼可辨递增；origin 落在红帆上
- [ ] memory 段有"记忆感"但字幕仍可读（不过曝底部）
- [ ] 倒滚时所有效果可逆、无残影

## 6. Phase 4 · 打磨与发布

| 卡 | 内容 | 验收 |
| --- | --- | --- |
| V2-4.1 | 预加载策略：当前章全量 + 下一章前 48 帧；`FrameStore` 上报缺帧给 LoadingState | 冷启动到可滚 < 2s（本地）；跨章无等待感 |
| V2-4.2 | 性能预算固化：`tests/perf/scroll.spec.ts` 自动录制并断言长任务 = 0、heap < 300MB | CI 可跑 |
| V2-4.3 | a11y：滚动条隐藏但键盘全程可达；章节点有 `aria-label`；DOM 卡文本真实 DOM | axe 无 serious |
| V2-4.4 | 结尾来源声明文案（开放问题 #6）、章名卡终稿（#4） | 用户确认 |
| V2-4.5 | 文档：`ARCHITECTURE.md` §5 同步契约；`REDESIGN.md` 勾选；`docs/README.md` 链接；本文验收勾选归档 | 链接全有效 |
| V2-4.6 | 构建产物 `pnpm build` + 本地 `preview` 走通；素材 200MB 不进 git（`.gitignore` 已含 `desktop/`） | — |

## 7. Phase 5 · 可选：头部探视（P2）

只在 Phase 4 验收后、用户明确要求时启动。接入点：`behavior: { interaction: 'head-coupled-peek', maxUvOffset }` 作用于 pace 段的 cover-fit `uPanPx`（PEAR_01 §1.4），走 `InteractionEngine` → `InteractionFrame`；MediaPipe 只输出低维帧（AGENTS 隐私红线）。需要新增 pre-roll 授权流程与隐私文案 → 必须问人。

## 8. 风险与对策

| 风险 | 影响 | 对策 |
| --- | --- | --- |
| 字幕版源片将来替换为无字幕版 | fps / 时间码偏移 | 所有切帧以秒记录在 manifest 源数据；重跑 §5 命令 + 43 锚点 strip 复验 |
| 3085 帧 JPG 首屏加载 | 白屏 | poster + 当前章优先 + LRU；LoadingState 显示缺帧 |
| WebGL 上传 1280×720 纹理每帧 | 卡顿 | 只在帧号变化时 `texSubImage2D`；DPR cap 1.5 |
| 锚点槽 `scrub` 中段仍滚过切点 | 闪烁 | Phase 2 strip 复验到 ±0.05s；Playwright 10%/90% 同镜头断言 |
| Burn/ring 抽取时带入 Pear 品牌逻辑 | 使用边界 | 只搬数学（噪声、距离场、混合），不搬颜色表与形状常量；代码注释标来源行号 |
| 40 屏太长 | 流失 | Phase 1 人工体感 → 只改 `scroll.screens` |

## 9. 汇报模板（每张卡完成时）

```text
卡：V2-x.y  类别：core / renderer / config / tools / docs
改动文件：
命令与结果：pnpm check ✅ / Playwright n/n ✅
未验证项：
对共享文件（contracts / story.config / manifest）的建议 diff：
```
