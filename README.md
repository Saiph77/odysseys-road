# Odyssey's Road / 《归航》

一个受《奥德赛》启发的互动叙事网页项目。当前第一目标是完成约 60 秒的路演原型：以新古典主义油画素材、WebGL / GLSL、Canvas 序列帧、Three.js 空间场景和本地头部追踪，连续演出特洛伊、凝视选路、一条三幕航程与伊萨卡归乡。三 Track 长版保留为后续蓝图。

## 当前材料

- [60 秒路演版设计（当前第一版制作基准）](docs/ROADSHOW_60S_CUT.md)
- [Track 凝视选择技术实现文档](docs/TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md)
- [完整互动剧本（后续长版蓝图）](docs/ODYSSEY_INTERACTIVE_SCRIPT.md)

## 参考实现

- [`references/pear-no/`](references/pear-no/)：Pear.no 互动体验的本地复刻快照，用于研究滚动叙事、WebGL shader、Canvas 序列帧、HTML-in-Canvas、Three.js、MediaPipe 头部追踪和 off-axis projection。
- [Pear 参考快照说明](references/pear-no/REFERENCE_SNAPSHOT.md)

## 当前第一版结构

```text
00–10s  特洛伊木马 → 海上
→ 10–20s  凝视选择 Track
→ 20–30s  塞壬
→ 30–40s  斯库拉与卡律布狄斯
→ 40–50s  太阳神的牛
→ 50–60s  雷击沉船 → 伊萨卡
```

第一版完整制作 Track 3「歌声与牺牲」。另外两张 Track 卡片保留关注反馈，但明确显示内容尚未完成；摄像头授权、音频解锁和中心校准发生在 60 秒正片开始前。

后续长版的三个 Track：

1. 智慧与傲慢：莲食者、独眼巨人、风神之袋。
2. 诱惑与死亡：食人巨人港湾、喀耳刻、冥界。
3. 歌声与牺牲：塞壬、斯库拉与卡律布狄斯、太阳神的牛。

## 资料边界

`docs/` 中的《归航》剧本与技术设计是本项目材料。`references/pear-no/` 是带有独立来源说明的研究参考快照，不代表该参考项目及其素材被重新授权给本项目。
