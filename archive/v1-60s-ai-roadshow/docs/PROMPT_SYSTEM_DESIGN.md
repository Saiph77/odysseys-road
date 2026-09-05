# 《归航》Prompt 系统设计草案

> 状态：设计草案；当前权威交付物为 [`prompts/image-prompts/`](../prompts/image-prompts/README.md)（8 张人工整理稿）
> 制作基准：[`ROADSHOW_60S_CUT.md`](ROADSHOW_60S_CUT.md)
> 更新日期：2026-09-05

## 1. 目标

为 60 秒路演 8 个场景提供可独立发送的中英双语 System Prompt，避免跨 AI 并行生成时的风格漂移（漏贴角色锁、Negative 不完整、中英语义不一致）。

实现阶段：`prompt.registry.ts` 为唯一维护源 → 生成 `prompts/generated/{zh,en}/*.system.md` → CI 运行 `prompts:check`。

## 2. 8 组 Prompt ID

| ID | 章节 | 中文 | English |
| --- | --- | --- | --- |
| `00-prologue` | Ch.01 | 木马之夜 | The Horse |
| `01-sea-hub` | Ch.02 | 无名之海 | The Open Sea |
| `01b-track-selection` | Ch.02 | 三股记忆之流 | Three Memory Currents |
| `31-sirens` | Ch.03 | 塞壬之歌 | The Song That Knows You |
| `32-scylla-charybdis` | Ch.04 | 斯库拉与卡律布狄斯 | The Price of Passage |
| `33-cattle-of-the-sun` | Ch.05 | 太阳神的牛 | The Forbidden Herd |
| `f-storm` | Ch.06 | 最后一艘船 | The Last Ship |
| `f2-ithaca` | Ch.06 | 伊萨卡 | Ithaca |

## 3. 数据契约（实现时）

```ts
type PromptDefinition = Readonly<{
  id: string;
  chapterId: string;
  title: Readonly<{ zh: string; en: string }>;
  scene: Readonly<{ zh: string; en: string }>;
  aspectRatio: '16:9';
  includeCharacterLock: boolean;
  includeShipLock: boolean;
  includeCrewLock: boolean;
  approvedByHuman: boolean;
}>;
```

共享 Master Style、角色/船只锁与 Negative 在 registry 中一处维护；生成物每份仍是完整 System Prompt。

## 4. 生成文件结构

```text
prompts/
├── image-prompts/          # 当前人工稿（8 张）
├── prompt.registry.ts      # 未来唯一维护源
└── generated/
    ├── zh/*.system.md
    └── en/*.system.md
```

每份生成物固定含：Role、Master Style、Locks、Scene、Negative、Output Contract。画面内禁止文字；标题由 DOM 渲染。

## 5. 校验与所有权

`prompts:check` 至少检查：8 个 ID 均生成 zh/en、必备段落完整、禁止 `TODO` 与空段、source hash 一致。

| 内容 | Agent 可做 | 必须人工确认 |
| --- | --- | --- |
| 机械生成 16 个文件 | 是 | 模板先评审 |
| 检测缺段/禁词 | 是 | — |
| Master Style / 角色锁 | 仅提 diff | 是 |
| 单场景构图微调 | 可给候选 | 主体/方向变化需确认 |

视觉验收由人完成：并排比较奥德修斯、船只、色板与损伤阶段。
