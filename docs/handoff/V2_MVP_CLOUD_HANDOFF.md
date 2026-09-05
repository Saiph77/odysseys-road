# V2 MVP · 云端实现交接

> 更新日期：2026-09-05
> 仓库：Saiph77/odysseys-road；接续分支：`v2/mvp`。
> 实现检查点：`73bcb0f`（V2-1.2）；请使用该分支最新提交，包含本文及所需索引。
> 本文是当前状态快照；旧 `V2_MVP_AGENT_BRIEF.md`、`V2_ORCHESTRATION_AGENT_BRIEF.md`、`V2_PHASE0_TAKEOVER_REPORT.md` 不是当前完成证明。

## 1. 目标、授权与边界

完成《归航 / Odyssey's Road》**Phase 0–3 MVP 剩余工作**，不是重新设计，也不是从空仓库搭建。

- 五章 `origin → ithaca → trials → homeward → stinger`，7/10/9/9/5 屏，共 40 屏；100 Road 对应一个实际可滚视口。
- 仅 `sequence`（WebGL1 / Canvas 2D fallback）与 `dom` 两个 Renderer key。
- 仅 memory / burn / ring 三个 shader 家族；红帆三次共用 ring、强度递增。
- 唯一源片为官方预告片的既有字幕/水印版本，不生成、不重绘、不 AI 补帧；不把全长 sequence 接入 story。
- 不锁滚动、不接音频/摄像头，不做 Phase 4/5，不编辑 `archive/`。
- D-V2-013：用户授权最小、可逆决策记入提案后继续推进，不等逐 Phase 回复。不可把主观验收写成用户已确认；不可把该授权扩大为变更素材、家族、章节等红线。
- 章名/结尾终稿仍未确认；保留明确占位，不擅自编写来源或使用权声明。

先读 `AGENTS.md` → `docs/V2_ORCHESTRATION_PROPOSAL.md` → `docs/V2_IMPLEMENTATION_PLAN.md` → `docs/TRAILER_INDEX.md` 与 `public/assets/keyframes/official-trailer/timeline.json` → `docs/ARCHITECTURE.md` §2/3/5/7 → `docs/reference/PEAR_TECH_REFERENCE.md` 及 01/02 分册 → `src/core/contracts.ts`。

架构文档含 V1 预留设计；当前 DTO 以 contracts 为准，当前 V2 编排以提案和 story config 为准。已有 `clip`、`clips`、`flow.order`、`SceneFrame.clip`、带 chapterId 的 `fromRoad`、manifest `pattern` 不要重复设计。

## 2. 云端第一件事：恢复素材

### 2.1 Git 包含什么

源码、lockfile、六个资产 manifest、构建期源区间、boot poster、43 锚点图/索引、15 张截图基线、提案与参考源码都随 Git 提交。

**Git 不包含 3084 张章节 JPG、原始 MP4、临时 strip**。只 clone 会缺帧；`pnpm check`/构建成功也不代表真实素材可运行。不要因此替换为 mock、下载另一个版本的预告片或直接使用全长序列。

本地打包产物（需用户上传或挂载，未上传到任何外部存储）：

| 包 | 约大小 | 用途 | SHA-256 |
| --- | ---: | --- | --- |
| `odyssey-v2-full-assets.tar.gz` | 228 MiB | 推荐：六段精确 JPG + 唯一源片 + strip，避免 ffmpeg 版本造成基线差异 | `55944a931d7a3a92737fa771a785be0c4dbaa4eb7846a048b99e972c019a965a` |
| `odyssey-v2-source-and-strips.tar.gz` | 20 MiB | 上传有限时使用；只有唯一源片与 strip，须重新抽六段 | `c647a9d19eff5649b24734bfb0d5b0544bc1b5ac5e4cc90f61eb8c5ac01ccbfb` |

本机目录：`/Users/saiph/Downloads/odysseys-road/artifacts/cloud-handoff/`。云端**不能访问这个本机绝对路径**，必须先取得包。两个包任选其一，不必都上传。

### 2.2 启动与恢复命令

在仓库根目录操作，用上传后的实际路径替换 `/path/to/`：

```bash
git switch v2/mvp
git log -3 --oneline
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
tar -xzf /path/to/odyssey-v2-full-assets.tar.gz
node tools/verify-sequence.mjs
pnpm check
pnpm build
pnpm exec playwright test
pnpm dev --host 0.0.0.0
```

完整包展开后得到 `public/assets/sequences/act-*/desktop/` 与 `handoff-assets/source.mp4`、`handoff-assets/strips/`。它们均受 `.gitignore` 保护，不要强制 add。`handoff-assets/source.mp4` 是原 `66443bfd-1e56-4625-9cc6-2d318172909a.mp4` 的逐字节副本，仅为方便迁移改文件名。

若只收到小包，安装 ffmpeg 后执行：

```bash
tar -xzf /path/to/odyssey-v2-source-and-strips.tar.gz
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const source = JSON.parse(readFileSync('tools/assets.source.json', 'utf8'));
for (const asset of source.assets) {
  const result = spawnSync('node', [
    'tools/extract-sequence-frames.mjs', '-i', 'handoff-assets/source.mp4',
    '--id', asset.id, '--fps', String(source.fps), '--width', '1280',
    '--start', String(asset.start), '--duration', String(asset.end - asset.start),
  ], { stdio: 'inherit' });
  if (result.error || result.status !== 0) throw result.error ?? new Error(asset.id);
}
NODE
node tools/verify-sequence.mjs
node tools/build-assets-manifest.mjs
```

重抽 manifest 可能写入机器路径/工具版本；审查 diff，不无故提交环境噪声。重抽不保证字节级复现 JPEG，优先用完整包保留现有基线。

本机已验证环境：Node 25.6.1 / pnpm 10.23.0 / ffmpeg 8.1.1。版本不同时先报告差异，不盲目升级 lockfile。Playwright 用**独占 4317**、`reuseExistingServer:false`；不要连旧编排预览的 4180。新环境无 ffmpeg 时完整包仍可跑渲染/测试，但源片重新复验需要安装工具。

若暂时没有素材，先做纯逻辑、shader 结构与测试设施，标注真实素材验收受阻；不得伪造截图结果。

## 3. 当前实现与代码入口

| 模块 | 当前实现 | 入口 |
| --- | --- | --- |
| 核心 | Director / Registry / runtime / progress / validation；滚动 rAF 合并、逆 seek 像素量化修正、章切换 runtime 重置 | `src/core/`，`src/core/StorySession.ts` |
| 宿主 | RendererHost imperative 生命周期，同 layer sequence 复用；普通渲染不经 React state，debug 单独订阅 | `src/core/RendererHost.ts`，`src/components/RendererStage.tsx` |
| 缓存 | fetch → Blob → ImageBitmap，±3 预取、最近同 asset 已解码帧兜底、LRU、合并请求、取消/释放 | `src/renderers/sequence/FrameStore.ts` |
| 渲染 | WebGL1 双纹理、只在帧变化上传、同尺寸 texSubImage2D；Canvas 2D fallback；未就绪 opacity 0、poster 托底 | `src/renderers/sequence/`，`src/renderers/rendererRegistry.ts` |
| 参数 | decoded 32 / 并发3 / 队列48 / DPR cap1.5 | `src/config/render.config.ts` |
| DOM | localProgress 驱动可逆 reveal，参数来自 story；五个 DOM scene 含结尾，标题/结尾占位 | `src/renderers/DomRenderer.ts`，`src/content/registry.ts`，`src/config/story.config.ts` |
| 导航 | 五章圆点、键盘、boot 提示、debug slider | `src/components/`，`src/styles/app.css` |
| 素材 | 构建期源秒 → inclusive frame clips；运行时不换算秒 | `tools/assets.source.json` → `tools/build-assets-manifest.mjs` → `src/config/assets.manifest.ts` |
| GLSL | **目前只有 cover-fit + 普通 crossfade**；mode 有占位但没有三家族数学 | `src/renderers/sequence/glsl/main.glsl` |

用 `?debug=1` 查看进度；`?effects=off` 隐藏 transition scene，得到硬切对照；`?renderer=2d` 强制 2D。`sequenceFrame.ts` 已预留 zoom resolver，不能把它当完整 Phase 3 验收。

## 4. 本轮实测（2026-09-05，macOS 本机）

| 命令/检查 | 实际结果 | 不代表什么 |
| --- | --- | --- |
| `pnpm check` | 8 个 test files / **107 tests 全过**；tsc、eslint 通过 | 不代表全部人工 Gate 已过 |
| `pnpm build` | Vite 构建通过，58 modules | 不代表云端拥有 JPG |
| `node tools/verify-sequence.mjs` | **3084 帧 / 6 assets**，连续命名与尺寸/端点检查通过 | 不是全片黑帧检测 |
| `pnpm exec playwright test`（不更新基线） | **6 项全过**，含15张硬切基线、真实40屏、DOM安全区、2D/fling | 目前 pixel diff，不是 SSIM |
| origin 匀速10秒 | `longTasks=[]`，末次 `usedJSHeapSize=10000000` | 粗粒度末次 JS heap，**非全程峰值/总内存/GPU内存** |
| 无 WebGL | `--disable-gpu --disable-webgl` 路径通过导航到末尾 | 并未逐帧验收所有2D画面 |

六段 count：origin710、ithaca1051、launch154、trials762、homeward309、stinger98，总计3084，在3085±6内。不要把 homeward 改回占位310。

基线在 `tests/fixtures/expected/*.png`，提交 `73bcb0f` 保留 Phase 1 原图。Linux 字体、Chromium/GPU 环境不同可能造成像素差异：先保存 actual/diff 并解释，不直接 `--update-snapshots` 掩盖回归。

## 5. 剩余 goal / 卡顺序

### G1：收尾 Phase 1 验收，不重复实现缓存或宿主

- [ ] 增加真正的15图 SSIM计算/报告（目标≥0.98），保留已提交硬切基线。
- [ ] 核实不同宽度 cover、水印、快速 fling 不清空和跨章；当前测试覆盖有限。
- [ ] 审计 Gate 0 红线与 validator 拒绝规则覆盖；107 tests 是现有结果，不可代替逐项审计。
- [ ] 若继续宣称 heap峰值<300MB，补真实采样；目前只有末次粗粒度值。
- [ ] 记录主观屏数/视觉确认待用户，不把其当自动通过。

### G2：Phase 2 编排精修（V2-2.1…2.6）

1. **先复验源片/实际 JPG，再修改 clips。** §6 候选不是最终配置。
2. `tools/assets.source.json` 是构建期源秒唯一来源；写它再生成 manifest，勿只手改生成文件。
3. 只补 timeline `note`，不改43锚点 id/anchor/t/range。
4. trials十槽、homeward九scene、ithaca红帆pace已在 config 有骨架：验证连续无 gap/重叠、021≥100 Road、homeward每scene≥70、037≥130；别重复加槽。
5. 在 DevRoadPanel 加 scene Road时间尺和当前位置。
6. 034–038各取10%/90%图，核实单镜并计算SSIM（目标≥0.9）。高速运动可能降低SSIM，报告真实值，不为指标冻结镜头。
7. 保持40屏；屏数主观确认留待用户。切点调整导致截图变化要给前后对照及理由。

### G3：Phase 3 三家族（V2-3.1…3.8）

严格顺序：**GLSL拆分 → T4 burn POC → ring①②③ → origin点选 → memory → 021zoom → 降级/测试**。

- GLSL拆为 common / wipe_burn / wipe_ring / treat_memory / main，各文件<200行；无业务阈值、origin坐标、颜色参数硬编码。
- T4 A=006火场last、B=007木筏first；先修真实切点，效果只在交界前沿，不让整帧长期故障。
- ring三处共用一个函数；强度1/2/3对应 radiusScale/frontWidth/chroma 等参数在 story config。
- **三处 origin 当前未校准**。查看实际B首帧再取图像归一化坐标，写 source 的 `origins[clipId]` 并生成manifest。临时坐标必须标注未人工确认，不在shader/CSS写死。
- DevRoadPanel点选模式通过cover-fit逆映射返回图像坐标，显示JSON供人工写回，不能静默改磁盘。
- memory按progress ramp双端衰减，bloom/颗粒/暗角/色差，保护字幕可读性；不能依赖wall clock导致倒滚不可逆。
- zoom已有from/to入口，接完/核实021 1.1→1.0与降级。
- WebGL不可用/reduced motion：三家族crossfade，不混入强shader或zoom。
- 各家族 uT=0/.5/1 真像素断言；burn/ring首尾应全A/全B，中间有A/B，memory需检验treatment ramp端点与中段而不是虚构第二素材。
- 测试倒滚、context loss、reduced motion、2D；GPU帧时间<8ms须在1440×900、DPR≤1.5的实际支持环境测，软件WebGL结果不能冒充硬件GPU。

Pear仅复用数学/结构，引用源行号：`references/pear-no/src/glsl/hero_main_fragment.glsl` hash/noise/fbm约75–98，cover逆映射/定位约143–170；修改前重查具体位置。其它入口见技术分册，不复制Pear颜色/品牌形状/文案。

### G4：最终交付（不是启动Phase 4）

- [ ] 重跑 check/build/素材校验/browser/新SSIM和shader端点测试。
- [ ] 报告各Phase自动与人工清单，未通过/未执行分别列出。
- [ ] 给出burn、三个ring、memory、倒滚对照图；不只贴测试绿灯。
- [ ] 新增必要决策从D-V2-016起写提案§1；更新本文状态，按任务卡提交。
- [ ] 汇报卡/类别/改动文件/命令结果/未验证项/共享config或contracts diff。

## 6. 素材复验线索（尚未应用，不可直接当结论）

这些线索来自上一执行轮的源片strip检查；本次只打包，不重新确认。包内 `handoff-assets/strips/` 保留联系表与 `scene-cuts.log`。`phase1-baseline.jpg` 是较早UI联系表，**当前基线以Git的15张PNG为准**。

- **T4 007起点30.0秒仍可能是火场**：`burn-28-30.jpg`；`burn-cut-30-31.jpg`已生成但尚未人工查看。先看它再确定木筏真实B起点，预计约31秒但未确认。不要为了遵守粗略30.0切点把火场当B。
- 016原77.0秒还可能是室内青年，strip提示约77.167才红帆；候选77.25起、78.875止，A候选77.125止，需实际JPG复核。
- 029大军约117.885–120.787，122已红帆；T13 A的last不能落红帆。
- 030从122红帆约122.65就切室内，不能整个122–124都用于ring②/红帆hold。
- 021约95.958切银甲正面、96.54切近身，建议窄单镜而非原94–98。
- 031/032/033当前clip名是旧粗标，拟改config/manifest引用为权威 `031-night-battle` / `032-cavalry` / `033-odysseus-fate`，**不是改timeline id**。
- 038内部有切镜；041尾逐渐黑，不能把源片暗场与渲染器清空混为一谈。

候选单镜区间（秒，均待复验；小数不保证精确落帧）：

| 锚点 | 候选半开区间 | 备注 |
| --- | --- | --- |
| 020 | 90.25–92.0 | 林地 |
| 021 | 96.0–96.5 | 银甲正面 |
| 022 | 99.667–100.75 | 待复验 |
| 023 | 103.625–104.75 | 待复验 |
| 024 | 104.875–106.292 | 迷雾建筑，标签差异仅补note |
| 025 | 108.2–109.0 | 待复验 |
| 026 | 109.084–110.5 | 待复验 |
| 027 | 112.25–113.0 | 待复验 |
| 028 | 114.375–115.083 | 抱狗，既有note已提示 |
| 029 | 117.917–120.75 | 排除后续红帆 |
| 030 | 122.0–122.625 | 排除室内切点 |
| 031 | 123.5–124.5 | 核对权威名 |
| 032 | 124.625–126.208 | 核对权威名 |
| 033 | 128.0–128.583 | 林间镜头，补note |
| 034 | 130.208–130.917 | 待复验 |
| 035 | 131.0–131.625 | 待复验 |
| 036 | 131.75–132.333 | 待复验 |
| 037 | 132.417–133.25 | 红帆③ |
| 038 | 133.375–133.79 | 排除内部切镜 |
| 041 | 140.6–141.5 | 保留可辨识巨手，待确认 |

构建使用floor，非整帧小数可能向前取一帧；必须检查生成manifest指向的实际JPG首末帧，而非仅依靠源秒联系表。

## 7. 已知验收冲突与诚实报告规则

1. **硬切基线 vs reduced-motion crossfade**：转场中点不会必然一致，origin75%也可能落burn窗口。保留硬切对照；reduced-motion与2D plain crossfade对照，并记录原指标冲突，不能伪称与硬切全程相同。
2. **同镜头 vs SSIM≥0.9**：高速运动也会降低SSIM。以实际分数+联系表说明，不冻结全部帧或降低阈值充当通过。
3. **无黑帧 vs 源片暗场**：ithaca尾黑已显式允许，stinger本身暗；区分内容亮度和canvas未就绪/清空。
4. **云端截图平台差异**：字体与软件GPU会影响旧macOS基线；不要覆盖历史图来抹掉证据。
5. 用户未确认屏数、burn审美、ring origin与递增强度、终稿；可继续推进但保留待确认标识。

## 8. Git交付与本地遗留边界

`73bcb0f`是用户要求即时交接时对现存V2-1.2…1.9相关工作的**合并检查点**，不是宣称每卡所有验收完结。此前历史按原样保留，不重写旧任务提交。之后按卡继续提交。

本次保存活跃docs/tools、索引/锚点与已有V2文档修改；不扩展或修改archive内容。本机仍可能保留未跟踪 `archive/` 文件以及意外命名 `public/assets/sequences/ct-3a-launch/`，它们不是本交付输入，不要引入story或“清理”它们。生成全长 `official-trailer/desktop/` 也不随包交付；可用唯一源片复验，无需它即可继续MVP。

本次仅创建本地素材包、提交并推送Git，没有创建云端任务，也没有把MP4/全量JPG上传远程。用户需将素材包提供给云端agent。
