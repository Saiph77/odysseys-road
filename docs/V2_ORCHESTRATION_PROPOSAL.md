# V2 编排提案 · 《归航 / Odyssey's Road》

> 更新：2026-09-05  
> 状态：**已与用户逐项讨论并拍板（议程 A/B/C）**，进入实施；实现方案与验收见 [`V2_IMPLEMENTATION_PLAN.md`](V2_IMPLEMENTATION_PLAN.md)  
> 素材锚：一切 id / 时间码以 [`TRAILER_INDEX.md`](TRAILER_INDEX.md) 为准；本文只在其上叠加编排与转场，**不改 id 与 anchor**  
> 契约锚：[`ARCHITECTURE.md`](ARCHITECTURE.md) §5；本文 §7 的契约建议 diff 需集成者确认后才生效

---

## 0. 一句话

把官方《THE ODYSSEY》预告片（146.75s）**去掉 6 张发行卡、按 5 个章节重新分配滚动预算**，用 **1 个序列帧 Renderer（WebGL）+ 1 个 DOM Renderer** 播放，只用 **3 个 shader 家族**（memory / burn / ring）做转场，红帆三次出现共用同一个 ring 并强度递增。

## 1. 决策记录（2026-09-05 讨论结论）

| 编号 | 决策 | 备选被否原因 |
| --- | --- | --- |
| D-V2-001 | **裁掉发行卡**：Syncopy(4.0–5.25) · Universal(`001`) · Nolan(`008`) · July16(`019`) · Title(`039`) · Date(`042`) · IMAX(`043`) 不进 Road；结构功能由自有 DOM 章名卡承担 | 全保留 → 用别人的厂标/片名收尾且带水印 |
| D-V2-002 | **act-3 以 `030` 红帆②为界拆 3a / 3b**；3b 五连切每切 ≥1 屏 | 整幕 scrub → 切镜 <1s 滚动时闪烁（索引 §2 明示） |
| D-V2-003 | **纯线性**：无 hub / tracks / gate / ZoneDwellSelector；V1 神谕镜不延续 | 分支会打断预告片剪辑节奏 |
| D-V2-004 | **序列帧 Renderer = WebGL 纹理**（Pear `HeroCanvas` 模式），Canvas 2D 只作 fallback | Canvas 2D 做不了 burn / ring（见 §4.0） |
| D-V2-005 | **shader 只 3 家族**：memory treatment · burn · ring；其余全部硬切 | 5 家族以上"语法"变弱 |
| D-V2-006 | **第一个 POC = T4 Burn**（`006`→`007`） | — |
| D-V2-007 | 片名与结尾用**自有 DOM**（"归航 / Odyssey's Road" + 来源声明），不用 `039`/`042`/`043` 源帧 | 与 D-V2-001 一致，且免抽帧/免水印 |
| D-V2-008 | **仅滚动**输入（wheel / trackpad / 键盘 / 章节点导航）；无 pre-roll、无摄像头、无音频 | 头部追踪留 P2 |
| D-V2-009 | 红帆 ring 点**不锁滚动**，用 Road 减速（多给屏数）保证看完 | 锁滚会让用户觉得"卡住"；如需可用 `ScrollGate` 复用（用户可改） |
| D-V2-010 | **第一稿使用现有字幕版源片**（烧录中文字幕 + `FUSION-TV` 水印）；DOM 文案层避开底部 12% 安全区，不叠自有字幕 | 暂无无字幕版 |
| D-V2-011 | 章节子段**重新抽帧**为独立 asset（符合 ARCHITECTURE §7.4），不引用全长序列的帧偏移 | 帧偏移需改 manifest 契约 |
| D-V2-012 | 2026-09-05 用户批准接管报告 A/B/C：Phase 0 注册不绘图的 sequence 占位；SceneFrame.clip 与带 chapterId 的 fromRoad 保留；behavior 恢复 Record；按 §2.1 五个 DOM scene（含结尾），结尾用明确待确认占位 | 不伪造注册表、不擅自新增章名卡 |
| D-V2-013 | 用户授权 agent 自主推进 Phase 0–3：可逆且不改变素材源、五章顺序、40 屏和三 shader 家族的必要决策由 agent 记录后执行；可跳过的主观验收明确标注，不再等待逐 Phase 回复 | 自动验收仍须运行，不宣称用户已完成主观确认；Phase 4/5 不进入 |
| D-V2-014 | 保留 story 的 40 屏预算；stage 增加一个固定视口承载量，使物理可滚距离恰为 40 屏，而不是高度 40 屏、可滚 39 屏；该承载量不是叙事 Road | 100 Road = 实际一屏，正反 seek 共用同一物理范围 |
| D-V2-015 | 源秒区间统一半开 [from,to)；构建期生成 inclusive frame clips，末帧不超过实抽 count。运行时 manifest 无源秒换算；未校准 ring origin 不标记为用户已确认 | 排除切点下一镜与最后一帧越界；不改 43 锚点 |

## 2. 章节表

Road 单位约定：**100 Road = 1 屏（100vh）**，与 Pear `TOTAL_ROAD=5350 ↔ 5350vh` 同构；每章 `timeline.start=0`，`timeline.end = scroll.screens × 100`。

| 章 id | 源 act / beat | 源片区间（已复验切帧） | 时长 | 屏数 / Road | 密度 | 说明 |
| --- | --- | --- | ---: | --- | ---: | --- |
| `boot` | — | poster = `002` 首帧（6.1s） | — | 首屏静态 | — | 不是章节；资源就绪前模糊 poster，滚动即开始 |
| `origin` | act-1 · `002`–`007` | **5.4 → 35.0** | 29.6s | 7 屏 / 0–700 | 4.2 s/屏 | 记忆段 `003`–`006` 叠 memory treatment；`006`→`007` Burn |
| `ithaca` | act-2 · `009`–`017` | **37.8 → 81.6** | 43.8s | 10 屏 / 0–1000 | 4.4 s/屏 | `016` 红帆① 独立 pace 段 + ring①；止于源片自带黑场 81.4–81.9 |
| `trials` (3a) | act-3 · `017` 门廊 + `018`–`029` | **82.0 → 88.4** ∪ **90.25 → 122.0** | 38.2s | 9 屏 / 0–900 | 混合 | 82.0–88.4 连续 scrub；DOM 章名卡替代 `019`；`020`–`029` 锚点槽 + 微 scrub |
| `homeward` (3b) | act-3 · `030`–`038` | **122.0 → 134.9** | 12.9s | 9 屏 / 0–900 | 1.4 s/屏 | ring② 开章；`034`–`038` 五连切每切 ≥1 屏；`037` 2 屏慢镜 + ring③ |
| `stinger` (4) | act-4 · `040`–`041` | **138.1 → 142.2** | 4.1s | 5 屏 / 0–500 | hold | DOM 片名 → 洞穴暗场 → 巨手 → DOM 结尾 |
| **合计** | | 128.6s 叙事素材 | | **40 屏 ≈ 4000vh** | | 预览工具基线 100vh/s 下 ≈ 40s 匀速滚完；实际用户 1.5–3 分钟 |

### 2.1 章内 pace 段与 Renderer key

只用两个 Renderer key：`sequence`（WebGL，Canvas 2D fallback）、`dom`。**shader 效果 = scene 的 `behavior` 参数，不新增 key**（AGENTS 红线）。

| 章 | scene id | Road | renderer | asset / clip | behavior | layer |
| --- | --- | --- | --- | --- | --- | ---: |
| origin | `origin-sea` | 0–130 | sequence | `act-1-origin` / `002-sea-raft` (5.4–11.0) | — | 10 |
| origin | `origin-memory` | 130–560 | sequence | `act-1-origin` / `003-006-memory` (11.0–30.0) | `treatment: memory` ramp 0.05 | 10 |
| origin | `origin-burn` ⭐T4 | 520–600 | sequence | from `006-troy-fire` last → to `007-go-home` first | `transition: burn` | 20 |
| origin | `origin-alone` | 560–700 | sequence | `act-1-origin` / `007-go-home` (30.0–35.0) | — | 10 |
| origin | `origin-captions` | 0–700 | dom | — | 章名"I · 海难与记忆"，安全区外 | 50 |
| ithaca | `ithaca-card` | 0–60 | dom | — | 黑底章名"II · 没有主人的伊萨卡"（替代 `008`） | 50 |
| ithaca | `ithaca-home` | 40–760 | sequence | `act-2-ithaca` / `009-015` (37.8–77.0) | — | 10 |
| ithaca | `ithaca-ring-1` ⭐T7 | 720–800 | sequence | from `015-shore-search` last → to `016-red-sail-first` first | `transition: ring, intensity: 1, origin: manifest` | 20 |
| ithaca | `ithaca-redsail` | 760–900 | sequence | `act-2-ithaca` / `016-red-sail-first` (77.0–79.0) | — | 10 |
| ithaca | `ithaca-helmet` | 900–1000 | sequence | `act-2-ithaca` / `017-helmet` (79.0–81.6) | — | 10 |
| trials | `trials-launch` | 0–160 | sequence | `act-3a-launch` / full (82.0–88.4) | — | 10 |
| trials | `trials-card` | 160–240 | dom | — | 章名"III · 试炼"（替代 `019`） | 50 |
| trials | `trials-020` … `trials-029` | 240–900 | sequence ×10 | `act-3a-trials` / `020-forest-mist` … `029-army-plains` | `scrub: {from:0.2,to:0.8}`（只 scrub 镜头中段） | 10 |
| trials | ↳ `trials-021` | 100 Road（其余 ~62） | sequence | `021-silver-giant` | `treatment: zoom, from:1.1,to:1.0` | 10 |
| homeward | `homeward-ring-2` ⭐T13 | 0–80 | sequence | from `act-3a-trials`/`029` last → to `act-3b-homeward`/`030` first | `transition: ring, intensity: 2` | 20 |
| homeward | `homeward-030` … `homeward-034` | 0–510 | sequence ×5 | `030`(0–150) `031`(150–250) `032`(250–330) `033`(330–430) `034`(430–510) | — | 10 |
| homeward | `homeward-035` `036` `037` `038` | 510–580 / 580–650 / **650–780** / 780–900 | sequence ×4 | 五连切，`037` = 132.33–133.25 共 22 帧摊 130 Road = 滚动慢镜 | — | 10 |
| homeward | `homeward-ring-3` ⭐T15 | 630–700 | sequence | from `036` last → to `037` first | `transition: ring, intensity: 3` | 20 |
| stinger | `stinger-title` | 0–150 | dom | — | 黑底"归航 / Odyssey's Road"（替代 `039`） | 50 |
| stinger | `stinger-cave` | 150–260 | sequence | `act-4-stinger` / `040-cyclops-setup` (138.1–140.6) | — | 10 |
| stinger | `stinger-hand` | 260–380 | sequence | `act-4-stinger` / `041-cyclops-hand` (140.6–142.2) | — | 10 |
| stinger | `stinger-outro` | 380–500 | dom | — | 来源声明 / 返回顶部（替代 `042` `043`） | 50 |

> `trials-020…029` 各槽 Road 精确值与 clip 秒数见 §5 抽段清单；beat 之间为源片硬切，槽内 `scrub` 只取中段避免滚过切点闪烁。

## 3. 转场表

编号沿用讨论时的 T 序号；类型按 ARCHITECTURE §7.5 四类。

| # | from → to | 源秒 | 类型 | 做法 | Pear 参考 | 风险 / 备注 |
| --- | --- | ---: | --- | --- | --- | --- |
| T1 | boot → `002` | 5.4 | asset crossfade | poster 即首帧，滚动开始才走帧 | `.boot` 模糊 poster | 无 |
| T2 | `003`–`006` | 11–30 | **treatment（持续）** | bloom + 颗粒 + 暗角 + 微色差，随 localProgress 渐入渐出 | `hero_main_fragment.glsl` lens / fbm | 需 WebGL 基座（D-V2-004） |
| T3 | `005` 木马 | 20–24 | cover-fit 慢推 | `uv` 1.0→1.08 | PEAR_01 §1.4 | 低 |
| **T4** | `006` → `007` | **30.0** | **burn（一次性）** ⭐POC-1 | 噪声弯曲擦除 + 碳化 + 余烬，露出木筏特写 | PEAR_01 §3.3 | Burn 在 949 行单体里，需抽为 `wipe_distance.glsl` |
| T5 | `007` → ithaca | 35.0→37.8 | DOM 章名卡 | 尾帧 hold → 黑 → 卡 → `009` 城堡俯拍 fade-in（源片自带） | TermsNarrative line reveal | 低 |
| T6 | `009`↔`011`↔`014` | 51 / 69 | 硬切 | 源片硬切照播 | — | slabs 已否（D-V2-005） |
| **T7** | `015` → `016` 红帆① | 77.0 | **ring · 强度 1** | 以红帆位置为 `origin` 的环形揭示，半径小、窗口 80 Road | PEAR_01 §3.2 / `films.js origin` | origin 只能在 manifest |
| T8 | `017` 黑场 → trials | 81.4–81.9 | 源片黑场 = 章边界 | 不加卡 | — | 已复验 |
| T9 | `018` → `020` | 88.4→90.25 | DOM 章名卡 | 替代 `019` | — | 已复验切帧 |
| T10 | `020`–`029` | 90.25–122 | 锚点槽 + 微 scrub | 每 beat 一 scene，`scrub` 取中段 | — | 各 beat 边界待 P2 strip 复验（§8） |
| T11 | `021` 银甲巨人 | 96 | 尺度 jump | zoom-out treatment + 加长槽 | PEAR_01 §1.4 | 低 |
| **T13** | `029` → `030` 红帆② | 122.0 | **ring · 强度 2** + 章边界 | 同 T7 shader，半径/时长 ×2 | 同上 | 跨 asset 双纹理 |
| **T14** | `034`→`038` 五连切 | 130→134.9 | Road 减速 ⭐POC-3 | 每切 ≥70 Road；`037` 130 Road | — | 切帧已复验：131.65 / 132.33 / 133.25 |
| **T15** | `036` → `037` 红帆③ | 132.33 | **ring · 强度 3**（满屏） | 环从底部低角度扩到全屏 | 同上 | 参数表末项 |
| T16 | `038` → stinger | 134.9→138.1 | 硬切 + DOM 片名 | 火 → 黑 → 自有片名 | — | D-V2-007 |
| T17 | `040` → `041` | 140.6 | 尺度 jump scare | 暗场 hold → 硬切巨手 hold | — | 无音频，纯视觉 |
| T18 | → 结尾 | — | DOM | 来源声明 | — | 文案待定 |

## 4. 技术基座结论

### 4.0 为什么 WebGL（对应用户 B0 疑问）

Pear 源码里所有 `getContext(`：`HeroCanvas.jsx:53`、`FooterTransitionCanvas.jsx:25` = **`'webgl'`**；`SequenceCanvas.jsx:104-112` = `'2d'`×4。即：**炫酷转场全部在 WebGL 层，Canvas 2D 只做朴素 `drawImage` + opacity crossfade**。我们选的三家族全是 GLSL，所以序列帧必须作为纹理进 WebGL；Canvas 2D 只作 fallback（渐进增强红线）。

### 4.1 三家族 → 参数表

| 家族 | 形态 | 参数（全部来自 story.config / manifest） | 出现 |
| --- | --- | --- | --- |
| `memory` | treatment，作用于单纹理 | `intensity` ramp、颗粒尺度、暗角 | T2 |
| `burn` | transition，A→B 双纹理 | `span`（Road 窗口）、噪声频率、余烬色 | T4 |
| `ring` | transition，A→B 双纹理 | `origin`（manifest clip 元数据）、`intensity ∈ {1,2,3}` → 半径 / 前沿宽 / 色差 | T7 · T13 · T15 |

## 5. 待抽子段清单

```bash
VIDEO="/Users/saiph/Downloads/66443bfd-1e56-4625-9cc6-2d318172909a.mp4"
X="node tools/extract-sequence-frames.mjs -i $VIDEO --fps 24 --width 1280"
$X --id act-1-origin     --start 5.4   --duration 29.6    # 710 帧   002→007
$X --id act-2-ithaca     --start 37.8  --duration 43.8    # 1051 帧  009→017(止黑场)
$X --id act-3a-launch    --start 82.0  --duration 6.4     # 154 帧   017 门廊 + 018 冲锋
$X --id act-3a-trials    --start 90.25 --duration 31.75   # 762 帧   020→029
$X --id act-3b-homeward  --start 122.0 --duration 12.9    # 310 帧   030→038
$X --id act-4-stinger    --start 138.1 --duration 4.1     # 98 帧    040→041
# 合计 ≈ 3085 帧 ≈ 200MB（JPG q=2）
```

### 5.1 manifest `clips`（源秒；帧号 = floor((t − assetStart)×24)+1）

| asset | clip id | 源秒 | 备注 |
| --- | --- | --- | --- |
| act-1-origin | `002-sea-raft` | 5.4–11.0 | 5.4–6.1 暗海浪，6.1 起木筏 |
| | `003-006-memory` | 11.0–30.0 | 含 `003` `004` `005` `006` 四镜 |
| | `006-troy-fire` | 24.0–30.0 | T4 的 A（last） |
| | `007-go-home` | 30.0–35.0 | T4 的 B（first） |
| act-2-ithaca | `009-015` | 37.8–77.0 | 连续 |
| | `015-shore-search` | 75.0–77.0 | T7 的 A |
| | `016-red-sail-first` | 77.0–79.0 | T7 的 B，`origin` 待标（红帆在画面右上，约 [0.62, 0.35]，实施时校准） |
| | `017-helmet` | 79.0–81.6 | 复验：79.0–79.7 躺卧伤者，79.8–81.4 戴盔 |
| act-3a-launch | `full` | 82.0–88.4 | 门廊"对所有人" → 冲锋 → 荒原远景 |
| act-3a-trials | `020-forest-mist` … `029-army-plains` | 索引 §3 range（1s 精度） | **P2 用 strip 复验到 ±0.05s** |
| | `029-army-plains` | 117–122.0 | T13 的 A |
| act-3b-homeward | `030-red-sail-crossing` | 122.0–124 | T13 的 B，`origin` 待标 |
| | `031` `032` `033` | 124–126 / 126–128 / 128–130 | 1s 精度，待复验 |
| | `034-oars-rock` | 130–131.0 | 与 035 边界待复验（≤131.0） |
| | `035-city-fire-charge` | 131.0–131.65 | ✔ 已复验 |
| | `036-beach-landing` | 131.65–132.33 | ✔ 已复验；T15 的 A |
| | `037-climb-red-sail` | 132.33–133.25 | ✔ 已复验；T15 的 B，`origin` 约 [0.55, 0.5] |
| | `038-statue-fire` | 133.25–134.9 | ✔ |
| act-4-stinger | `040-cyclops-setup` | 138.1–140.6 | ✔ |
| | `041-cyclops-hand` | 140.6–142.2 | ✔ |

## 6. 交互（议程 C 结论）

| 项 | 决定 |
| --- | --- |
| 输入 | wheel / trackpad / ↑↓ PgUp PgDn Home End / 右侧 5 个章节点（逆映射 seek） |
| 起始 | 无 pre-roll、无按钮；首屏 `002` 首帧 + 一行"向下滚动"；滚动即开始 |
| 滚动预算 | 40 屏；hold 段用屏数实现，不锁滚动（D-V2-009） |
| 摄像头 / 头部 | 不进第一稿；`HEAD_COUPLED_PEEK_TECHNICAL_DESIGN.md` 留 P2 |
| 音频 | 无 |
| reduced-motion | 三家族全部退化为 crossfade；DOM 动画退化为淡入 |
| 无 WebGL | Canvas 2D 序列 + crossfade；页面可完整走完 |

## 7. story.config 骨架（提案，不直接改共享文件）

```ts
// 提案：与 ARCHITECTURE §5.2 的差异用 // + 标出
export const storyConfig = {
  release: { id: 'v2-trailer-recut', enabledTrackIds: [], defaultTrackId: null }, // + 线性版无 track
  flow: { entry: 'origin', order: ['origin', 'ithaca', 'trials', 'homeward', 'stinger'] }, // + 用 order 取代 hub/tracks
  chapters: [
    {
      id: 'origin', kind: 'linear',
      timeline: { start: 0, end: 700 }, scroll: { screens: 7 },
      scenes: [
        { id: 'origin-sea',    road: { start: 0,   end: 130 }, blend: { in: 0, out: 0 }, layer: 10, renderer: 'sequence', asset: 'act-1-origin', clip: '002-sea-raft' },          // + clip
        { id: 'origin-memory', road: { start: 130, end: 560 }, blend: { in: 0, out: 0 }, layer: 10, renderer: 'sequence', asset: 'act-1-origin', clip: '003-006-memory',
          behavior: { treatment: { kind: 'memory', ramp: 0.05 } } },
        { id: 'origin-burn',   road: { start: 520, end: 600 }, blend: { in: 0, out: 0 }, layer: 20, renderer: 'sequence',
          behavior: { transition: { kind: 'burn', from: { asset: 'act-1-origin', clip: '006-troy-fire', frame: 'last' },
                                                  to:   { asset: 'act-1-origin', clip: '007-go-home',   frame: 'first' } } } },
        { id: 'origin-alone',  road: { start: 560, end: 700 }, blend: { in: 0, out: 0 }, layer: 10, renderer: 'sequence', asset: 'act-1-origin', clip: '007-go-home' },
        { id: 'origin-captions', road: { start: 0, end: 700 }, blend: { in: 0, out: 0 }, layer: 50, renderer: 'dom' }
      ]
    }
    // ithaca / trials / homeward / stinger 按 §2.1 表填写
  ]
} as const;
```

### 7.1 契约建议 diff（需集成者确认，见 ARCHITECTURE §5.1）

| 项 | 变更 | 理由 |
| --- | --- | --- |
| `SceneDefinition.clip?: string` | **新增** | pace 段 = asset 的命名子区间；避免每个 beat 一个 asset 目录 |
| `AssetManifestEntry.clips` | **新增** `{ [clipId]: { from: frameIndex, to: frameIndex, origin?: [x, y] } }` | clip 边界与 ring 的 `origin` 是素材事实，只能在 manifest |
| `behavior.transition` / `behavior.treatment` | 约定 schema（仍在 `Record<string, unknown>` 内） | 不改契约类型，但 validator 需校验 kind ∈ {memory, burn, ring} |
| `ChapterDefinition.kind` | 第一稿只用 `'linear'`；`hub/track/placeholder` 保留不用 | D-V2-003 |
| `flow` | `{ entry, order[] }` 取代 `{ entry, hub, tracks, finale }` | 线性版；旧字段保留为可选以便将来分支 |
| `renderer` 联合类型 | 第一稿只注册 `sequence` `dom`；`mirrors` `video` `shader` 不注册 | validator 拒绝未注册 key |
| validateStory 新增规则 | `clip` 必须存在于对应 asset 的 `clips`；`transition.from/to` 必须可解析；同 layer 同 Road 不得有两个 sequence 叠加（除 transition 层 20） | — |

## 8. 开放问题 / 待复验

| # | 项 | 状态 | 谁定 |
| --- | --- | --- | --- |
| 1 | 源片为字幕版 + `FUSION-TV` 水印；无字幕官方版是否将来替换 | **暂用**（D-V2-010）；若替换，重跑 §5 命令并复验 43 锚点 | 用户 |
| 2 | `020`–`029`、`031`–`034` 的切帧只有 1s 精度 | P2 前用 strip 法复验（方法见 TRAILER_INDEX §7） | agent |
| 3 | `016` / `030` / `037` 红帆 `origin` 坐标 | 实施 ring 时在 DevRoadPanel 里点选校准，写回 manifest | agent + 用户看图 |
| 4 | DOM 章名卡文案（I/II/III/片名/结尾） | 占位文案先上，用户后改 | 用户 |
| 5 | 40 屏总长是否合适 | Phase 1 用 `sequence-scroll-preview` 与 DevRoadPanel 实测后调 `scroll.screens` | 用户体感 |
| 6 | 结尾来源声明措辞与素材使用范围 | 待定 | 用户 |
| 7 | 红帆点是否改为锁滚动 | 默认不锁（D-V2-009），可改 | 用户 |

## 9. 相关文件

```text
docs/V2_ORCHESTRATION_PROPOSAL.md   ← 本文（编排 · 转场 · 抽段 · 契约建议）
docs/V2_IMPLEMENTATION_PLAN.md      ← 分 phase 实施与验收
docs/TRAILER_INDEX.md               ← 权威素材索引（id / anchor 不改）
docs/ARCHITECTURE.md                ← 模块边界与契约
docs/reference/PEAR_TECH_01_WEBGL_SHADER.md   ← burn / ring 源码位置
public/assets/keyframes/official-trailer/timeline.json ← 43 锚点 + 复验 note
```
