# 《归航》双语独立图像 Prompt

本目录从 `docs/ODYSSEY_INTERACTIVE_SCRIPT.md` 的生图系统与场景提示词拆分而来。每张图对应一个 Markdown 文件；每个文件都同时包含：

1. 中文系统风格；
2. 中文图片特色；
3. English System Style；
4. English Image Features。

每份文件都是可独立使用的完整交付稿，不需要返回原剧本拼接 Master Style、角色锁或 Negative Prompt。中文和英文描述在主体数量、左右位置、动作、留白与禁止项上保持一致。

> 当前状态：人工整理稿，尚未接入 `prompt.registry.ts` 或自动生成器。视觉一致性仍需对实际图像模型进行并排测试和人工复核。

## 60 秒路演优先

- [`00-prologue.md`](00-prologue.md)：木马之夜 / The Horse
- [`01-sea-hub.md`](01-sea-hub.md)：无名之海 / The Open Sea
- [`01b-track-selection.md`](01b-track-selection.md)：三股记忆之流 / Three Memory Currents
- [`31-sirens.md`](31-sirens.md)：塞壬之歌 / The Song That Knows You
- [`32-scylla-charybdis.md`](32-scylla-charybdis.md)：斯库拉与卡律布狄斯 / The Price of Passage
- [`33-cattle-of-the-sun.md`](33-cattle-of-the-sun.md)：太阳神的牛 / The Forbidden Herd
- [`f-storm.md`](f-storm.md)：最后一艘船 / The Last Ship
- [`f2-ithaca.md`](f2-ithaca.md)：伊萨卡 / Ithaca

## 后续长版

- [`t1-cover.md`](t1-cover.md)：智慧与傲慢 / Cunning & Pride
- [`11-lotus-eaters.md`](11-lotus-eaters.md)：莲食者之岛 / The Lotus Eaters
- [`12-cyclops.md`](12-cyclops.md)：独眼巨人的洞穴 / Nobody
- [`13-bag-of-winds.md`](13-bag-of-winds.md)：风神之袋 / The Bag of Winds
- [`t2-cover.md`](t2-cover.md)：诱惑与死亡 / Desire & Death
- [`21-closed-harbor.md`](21-closed-harbor.md)：食人巨人的港湾 / The Closed Harbor
- [`22-circe.md`](22-circe.md)：喀耳刻的宫殿 / The Beautiful Cage
- [`23-underworld.md`](23-underworld.md)：冥界问路 / The House of the Dead
- [`t3-cover.md`](t3-cover.md)：歌声与牺牲 / Song & Sacrifice

## 使用方法

选择中文或英文版本，将该语言下的“系统风格”和“图片特色”一起发送给图像模型。不要只发送图片特色，否则人物、船只、色板和排除项可能发生漂移。
