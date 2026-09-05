# Odyssey's Road / 《归航》

一个受《奥德赛》启发的互动叙事网页项目。当前第一目标是完成约 60 秒的路演原型：以新古典主义油画素材、WebGL / GLSL、Canvas 序列帧、HTML-in-Canvas、Three.js 空间场景和可选的本地头部追踪，连续演出特洛伊、凝视选路、一条三幕航程与伊萨卡归乡。三 Track 长版保留为后续蓝图。

> 当前状态：架构与内容设计阶段。仓库尚未初始化 React/Vite 运行时代码；文档中的接口、目录和验收项均为待实现契约，不代表已经上线。

## 当前材料

- [60 秒路演版设计（当前第一版制作基准）](docs/ROADSHOW_60S_CUT.md)
- [目标架构与开发规范](docs/ARCHITECTURE.md)
- [Track 空间选择技术设计](docs/TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md)
- [完整互动剧本（后续长版蓝图）](docs/ODYSSEY_INTERACTIVE_SCRIPT.md)
- [双语独立 System Prompt 设计](docs/PROMPT_SYSTEM_DESIGN.md)
- [Pear-no 类项目架构审计](docs/reference/PEAR_ARCHITECTURE_AUDIT.md)
- [Agent 协作约束](AGENTS.md)

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

## 下一阶段的实现入口

获得明确实现授权后，按 `docs/ARCHITECTURE.md` 的路演 P0 顺序初始化：release profile/config 校验器 → `StoryRouter` / `StoryDirector` → Sequence 占位渲染 → Road 调试面板 → HTML-in-Canvas capability adapter。MediaPipe 与 Shader 均在 60 秒基础叙事和降级路径通过后接入。
