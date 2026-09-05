# Odyssey's Road / 《归航》

受《奥德赛》启发的 60 秒互动叙事路演原型：新古典主义油画素材、滚动驱动的连续转场、三面真实 HTML 神谕镜、可选的本地头部追踪（MediaPipe），以及为 HTML-in-Canvas、Three.js、Web Audio 预留的扩展接口。

> **当前状态**：设计已收敛，进入 MVP 实现阶段。运行时代码按 [`docs/TASKS.md`](docs/TASKS.md) 任务卡逐步落地；`src/` 尚为空目录。

## 先读什么

| 顺序 | 文档 | 内容 |
| --- | --- | --- |
| 1 | [`docs/DECISIONS.md`](docs/DECISIONS.md) | **已拍板的决定**。任何文档冲突以此为准 |
| 2 | [`docs/TASKS.md`](docs/TASKS.md) | **MVP 任务卡**：文件所有权、依赖、验收、并行协议 |
| 3 | [`AGENTS.md`](AGENTS.md) | Agent 协作红线与提交规范 |
| 4 | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | 模块边界、契约、story.config schema |
| 5 | [`docs/scripts/60s-roadshow/`](docs/scripts/60s-roadshow/README.md) | 逐秒剧本：01 开场与择路、02 Track 3 与归乡（叙事/美术/声音以此为准） |
| 6 | [`docs/TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md`](docs/TRACK_SELECTION_GAZE_TECHNICAL_DESIGN.md) | 神谕镜选择：三区累计停留、HTML-in-Canvas 能力边界 |
| 7 | [`docs/HEAD_COUPLED_PEEK_TECHNICAL_DESIGN.md`](docs/HEAD_COUPLED_PEEK_TECHNICAL_DESIGN.md) | 斯库拉章单序列头部探视 |
| 8 | [`docs/ROADSHOW_60S_CUT.md`](docs/ROADSHOW_60S_CUT.md) | 制作总览（较早，细节让位于以上文档） |
| — | [`prompts/image-prompts/`](prompts/image-prompts/README.md) | 双语图像 Prompt（待按 T7 重写） |
| — | [`docs/PROMPT_SYSTEM_DESIGN.md`](docs/PROMPT_SYSTEM_DESIGN.md) | Prompt registry 设计（待实现） |
| — | [`docs/reference/`](docs/reference/PEAR_TECH_REFERENCE.md) | Pear.no 参考实现技术手册、转场研究、架构审计（只作参考） |
| — | [`references/pear-no/`](references/pear-no/) | Pear.no 快照（仅研究，不复用素材） |

文档优先级（D-013）：DECISIONS > 剧本 > 交互技术设计 > ARCHITECTURE > ROADSHOW > reference。

## 60 秒结构

```text
pre-roll  活画：加载即请求摄像头并滚动校准；第一次滚动即开始（不计时，无按钮）
00–10s    troy        木马入城 → 焚城 → 雅典娜神像断首 → 裂缝成为海平线
10–20s    selection   三面神谕镜升起；真实时间 5 秒按头部朝向累计停留；最长者胜出
20–30s    sirens      塞壬：左右头部混合两种歌声（第一版只做显影，无音频）
30–40s    scylla      两种死亡：向左看漩涡，向右看斯库拉（单序列 UV 探视）
40–50s    cattle      太阳神的牛：勿视、勿触 → 落日 → 篝火 → 黎明
50–60s    homecoming  晴空雷击 → 残影 → 风暴 → 断桅漂流 → 伊萨卡（停在海浪循环）
```

三面神谕镜固定左/中/右：**I 智慧与傲慢**、**II 诱惑与死亡**、**III 歌声与牺牲**（唯一完整路线）。I/II 胜出时进入「这段记忆尚未归来」占位章，可返回或继续 Track 3。

## 开发

技术栈：Vite + TypeScript + React + pnpm（D-014）。工具链由任务卡 T0 建立；建立后本节补充 `pnpm dev / check / build` 说明。
