# Chapter 01 特洛伊陷落 — 图生视频 Prompt（3 段）

> 版本：V1.0（2026-09-05）
> 依据：`docs/scripts/60s-roadshow/01_OPENING_AND_SELECTION_SCRIPT.md` §3；静帧 Prompt 见 `../image-prompts/00-prologue.md`
> 首帧参考：`../generated/ch01/S1-A_v1_1536x1024.png`（用户生成，已采纳为 S1-A 正式首帧）
> 输出：16:9，≥ 1440p，24/30fps，无文字、无水印、无转场特效；每段可多生成 1–2s 供网页裁切

## 0. 分段方案

正片 `00.0–10.0s` 分为三段视频 + 两张静帧 + 网页 shader 收尾。视频总长约 9.2s，其余 0.8s 由网页完成"裂缝 → 海平线"。

| 段 | 正片时间 | 建议生成时长 | 首帧 | 尾帧 | 网页衔接 |
| --- | ---: | ---: | --- | --- | --- |
| V0（可选） | Pre-roll | 4–6s 无缝循环 | 同 V1 首帧 | 同首帧 | 落地活画；没有它则用静帧 + shader 微动 |
| V1 入城与闭门 | 00.0–02.6 | 3–4s | `S1-A`（用户图） | `S2-B` 闭门夜色 | 尾帧接近全黑 → 直切 V2 |
| V2 马腹与火 | 02.6–07.0 | 4–5s | `S3` 暗场士兵下马 | `S5'` 火海（自广场内抬升机位） | 06.8s 网页停帧 200ms → 150ms 叠化进 V3 |
| V3 神像倒塌 | 07.0–09.2 | 3s | `S6-A` 神像直立 | `S7-B'` 头颅落地、无裂缝 | 网页 shader 画竖裂缝、旋转、揭开 `S8-B` 晨海 |

`S5'`、`S7-B'` 是对 `00-prologue.md` 的两处调整（见 §4），其余帧 ID 与该文件一致。

## 1. 首帧参考图评估（S1-A v1）

**结论：采纳，作为 V0/V1 首帧，不重出。** 需要一次 16:9 裁切与放大。

符合项：新古典油画笔法、平涂天青蓝、象牙石 + 牛血红 + 旧金色板；木马自左向右被拖向右侧敞开城门（与剧本方向一致）；上方左侧大片干净天空可放 DOM 标题；画内无文字；城门形制（双方塔 + 齿状女墙 + 高门）与「城门锁」一致。

偏差与处理：

| 偏差 | 处理 |
| --- | --- |
| 3:2（1536×1024）非 16:9 | 裁为 1536×864：上裁 40px、下裁 120px（去掉最下方台座与脚部，保留全部天空与木马、城门）；再放大到 ≥ 2560×1440 |
| 前景有庆典人群（举月桂、观礼者），剧本写"不拍庆典笑脸" | **接受**。庆祝与随后的灰烬同处一画，反差更重；下裁 120px 已削弱前景比重。剧本 §3 本条视为已改 |
| 海面上有一队希腊船 | 接受为"假意离去的舰队"。V1 运动提示中要求它们**静止或缓慢远去**，不得靠岸 |
| 城墙红旗上有金色太阳纹 | 接受。圆形太阳 = 全片"诱惑"圆环母题的第一次出现，并预示第五章太阳神；不是文字/Logo |
| 金色落日而非灰蓝黄昏 | 接受。落日正好给 V1 提供"最后一线金光被门缝压成黑"的光源 |

一致性影响：从这张图起，**木马 = 这匹木马**（深雪松木条拼接、绳索挽具、四木轮、无可见舱门），**城门 = 这座城门**。后续 S2/S3/S4 生图时把这张图作为参考图（image reference / style reference）一并提供。

## 2. 三段视频 Prompt

### V0｜落地活画循环（可选）

```text
Static camera, no camera movement. Seamless 5-second loop of a neoclassical oil painting coming quietly alive: the sea surface glitters and breathes very slowly, thin clouds drift almost imperceptibly, the red banners on the gate stir once in a light wind, faint torch smoke rises from the towers. Nothing else moves: the wooden horse, the crowd, the ships and the architecture stay perfectly still. Preserve every detail of the source painting, painterly brush texture, flat cerulean sky. First and last frame identical for looping. No text, no morphing, no added figures, no camera zoom.
```

```text
固定机位，无任何镜头运动。5 秒无缝循环：海面极慢地起伏闪光，薄云几乎不可察觉地漂移，城门上的红旗在微风里动一次，塔楼火把冒出极淡的烟。其余一切完全静止：木马、人群、船与建筑不动。保留原画全部细节与油画笔触、平涂天青蓝天空。首尾帧一致以便循环。禁止文字、形变、新增人物、推拉镜头。
```

### V1｜入城与闭门（00.0–02.6s，生成 3–4s）

首帧：`S1-A`（裁切后的用户图）。尾帧（若工具支持首尾帧）：`00-prologue.md` 的 `S2-B`。

```text
Neoclassical oil painting in motion, smooth painterly rendering, no photorealism. The crowd hauls the colossal wooden horse rightward on its wheels toward the open gate; ropes stay taut, the horse rolls slowly and rigidly, its planks and proportions never change. Camera performs one slow continuous push-in toward the gate, keeping the gate on the right third. As the horse's hindquarters cross the threshold, the sun sinks into the sea on the left and the whole sky darkens from cerulean dusk to deep ink-blue night. The two great doors swing shut from both sides; the last golden sunlight is squeezed into a single thin vertical slit between them, then the slit goes black. The distant ships stay still or drift slowly away, never approaching shore. Spectators' gestures are minimal; no new figures appear. Final frame: closed dark gate at night, one faint vertical seam, a few tiny stars. No text, no lens flare, no morphing of the horse, no cuts.
```

```text
新古典油画动起来，笔触平滑，非写实摄影。人群把巨大的木马沿轮子向右拖向敞开的城门；绳索始终绷紧，木马缓慢、僵直地滚动，木板和比例不变。镜头做一次缓慢连续的推进，城门始终在画面右三分之一。木马臀部越过门槛时，太阳沉入左侧海面，整片天空从天青蓝黄昏压成墨蓝深夜。两扇巨门从两侧合拢，最后一线金色日光被挤成门间一条细竖缝，随后竖缝变黑。远处船只静止或缓慢远去，绝不靠岸。观众动作极少，不出现新人物。尾帧：夜色中闭合的暗色城门，一条几乎不可见的竖缝，几颗小星。禁止文字、镜头光晕、木马形变、剪切。
```

### V2｜马腹与火（02.6–07.0s，生成 4–5s）

首帧：`S3`（暗场，士兵沿绳梯下马；生图时附 S1-A 作为木马参考图）。尾帧（可选）：`S5'`（见 §4）。

```text
Neoclassical oil painting in motion, dark night interior of the city square, moonlight only. Greek soldiers descend one by one down the rope ladder from the wooden horse's belly, slow and silent, their bronze catching one small cold highlight each. One soldier strikes a torch: the flame is the first saturated color, copper red and sulfur gold, lighting only his arm and the horse's forelegs. Then five or six torches are thrown in different parabolic arcs toward rooftops and hangings, each leaving a short trail of firelight. Where they land, fabric and beams catch fire and the flames spread across the roofs. During the last two seconds the camera rises and pulls back slowly, revealing the whole city igniting while the wooden horse in the square remains a solid black void untouched by light. Final frame: wide burning Troy at night, the horse as the single black shape at center. Flames painterly, not photoreal. No text, no cuts, no faces in close-up, no extra limbs, the horse never changes.
```

```text
新古典油画动起来，城内广场夜景，只有月光。希腊士兵沿木马腹部垂下的绳梯逐个无声降下，动作缓慢，每人青铜甲上只有一小点冷高光。一名士兵点燃火把：火焰是画面第一个饱和颜色——铜红与硫黄金，只照亮他的手臂与木马前腿。随后五六支火把沿不同抛物线飞向屋顶与帷幔，各留下一条短促的火光尾迹。落点处织物与木梁起火，火势沿屋顶蔓延。最后两秒镜头缓慢升高并后拉，露出整座城正在燃烧，而广场中的木马始终是一块不被光照亮的实心黑色空洞。尾帧：夜里燃烧的特洛伊全景，木马是画面中央唯一的黑形。火焰要有油画感，不写实。禁止文字、剪切、人脸特写、多余肢体，木马不得改变。
```

### V3｜神像倒塌（07.0–09.2s，生成 3s）

首帧：`S6-A`（神像直立，绳索绷紧，背后火海）。尾帧（可选）：`S7-B'`（见 §4）。

```text
Neoclassical oil painting in motion. A colossal cold-ivory marble statue of Pallas Athena stands in the right foreground against the burning city; coarse ropes around her neck and spear are pulled taut by soldiers at the lower left. The statue slowly tilts forward toward the camera. A single vertical crack opens at the neck, the head separates from the body while the face keeps its calm expression and forward gaze; the spear shaft snaps, the small round shield slips away, stone dust and sparks drift from the break. The camera follows the falling head downward in one continuous move, ending in a close view of the head resting on the flagstones, forehead and Corinthian helmet near the center of the frame, face calm, warm firelight fading to a dim glow. Final frame nearly still and quiet. No explosion, no shattering, no blood, no change of facial expression, no blinking, no text, no cuts.
```

```text
新古典油画动起来。巨大的冷象牙白大理石帕拉斯·雅典娜立像位于右前景，背后是燃烧的城市；套在颈部与矛杆上的粗绳被左下方士兵拉紧。神像缓慢向镜头方向前倾。颈部裂开一道竖直裂纹，头颅与身体分离，面容始终平静、目光向前；矛杆折断，小圆盾滑落，石屑与火星从断口飘出。镜头以一次连续运动跟随头颅下落，结束于头颅静静躺在石板上的近景，额头与科林斯头盔位于画面中央附近，面容平静，火光的暖色退成微弱余温。尾帧几乎静止、安静。禁止爆炸、碎裂飞溅、血、表情变化、眨眼、文字、剪切。
```

## 3. 网页侧衔接（供 T3/T8 实现）

- V1 尾 → V2 首：两帧都接近黑，直切；`troy` 章在 Road 上留 2 帧余量防止跳帧可见。
- V2 尾 → V3 首：06.8s 停帧 200ms（剧本"火焰极短冻结"），150ms 叠化到 V3 首帧。
- V3 尾 → S8-B：网页 shader 在 V3 尾帧上从额心画一条竖直白裂缝贯穿画面（~250ms，同时火声抽空），画面旋转 90° 使裂缝横置，crack mask 揭开 `S8-B` 晨海静帧（~550ms）。这是 T8 的 burn/crack mask 任务；V3 因此**不需要**生成裂缝。
- 若视频工具能稳定生成 V3 尾 → `S7-B`（带裂缝）→ `S8-B` 的旋转 match cut，可替代 shader；shader 路径保留为兜底。

## 4. 对 `00-prologue.md` 的两处调整

- **S5 → S5'**：机位从"城外高处俯瞰"改为"城内广场上方抬升后拉"，与 V2 连续；木马仍是唯一黑洞，其余描述不变。
- **S7-B → S7-B'**：头颅落地近景，额头与头盔在画面中央附近，**不画裂缝**；裂缝由网页生成。原 S7-B（带裂缝）保留为可选尾帧。

## 5. 生成顺序建议

1. 裁切、放大 S1-A → 直接跑 **V1**（无需新生图）。
2. 生图 `S6-A` → 跑 **V3**（神像是全章最难一致的对象，早出早验）。
3. 生图 `S3` → 跑 **V2**。
4. 生图 `S8-B` 晨海（网页揭开用）。
5. 可选：V0 循环。
