# V2 Phase 0 接管检查与待确认项

> 更新：2026-09-05  
> 状态：接管修复已提交；**Gate 0 未通过，不进入 Phase 1**。  
> 基线：`v2/mvp`，接管时 HEAD `d8c42c0`；本任务不重写另一实现任务的提交历史。  
> 依据：[实施计划](V2_IMPLEMENTATION_PLAN.md) §2、[编排提案](V2_ORCHESTRATION_PROPOSAL.md) §2.1 / §7.1。

## 1. 事实、假设、边界

- 首次只读检查为 `main` 且没有实现文件；检查期间另一写入方创建 `v2/mvp`、实现文件及三个提交。
- 用户随后指定以本任务为准；接管现有实现，而非从空目录重复搭建。
- Codex 任务列表未找到另一个同目录任务，不能据此证明所有外部编辑器已经停止；未强杀不明进程。
- 基于以下假设：现有配置可用于数字阶段的占位验证，但不视为用户批准了现有红帆坐标、结尾声明或契约偏离。
- 本轮不编辑素材、锚点、archive、contracts、story.config、assets.manifest 或 content.registry；不切帧、不实现 shader。
- 接管前的 `V2-0.1` 提交包含原先已暂存的归档移动；后两个提交各合并了多张卡。本轮不重写这些历史。
- 原有未提交的 AGENTS / README / 架构文档及其他文件保留；本轮仅逐路径暂存自己修改的代码、测试和本报告。

## 2. 逐卡修复记录

以下均为对既有卡的修复，不表示整张卡已达到全部验收条件。

| 卡 | 类别 | 改动文件 | 提交 | 命令与结果 | 未验证项 / 共享文件建议 |
| --- | --- | --- | --- | --- | --- |
| V2-0.5 | core | `src/core/validateStory.ts`、`tests/core/validateStory.test.ts` | `a99c8f5` | `pnpm check`：62 tests，通过，有两条既有 lint warning | 补齐非法 renderer、无 clip 的悬空 asset、coverage gap、同 layer 重叠、非有限数、未来 branch/gate 规则；不调整共享契约；manifest 实帧完整性不在此结果内 |
| V2-0.6 | core | `SceneRegistry.ts`、`StoryDirector.ts`、`tests/core/timeline.test.ts` | `be66b2b` | `pnpm check`：86 tests，通过 | 硬切采用半开区间，终章末端仍可达；验证四个章界 ±1e-6、blend、逆映射；未改屏数或边界 |
| V2-0.7 | core | `ProgressSource.ts`、`src/app/App.tsx`、`main.tsx`、`tests/core/ProgressSource.test.ts` | `ae1704f`、`ee2b8a2` | `pnpm check`：92 / 95 tests，通过 | 调试页改用真实滚动输入；rAF 合并事件、销毁取消、逆映射 seek；第二次提交修复浏览器实测发现的 CSS 像素舍入导致章首落到上一章；小于一个 CSS 像素仅用于 seek 数值误差，不是交互节奏参数 |
| V2-0.8 | renderer / core | `RendererStage.tsx`、`tests/core/ChapterRuntime.test.ts` | `dccbbaa` | `pnpm check`：94 tests，通过，零 lint warning | 不在 mount 完成前 update，不在销毁后异步回写旧帧；context 清理使用稳定集合；验证 latch 生命周期。复杂异步资源分配与失败恢复尚无浏览器回归用例 |
| V2-0.10 | core / renderer | `src/core/frameIndex.ts`、`DevRoadPanel.tsx`、`App.tsx`、`tests/core/frameIndex.test.ts` | `98686fc` | `pnpm check`：103 tests，通过，零 lint warning | 面板增加预计帧号，明确标注占位；微 scrub 使用配置；移除组件重复 seek。没有序列解码，不能把预计帧号当作实际显示帧 |

## 3. Gate 0 清单

- [x] 最终 `pnpm check`：TypeScript、ESLint、Vitest 通过；7 个测试文件、103 tests，零 warning。
- [x] `pnpm build`：Vite 生产构建通过。
- [x] validator 失败 fixture 覆盖重复 chapter/scene、gap、越界/非法 Road、未注册 renderer、缺 clip、transition 引用错误及 §5.3 branch/gate 规则。
- [x] Director：0 → origin Road 0；1 → stinger Road 500；所有章界前后归属通过。
- [x] SceneRegistry：burn 与底层 memory / alone 叠加正确；硬切边界不会同时激活两个底层 sequence；smoothstep 及倒向计算通过。
- [x] `rg -n 'scrollY' src/renderers src/components src/styles` 无匹配。
- [x] 本轮改动路径的 `git diff --check` 通过。全工作区检查仍报告原有 AGENTS / README 的 Markdown 行尾空格，未代为修改。
- [x] 浏览器实际滚动会更新 debug chapter / Road；五个章节点均验证到达本章 Road 0。
- [x] 调试 slider 的键盘 End 可到 stinger Road 500；预计帧号实测显示 origin-alone 的数值。
- [ ] 40 屏完整连续采样和每一种键盘输入的全程验收未完成；端点可达不等同于全程连续采样。
- [ ] 文案节奏数字归位未通过：继承实现 `DomRenderer.ts` 仍硬编码 `1.2` / `0.85`，CSS 仍使用时间驱动的淡入。
- [ ] DOM 卡数量 / 文案待确认；仅抽查 origin 卡安全区，未完成全部场景的视觉验收。
- [ ] Renderer 实际注册表与 validator 输入不一致，见 §5。
- [ ] 主循环仍把 DirectorFrame 放入 React state，不符合实施计划 §1 的渲染循环边界；后续需改成 imperative 更新，React 只承载宿主与调试 UI。
- [ ] ChapterRuntime 当前按页面 mount，尚未接上章切换时的生命周期切换。
- [ ] manifest 的构建期生成、切点 strip 复验与最终帧数边界尚未完成，见 §4。
- [ ] 用户尚未确认 Gate 0；没有开始 Phase 1。

浏览器说明：内嵌浏览器存在缩放，最初设置 1280×720 后 DOM 实际报告 1163×654；随后调整视口并读取 `innerWidth/innerHeight`，确认 CSS 视口为 1280×720。浏览器检查不是 Phase 1 的 Playwright 15 图基线，也没有 SSIM 数据。

## 4. 接管时已存在、未擅自修订的素材问题

来源：`src/config/assets.manifest.ts`，本轮以 Node 导入占位 manifest 并检查 `clip.to > frameCount`：

| asset / clip | to | placeholder frameCount |
| --- | ---: | ---: |
| act-1-origin / 007-go-home | 711 | 710 |
| act-2-ithaca / 017-helmet | 1052 | 1051 |
| act-3a-trials / 029-army-plains | 763 | 762 |
| act-4-stinger / 041-cyclops-hand | 99 | 98 |

这证明占位值内部不一致，不证明实际抽帧结果缺帧。后续应先按文档 strip 复验，再在构建期生成并校验有效帧范围，而非在 Renderer 偷偷 clamp。

- `clipFromSeconds` 当前被运行时模块调用，顶部的 “Build-time helper” 注释不是构建期执行的证据。
- 三处 ring origin 已写入 `[0.62, 0.35]`、`[0.6, 0.4]`、`[0.55, 0.5]`，没有本任务的点选校准与用户确认；**不可作为 Gate 3 的已确认素材事实**。
- 不改变 43 锚点 id / anchor；当前 trials / homeward 细分 clip 仍只是继承的占位表。

## 5. 需要用户确定的文档冲突与建议 diff

### A. Phase 0 的 sequence 如何处理

事实：[实施计划](V2_IMPLEMENTATION_PLAN.md) `V2-0.3` 要求完整 scene config 能通过 validator，`V2-0.8` 又要求只注册 dom；[架构](ARCHITECTURE.md) §5.3 要求拒绝未注册 Renderer。

现状：`src/app/App.tsx` 把 `['dom', 'sequence']` 作为 validator 参数，却实际上只注册 dom；RendererStage 则直接跳过 sequence。不能把这个通过结果称为真实注册表校验通过。

**建议，待批准**：Phase 0 允许注册不绘图的 sequence 占位实现，保持无画面的数字阶段；validator 改读真实注册表，Phase 1 替换占位 factory。不增加第三个 Renderer key，不降低 validator 拒绝规则。

替代方案是 Phase 0 用另一个纯 DOM 的 runtime 配置，但这会偏离“直接验证完整 story.config”，不建议。

### B. 现有契约的补签范围

事实：本任务尚未修改 `contracts.ts`。继承版本相对架构 §5.1 不仅有获批的 `SceneDefinition.clip`，还包含：

```diff
 SceneFrame
+  clip?: string

 StoryDirector
-  fromRoad(road: number): DirectorFrame
+  fromRoad(chapterId: string, road: number, source?: ProgressSourceKind): DirectorFrame

 SceneDefinition / SceneFrame
-  behavior?: Readonly<Record<string, unknown>>
+  behavior?: SceneBehavior
```

**建议，待批准**：保留 SceneFrame.clip 与带 chapterId 的 fromRoad，使 Renderer 能仅消费 SceneFrame、局部 Road 可寻址；behavior 按提案 §7.1 恢复通用 Record，内部用校验 / 类型守卫解释 schema，避免每个 behavior 参数都变成跨层契约字段修改。

其他由空仓库落地时新增的 manifest / content / registry 辅助类型也已存在于 contracts；不因接管而宣称这些已经获得额外批准。

### C. DOM 卡数量与占位文案

事实：[实施计划](V2_IMPLEMENTATION_PLAN.md) `V2-0.9` 写“5 张章名卡 + 结尾”，但[提案 §2.1](V2_ORCHESTRATION_PROPOSAL.md)只列五个 DOM scene：origin-captions、ithaca-card、trials-card、stinger-title、stinger-outro（**包含结尾**）；homeward 没有独立章名卡。

**建议，待批准**：按逐 scene 表的五个 DOM scene 实现，不加 homeward 卡、不改 Road；章名沿用提案文字并标记为待终审。现有自行补写的“仅用于非商业学习与展示”不应当作用户的素材范围声明，结尾先换成明确的“结尾文案待确认”占位，终稿另定。

上述建议尚未写回 shared files 或决策表。收到确认后，新增递增决策记录，再完成剩余 Phase 0 修复及复验；仍须用户确认 Gate 0 后才能进入 Phase 1。
