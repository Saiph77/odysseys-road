# Odyssey's Road / 《归航》

一个受《奥德赛》启发的互动叙事网页项目。项目计划使用长滚动时间轴、新古典主义油画素材、WebGL / GLSL、Canvas 序列帧、Three.js 空间场景，以及可选的本地头部追踪，构建三条可自由选择的“记忆之流”。

## 当前材料

- [完整互动剧本](docs/ODYSSEY_INTERACTIVE_SCRIPT.md)
- [Track 凝视选择技术实现文档](docs/TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md)

## 参考实现

- [`references/pear-no/`](references/pear-no/)：Pear.no 互动体验的本地复刻快照，用于研究滚动叙事、WebGL shader、Canvas 序列帧、HTML-in-Canvas、Three.js、MediaPipe 头部追踪和 off-axis projection。
- [Pear 参考快照说明](references/pear-no/REFERENCE_SNAPSHOT.md)

## 计划结构

```text
特洛伊序章
→ 海上 Track 凝视选择
→ 任意未完成 Track
→ 返回海上选择
→ 任意未完成 Track
→ 返回海上选择
→ 最后一个 Track
→ 雷击沉船与归乡终章
```

三个 Track：

1. 智慧与傲慢：莲食者、独眼巨人、风神之袋。
2. 诱惑与死亡：食人巨人港湾、喀耳刻、冥界。
3. 歌声与牺牲：塞壬、斯库拉与卡律布狄斯、太阳神的牛。

## 资料边界

`docs/` 中的《归航》剧本与技术设计是本项目材料。`references/pear-no/` 是带有独立来源说明的研究参考快照，不代表该参考项目及其素材被重新授权给本项目。

