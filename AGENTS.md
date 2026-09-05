# Odyssey's Road Agent 协作约束

> [Rebuilt by dev-trace init: 2026-09-05 from fresh repository scan]

本仓库当前处于**文档与架构设计阶段**。在用户明确说“开始实现”以前，Agent 不得创建运行时代码、安装依赖或把规划描述成已实现功能。

当前唯一制作基准是 `docs/ROADSHOW_60S_CUT.md`：只完整开放 Track 3；Track 1/2 卡片可响应凝视但不可确认进入。任何实现或文档不得超出 60 秒路演范围。

## 开始任务前

1. 先读 `README.md`、`docs/ARCHITECTURE.md` 与本次任务涉及的专题文档。
2. 用一句话说明本次修改属于：叙事、Road/config、素材、Renderer、交互输入、文档中的哪一类。
3. 列出事实、假设和未验证项；实验性浏览器能力必须附官方来源与验证日期。
4. 保留用户已有修改，只提交本任务文件。

## 架构红线

- `StoryRouter` 只决定当前章节和 Track 顺序；`StoryDirector` 只把当前章节的输入映射为 Road。
- release profile 决定当前可确认的 Track；路演版中 Track 1/2 可响应关注但不得确认进入。
- 章节边界、overlap、Renderer key、layer 与素材引用只能来自 `story.config`；组件和 Renderer 禁止出现业务 Road 裸数字。
- 素材路径、帧号、格式和 desktop/mobile tier 只能来自 asset manifest。
- Renderer 只消费 `SceneFrame`；不得读取 `window.scrollY`，不得相互 import 实现。
- MediaPipe 只输出归一化 `InteractionFrame`；不得进入 Router、Director，也不得保存视频帧、landmarks 或逐帧视线轨迹。
- HTML-in-Canvas 必须经过 capability adapter；业务代码不得直接依赖实验 API 名称。
- WebGL、摄像头与实验 API 都是渐进增强；指针、键盘和真实 DOM 路径必须能完成故事。
- 新增视觉效果不等于新增 Renderer。只有渲染技术或生命周期契约不同，才新增 Renderer key。

## 变更所有权

| 修改目标 | 默认只改 | 需要额外改动的条件 |
| --- | --- | --- |
| 调整章节节奏/overlap | `story.config` | 公共 schema 改变时才改契约与文档 |
| 换素材 | asset manifest + 素材文件 | 素材类型改变时评估 Renderer |
| 新增同类章节 | `story.config` | 新素材再改 manifest；不改 Renderer |
| 新渲染技术 | 新 Renderer + registry | 同时补 fallback、测试与架构文档 |
| 调整凝视算法 | interaction provider/controller | 不改 Road 与 Router |
| 修改故事风格 | Prompt registry / 剧本文档 | 不把文案复制进 Renderer |

## Agent 与人工复核边界

Agent 可实现已批准的 Renderer、fallback、清理逻辑、validator、测试、GLSL 和 Prompt 生成工具。以下事项必须显式请求人工复核：Road 表、章节身份和顺序、handoff、隐私提示、移动端构图、素材许可、Prompt 的角色/世界观锁定。

## 完成标准

- 文档阶段：链接有效；事实有来源；规划与已实现状态不混淆；`git diff --check` 通过。
- 实现阶段：按未来 `package.json` 的 `test`、`assets:check`、`prompts:check`、`build` 全部通过，并人工抽查章节交界、快速滚动、移动端、键盘与降级路径。
- 提交前运行 `git status --short` 和 `git diff --check`；汇报未验证项，不以 build 通过代替视觉验收。
