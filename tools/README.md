# Lab tools

> 更新日期：2026-09-05。不属于 MVP 运行时代码；用于素材实验与 Pear 式滚动序列验收。

## 序列帧抽取

从视频导出滚动 scrub 用的密集帧序列，输出结构与 `docs/ARCHITECTURE.md` §7.4 一致。

**默认输出**：`public/assets/sequences/<id>/`（正式素材目录）。实验可改 `--output lab/sequences`。

**依赖**：系统已安装 [ffmpeg](https://ffmpeg.org/)（`brew install ffmpeg`）。

```bash
# 默认 30 fps，输出到 public/assets/sequences/<id>/desktop/
node tools/extract-sequence-frames.mjs \
  --input /path/to/video.mp4 \
  --id ch01-opening

# 指定输出根目录
node tools/extract-sequence-frames.mjs \
  --input /path/to/video.mp4 \
  --id ch01-opening \
  --output public/assets/sequences
```

产物：

```text
public/assets/sequences/<id>/
├── manifest.json
└── desktop/
    ├── frame-0001.jpg
    └── ...
```

**已有素材**：无（V1 `ch01-opening` 已归档）。V2 预告片序列待用户交付时间线后抽取。

```bash
node tools/extract-sequence-frames.mjs -i /path/to/trailer.mp4 --id <asset-id> --fps 30
```

## 滚动预览

Pear `SequenceCanvas` 同款思路：固定 canvas + `object-fit: cover` 取景 + 滚动映射帧号。

```bash
cd /path/to/odysseys-road
python3 -m http.server 4173
```

浏览器打开：

```text
http://localhost:4173/tools/sequence-scroll-preview/?asset=../../public/assets/sequences/<asset-id>
```

可选 query：

| 参数 | 含义 |
| --- | --- |
| `asset` | 序列根目录（含 manifest.json） |
| `tier` | 默认 `desktop` |
| `posStart` / `posEnd` | cover 水平取景 0–100（Pear 式 pan） |
| `posEaseStart` / `posEaseEnd` | pan 起止 progress |

## 与 Pear 的对照

- Pear 序列约 **121 帧** / 档，滚动 road 区间映射 `frameIndex = round(progress * 120) + 1`（见 `references/pear-no/src/components/SequenceCanvas.jsx`）。
- 5s 素材 @ **30fps ≈ 153 帧**，比 Pear 略密，scrub 更顺；@ **24fps ≈ 122 帧** 接近 Pear 密度。
- 正式接入 MVP：T6 写入 `assets.manifest.ts`；可选 JPG → WebP。
- Agent 交接（V1，已归档）：`archive/v1-60s-ai-roadshow/docs/handoff/`
- V2 入口：`docs/REDESIGN.md`
