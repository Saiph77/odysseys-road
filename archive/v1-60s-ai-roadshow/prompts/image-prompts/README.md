# 《归航》双语图像 Prompt

每张图一个 Markdown 文件，含中文与英文的「系统风格 + 图片特色」，可独立发送给图像模型。

视觉连续性（角色、船只、色板、禁止项）已内嵌于各文件的系统风格段，无需额外拼接。

> 当前状态：人工整理稿，尚未接入 `prompt.registry.ts`。

## 场景清单（8 张）

| 文件 | 章节 | 用途 |
| --- | --- | --- |
| [`00-prologue.md`](00-prologue.md) | Pre-roll + Ch.01 00–10s | 特洛伊陷落 9 镜头 13 帧 Prompt 包（含木马/城门/神像一致性锁） |
| [`../video-prompts/ch01-troy.md`](../video-prompts/ch01-troy.md) | Ch.01 00–10s | 三段图生视频 Prompt + S1-A 参考图评估 |
| [`01-sea-hub.md`](01-sea-hub.md) | Ch.02 背景 | 无名之海 |
| [`01b-track-selection.md`](01b-track-selection.md) | Ch.02 主体 | 三股记忆之流（Track 选择） |
| [`31-sirens.md`](31-sirens.md) | Ch.03 | 塞壬之歌 |
| [`32-scylla-charybdis.md`](32-scylla-charybdis.md) | Ch.04 | 斯库拉与卡律布狄斯 |
| [`33-cattle-of-the-sun.md`](33-cattle-of-the-sun.md) | Ch.05 | 太阳神的牛 |
| [`f-storm.md`](f-storm.md) | Ch.06 前半 | 雷击沉船 |
| [`f2-ithaca.md`](f2-ithaca.md) | Ch.06 尾帧 | 伊萨卡归乡 |

## 使用方法

选定语言，将该语言下的「系统风格」与「图片特色」一并发送。不要只发图片特色，否则角色与船只容易漂移。
