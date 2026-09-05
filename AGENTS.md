# Odyssey's Road · Agent 协作约束

> 更新日期：2026-09-05。决定的来源见 `docs/DECISIONS.md`；任务领取见 `docs/TASKS.md`。

## 现在处于哪个阶段

实现阶段已开放，但**只允许按 `docs/TASKS.md` 的任务卡实现**。没有任务卡的功能不做；想做就先加卡。

第一版范围：60 秒路演 MVP，只有 Track 3 完整；Track 1/2 胜出后进入「这段记忆尚未归来」占位章（D-001）。桌面 Chromium，无移动端（D-008）。

## 开始任务前

1. 读 `docs/DECISIONS.md` 全文、`docs/TASKS.md` 里自己的卡、`docs/ARCHITECTURE.md` §5（契约）。
2. 一句话说明本次修改属于：core / interaction / renderer / mirrors / app / content / prompts / docs 哪一类，对应哪张卡。
3. 只改卡上"拥有"的路径。共享文件（`src/core/contracts.ts`、`story.config.ts` schema、根配置）只给建议 diff，不直接改。
4. 列出事实、假设、未验证项。实验性浏览器能力必须附官方来源与查询日期。

## 架构红线（违反即打回）

- `StoryRouter` 只决定当前章节与 Track 路由；`StoryDirector` 只把进度映射为章节局部 Road；两者不知道摄像头。
- 章节边界、blend、renderer key、layer、asset 引用只来自 `story.config`；素材路径/帧数只来自 asset manifest；交互阈值只来自 `interaction.config.ts`。**组件、Renderer、CSS、GLSL 里不得出现业务秒数或 Road 裸数字。**
- Renderer 只消费 `SceneFrame` + `InteractionFrame`（+ `SelectionState`）；不读 `window.scrollY`；不 import 其他 Renderer 的实现。
- MediaPipe 只输出低维 `InteractionFrame`；不保存、不上传、不记录视频帧、landmarks、逐帧轨迹。
- HTML-in-Canvas / Three / WebGL / 摄像头都是渐进增强；指针 + 键盘 + 真实 DOM 必须能走完 60 秒。实验 API 名称只允许出现在 `src/capabilities/`。
- 一次性事件（雷击、触碰）用 `ChapterRuntime` 的 latch，Renderer 不自持"已触发"状态。
- 新增视觉效果 ≠ 新增 Renderer key；只有渲染技术或生命周期契约不同才新增。

## 提交与汇报

- 分支 `task/<ID>-<slug>`，提交信息前缀卡号：`T2: ...`。小步提交；会话结束前 push。
- 提交前：`pnpm check`（typecheck + test）通过；`git status --short`、`git diff --check` 干净。
- 汇报模板：改动文件 / 运行的命令与结果 / 未验证项 / 对共享文件的建议 diff。不以 build 通过代替视觉验收。
- 不擅自提交到 main；不重写他人任务卡拥有的文件。

## 必须停下来问人的事

Road 表与章节顺序的变更、契约字段增删、隐私文案、雷击亮度与时长、Prompt 的角色/世界观锁、素材许可。

## 文档阶段的额外要求

链接有效；事实有来源；规划与已实现状态不混淆（未实现的写"待实现"）；每份文档顶部保留版本/更新日期。
