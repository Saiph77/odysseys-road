# V2 MVP · Coding Agent 交接 Prompt

> 更新：2026-09-05 · 用途：整段复制给负责实现 MVP 的 coding agent  
> 上一份（讨论阶段）简报：[`V2_ORCHESTRATION_AGENT_BRIEF.md`](V2_ORCHESTRATION_AGENT_BRIEF.md)，已完成，仅供追溯

---

## 你的角色

你是《归航 / Odyssey's Road》项目的 **MVP 实现 agent**。讨论与规划阶段已结束，所有编排、转场、交互决策已拍板并写进文档；你的任务是**按文档实现，不重新设计**。遇到文档没覆盖的决策，停下来问人，不要自行发挥。

## 主题主旨（一句话）

把 Christopher Nolan《THE ODYSSEY》官方预告片（146.75s）**去掉 7 张发行卡、按 5 个章节重新分配滚动节奏**，做成一个**滚动驱动**的网页：序列帧作为 WebGL 纹理播放，只用 **memory / burn / ring** 三个 shader 家族做转场，红帆三次出现共用同一个 ring 并强度递增。不生成、不 AI 重绘任何画面，只重排与转场。

## 必读（按序，读完再动手）

| # | 文件 | 得到什么 |
| --- | --- | --- |
| 1 | `AGENTS.md` | 10 条架构红线、工作流程、必须问人的事 |
| 2 | `docs/V2_ORCHESTRATION_PROPOSAL.md` | 决策 D-V2-001…011 · 5 章章节表 · 逐 scene 表（§2.1）· 转场表 T1–T18 · 抽段命令（§5）· manifest clips · story.config 骨架与契约建议（§7） |
| 3 | `docs/V2_IMPLEMENTATION_PLAN.md` | **你的任务卡** `V2-<phase>.<n>` 与每个 Phase 的自动/人工验收清单 |
| 4 | `docs/TRAILER_INDEX.md` + `public/assets/keyframes/official-trailer/timeline.json` | 43 锚点 id / 时间码 / 复验 note（**id 与 anchor 不可改**） |
| 5 | `docs/ARCHITECTURE.md` §2 §3 §5 §7 | 目录结构、调用图、接口、转场分类 |
| 6 | `docs/reference/PEAR_TECH_REFERENCE.md` → 分册 `PEAR_TECH_01_WEBGL_SHADER.md`、`PEAR_TECH_02_CANVAS_DOM_FX.md` | 可迁移的技术模式（含源码行号）；源码在 `references/pear-no/src/` |

## 现状与环境（已核实 2026-09-05）

- 仓库根：`odysseys-road/`，分支 `main`；**`src/` 八个子目录全空，无 `package.json`**，只有 `tools/` 两个脚本与文档。
- 工具：node v25.6.1 · pnpm 10.23.0 · ffmpeg 8.1.1（`/opt/homebrew/bin/ffmpeg`）· python3（无 PIL）。
- **唯一源片**：`/Users/saiph/Downloads/66443bfd-1e56-4625-9cc6-2d318172909a.mp4`（1280×720 · 29.97fps · **烧录中文字幕 + FUSION-TV 水印**）。
- 已有素材：`public/assets/sequences/official-trailer/`（全长 3522 帧 @24fps，只用于校验/预览，**不进 story.config**）；43 张锚点图 `public/assets/keyframes/official-trailer/frames/`。
- `public/` 与 `docs/` 目前 untracked；素材帧目录 `desktop/` 已在 `.gitignore`。
- 预览：`python3 -m http.server 4173` → `/tools/sequence-scroll-preview/?asset=../../public/assets/sequences/official-trailer`、`/tools/keyframes-gallery/`。

## 已拍板、你不需要再问的事

| 决策 | 内容 |
| --- | --- |
| 章节 | `origin`(5.4→35.0) · `ithaca`(37.8→81.6) · `trials`(82.0→88.4 ∪ 90.25→122.0) · `homeward`(122.0→134.9) · `stinger`(138.1→142.2)；共 40 屏，**100 Road = 1 屏** |
| 裁掉 | Syncopy / Universal / Nolan / July 16 / Title / Date / IMAX 七张卡；结构功能由自有 DOM 章名卡替代 |
| 结构 | 纯线性 `flow = { entry, order[] }`；无 hub / gate / tracks |
| Renderer | 只有 `sequence`（WebGL1 全屏三角形，Canvas 2D fallback）与 `dom` 两个 key |
| Shader | 只有 `memory`（treatment）· `burn`（transition）· `ring`（transition）；**第一个 POC = T4 burn（`006`→`007`，源 30.0s）** |
| 交互 | 仅滚动（wheel / trackpad / 键盘 / 右侧 5 章节点逆映射 seek）；无 pre-roll、摄像头、音频；红帆点**不锁滚动**，用屏数 hold |
| 素材 | 6 个章节 asset **重新抽帧**（命令见提案 §5），不用全长序列帧偏移；DOM 文案**禁止**进入视口底部 12%（避开烧录字幕） |
| 片名/结尾 | 自有 DOM，不用 `039`/`042`/`043` 源帧 |

## MVP 范围

**Phase 0 → Phase 3**（`V2_IMPLEMENTATION_PLAN.md` §2–§5），按顺序、逐 Phase 过验收再进下一 Phase：

```text
Phase 0  pnpm 工具链 + contracts.ts + story.config + manifest + validateStory
         + StoryDirector / SceneRegistry / ProgressSource(scroll) / ChapterRuntime
         + RendererStage + DomRenderer + DevRoadPanel(?debug=1)        → 只有数字，无画面
Phase 1  抽 6 个 asset + verify-sequence 工具 + FrameStore(LRU/预取/兜底)
         + SequenceRendererGL / 2D fallback + boot poster + 章节点导航
         + Playwright 截图基线                                        → 40 屏全程可滚，硬切
Phase 2  strip 复验 020–029 / 031–034 切帧 → manifest clips
         + trials 10 个锚点槽 + homeward 五连切 + ithaca 红帆 pace 段
         + DevRoadPanel scene 时间尺 → 与用户过屏数                    → 节奏成立
Phase 3  GLSL 拆分 → T4 burn → ring ①②③(origin 点选校准) → memory → 021 zoom
         + reduced-motion / 2D 路径退化为 crossfade                   → "酷炫"成立
```

Phase 4（性能预算固化 / a11y / 文案终稿 / 文档同步）与 Phase 5（头部探视）**不在本次范围**，不要提前做。

## 验收标准（摘要，完整清单在实施计划各 Phase §x.2）

**Gate 0**：`pnpm check` 全绿；validateStory 每条拒绝规则有失败用例；`src/renderers/` `src/components/` `*.css` `*.glsl` 中 grep 不到 `scrollY` 与 Road 裸数字；`?debug=1` 滚 40 屏数字连续；5 张 DOM 卡不进底部 12%。  
**Gate 1**：6 个 asset 通过 `verify-sequence`（总帧 3085±6）；全程无黑帧白闪；快速 fling 不清空画面；15 张 Playwright 截图 SSIM ≥ 0.98；匀速滚 origin 章 10s 长任务 = 0、heap < 300MB；`--disable-gpu` 下 2D 路径走完全程。  
**Gate 2**：同章 layer 10 的 sequence scene Road 不重叠不留 gap；3b 每 scene ≥ 70 Road、`037` ≥ 130；五连切每 scene 10%/90% 截图属同一镜头（SSIM ≥ 0.9）；用户确认屏数。  
**Gate 3**：GLSL 每文件 < 200 行且无业务常量；三家族各有 `uT ∈ {0, 0.5, 1}` 截图断言；reduced-motion 截图与 Phase 1 基线一致；转场 GPU 帧时间 < 8ms；用户看图确认：burn 只在前沿烧、ring ①②③ 同形态强度递增且 origin 落在红帆上、倒滚可逆。

## 工作方式

1. 新建分支 `v2/mvp`；每张卡一个 commit，message 带卡号 `V2-x.y`。
2. 每张卡开始前：说明改动类别（core / renderer / config / tools / docs）、列出事实 / 假设 / 未验证项。
3. **先读后改**：修改前检查已有实现，禁止重复功能；优先查看工具，最后才编辑。
4. timing / 屏数 / 转场参数只能出现在 `story.config` 或 manifest 的 diff 里；**禁止**用 JSX / CSS / GLSL 阈值"修好"视觉偏差。
5. Pear 代码只搬数学与结构（噪声、距离场、cover-fit、逆映射），不搬品牌颜色 / 形状常量 / 文案；注释标源码行号。
6. 切帧一律先 strip 复验（`extract-sequence-frames --fps 24 --width 240` 到 `/tmp` → ffmpeg `select`+`tile` 拼图，见 TRAILER_INDEX §7）再写 manifest；只补 `note`，不改 id / anchor。
7. 每张卡完成后按此模板汇报：

```text
卡：V2-x.y  类别：
改动文件：
命令与结果：pnpm check ✅ / Playwright n/n ✅ / 其他
未验证项：
对共享文件（contracts / story.config / manifest）的建议 diff：
```

8. 每个 Phase 结束：贴出该 Phase 验收清单的逐项勾选结果，**等用户确认**后再进下一 Phase。

## 必须停下来问人

- 43 锚点 id / anchor 的任何改动；章节数、顺序、屏数总量的大改
- `contracts.ts` 字段增删（提案 §7.1 的 `clip` / `clips` / `flow.order` 已批准，其余要问）、新增 Renderer key、新增 shader 家族
- 三处红帆 `origin` 坐标（DevRoadPanel 点选后给用户看图确认再写 manifest）
- 章名卡 / 结尾来源声明文案（先用占位文案）
- 是否锁滚动、是否引入摄像头 / 音频
- 任何"文档没写、但实现必须选一个"的情况

## 明确不做

不编辑 `archive/`；不恢复 `prompts/`；不生成 / 重绘 / AI 补帧；不接摄像头 / MediaPipe / 音频；不把全长 `official-trailer` 序列接进 story.config；不用源片片名 / 定档 / IMAX 帧收尾；不做 Phase 4/5。

## 开放问题（知道即可，不阻塞）

1. 源片为字幕版，将来可能替换无字幕版 → 所有切帧以秒记录在 manifest 源数据，便于重跑。
2. 40 屏总长是否合适 → Phase 1 用户体感后只改 `scroll.screens`。
3. 结尾来源声明措辞 → 占位。
