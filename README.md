# Odyssey's Road / 《归航》

受《奥德赛》启发的 60 秒互动叙事路演原型：新古典主义油画素材、WebGL / GLSL、Canvas 序列帧、HTML-in-Canvas、Three.js 空间场景，以及可选的本地头部追踪。

> **当前状态**：文档与架构设计阶段，尚未初始化运行时代码。

## 文档索引

| 文档 | 内容 |
| --- | --- |
| [`docs/ROADSHOW_60S_CUT.md`](docs/ROADSHOW_60S_CUT.md) | **制作总览基准**：版本定位、六章节奏、素材预算、验收 |
| [`docs/scripts/60s-roadshow/`](docs/scripts/60s-roadshow/README.md) | **逐秒连续剧本**：01 开场与择路、02 Track 3 与归乡（细节冲突时以此为准） |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | 目标架构与开发规范 |
| [`docs/TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md`](docs/TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md) | Track 凝视选择（HTML-in-Canvas + Three.js + MediaPipe） |
| [`docs/HEAD_COUPLED_PEEK_TECHNICAL_DESIGN.md`](docs/HEAD_COUPLED_PEEK_TECHNICAL_DESIGN.md) | 斯库拉章头部探视（单序列 UV 偏移） |
| [`prompts/image-prompts/`](prompts/image-prompts/README.md) | 8 组双语图像 Prompt |
| [`docs/PROMPT_SYSTEM_DESIGN.md`](docs/PROMPT_SYSTEM_DESIGN.md) | Prompt registry 设计（待实现） |
| [`docs/reference/PEAR_TECH_REFERENCE.md`](docs/reference/PEAR_TECH_REFERENCE.md) | Pear.no 技术实现手册（WebGL/GLSL、Canvas 2D、HTML-in-Canvas、头部追踪，共 4 册） |
| [`docs/reference/PEAR_HERO_TRANSITION_STUDY.md`](docs/reference/PEAR_HERO_TRANSITION_STUDY.md) | Pear 首段视频与复合转场研究 |
| [`docs/reference/PEAR_ARCHITECTURE_AUDIT.md`](docs/reference/PEAR_ARCHITECTURE_AUDIT.md) | Pear-no 类项目架构审计 |
| [`references/pear-no/`](references/pear-no/) | Pear.no 参考实现快照（仅研究，不复用素材） |
| [`AGENTS.md`](AGENTS.md) | Agent 协作约束 |

## 60 秒结构

```text
00–10s  特洛伊木马 → 海上
10–20s  凝视选择 Track（三卡展示，仅 Track 3 可进入）
20–30s  塞壬
30–40s  斯库拉与卡律布狄斯
40–50s  太阳神的牛
50–60s  雷击沉船 → 伊萨卡
```

三面 Track 神谕镜代表三股记忆之流（内容与符号见 [`ROADSHOW_60S_CUT.md` §4](docs/ROADSHOW_60S_CUT.md)）；另外两面保留凝视反馈，但明确提示内容尚未归来：

1. **智慧与傲慢** — 莲食者、独眼巨人、风神之袋
2. **诱惑与死亡** — 食人巨人港湾、喀耳刻、冥界
3. **歌声与牺牲** — 塞壬、斯库拉与卡律布狄斯、太阳神的牛（**当前唯一完整路线**）

摄像头授权、音频解锁与头部校准发生在正片开始前，不计入 60 秒。

## 实现入口

获得明确实现授权后，按 [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) P0 顺序：release profile / config 校验器 → `StoryRouter` / `StoryDirector` → Sequence 占位渲染 → Road 调试面板 → HTML-in-Canvas capability adapter。
