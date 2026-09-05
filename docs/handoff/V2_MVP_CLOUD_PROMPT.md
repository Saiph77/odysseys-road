# 云端接续 Prompt

> 更新日期：2026-09-05

以下正文可直接发送给云端实现 agent：

---

请接手 Saiph77/odysseys-road 仓库 `v2/mvp` 分支的《归航 / Odyssey's Road》MVP 实现。不要从 main 旧状态开始，也不要重新设计；先确认当前提交包含 `73bcb0f` 之后的云端交接文档。

先读 `AGENTS.md` 和 `docs/handoff/V2_MVP_CLOUD_HANDOFF.md`，再按文档必读顺序查看提案、实施计划、43锚点索引、架构、Pear参考与 `src/core/contracts.ts`。交接文档比旧handoff prompt和“src为空”的历史描述更新。

当前Phase 0主体和Phase 1真实序列渲染已经实现；不要重复搭建。剩余目标按handoff的G1→G4推进：补验收证据，Phase 2 strip复验/单镜clips/scene时间尺，Phase 3依次实现T4 burn、共用ring①②③与origin点选、memory、021zoom，再完成降级、倒滚、shader端点和截图验收。只做Phase 0–3，不做Phase 4/5。

素材JPG不在Git。先检查我提供的 `odyssey-v2-full-assets.tar.gz`（推荐）或 `odyssey-v2-source-and-strips.tar.gz`，按handoff校验SHA-256、解压/抽帧并运行verify-sequence。若附件暂缺，先推进不依赖真实素材的部分并明确缺少哪些输入，不伪造素材、截图或通过结论。

保持五章顺序与40屏、sequence/dom两个Renderer key、memory/burn/ring三家族；唯一源片不替换、不AI重绘、不锁滚动、不音频/摄像头、不改archive。timing和效果参数只进story.config，clip/origin只进manifest源数据后生成；不以JSX/CSS/GLSL业务阈值掩盖视觉问题。43锚点id/anchor不改，只补note。

我授权你对不突破这些红线的未明确事项采用最小、可逆方案，记录事实、假设、未验证项与决策后继续，不用等待逐Phase回复。重要决策追加提案§1，从D-V2-016递增。主观屏数/视觉/文案终稿没经过我确认的，必须明确标“待用户确认”，不能代我勾选。

现有实测为107单测、6项浏览器测试、3084帧校验和build通过，不等于所有Gate完成。特别注意现有截图比较并非SSIM、heap只测末值、shader当前只有crossfade；保留原Phase 1基线，解释平台与clip修改造成的差异，不直接更新截图来遮盖回归。

继续在 `v2/mvp` 上按V2-x.y任务卡分commit，先读后改、禁止重复功能。每卡报告改动文件/命令与结果/未验证项/共享配置diff；最终交付可运行实现、实际验收证据、关键效果对照图以及明确的剩余人工确认项。
