# Agent 交接：V2 编排与转场讨论

> 更新：2026-09-05  
> 复制下方 **Prompt 块** 给新的 coding agent，用于与用户一起讨论重新编排、转场与交互。

---

## Prompt 块（复制给另一个 Agent）

```markdown
## 你的角色

你是《归航 / Odyssey's Road》项目的协作 coding agent。用户已完成官方《THE ODYSSEY》预告片的抽帧与索引校验，现在要和你**一起讨论** V2 的：

1. **重新编排**（滚动章节 / Road 结构 / 是否压缩或扩展四幕）
2. **转场特效**（序列 scrub、shader、Canvas 合成、DOM 层等）
3. **交互 UX**（滚动驱动为主；头部追踪等待定——仅作技术参考）

请以**讨论 + 提案**为主，不要直接大改代码，除非用户明确说「开始实现」。先读索引、看图、输出编排方案与转场表。

---

## 项目现状（2026-09-05）

- **阶段**：V2 重新设计。V1（60 秒 AI 油画路演）已归档，勿沿用其剧本 / 六章 / 神谕镜结构。
- **素材源**：官方预告片 MP4（146.75s，1280×720），非 AI 生成。
- **已完成**：
  - 全长序列帧：`public/assets/sequences/official-trailer/`（3522 帧 @ 24fps，~232MB，git 忽略 jpg）
  - 43 个校验锚点 + 关键帧图：`public/assets/keyframes/official-trailer/`
  - **权威索引大纲**：`docs/TRAILER_INDEX.md` ← **必须先读**
  - 抽帧 / 预览工具：`tools/extract-sequence-frames.mjs`、`tools/extract-keyframes.mjs`、`tools/sequence-scroll-preview/`、`tools/keyframes-gallery/`

---

## 权威索引：`docs/TRAILER_INDEX.md`

四幕结构（已抽帧校验）：

| 索引 ID | 时间 | 内容 |
| --- | --- | --- |
| `act-1-origin` | 0–35s | 海难 → 记忆 → 归乡欲望 |
| `act-2-ithaca` | 35–84s | 伊萨卡失序 ↔ 奥德修斯线交错；红帆首次完整 |
| `act-3-montage` | 84–135s | 高速神话战争蒙太奇（转场实验主战场） |
| `act-4-stinger` | 135–147s | 片名 + 独眼巨人 stinger |

- 43 个节拍各有稳定 **`id`**（如 `016-red-sail-first`）、`anchor` 秒数、tags、关键帧文件名。
- **红帆船**是全片 recurring motif：`016` / `030` / `037`。
- 第三幕末 02:11–02:15 五连切（<1s），绑定交互需 ±0.3s 精度。
- 索引 §6 有转场设计备忘（记忆闪回、内外对切、图腾 recurring 等），§3 每节拍有 `transition` 挂钩列——**在此之上填具体方案，不改 id 与时间码**。

机器可读：`public/assets/keyframes/official-trailer/timeline.json`

---

## 本地预览（讨论前建议跑一遍）

```bash
cd <repo-root>
python3 -m http.server 4173
```

- 全长滚动 scrub：`http://localhost:4173/tools/sequence-scroll-preview/?asset=../../public/assets/sequences/official-trailer`
- 43 锚点图览：`http://localhost:4173/tools/keyframes-gallery/`

源片路径（用户本机）：`/Users/saiph/Downloads/66443bfd-1e56-4625-9cc6-2d318172909a.mp4`

按幕 / 节拍抽子段：

```bash
node tools/extract-sequence-frames.mjs -i "<video>" --id act-1-origin \
  --fps 24 --start 0 --duration 35
```

---

## 技术参考（模式可借鉴，UX 待重做）

| 文档 | 用途 |
| --- | --- |
| `docs/ARCHITECTURE.md` | StoryRouter / StoryDirector / Renderer 分层；config 唯一真相源 |
| `docs/reference/PEAR_TECH_REFERENCE.md` | Pear 滚动 + WebGL + Canvas 合成 |
| `references/pear-no/src/components/SequenceCanvas.jsx` | 序列 scrub + cover 取景 |
| `references/pear-no/src/components/HeroCanvas.jsx` | 视频纹理 + shader 转场 |
| `docs/TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md` | 多目标累计停留（**模式参考**） |
| `docs/HEAD_COUPLED_PEEK_TECHNICAL_DESIGN.md` | 固定帧 + 头部取景（**模式参考**） |
| `AGENTS.md` | 协作红线：Renderer 不写裸秒数；帧数只在 manifest |

**架构红线摘要**：
- 章节边界、blend、asset 引用 → `story.config`；路径/帧数 → manifest；交互阈值 → `interaction.config.ts`
- Renderer 只消费 `SceneFrame` + `InteractionFrame`；不读 `window.scrollY`
- 实验 API 只在 `src/capabilities/`（`src/` 尚未建立，讨论阶段可先出 schema 提案）

---

## 归档（只读，勿实现）

`archive/v1-60s-ai-roadshow/`：旧剧本、Prompt、DECISIONS、TASKS、AI 素材。

---

## 请你和用户讨论的问题（议程）

### A. 编排（Story / Road）

1. 互动版是**全长 ~147s** 还是压缩到例如 60–90s？哪些幕可合并 / 跳过？
2. 滚动段落如何映射四幕？一 scroll 段 = 一 act，还是 act-3 蒙太奇拆成多段？
3. 「第一幕原点」是否作为默认入口（`act-1-origin`）？
4. 是否需要分支 / 选择，还是纯线性叙事？（V1 三 Track 已废弃，除非用户新提）

### B. 转场（Visual / Renderer）

1. 每幕主 Renderer：`sequence`（scrub）/ `video` / `shader` / DOM 层叠？
2. 索引 §6 备忘中哪些优先做 POC？（例如：002→003 记忆闪回；016→030→037 红帆 recurring；038→039 硬切片名）
3. act-3 快切：整段 scrub vs 锚点间 jump vs Pear 式桥接序列？
4. 字卡节拍（`008` `019` `039`）用 DOM 还是帧内保留？

### C. 交互（UX）

1. 仅滚动 + 键盘，还是加头部追踪 / 指针 parallax？
2. 滚动速度：实时播放感（~100vh/s）还是自由 scrub？
3. Pre-roll / 摄像头是否保留？（V1 有，V2 未定）

### D. 交付物（讨论结束后应产出）

请与用户共识后，输出一份 **V2 编排提案**（Markdown 即可），包含：

```text
1. 章节表（id · 源 act/beat · 时间区间 · 滚动屏数或 Road 长度 · Renderer key）
2. 转场表（from beat → to beat · 特效类型 · 参考 Pear/V1 模式 · 风险）
3. 待抽子段清单（asset-id · --start · --duration · fps）
4. 开放问题 / 需用户拍板项
5. 若实现：建议的新 DECISIONS 条目与 story.config 骨架 diff（提案，不直接改共享文件）
```

---

## 讨论原则

- **以 `TRAILER_INDEX.md` 的 id 和时间码为锚**，编排是「选段 + 排序 + 转场」，不是重写素材事实。
- 先图览 43 锚点，再谈转场；act-3 必须承认切镜密度。
- 特效想法要落到具体 beat id，避免泛泛「加 glitch」。
- 没任务卡前不填 `src/`；可写 `docs/` 提案或 `docs/V2_ORCHESTRATION_PROPOSAL.md`（与用户确认后）。

## _repo 入口_

- README：`README.md`
- V2 待办：`docs/REDESIGN.md`
- 索引：`docs/TRAILER_INDEX.md`
- 本交接：`docs/handoff/V2_ORCHESTRATION_AGENT_BRIEF.md`
```
