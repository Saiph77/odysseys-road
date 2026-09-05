# Odyssey's Road · Agent 协作约束

> 更新日期：2026-09-05（V2 实施阶段）
> 一句话：把官方《THE ODYSSEY》预告片**重新拼接、重新分配滚动节奏**，用序列帧 + WebGL 转场做成一个滚动驱动的酷炫互动页。素材不生成、不 AI 重绘，只重排与转场。

## 0. 现在处于哪个阶段

**V2 实施**。编排、转场、交互已与用户讨论并拍板（决策 D-V2-001…015）。本次 MVP 范围仅 Phase 0–3。
V1（60 秒 AI 油画 / 三 Track / 神谕镜）已归档至 `archive/v1-60s-ai-roadshow/`，**勿再按 V1 任务卡实现，勿从 archive 复制叙事**。

云端接续先读 `docs/handoff/V2_MVP_CLOUD_HANDOFF.md`：Phase 0 主体与 Phase 1 序列渲染已落地，Phase 2 切点与 Phase 3 shader 未完成。D-V2-013 允许记录最小、可逆决策后推进，不必等待逐 Phase 人工回复；不得把未执行的主观验收标为通过。生成序列帧不在 Git，先恢复素材再跑浏览器验收。[Updated: 2026-09-05]

## 1. 开始任何任务前必读（按序）

| # | 文件 | 你会得到 |
| --- | --- | --- |
| 1 | `docs/V2_ORCHESTRATION_PROPOSAL.md` | 决策表 · 5 章章节表 · 转场表 T1–T18 · 抽段清单 · 契约建议 · 开放问题 |
| 2 | `docs/V2_IMPLEMENTATION_PLAN.md` | 当前 Phase、任务卡 `V2-<phase>.<n>`、验收清单 |
| 3 | `docs/TRAILER_INDEX.md` + `public/assets/keyframes/official-trailer/timeline.json` | **权威素材索引**：四幕 · 43 锚点 id · 时间码 · 复验 note |
| 4 | `docs/ARCHITECTURE.md` §2 §3 §5 §7 | 模块边界、调用图、契约、转场分类 |
| 5 | `docs/reference/PEAR_TECH_REFERENCE.md`（+ 分册 01 shader / 02 canvas-dom） | 可迁移的技术模式与源码行号 |

技术改动前再看 `src/core/contracts.ts`（Phase 0 后为契约唯一真相源）。

## 2. 素材事实（不要再假设）

- **唯一源片**：`66443bfd-1e56-4625-9cc6-2d318172909a.mp4`，146.75s，1280×720，29.97fps，**烧录中文字幕 + `FUSION-TV` 水印**（D-V2-010）。→ DOM 文案层**禁止**进入视口底部 12%；**禁止**叠自有字幕。
- **全长序列**：`public/assets/sequences/official-trailer/`（3522 帧 @24fps，仅校验/预览用，不进 story.config）。
- **章节 asset**（Phase 1 抽取）：`act-1-origin` `act-2-ithaca` `act-3a-launch` `act-3a-trials` `act-3b-homeward` `act-4-stinger`，切帧秒数见提案 §5。
- **43 锚点 id 与 anchor 不可改**；发现画面与标签不符 → 只补 `note`（方法：24fps strip 复验，见 TRAILER_INDEX §7）。
- **发行卡不入 Road**：Syncopy / Universal / Nolan / July 16 / Title / Date / IMAX（D-V2-001）。
- 帧号换算：`frameIndex = floor((t − assetStart) × 24) + 1`，只在构建期 / manifest 里做。

## 3. 架构红线（违反即返工）

1. **只有两个 Renderer key**：`sequence`（WebGL，Canvas 2D fallback）与 `dom`。shader 效果 = scene `behavior` 参数；**新增视觉效果 ≠ 新增 Renderer key**。
2. **shader 只有三家族**：`memory`（treatment）· `burn`（transition）· `ring`（transition，红帆 ①②③ 共用、强度递增）。新增家族必须先改 D-V2-005，问人。
3. **数字归位**：章节边界 / Road / blend / screens / 转场参数 → `story.config`；帧数 / 路径 / clip 边界 / ring `origin` → asset manifest；交互阈值 → `interaction.config.ts`。**组件、Renderer、CSS、GLSL 里不得出现业务秒数、Road 裸数字或 origin 坐标。**
4. `StoryDirector` 只把进度映射为章节局部 Road；`SceneRegistry` 只解析 active scenes；Renderer 只消费 `SceneFrame`（+ `InteractionFrame`），**不读 `window.scrollY`，不 import 其他 Renderer**。
5. 线性版：`flow = { entry, order[] }`；不写 hub / gate / tracks / `ZoneDwellSelector`（D-V2-003）。分支能力保留在契约里但不注册。
6. 一次性事件走 `ChapterRuntime.latch`，Renderer 不自持"已触发"。
7. 渐进增强：WebGL 不可用 / `prefers-reduced-motion` → 三家族退化为 crossfade；指针 + 键盘 + 真实 DOM 必须能走完全程。实验 API 名只出现在 `src/capabilities/`。
8. 序列帧：按需 + 预取 ±3 + 最近已解码帧兜底 + LRU；纹理只在帧号变化时上传；`alpha:false` 画布未就绪时 `opacity:0`。
9. Pear 参考只搬**数学与结构**（噪声、距离场、cover-fit、逆映射），不搬品牌颜色表、形状常量、文案；代码注释标源码行号。
10. 不锁滚动（D-V2-009）：hold 用 Road 屏数实现；如需 `ScrollGate` 先问人。

## 4. 工作流程

1. 领卡：从 `V2_IMPLEMENTATION_PLAN.md` 取当前 Phase 的 `V2-x.y`；说明改动类别：core / renderer / config / tools / docs。
2. 列出事实、假设、未验证项；涉及切帧一律先 strip 复验再写 manifest。
3. 优先读代码与素材，最后才编辑；**修改前检查已有实现，禁止重复功能**。
4. timing / 屏数 / 转场参数的变化只允许出现在 `story.config` 或 manifest 的 diff 里，**禁止**用 JSX / CSS / GLSL 的阈值"修好"视觉偏差。
5. 提交前 `pnpm check`（tsc + lint + vitest）通过；Phase 1 起 Playwright 截图基线通过。
6. 分支 `v2/<topic>` 或 `task/V2-x.y-<slug>`。
7. 汇报格式：改动文件 / 命令与结果 / 未验证项 / 对共享文件（contracts · story.config · manifest）的建议 diff。

## 5. 本地工具

```bash
python3 -m http.server 4173                      # 静态预览（Phase 0 前）
# 全长 scrub：/tools/sequence-scroll-preview/?asset=../../public/assets/sequences/official-trailer
# 43 锚点图：/tools/keyframes-gallery/
node tools/extract-sequence-frames.mjs -i "<video>" --id <asset-id> --fps 24 --width 1280 --start <s> --duration <s>
# 切帧复验 strip：--width 240 抽到 /tmp，ffmpeg select+tile 拼图看切点（TRAILER_INDEX §7）
pnpm dev / pnpm check                            # Phase 0 后
```

## 6. 明确不做

- 不编辑 `archive/`（只读）；不恢复 `prompts/` AI 生图流程。
- 不生成 / 重绘 / AI 补帧任何画面；只用源片抽帧。
- 不引入摄像头、MediaPipe、pre-roll、音频（Phase 5 之前）。
- 不在第一稿使用 `039` `042` `043` 源帧作片名 / 结尾（D-V2-007）。
- 不把全长 `official-trailer` 序列直接接进 story.config（D-V2-011）。

## 7. 必须停下来问人

- 任何 43 锚点 id / anchor 的改动；章节数、章节顺序、屏数总量的大改
- 契约字段增删（`contracts.ts`）、新增 Renderer key、新增 shader 家族
- 素材替换（无字幕版）、素材使用范围与结尾来源声明措辞
- 是否锁滚动、是否引入摄像头 / 音频
- 章名卡与结尾文案终稿

## 8. 文档要求

链接有效；区分「已归档 V1」与「活跃 V2」；每份活跃文档顶部保留更新日期；单文件 < 20k tokens，超了按主题拆分。决策新增写入 `V2_ORCHESTRATION_PROPOSAL.md` §1 并递增 `D-V2-0xx`。
