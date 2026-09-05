# 《归航》双语独立 System Prompt 设计草案

> 状态：设计草案，尚未生成 `prompts/` 文件
> 权威内容：`docs/ODYSSEY_INTERACTIVE_SCRIPT.md` 第五、六节
> 目标：每个场景拥有可直接发送给不同 AI 的完整中英文 System Prompt，不需要人工拼接公共片段
> 更新日期：2026-09-05

当前制作优先级以 `ROADSHOW_60S_CUT.md` 为准：先生成并验收路演直接使用的 `00-prologue`、`01-sea-hub`、`01b-track-selection`、`31-sirens`、`32-scylla-charybdis`、`33-cattle-of-the-sun`、`f-storm`、`f2-ithaca`；其余 9 组保留在 registry，进入长版时生成/验收。目录与 schema 一次设计完整，但不把 17 组全部生成误报为当前制作范围。

## 1. 要解决的问题

剧本当前使用：

```text
MASTER STYLE LOCK
+ CHARACTER / OBJECT LOCKS
+ SCENE PROMPT
+ GLOBAL NEGATIVE PROMPT
```

这对集中阅读很高效，但跨多个 AI 并行生成时容易发生四种漂移：漏贴角色锁、使用过期 Master、中文/英文场景含义不一致、Negative 不完整。

目标不是复制 17 份不可维护文本，而是同时满足：

1. `prompt.registry.ts` 是共享锁和场景变量的唯一维护源。
2. 生成物每份都是完整 System Prompt，可独立发送。
3. 中文和英文以相同 `promptId` 一一对应。
4. 生成物可读、可 diff、可校验；使用者不需要运行时拼接。

## 2. 目标目录

```text
prompts/
├── README.md
├── prompt.registry.ts               # 人工维护源
├── schema.ts                        # PromptDefinition 类型与 validator
└── generated/
    ├── zh/
    │   ├── 00-prologue.system.md
    │   ├── 01-sea-hub.system.md
    │   └── ...
    └── en/
        ├── 00-prologue.system.md
        ├── 01-sea-hub.system.md
        └── ...

scripts/
├── generate-prompts.mjs             # 确定性生成；输出文件头含来源 hash
└── validate-prompts.mjs             # ID、章节、双语、必备段落、禁词校验
```

`generated/` 提交进 Git，便于直接浏览和发送。只编辑 registry，不手改生成物；CI 运行 `prompts:check`，发现生成物过期即失败。

## 3. Prompt 数据契约

```ts
type LocalizedText = Readonly<{ zh: string; en: string }>;

type PromptDefinition = Readonly<{
  id: string;
  chapterId: string;
  title: LocalizedText;
  task: LocalizedText;
  scene: LocalizedText;
  aspectRatio: '16:9';
  includeCharacterLock: boolean;
  includeShipLock: boolean;
  includeCrewLock: boolean;
  continuityNotes?: LocalizedText;
  approvedByHuman: boolean;
}>;
```

`include*Lock` 是生成控制，不是让使用者自行拼接；生成后的文件仍包含完整文字。没有奥德修斯/船员/船的场景可以关闭不相关锁，减少模型互相冲突的指令，但此选择必须在 registry 中显式且经人工复核。

## 4. 每份 System Prompt 的固定结构

```text
# System Prompt: <promptId> / <title>

## Role and task
你是……只生成一个 16:9 场景画面……

## Non-negotiable master style
完整 Master Style Lock

## Character and object continuity
本场景所需的完整角色/船/船员锁

## Scene direction
该场景完整构图、动作、前中后景、留白与唯一视觉奇观

## Global exclusions
完整 Negative Prompt

## Output contract
不生成画内文字；只返回图像；不得解释；无法满足时明确失败
```

中文文件全部使用中文表达规则；英文文件全部使用英文表达规则。希腊专名、颜色 hex、模型参数等稳定标识保持一致。

## 5. 计划拆分的 17 组 Prompt

| ID | 中文文件主题 | 英文文件主题 | 剧本来源 |
| --- | --- | --- | --- |
| `00-prologue` | 木马之夜 | The Horse | Prompt 00 |
| `01-sea-hub` | 无名之海 | The Open Sea | Prompt 01 |
| `01b-track-selection` | 三股记忆之流 | Three Memory Currents | Prompt 01B |
| `t1-cover` | 智慧与傲慢封面 | Cunning & Pride | Prompt T1 |
| `11-lotus-eaters` | 莲食者之岛 | The Lotus Eaters | Prompt 1.1 |
| `12-cyclops` | 独眼巨人的洞穴 | Nobody | Prompt 1.2 |
| `13-bag-of-winds` | 风神之袋 | The Bag of Winds | Prompt 1.3 |
| `t2-cover` | 诱惑与死亡封面 | Desire & Death | Prompt T2 |
| `21-closed-harbor` | 食人巨人的港湾 | The Closed Harbor | Prompt 2.1 |
| `22-circe` | 喀耳刻的宫殿 | The Beautiful Cage | Prompt 2.2 |
| `23-underworld` | 冥界问路 | The House of the Dead | Prompt 2.3 |
| `t3-cover` | 歌声与牺牲封面 | Song & Sacrifice | Prompt T3 |
| `31-sirens` | 塞壬之歌 | The Song That Knows You | Prompt 3.1 |
| `32-scylla-charybdis` | 斯库拉与卡律布狄斯 | The Price of Passage | Prompt 3.2 |
| `33-cattle-of-the-sun` | 太阳神的牛 | The Forbidden Herd | Prompt 3.3 |
| `f-storm` | 最后一艘船 | The Last Ship | Prompt F |
| `f2-ithaca` | 伊萨卡尾帧 | Ithaca | Prompt F2 |

## 6. 完整文件示例（缩略场景，仅验证结构）

以下示例用于评审 System Prompt 结构；最终实施时，场景段必须从剧本 registry 的完整双语内容生成，不能复制此缩略版作为生产 Prompt。

### 中文输出形态

```text
SYSTEM PROMPT — 00-prologue / 木马之夜

你是一位负责《归航》视觉连续性的资深叙事概念艺术家。生成一张且仅一张 16:9 横幅场景图。所有标题、字幕与正文由网页 DOM 渲染，因此图像内部不得出现文字。

[MASTER STYLE LOCK]
使用统一的新古典主义油画语言……保持前景人物、中景建筑或船只和大面积留白背景清晰分离……

[CHARACTER / OBJECT LOCKS]
奥德修斯始终是同一名约 42 岁的爱琴海男性……船只始终是同一艘深色雪松木希腊长船……

[SCENE DIRECTION]
特洛伊陷落之夜，巨大的木马从右侧穿过浅色石门……

[GLOBAL EXCLUSIONS]
禁止文字、字母、标题、Logo、水印……禁止现代物件、维京/罗马/中世纪盔甲……

[OUTPUT CONTRACT]
只返回图像，不解释提示词。无法满足禁止项时不要用近似文字代替。
```

### English output shape

```text
SYSTEM PROMPT — 00-prologue / The Horse

You are the senior narrative concept artist responsible for visual continuity across Odyssey's Road. Generate one and only one 16:9 landscape scene. All titles, subtitles, and body copy will be rendered as web DOM, so the image must contain no text.

[MASTER STYLE LOCK]
Use one coherent neoclassical oil-painting language... Keep foreground figures, middle-ground architecture or ship, and generous negative-space background clearly separated...

[CHARACTER / OBJECT LOCKS]
Odysseus is always the same 42-year-old Aegean man... The ship is always the same dark cedar Greek longship...

[SCENE DIRECTION]
Night at the fall of Troy, with a colossal wooden horse entering pale-stone gates from the right...

[GLOBAL EXCLUSIONS]
No text, letters, captions, logos, watermarks... no modern objects, Viking, Roman imperial, or medieval armor...

[OUTPUT CONTRACT]
Return only the image. Do not explain or restate the prompt. Do not substitute decorative pseudo-text when an exclusion cannot be satisfied.
```

## 7. 风格一致性规则

- Master、角色/物件锁与 Negative 由一处维护；场景文件不得维护私有副本。
- 奥德修斯年龄、疤痕、服装、胸针和腰绳为强连续字段；不得由 Agent“优化”。
- 船只设计固定，损伤只单向累积；每个 Prompt 必须声明当前损伤阶段。
- 每幅图只有一个主要视觉奇观；其余元素服务构图与后续 DOM 排版。
- 画面不得包含文字；Prompt 中提到的石碑/铭牌必须明确“表面留白”。
- 彩虹故障是极小面积数字痕迹，不得升级为全图调色。
- 中文与英文场景在主体数量、左右位置、动作时刻、留白方位和禁止项上必须等价。

## 8. 人与 Agent 的所有权

| 内容 | Agent 可做 | 必须人工确认 |
| --- | --- | --- |
| 机械生成 34 个完整文件 | 是 | 生成模板先评审 |
| 中英文初译、字段对齐 | 是 | 神话语义和专名终审 |
| 检测缺段/禁词/ID 漂移 | 是 | 无需逐项许可 |
| Master Style Lock | 仅可提出 diff | 是 |
| 角色、船只、船员锁 | 仅可提出 diff | 是 |
| 单场景构图微调 | 可给候选 | 主体/方向/连续性变化需确认 |
| 模型特定参数 | 可放 profile | 不得污染通用 System Prompt |

## 9. 校验与验收

生成器必须是确定性的。`prompts:check` 至少检查：

- 17 个 registry ID 均生成 zh/en，且没有额外文件；
- 每份含 Role、Master、所需 Locks、Scene、Negative、Output Contract；
- promptId、chapterId、标题和 source hash 一致；
- 禁止 `TODO`、空段和“same as previous”；
- 中文文件不缺失角色字段，英文文件不缺失相应字段；
- 输出文件不依赖 include/import/link 才能读懂；
- 修改共享锁后，34 份文件必须全部重新生成。

视觉验收仍由人完成：并排比较奥德修斯、船、服装、色板、地平线和损伤阶段。Prompt 文本一致不等于生成结果一致。

## 10. 实施时只需改哪些文件

- 加场景 Prompt：只改 `prompt.registry.ts`，运行 generator，提交新增 zh/en 两个生成物。
- 改全局风格：只改 registry 的 Master，经人工评审后重新生成全部文件。
- 改某场景构图：只改对应 scene definition，重新生成该对文件。
- 换图像模型：增加调用侧 model profile；不改通用 System Prompt，除非模型明确要求语法差异。
