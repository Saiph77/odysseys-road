# 编排预览（片段 + Comment）

按 `TRAILER_INDEX` 四幕 × 43 节拍预览预告片片段，comment 写入 `public/assets/keyframes/official-trailer/comments.json`。

## 启动

```bash
cd <repo-root>
node tools/orchestration-preview/server.mjs
```

浏览器打开：**http://localhost:4180/tools/orchestration-preview/**

> 需本机存在源片 symlink：`public/assets/video/official-trailer.mp4` → Downloads 里的 MP4。

## 用法

1. 左侧点**节拍** → 视频循环播放该时间段；点**播整幕** → 播放整幕区间。
2. 右侧填写 **Comment / Transition / Orchestration**，约 0.6s 后自动 PUT 到 `comments.json`。
3. 有 comment 的节拍左侧显示绿点标记。

## comments.json 结构

```json
{
  "version": 1,
  "updatedAt": "2026-09-05T…",
  "beats": {
    "016-red-sail-first": {
      "comment": "全片图腾，滚动段落中心",
      "transition": "与 030 呼应",
      "orchestration": "独立 scroll 段"
    }
  }
}
```

## 相关

- 索引：`docs/TRAILER_INDEX.md`
- 节拍表：`public/assets/keyframes/official-trailer/timeline.json`
