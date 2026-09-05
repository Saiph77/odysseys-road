# 《THE ODYSSEY》宣传片 · 最终索引大纲

> **版本**：V1.0（抽帧校验完成）  
> **更新**：2026-09-05  
> **用途**：V2《奥德赛之路》的**素材与叙事索引**——章节划分、转场锚点、标签检索均以此为准；后续「更有意思的转场特效」在本索引上叠加，**不改时间码与 ID**。  
> **源片**：`66443bfd-1e56-4625-9cc6-2d318172909a.mp4`（146.75s · 1280×720 · 29.97fps）  
> **全长序列**：`public/assets/sequences/official-trailer/`（3522 帧 @ 24fps）  
> **关键帧**：`public/assets/keyframes/official-trailer/`（43 锚点）  
> **机器可读**：`public/assets/keyframes/official-trailer/timeline.json`  
> **图览**：`tools/keyframes-gallery/index.html`

---

## 如何使用本索引

| 你要做… | 查什么 |
| --- | --- |
| 定一个互动章节 / 滚动段落 | **§2 四幕总览** → 取 `act-*` 区间 |
| 找某个视觉母题的素材 | **§4 标签反向索引** |
| 做转场入点 / 出点 | **§3 节拍表** 的 `anchor` 与 `keyframe` |
| 抽子段序列 | **§5 抽段公式** + 节拍表 `range` |
| Agent / 代码绑定素材 | 用 **`id`**（如 `016-red-sail-first`），稳定不变 |

**帧号换算**（24fps 全长序列）：`frameIndex = floor(seconds × 24) + 1`，上限 3522。

---

## 1. 一句话结构

预告片**不从特洛伊开战**，而从**奥德修斯已失落**写起：海难 → 记忆里的家与战争 → 「回家」成为唯一目标 → 切伊萨卡失序 → 双线交错 → 红帆作为归途图腾 → 第三幕用蒙太奇轰炸「战争 / 人类 / 自然 / 神话」四尺度试炼 → 片名 → 独眼巨人 stinger。

---

## 2. 四幕总览

### 第一幕 · 海难、记忆与归乡欲望

| 字段 | 内容 |
| --- | --- |
| **索引 ID** | `act-1-origin` |
| **时间** | 00:00 – 00:35（0s – 35s） |
| **序列帧** | 1 – 840 @ 24fps |
| **叙事** | 从「失败 / 漂流」开篇，非从战争开篇；在极短时间内压缩因果链：战争结束 ≠ 奥德修斯内心结束 → 唯一目标是回家 |
| **视觉母题** | 海洋 · 残骸 · 妻子 · 儿子 · 木马 · 火焰 · 孤独奥德修斯 |
| **转场提示** | 适合作为全片**原点**：从实拍海难渐入记忆（可叠化 / 网点 / 色差）；幕末 00:30–00:35 孤独广角 → 硬切或字卡进第二幕 |
| **结构断点** | 00:35 Nolan 字卡（`008-nolan-card`） |

---

### 第二幕 · 没有主人的伊萨卡

| 字段 | 内容 |
| --- | --- |
| **索引 ID** | `act-2-ithaca` |
| **时间** | 00:35 – 01:24（35s – 84s） |
| **序列帧** | 841 – 2016 @ 24fps |
| **叙事** | 镜像结构：外拼命归家 / 内因缺席而失序；非纯伊萨卡章——洞穴、伤兵、荒原与奥德修斯线**交错** |
| **视觉母题** | 宫殿 · 宴席 · Penelope · 织机 · Telemachus · 求婚者 · 洞穴 · 伤兵 · **红帆船** |
| **转场提示** | 家庭内景 ↔ 冒险外景**对切**；`016-red-sail-first`（01:18）为全片第一个**完整归途符号**，适合作为本幕 emotional peak |
| **结构断点** | 01:24 奥德修斯冲锋（`018-charge`）进入第三幕 |

---

### 第三幕 · 战争、航海与神话试炼

| 字段 | 内容 |
| --- | --- |
| **索引 ID** | `act-3-montage` |
| **时间** | 01:24 – 02:15（84s – 135s） |
| **序列帧** | 2017 – 3240 @ 24fps |
| **叙事** | 放弃连续叙事，高速蒙太奇；不交代「第几关」，而展示归途跨越**四尺度阻碍** |
| **视觉母题** | 银甲敌人 · 森林 · 暴风 · 神秘女性 · 军队 · 红帆船 · 岛屿 · 火焰 · 神像 |
| **转场提示** | 本幕最适合**创意转场实验**（故障 / shader / 序列桥接）；切镜常 <1s，锚点用 §3 表，勿只按整幕 scrub |
| **结构断点** | 02:15 高潮硬切 → 片名（`039-title`） |
| **注意** | 末段 02:11–02:15 五连切：岩岛 → 城火 → 登陆 → **爬红帆**（132.8s）→ 神像；`037` 仅 ~0.3s 窗口 |

---

### 第四幕 · 片名与巨人伏笔

| 字段 | 内容 |
| --- | --- |
| **索引 ID** | `act-4-stinger` |
| **时间** | 02:15 – 02:26.75（135s – 146.75s） |
| **序列帧** | 3241 – 3522 @ 24fps |
| **叙事** | 标题定调 → 极短 stinger：「I think he's asleep」→ 巨手 → 定档 → IMAX 信息 |
| **视觉母题** | 片名 · 黑暗洞穴 · 独眼巨人 · 巨手 |
| **转场提示** | 片名可全屏 hold；stinger 适合**突然静音 / 尺度 reveal**（从小队到巨手） |

---

## 3. 节拍表（43 锚点 · 校验通过）

> `anchor` = Representative 秒数（关键帧取点） · `keyframe` = 文件名前缀  
> `narrative` = 叙事作用 · `transition` = 后续转场设计可挂钩点（待实现）

### 第一幕 `act-1-origin`

| id | range | anchor | keyframe | tags | narrative | transition |
| --- | --- | ---: | --- | --- | --- | --- |
| `001-universal` | 00:00–00:05 | 2.5s | `001-universal_00m02.5s` | 厂标 | 开场 | 厂标 dissolve |
| `002-shipwreck` | 00:05–00:11 | 8.0s | `002-shipwreck_00m08.0s` | 海难 · 漂流 · 残骸 | 从失败 / 失落状态开篇 | 俯拍 → 人物；可 parallax 残骸 |
| `003-penelope` | 00:11–00:16 | 13.5s | `003-penelope_00m13.5s` | Penelope · 爱情 · 家 | 最核心私人情感 | 记忆闪回入；柔光 → 硬切 |
| `004-telemachus` | 00:16–00:20 | 18.0s | `004-telemachus_00m18.0s` | Telemachus · 儿子 | 第二个家庭锚点 | 与 003 构成「家」对 |
| `005-trojan-horse` | 00:20–00:24 | 22.0s | `005-trojan-horse_00m22.0s` | 木马 · 特洛伊 | 进入战争记忆 | 夜色 + 剪影；规模 reveal |
| `006-troy-fire` | 00:24–00:30 | 27.0s | `006-troy-fire_00m27.0s` | 攻城 · 火焰 · 特洛伊 | 胜利即灾难记忆 | 火焰 chroma / 颗粒 |
| `007-go-home` | 00:30–00:35 | 32.5s | `007-go-home_00m32.5s` | 奥德修斯 · 孤独 · 归乡 | 归乡愿望；第一幕收束 | 广角 hold → 字卡或硬切 |

### 第二幕 `act-2-ithaca`

| id | range | anchor | keyframe | tags | narrative | transition |
| --- | --- | ---: | --- | --- | --- | --- |
| `008-nolan-card` | 00:35–00:38 | 36.5s | `008-nolan-card_00m36.5s` | 字卡 | 第一幕断点 | 黑场字卡 |
| `009-ithaca-palace` | 00:38–00:44 | 41.0s | `009-ithaca-palace_00m41.0s` | Ithaca · 宫殿 · 宴席 | 故乡与权力真空 | Establishing；与 act-1 色调对比 |
| `010-penelope-loom` | 00:44–00:51 | 47.5s | `010-penelope-loom_00m47.5s` | 王后 · 织机 · 求婚者 | 家庭 / 政治危机 | 室内稳定构图 |
| `011-cave-flock` | 00:51–00:56 | 53.5s | `011-cave-flock_00m53.5s` | 洞穴 · 羊群 · 探索 | 神话冒险空间首次插入 | 外线插入；火把明暗 |
| `012-island-telemachus` | 00:56–01:01 | 58.5s | `012-island-telemachus_00m58.5s` | 岛屿 · 寻找 | 寻父线启动 | 悬崖 / 远景 |
| `013-suitors` | 01:01–01:09 | 65.0s | `013-suitors_01m05.0s` | 求婚者 · Telemachus | 伊萨卡冲突升级 | 群像；可 DOM 层文案 |
| `014-wounded-soldiers` | 01:09–01:15 | 72.0s | `014-wounded-soldiers_01m12.0s` | 战争 · 伤兵 · 漂泊 | 父亲线 ↔ 战争线 | 泥污 /  handheld 感 |
| `015-shore-search` | 01:15–01:18 | 76.5s | `015-shore-search_01m16.5s` | 海岸 · 寻父 | 双线汇合前奏 | 浅水 / 痕迹色 |
| `016-red-sail-first` | 01:17–01:19 | 78.0s | `016-red-sail-first_01m18.0s` | 红帆船 | **归途图腾首次完整** | 全片关键 symbol；可 recurring motif |
| `017-odysseus-wounded` | 01:19–01:24 | 81.5s | `017-odysseus-wounded_01m21.5s` | 奥德修斯 · 归家 | 愿望 → 行动 | 第二幕收束 → 第三幕 |

### 第三幕 `act-3-montage`

| id | range | anchor | keyframe | tags | narrative | transition |
| --- | --- | ---: | --- | --- | --- | --- |
| `018-charge` | 01:24–01:28 | **85.5s** | `018-charge_01m25.5s` | 冲锋 · 大军 | 第一处情绪高潮 | 近景怒吼；⚠ 86s 已为远景 |
| `019-july16-card` | 01:28–01:30 | 89.0s | `019-july16-card_01m29.0s` | 字卡 | 结构断点 | 字卡 |
| `020-forest-mist` | 01:30–01:34 | 92.0s | `020-forest-mist_01m32.0s` | 森林 · 迷雾 | 神话战争蒙太奇开场 | 雾 / 纵深 |
| `021-silver-giant` | 01:34–01:38 | 96.0s | `021-silver-giant_01m36.0s` | 银甲巨人 · 近战 | 超常尺度敌人 | 尺度对比转场 |
| `022-palace-intrigue` | 01:38–01:42 | 100.0s | `022-palace-intrigue_01m40.0s` | 阴谋 · 宫殿 | 伊萨卡线再插入 | 内外对切 |
| `023-storm-sea` | 01:42–01:46 | 104.0s | `023-storm-sea_01m44.0s` | 风暴 · 航海 | 自然成为敌人 | 雨 / 浪 shader |
| `024-mist-entity` | 01:45–01:47 | 106.0s | `024-mist-entity_01m46.0s` | 迷雾 · 未知存在 | 神话威胁暗示 | 轮廓 reveal |
| `025-mystery-woman` | 01:46–01:50 | 108.0s | `025-mystery-woman_01m48.0s` | 神秘女性 · 海岸 | 诱惑 / 阻碍 | 苍白海岸美学 |
| `026-fire-battle` | 01:49–01:51 | 110.0s | `026-fire-battle_01m50.0s` | 城战 · 火 | 战争再爆发 | 火 + 颗粒 |
| `027-injured-youth` | 01:51–01:54 | 112.5s | `027-injured-youth_01m52.5s` | 受伤 · 失败 | 归途代价 | 慢镜 / 反色 |
| `028-kiss-animal` | 01:54–01:57 | 115.5s | `028-kiss-animal_01m55.5s` | 爱情 · 家园 · 动物 | 蒙太奇中的「生命」插入 | 快切缓冲 |
| `029-army-plains` | 01:57–02:01 | 119.0s | `029-army-plains_01m59.0s` | 航行 · 大军 | 尺度扩张 | 航拍 / 全景 |
| `030-red-sail-crossing` | 02:01–02:03 | 122.0s | `030-red-sail-crossing_02m02.0s` | 红帆船 · 归途 | 归乡主线 reinforcement | 与 016 呼应 |
| `031-night-battle` | 02:03–02:05 | 124.0s | `031-night-battle_02m04.0s` | 夜战 | 最终高潮段 | 火光闪烁 |
| `032-cavalry` | 02:05–02:07 | 126.0s | `032-cavalry_02m06.0s` | 大军 · 骑兵 | 大规模运动 | 速度线 |
| `033-odysseus-fate` | 02:07–02:09 | 128.0s | `033-odysseus-fate_02m08.0s` | 奥德修斯 · 命运 | 「连神也不能阻止」主题 | 台词 beat |
| `034-oars-rock` | 02:09–02:11 | 130.0s | `034-oars-rock_02m10.0s` | 划桨 · 岩岛 · 急转 | 航海危机最大规模 | 红帆 + 峭壁 |
| `035-city-fire-charge` | 02:11–02:12 | 131.5s | `035-city-fire-charge_02m11.5s` | 城破 · 火灾 | 蒙太奇加速 | 快切 |
| `036-beach-landing` | 02:12–02:13 | 132.5s | `036-beach-landing_02m12.5s` | 海滩冲锋 | 登陆 | 水花 / 冲击 |
| `037-climb-red-sail` | 02:13–02:14 | **132.8s** | `037-climb-red-sail_02m12.8s` | 红帆 · 攀爬 | **全片标志性动作构图** | ⚠ 极短；低角度红帆 |
| `038-statue-fire` | 02:14–02:15 | 134.5s | `038-statue-fire_02m14.5s` | 神像 · 亵渎 · 火焰 | 神性 ↔ 战争合并 | 第三幕终切 |

### 第四幕 `act-4-stinger`

| id | range | anchor | keyframe | tags | narrative | transition |
| --- | --- | ---: | --- | --- | --- | --- |
| `039-title` | 02:15–02:18 | 136.5s | `039-title_02m16.5s` | Title | 主标题 | 全屏 hold |
| `040-cyclops-setup` | 02:18–02:21 | 139.5s | `040-cyclops-setup_02m19.5s` | 洞穴 · 巨人 | stinger 对白 | 暗场 →  whisper |
| `041-cyclops-hand` | 02:21–02:22 | 141.5s | `041-cyclops-hand_02m21.5s` | Cyclops · 巨手 | 独眼巨人 reveal | 尺度 jump scare |
| `042-release-date` | 02:22–02:24 | 143.0s | `042-release-date_02m23.0s` | 定档 | 16.07.26 | 字卡 |
| `043-imax` | 02:24–02:26.75 | 145.5s | `043-imax_02m25.5s` | IMAX | 技术信息结尾 | 结尾 |

---

## 4. 标签反向索引

| 标签 | 锚点 id | 秒数 | 说明 |
| --- | --- | ---: | --- |
| 海难 / 漂流 / 残骸 | `002-shipwreck` | 8 | 全片开篇视觉 |
| Penelope / 爱情 / 家 | `003-penelope` | 13.5 | 记忆线；`010` 为现实线 |
| Telemachus / 儿子 | `004-telemachus` | 18 | 与 `013` `012` 呼应 |
| 木马 / 特洛伊 | `005-trojan-horse` | 22 | 战争记忆入口 |
| 攻城 / 火焰 | `006-troy-fire` | 27 | 与 `026` `035` `038` 火 motif 链 |
| 归乡 / 孤独 | `007-go-home` | 32.5 | act-1 情感落点 |
| 红帆船 | `016` · `030` · `037` | 78 · 122 · 132.8 | **全片最重要 recurring motif** |
| 织机 / 求婚者 | `010` · `013` | 47.5 · 65 | 伊萨卡内政 |
| 洞穴 | `011` · `040` | 53.5 · 139.5 | 冒险 vs stinger |
| 银甲巨人 | `021-silver-giant` | 96 | 神话尺度战斗 |
| 风暴 / 航海 | `023` · `034` | 104 · 130 | 自然阻碍 |
| 神像 / 火焰 | `038-statue-fire` | 134.5 | 第三幕终象 |
| Cyclops / 巨手 | `041-cyclops-hand` | 141.5 | 片尾 hook |

---

## 5. 抽段公式（实现用）

```bash
VIDEO="/Users/saiph/Downloads/66443bfd-1e56-4625-9cc6-2d318172909a.mp4"

# 整幕示例：第一幕
node tools/extract-sequence-frames.mjs -i "$VIDEO" --id act-1-origin \
  --fps 24 --start 0 --duration 35

# 单节拍示例：红帆首次完整
node tools/extract-sequence-frames.mjs -i "$VIDEO" --id beat-016-red-sail \
  --fps 24 --start 77 --duration 2
```

输出目录：`public/assets/sequences/<id>/desktop/frame-0001.jpg …`

---

## 6. 转场设计备忘（待 V2 填具体方案）

| 类型 | 建议挂钩节拍 | 备注 |
| --- | --- | --- |
| 记忆闪回 | `002` → `003` → `005` | 海难实拍 → 柔光记忆 → 战争剪影 |
| 内外对切 | `009` ↔ `011` ↔ `014` | 宫殿稳定 vs 冒险 handheld |
| 图腾 recurring | `016` → `030` → `037` | 同一红帆 motif 三次，强度递增 |
| 尺度 jump | `021` · `041` | 银甲巨人 /  Cyclops 手 |
| 蒙太奇加速 | `034` – `038` | 五连切，勿合并为一个 scroll 段 |
| 硬切收束 | `038` → `039` | 火与神像 → 黑场片名 |

---

## 7. 校验记录

- 43 / 43 锚点已抽帧并对照画面  
- **2 处 anchor 微调**：`018` → 85.5s；`037` → 132.8s  
- 第三幕 02:11–02:15 切镜 <1s，绑定交互时建议 ±0.3s 复验  

**2026-09-05 二次复验（24fps strip，±0.05s）** — 以下 4 个锚点的代表帧与标签不符，**id / anchor 不改**，仅在 `timeline.json` 补 `note`：

| id | anchor 帧实际 | 实际镜头窗口 | 建议代表帧 |
| --- | --- | --- | --- |
| `017-odysseus-wounded` | **黑场** | 79.0–79.7 躺卧伤者 · 79.8–81.4 海边戴盔 · **81.4–81.9 黑场** · 82.0–84.0 门廊回望 | 80.5s；黑场可作 act-2→act-3 边界 |
| `025-mystery-woman` | 双手小金人 | 107.3–108.0 小金人 · **108.2–109.0 神秘女性** · 109.1 起城战火 | 108.5s |
| `028-kiss-animal` | Penelope 台词 | 113.6–114.2 拥吻 · 114.3–115.0 抱小狗 · 115.1–115.9 Penelope · 116.6 起船首 | 114.5s |
| `036-beach-landing` | 已是爬红帆 | 131.0–131.6 城火(035) · **131.65–132.3 登陆** · 132.33–133.2 爬红帆(037) · 133.25 起神像(038) | 132.0s；`037` 实际窗口 ≈0.9s |

校验过程文档（归档）：`docs/REDESIGN_TRAILER_OUTLINE.md`

---

## 8. 相关文件

```text
docs/TRAILER_INDEX.md                          ← 本文件（权威索引）
public/assets/keyframes/official-trailer/
├── timeline.json                              ← 机器可读 43 点
├── index.json                                 ← 含 file 路径
└── frames/*.jpg
public/assets/sequences/official-trailer/      ← 全长 3522 帧
tools/extract-keyframes.mjs
tools/extract-sequence-frames.mjs
tools/keyframes-gallery/index.html
```
