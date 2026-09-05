# 静态素材（V2）

> 更新：2026-09-05

V1 AI 序列 `ch01-opening` 已移至 [`archive/v1-60s-ai-roadshow/assets/`](../../archive/v1-60s-ai-roadshow/assets/ch01-opening/manifest.json)。

## 约定（与 ARCHITECTURE §7.4 一致）

```text
public/assets/
├── sequences/<asset-id>/
│   ├── manifest.json
│   └── desktop/frame-0001.*
└── video/                 # 可选：预告片源或片段
```

## 已有素材

| asset id | 说明 | 帧数 | 时长 | 源 |
| --- | --- | --- | --- | --- |
| `official-trailer` | 官方宣传片完整序列 | 3522 @ 24fps | ~2m27s | `66443bfd-…909a.mp4` |

帧文件在 `desktop/`（约 225MB），git 已忽略；`manifest.json` 进 git。

## 按时间线切子段

```bash
node tools/extract-sequence-frames.mjs \
  -i /path/to/trailer.mp4 \
  --id trailer-act-01 \
  --fps 24 \
  --start 12.5 \
  --duration 8
```
