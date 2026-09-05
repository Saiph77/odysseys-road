# 《归航 / NOSTOS》决策记录

> 用途：记录已经拍板的产品与技术决定。**任何文档之间的冲突，以本文件为准**；本文件没有覆盖的部分，按 `README.md` 的文档优先级处理。
> 规则：一条决定一个编号，只追加不删除；推翻旧决定时新增一条并写明"取代 D-xxx"。
> 更新日期：2026-09-05

## 决策一览

| 编号 | 主题 | 一句话结论 |
| --- | --- | --- |
| D-001 | 范围 | 只做 60 秒路演；Track 1/2 只到"记忆尚未归来"占位章 |
| D-002 | 选择机制 | 三区（左/中/右）累计停留，真实时间 5 秒窗口，累计最长者胜出 |
| D-003 | 摄像头生命周期 | 第一版从"开始归航"起全程运行，不随章节停止 |
| D-004 | Pre-roll | 一张活画 + 一个按钮；点击即授权、解锁音频、静默校准并开始 |
| D-005 | 时钟 | 滚动驱动主时间轴；只有选择窗口和一次性事件用真实时间 |
| D-006 | 前倾触碰 | z > 0.35 持续 ≥ 300ms 触发一次；第二波任务 |
| D-007 | 雷击与光敏 | 单帧、限亮度、每会话一次；reduced-motion 改柔和爬升；pre-roll 提示 |
| D-008 | 平台 | 仅桌面 Chromium，不做任何移动端适配 |
| D-009 | 音频 | 只预留 `AudioBus` 接口与空实现；塞壬双声部不在第一版 |
| D-010 | 神谕镜技术路径 | MVP 用真实 DOM + CSS 3D；`HtmlCanvasBridge` 接口现在定死，native/polyfill 后补 |
| D-011 | 结束态 | 停在可循环海浪，不自动刷新，提供克制的"重新开始" |
| D-012 | 视觉语言 | 采用剧本的"近黑海面 + 青铜神谕镜"，取代早期"天青蓝 + 大理石铭牌" |
| D-013 | 文档优先级 | DECISIONS > 剧本（叙事/美术/声音）> 交互技术设计（阈值/状态机）> ARCHITECTURE（schema/时序） |
| D-014 | 技术栈 | Vite + TypeScript + React + pnpm；Three.js / MediaPipe 精确锁版本 |
| D-015 | 协作方式 | 按 `docs/TASKS.md` 任务卡领任务；每卡有文件所有权；共享契约改动须经集成者 |
| D-016 | 长版剧本 | 不再维护 `ODYSSEY_INTERACTIVE_SCRIPT.md`；母题说明由 60 秒剧本自足 |

---

## D-001 范围：只做 60 秒路演，Track 1/2 到占位章

- 正式制作只有 Track 3「歌声与牺牲」（塞壬 → 斯库拉与卡律布狄斯 → 太阳神的牛）与终章。
- Track 1/2 **可以在选择中真实胜出**（这是验证选择链路的必要条件），胜出后进入占位章 `memory-pending`：石灰白安静画面 + 文字「这段记忆尚未归来」+ 两个真实按钮「返回神谕镜」「继续 Track 3」。
- `story.config.release`：`enabledTrackIds: ['track-c']`，`disabledChoiceBehavior: 'placeholder'`，`defaultTrackId: 'track-c'`。
- 取代早期 AGENTS.md 中"Track 1/2 不可确认进入"与 ARCHITECTURE 中 `preview-only` 的口径。将来开放 Track 1/2 只改 `enabledTrackIds`。
- Track 3 被选中后到塞壬的转场**第一版不追求视觉效果**，可以是简单淡入；剧本中"声波突破镜框"作为后续润色任务。

## D-002 选择机制：三区累计停留

用户原话的设计逻辑：看头部朝向（左、中、右），分别计时；计时结束看累计时间，最长者胜出。以下是补全的规则，全部数值为**初始值，实机可调，只能放在 interaction config**。

### 分区

- 输入为 `InteractionFrame.focusX ∈ [-1, 1]`（头部：位置 + yaw 融合，yaw 权重更高；指针：视口 x 归一化；键盘：←/→ 平滑推动虚拟焦点）。
- 三区带迟滞，避免边界抖动：
  - 进入左区：`focusX < -0.30`；进入右区：`focusX > 0.30`
  - 回到中区：`|focusX| < 0.14`
- 只有 `detected && confidence ≥ 0.55` 的样本参与累计；单步 `dt` 上限 50ms（防止后台恢复一次补满）。

### 窗口

| 阶段 | 驱动 | 时长 | 行为 |
| --- | --- | ---: | --- |
| `rise` | 滚动 | — | 三镜升起；滚到 `selection` 章节的 gate 位置时进入下一阶段 |
| `collect` | 真实时间 | 4500ms | 累计 `dwellMs[left/center/right]`；镜面远近/亮度/金纹随累计比例变化 |
| `freeze` | 真实时间 | 500ms | 停止累计，排名显形；防止临界抖动改结果 |
| `resolve` | 一次事件 | — | 取胜者 → `StoryRouter.selectTrack()`；解开滚动锁 |

- `collect + freeze = 5000ms`，对应剧本 `12.5–17.5s`。
- **采集期间滚动被 ScrollGate 锁住**：滚动进度钳制在 gate 位置，滚轮输入被忽略。`resolve` 后释放，用户继续向下滚动进入被选 Track（即用户描述的"选到那个地方，然后向下"）。

### 胜者判定

1. `winner = argmax(dwellMs)`。
2. 平局 → 冻结时刻所在区。
3. 总累计 `< 1000ms`（几乎没人看）→ `release.defaultTrackId`（Track 3），文案层面即剧本的"海替你决定"。
4. 指针点击某镜 / 键盘 Enter → **立即**以该镜为胜者，跳过剩余窗口（无摄像头路径不必等 5 秒）。
5. `winner ∉ enabledTrackIds` → 路由到 `memory-pending`（见 D-001）。

### 明确不做

- 不做"连续停留 1.8s + 0.6s 确认"的两段式（取代 TRACK_SELECTION V2.0 §7.3 的 `ARM_MS/CONFIRM_MS`）。
- 不做累计衰减；窗口内就是纯累计。
- 不显示百分比、排行或倒计时数字；只用镜面远近、亮度、金纹闭合表达。

## D-003 摄像头生命周期：全程运行

- 摄像头在 pre-roll 点击「开始归航」时请求，成功后**一直运行到页面关闭**；不在 Selected 后停止，也不在章节切换时停止。
- 各章按需消费 `InteractionFrame`；不消费的章节（如 `troy`）忽略即可。
- 页面 `visibilitychange → hidden` 时暂停推理（不必停 track），恢复时继续。
- 隐私约束不变：不保存、不上传、不记录视频帧、landmarks、逐帧轨迹。
- 取代 TRACK_SELECTION V2.0 §2.3 第 7 条"Selected 后停止摄像头"和 ARCHITECTURE §4.2 不变量 5 中"选择确认时停止摄像头"。性能优化（按章启停）留到路演前再评估。

## D-004 Pre-roll：一个按钮

页面加载后停在剧本 01 §2 描述的"活画"（黎明前海岸 + 标题 + 副标题）。只有一个按钮：

> 开始归航 / BEGIN THE RETURN

点击后在同一用户手势内顺序完成：

1. `AudioContext.resume()`（音频解锁；第一版无音频也保留这一步）。
2. `getUserMedia()` 请求摄像头；按钮替换为一行文字「海正在辨认你的方向…」。
3. 摄像头就绪后静默采集约 24 帧（≈1s）作为基线（脸宽中值 → z 基线；focusX 均值 → 中心偏置），**不要求用户做任何动作**。
4. 校准完成 → 60 秒计时开始，滚动解锁。

失败路径：摄像头被拒 / 无设备 / 4 秒内未就绪 → 文字改为「以指针航行」，1 秒后照常开始，全程用鼠标/键盘。

pre-roll 底部两行极小字：`方向仅在本机即时计算，不保存影像。` 与 `本体验包含一次瞬间强光。`（见 D-007）。

路演现场：演示前在浏览器里预先授权一次，避免权限弹窗。

取代 ROADSHOW §2 的六步流程。

## D-005 时钟：滚动为主，两处例外

- **主时间轴由滚动驱动**：`ProgressSource(scroll)` → `StoryDirector` → 章节局部 Road。这是用户的"滚轮就是时间轴"身体感，保留。
- **例外 1：选择窗口**用真实时间（D-002），期间 ScrollGate 锁滚动。
- **例外 2：一次性事件**（雷击白帧、牛群"触碰"涟漪、六名船员依次消失的声音）用跨阈值 latch 触发，Renderer 不自持状态，latch 由 `ChapterRuntime` 持有，滚动抖动不能重复触发。
- 第一版**不做**滚动阻尼和路演自动兜底（autopilot）；接口上预留 `ProgressSource` 的 `'autopilot' | 'debug'` 变体，作为第二波任务。
- 章节滚动长度（每章几屏）只在 `story.config`；第一版每章等长，方便按滚轮体感统一调节。

## D-006 前倾触碰

- `z` 来自脸宽 / 校准基线比值，经 140–220ms 平滑。
- 触发条件：`z > 0.35` 持续 `≥ 300ms`，每章最多触发一次（latch）。
- pointer down / Enter / Space 等价。
- 只用于 Ch.05 的"触碰"涟漪与 Ch.06 漂流末段的"探近"；第二波任务，第一版可缺席不影响剧情。

## D-007 雷击与光敏安全

- 白帧只出现一次，持续 1 个绘制周期（≈16–33ms），使用 `#F2F0EA` 类暖白并限制亮度约 85%，不用纯 `#FFFFFF`。
- 用 latch 保证每次会话只触发一次；滚回去再滚下来不重放。
- `prefers-reduced-motion: reduce` → 用 120ms 的亮度爬升到 60% 再回落替代瞬时白帧；取消反相残影与色差。
- pre-roll 底部提示「本体验包含一次瞬间强光。」；不另做开关。

## D-008 平台：仅桌面

- 目标：桌面 Chromium，固定路演设备；不做移动端布局、触摸手势、mobile tier。
- 删除 schema 中 `scroll.screens.mobile` 与 asset manifest 的 `mobile` tier；`tier` 字段保留为字符串以便将来扩展，第一版只有 `'desktop'`。
- 验收视口：1920×1080 与 1440×900 两档即可。

## D-009 音频：只留接口

- 定义 `AudioBus` 接口：`load(stemId)`、`play(stemIds, {syncAt})`、`setMix(params)`、`stop()`；实现 `NullAudioBus`（全部 no-op）。
- 塞壬双声部（同一 `AudioContext`，两条 stem 同一 `currentTime` 起播，GainNode + StereoPanner 连续 crossfade，绝不重触发）作为将来的 `WebAudioBus` 实现，规则先写在 `TASKS.md` 里的第二波任务。
- Renderer 不直接碰 Web Audio；只向 `AudioBus` 发参数。

## D-010 神谕镜技术路径

- MVP：三面镜是**真实 DOM**（`<article>` + `<button>`），用 CSS `perspective` / `transform3d` 做弧面排布、前移与缩放；这就是 capability adapter 三条路径中的 `SemanticDomBridge`。
- 现在就定死 `HtmlCanvasBridge` 接口（`mount / update(geometry) / requestPaint / destroy / mode`），业务代码只依赖接口。native（WICG HTML-in-Canvas + Three `HTMLTexture`）与 polyfill 路径作为第二波任务接入，不改 Renderer 契约。
- 镜内内容第一版**不可滚动**：罗马数字 + Track 标题 + 一句预言 + 固定小字。剧本中"镜内可纵向翻阅"作为后续任务，接口上给 `MirrorContent` 留 `sections[]`。
- 三镜位置固定左/中/右，不交换。

## D-011 结束态

- `homecoming` 最后一个 scene 为可循环海浪 + 炊烟；60 秒后不自动刷新、不跳回首页。
- 画面角落出现克制的「重新开始」文字链接（`?restart` 或直接 `location.reload()`），不做大按钮。
- 摄像头不主动关闭（D-003）。

## D-012 视觉语言

- 全库采用剧本 01 §4 的美术：近黑爱琴海、老化青铜希腊边框神谕镜、镜外低饱和、镜内高饱和油画 + 真实 HTML 字体、三 Track 各自色板。
- 术语统一为「神谕镜 / oracle mirror」；稳定 ID 保持 `track-a / track-b / track-c`。
- ARCHITECTURE §8.1 早期 token 表改为：底色 `sea-black`、边框 `bronze` / `verdigris`、强调 `aged-gold`，三 Track 色板见剧本 01 §4 表。

## D-013 文档优先级

冲突时按顺序取胜：

1. `docs/DECISIONS.md`
2. `docs/scripts/60s-roadshow/*`：叙事、美术、声音、文案
3. `docs/TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md`、`docs/HEAD_COUPLED_PEEK_TECHNICAL_DESIGN.md`：交互阈值与状态机
4. `docs/ARCHITECTURE.md`：schema、模块边界、时序
5. `docs/ROADSHOW_60S_CUT.md`：制作总览（历史较早，细节以上面为准）
6. `docs/reference/*`：只作参考，不构成约束

## D-014 技术栈

- Vite + TypeScript + React 18 + pnpm；测试 Vitest。
- `three`、`@mediapipe/tasks-vision` 使用精确版本（无 `^`）。具体版本号在 T0 bootstrap 时用 `pnpm view <pkg> version` 查询后写死，**不得凭记忆填写**。
- 不引入状态管理库、CSS 框架；样式用 CSS Modules 或原生 CSS 变量。

## D-015 协作方式

- 任务卡在 `docs/TASKS.md`；每卡列出「拥有的文件/目录」「依赖」「验收」。
- 领任务的 agent 只改自己拥有的路径；需要改共享契约（`src/core/contracts.ts`、`src/config/story.config.ts`）时，在汇报里单列 diff，由集成者合并。
- 分支命名 `task/<ID>-<slug>`；worktree 方式并行；合并前 rebase main。
- 小步提交，每次会话结束前 push；不让未提交修改过夜。

## D-016 长版剧本

- `docs/ODYSSEY_INTERACTIVE_SCRIPT.md` 已删除且不恢复。60 秒剧本中所有对它的引用改为自足说明。
