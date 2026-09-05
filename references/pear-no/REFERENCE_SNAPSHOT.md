# Pear.no 参考快照说明

## 来源

- 上游仓库：https://github.com/amasun/Pear-no
- 本地来源目录：`/Users/bopeng/Documents/ChatGPT/New project/Pear-no`
- 快照日期：2026-09-05
- 基础提交：`c9c094ca2e17d4a916de6103263bc1a99c3aa5d4`
- 基础提交说明：`Sync hero video and mask frames`

## 快照范围

本目录复制的是来源仓库在快照日期的当前工作树，而不只是上游基础提交。它包含当时尚未在来源仓库提交的改动与新增内容，包括：

- README、依赖配置、`App.jsx` 和样式调整。
- `src/spatial/` 中的 HTML-in-Canvas、Three.js 空间场景与 off-axis projection。
- 本地 MediaPipe Face Landmarker 运行资源与模型。
- 头部追踪、鼠标回退与空间文档交互实验。

为避免嵌套仓库、依赖和构建产物进入主仓库，复制时排除了：

- `.git/`
- `node_modules/`
- `dist/`
- `.DS_Store`

## 使用边界

该快照用于技术研究和本项目实现参考。上游 README 将项目标记为 `Research Only`，且快照中未提供将其素材重新授权给 Odyssey's Road 的独立许可证。因此：

- 可以研究其结构、时间轴、渲染管线和交互思路。
- Odyssey's Road 应使用自己的画面、视频、音频与从零实现的效果代码。
- 不应把参考目录中的 Pear 品牌素材当作 Odyssey's Road 的正式产品素材发布。

详细技术背景参见本目录的 `README.md`、`REPLICATION_LESSONS.md` 与 `L4_DEVELOPMENT_PROGRESS.md`。

