# 00-prologue｜Chapter 01 特洛伊陷落 / The Fall of Troy — 图片生成 Prompt 包

> 版本：V2.0（2026-09-05，按 `docs/scripts/60s-roadshow/01_OPENING_AND_SELECTION_SCRIPT.md` §3 重写；取代旧版单张"木马之夜"）
> 画幅：16:9，≥ 2560×1440（D-008 仅桌面）
> 覆盖正片：`Pre-roll 活画` + `00.0–10.0s`（`troy` 章）
> 用途：先出静帧，再由图生视频。每个镜头给出 **首帧 A** 与 **尾帧 B**；A/B 之间只允许发生描述中的那一个变化，机位、焦距、光源方向不变。

---

> **V2.1 补记（2026-09-05）**：视频分三段生成，见 [`../video-prompts/ch01-troy.md`](../video-prompts/ch01-troy.md)。S1-A 已由用户出图并采纳（`../generated/ch01/S1-A_v1_1536x1024.png`），S0 不再单独生图；S5 改为广场内抬升机位（S5'）；S7-B 的裂缝改由网页 shader 生成（S7-B' 不画裂缝）。

## 0. 使用方法

1. **系统风格**（§2）每次都完整粘贴在前，后面接对应镜头的「图片特色」。
2. **三条一致性锁**（§1）追加在系统风格之后：木马锁、城门锁、神像锁。同一镜头的 A/B 两帧必须同时带上。
3. 生成顺序建议：先出 `S1-A`、`S6-A`、`S8-B` 三张定调（海岸 / 神像 / 晨海），确认色板后再补其余。
4. 视频衔接：`S1-B ≈ S2-A`，`S6-B ≈ S7-A`。相邻镜头共享帧时只生成一张，两个片段复用。
5. 画内禁止一切文字（标题、字幕由 DOM 渲染）。

## 1. Chapter 01 专用一致性锁（追加在系统风格之后）

```text
【木马锁】特洛伊木马始终是同一件物体：巨大、僵直、古风的木马，深色雪松木板拼接，木纹清晰可见，青铜铆钉与粗绳挽具，四只实心木轮，腹部只有一条几乎看不见的舱门缝。比例、木色和站姿在所有帧中完全一致。
【城门锁】特洛伊城门始终是：淡色石灰岩纪念碑式城门，两座方形塔楼夹一扇高大的青铜包边双开雪松木门，上方是带齿状女墙的城墙，墙上有火把托架。
【神像锁】守城神像始终是同一尊：巨大的冷象牙白大理石帕拉斯·雅典娜立像，古风式严肃而平静的面容，科林斯头盔推到头顶，长佩普洛斯外罩神盾皮，右手扶高矛，左手持小圆盾；头盔与矛尖残留旧金箔痕迹。五官、姿态与石材在所有帧中不变。
```

```text
[HORSE LOCK] The Trojan horse is always the same object: a colossal stiff archaic wooden horse built from dark-cedar planks with clearly visible grain, bronze studs, a coarse rope harness, four solid wooden wheels, and one nearly invisible hatch seam under the belly. Proportions, wood color and stance are identical in every frame.
[GATE LOCK] The gate of Troy is always: a monumental pale-limestone gate, two square towers flanking one tall double-leaf cedar door bound in bronze, a crenellated wall above, torch brackets on the wall.
[STATUE LOCK] The guardian statue is always the same: a colossal cold-ivory marble standing Pallas Athena, archaic severe calm face, Corinthian helmet pushed back on the head, long peplos under an aegis, right hand resting on a tall spear, left hand holding a small round shield; traces of old gold leaf remain on helmet and spear tip. Features, pose and stone never change between frames.
```

## 2. 系统风格（每张必带）

### 中文

```text
你是负责《归航》全片视觉连续性的资深叙事概念艺术家。只生成一张 16:9 横幅图像；画内不得出现任何文字，网页标题与字幕将由 DOM 另行渲染。

整幅画必须是一张宽幅电影式的新古典主义油画：采用雅克-路易·大卫与让-奥古斯特-多米尼克·安格尔式的平滑、精炼笔触，理想化但优雅可信的人体，严谨而纪念碑式的构图，克制的戏剧动作，可信的古希腊材料，以及轻微老化的画布质感。使用平涂且饱和的天青蓝天空或深爱琴海蓝氛围、温暖象牙白大理石、旧金、牛血红织物和炭黑阴影。前景人物、中景建筑或船只与为网页排版保留的大面积干净背景必须清楚分层。仅加入稀疏粗颗粒黑白半色调点、一个受控的同心信号母题，以及最多一处极小的彩虹色差故障。整体应干净、庄重、神话性、可触摸且高度统一，不能成为摄影、商业电影剧照或普通奇幻概念图。

奥德修斯始终是同一个人：42 岁、精瘦强健的爱琴海国王，橄榄色皮肤，及肩深棕卷发，鬓角略灰，短卷胡须，笔直突出的鼻梁，左眉上方有淡疤，眼神聪明、疲惫而善于计算；穿风化的象牙白短基同，褪色牛血红披风以小型青铜猫头鹰胸针固定，系深蓝黑色腰绳。他必须像真实、饱经风霜的人，绝不能像现代超级英雄。

船始终是同一艘深色雪松木希腊长船：单桅、磨损的赭黄色方帆、粗绳、盐渍木板、小型青铜撞角，船首绘红白眼睛。损伤可以随旅程累积，但船体设计不能改变。船员是饱经风霜的地中海水手，穿各不相同的灰白基同，只有克制的牛血红和赭黄细节；面孔不能复制，不得出现现代服装或装备。

禁止文字、字母、标题、Logo、水印、画框、现代物品、现代船只、维京设计、罗马帝国盔甲、中世纪盔甲、奇幻板甲、超级英雄体型、照片写实、光滑 3D 渲染、动漫、漫画、像素画、十字绣、蒸汽朋克、通用奇幻概念图、青橙商业电影调色、过度镜头光晕、渐变天空、暗角、随机彩虹效果、拥挤构图、多余肢体、复制人物、奥德修斯服装漂移或船型变化。

只返回图像，不解释或复述提示词。无法满足禁止项时，不得用伪文字或装饰性符号替代。
```

### English

```text
You are the senior narrative concept artist responsible for visual continuity across Odyssey's Road. Generate one and only one 16:9 landscape image. No text may appear inside the image; all titles and subtitles will be rendered separately as web DOM.

A wide cinematic tableau painted as a single NEOCLASSICAL OIL PAINTING, with smooth refined painterly rendering inspired by Jacques-Louis David and Jean-Auguste-Dominique Ingres, elegant idealized anatomy, disciplined monumental composition, restrained theatrical gestures, believable ancient Greek materials, and subtle aged-canvas texture. Use a flat saturated cerulean-blue sky or deep Aegean-blue atmosphere, warm ivory marble, aged-gold accents, oxblood-red cloth, and charcoal-black shadows. Keep foreground figures, middle-ground architecture or ship, and a generous uncluttered background reserved for interface typography clearly separated. Integrate sparse coarse black-and-white halftone dots, one controlled concentric signal motif, and at most one very small rainbow chromatic-glitch accent. The result must be painterly but clean, solemn, mythic, tactile, and highly coherent, never photographic, cinematic-commercial, or generic fantasy concept art.

Odysseus is always the same man: a 42-year-old lean and strong Aegean king with olive skin, shoulder-length dark-brown curly hair with slight grey at the temples, a short curled beard, a straight prominent nose, a faint scar above the left eyebrow, intelligent exhausted calculating eyes, a weathered ivory-white short chiton, a faded oxblood-red cloak fastened by a small bronze owl fibula, and a dark blue-black waist cord. He must look human and weathered, never like a modern superhero.

The ship is always the same dark-cedar Greek longship with one mast, a worn square ochre sail, coarse ropes, salt-stained planks, a small bronze ram, and a painted red-and-white eye on the prow. Damage may accumulate through the journey, but the hull design never changes. The crew are weathered Mediterranean sailors in varied off-white chitons with restrained oxblood and ochre details, historically inspired silhouettes, no identical faces, and no modern clothing or equipment.

No text, letters, captions, logos, watermarks, frames, modern objects, modern ships, Viking design, Roman imperial armor, medieval armor, fantasy plate armor, superhero anatomy, photorealistic photography, glossy 3D render, anime, comic-book style, pixel art, cross-stitch, steampunk, generic fantasy concept art, teal-and-orange cinematic grading, excessive lens flare, gradient sky, vignette, random rainbow effects, crowded composition, extra limbs, duplicated people, inconsistent Odysseus costume, or changing ship design.

Return only the image. Do not explain or restate the prompt. Do not substitute pseudo-text or decorative symbols when an exclusion cannot be satisfied.
```

## 3. 镜头总表

| 镜头 | 正片时间 | 内容 | 帧 | 视频时长 | 网页用途 |
| --- | ---: | --- | --- | ---: | --- |
| S0 | Pre-roll | 黎明前海岸活画 | 1 张 | 4–6s 无缝循环 | 落地页背景（先用静帧 + 局部循环） |
| S1 | 00.0–01.8 | 木马从海边被拖向城门 | A / B | 1.8s | 开场主镜头 |
| S2 | 01.8–02.6 | 城门合拢，门缝金光压成黑 | A(=S1-B) / B | 0.8s | 竖缝母题第一次出现 |
| S3 | 02.6–04.0 | 士兵从木马腹中降下 | 1 张（微动） | 1.4s | 暗场 |
| S4 | 04.0–05.8 | 火把飞向城市 | A / B | 1.8s | 第一个高饱和色 |
| S5 | 05.8–07.0 | 特洛伊火海全景，木马是黑洞 | 1 张（微动） | 1.2s | 06.8s 短暂冻结 |
| S6 | 07.0–08.5 | 雅典娜像被绳索拉倒，颈部开裂 | A / B | 1.5s | 神像倒塌 |
| S7 | 08.5–09.2 | 断首落地，额心竖裂缝贯穿画面 | A(=S6-B 近景) / B | 0.7s | 落地静音 |
| S8 | 09.2–10.0 | 裂缝泛白 → 平静晨海，中央一艘小船 | B（尾帧） | 0.8s | 网页 shader 做裂缝转海平线，只需尾帧 |

共 13 张静帧。S8 的「竖裂缝旋转成海平线」建议由网页 shader 完成（T8 burn/crack mask），视频只需提供 S7-B（竖裂缝）与 S8-B（晨海）两端；若你的视频工具能稳定做旋转 match cut，也可以直接生成 S7-B → S8-B 的 0.8s 片段。

## 4. 各镜头「图片特色」

### S0｜Pre-roll 活画

中文
```text
黎明前的爱琴海岸，极低的冷灰蓝光。特洛伊的淡色石城墙与城门坐落在画面右上方的高地上，只有几支火把在塔楼上发出微弱旧金色光点。巨大的木马停在左侧岸边沙地上，只显示为一个深色雪松木的暗轮廓，木纹几乎不可见。海面完全平静，一条清晰的水平海平线横贯画面下三分之一处，薄雾贴着水面。没有人物。上方中央与左侧保留大面积干净的深蓝夜空供网页标题。稀疏半色调点只出现在雾中；不出现任何彩虹色差。整体像一幅屏住呼吸的静画。
```
English
```text
The Aegean shore before dawn in very low cold grey-blue light. The pale limestone walls and gate of Troy sit on high ground in the upper right, with only a few torches glowing as faint aged-gold points on the towers. The colossal wooden horse rests on the sand at the left shore, shown only as a dark silhouette of dark cedar, its grain barely visible. The sea is completely calm, one clean horizontal horizon line crossing the lower third of the frame, thin mist lying on the water. No people. Reserve a large clean deep-blue night sky in the upper center and left for the web title. Sparse halftone dots only in the mist; no rainbow accent at all. The whole image holds its breath.
```

### S1｜木马从海边进入城门（00.0–01.8）

**A 首帧** — 中文
```text
低机位正侧面宽构图。巨大的木马位于画面左侧三分之一，刚离开左后方的海岸沙地，粗绳从它的挽具绷紧地拉向右前方。数十名特洛伊人作为比例尺拉着绳索，只见背影与侧影，不见庆典笑脸；他们的基同是灰白与克制的赭黄。淡色石城门在画面右侧完全敞开，门内透出一片不自然的暖金色光，像一张已经张开的口。天空与海为平涂的灰蓝黄昏，木轮压过盐渍石板。木马始终是最大的暗形，腹部舱门缝不可见。上方保留干净天空。
```
**A** — English
```text
Low camera, true side view, wide composition. The colossal wooden horse occupies the left third of the frame, just leaving the sandy shore at the left rear; coarse ropes run taut from its harness toward the right front. Dozens of Trojans pull the ropes as a scale reference, seen only from behind or in profile, no celebratory faces; their chitons are off-white with restrained ochre. The pale limestone gate stands fully open on the right, an unnatural warm gold light glowing from inside like a mouth already open. Sky and sea are a flat grey-blue dusk; the wooden wheels press over salt-stained flagstones. The horse is always the largest dark shape, its belly hatch seam invisible. Keep a clean sky above.
```

**B 尾帧** — 中文
```text
同一机位、同一焦距、同一黄昏光。木马已经被拖到画面右侧，尾部刚刚越过城门门槛，前半身被城门阴影吞没，只剩臀部与后轮仍在门外被外光照亮。绳索松垂在石板上，拉绳的人群大部分已进入门内，只剩最后几个背影。门内的暖金色光更强，把木马后腿边缘勾成一道细金线。天空更暗一档，海面在左侧只剩一线。
```
**B** — English
```text
Same camera, same focal length, same dusk light. The horse has been dragged to the right side of the frame; its tail has just crossed the gate threshold, its front half swallowed by the gate's shadow, only the hindquarters and rear wheels still lit outside. Ropes lie slack on the flagstones; most of the pulling crowd has passed inside, only the last few backs remain. The warm gold light inside the gate is stronger, drawing a thin gold rim along the horse's hind legs. The sky is one step darker; the sea is a single line at the far left.
```

### S2｜城门合拢，黄昏坠入黑夜（01.8–02.6）

**A 首帧** = S1-B 的正面推近版 — 中文
```text
镜头正对城门，略仰视。两扇青铜包边雪松木门正在合拢，只剩一条约占画面宽度十分之一的竖缝，缝中是最后一线黄昏金光，光落在门前石板上形成一条窄长的金色地带。门外一切已在阴影中；两座塔楼与齿状女墙在上方形成暗色框架。天空是压得很低的深蓝，没有星星。
```
**A** — English
```text
Camera facing the gate straight on, slightly from below. The two bronze-bound cedar doors are closing, leaving a vertical slit about one tenth of the frame width; inside the slit is the last line of dusk gold, falling onto the flagstones as a narrow golden strip. Everything outside is already in shadow; the two towers and crenellated wall frame the top in darkness. The sky is a low deep blue with no stars.
```

**B 尾帧** — 中文
```text
同一机位。城门已完全闭合，只在门缝位置留下一条几乎不可见的炭黑细线，金光完全消失。天空在同一瞬间变成深夜的墨蓝黑，出现极少几颗晨星般的小星点。门上的青铜包边只靠塔楼火把发出极弱的反光。整幅画几乎是暗场，但门的轮廓、竖缝和石板纹理必须仍然可读。
```
**B** — English
```text
Same camera. The gate is fully closed, leaving only a nearly invisible charcoal-black vertical line where the seam is; the gold light is gone. In the same instant the sky has become the ink blue-black of deep night with a very few small star points. The bronze bindings on the door catch only the faintest reflection from tower torches. The picture is almost a dark field, yet the gate outline, the vertical seam and the flagstone texture must remain readable.
```

### S3｜士兵从木马腹中降下（02.6–04.0，单帧微动）

中文
```text
城内广场夜景，暗场，月光是唯一光源。巨大的木马占据画面左半，腹部舱门已经打开，一条绳梯垂到地面。四到五名希腊士兵正逐个无声降下，一人仍在梯上，两人已站在地面弯腰。人物边缘由冷月光勾出，暗但不是纯剪影，能看清"人从马里出来"。青铜甲片上有一小块受控的高光，这是画面唯一的亮色。地面石板、远处沉睡的房屋与神庙柱廊都在深蓝黑阴影中。上方保留干净夜空。
```
English
```text
Night in the square inside the city, a dark field, moonlight the only source. The colossal horse fills the left half; its belly hatch is open and a rope ladder hangs to the ground. Four or five Greek soldiers descend silently one by one, one still on the ladder, two already crouching on the ground. Figures are rimmed by cold moonlight, dark but never pure silhouettes, so that "men coming out of the horse" reads clearly. One small controlled highlight on a bronze scale of armor is the only bright accent. Flagstones, sleeping houses and a temple colonnade in the distance lie in deep blue-black shadow. Keep a clean night sky above.
```

### S4｜火把飞向城市（04.0–05.8）

**A 首帧** — 中文
```text
同一广场夜景，机位略后退。第一名士兵站在木马前方，刚点燃一支火把并举起；火焰是整幅画中第一个高饱和颜色——铜红与硫黄金。火光只照亮他的手臂、面部侧影和木马前腿的木纹，其余一切仍在深蓝黑夜里。另有两名士兵在暗处手持未点燃的火把。远处的屋顶、帷幔和城门内侧仍完整无损。
```
**A** — English
```text
Same square at night, camera pulled slightly back. The first soldier stands before the horse, having just lit a torch and raised it; the flame is the first high-saturation color in the whole picture, copper red and sulfur gold. Its light touches only his arm, the side of his face and the grain of the horse's forelegs; everything else stays in deep blue-black night. Two more soldiers hold unlit torches in the dark. Distant rooftops, hangings and the inner side of the gate are still intact.
```

**B 尾帧** — 中文
```text
同一机位。五到六支火把已经离手，沿不同的抛物线飞向屋顶、帷幔和城门内侧，每条轨迹在空中留下一条短促的火光尾迹。火把轨迹边缘允许出现极轻的红、黄、青三色印刷错版感，这是全画唯一的彩虹色差。落点处帷幔与木梁刚开始着火，出现第一批小火焰。士兵仍是暗色人影，木马仍是最大的暗形。天空仍是深夜。
```
**B** — English
```text
Same camera. Five or six torches have left the hands and fly along different parabolas toward rooftops, hangings and the inner gate, each leaving a short trail of firelight in the air. The edges of the torch trails may carry a very slight red-yellow-cyan misregistration like a misprinted plate; this is the only rainbow chromatic accent in the picture. Where they land, hangings and beams have just begun to burn with the first small flames. The soldiers remain dark figures, the horse remains the largest dark shape. The sky is still deep night.
```

### S5｜特洛伊火海全景（05.8–07.0，单帧微动）

中文
```text
远景，从城外高处俯瞰整座特洛伊在夜里燃烧。铜红与硫黄金的火焰吞没屋顶与神庙，建筑轮廓像一幅油画被从内部烧穿，火焰边缘带粗糙纸张纤维与半色调灰烬颗粒。木马站在城中央广场，是火海中唯一的一块黑色空洞，完全不被火光照亮。人物不再可辨。城墙与城门的淡色石头在下方形成一条冷色的水平带。上方天空是浓烟与墨蓝夜色，保留一块相对干净的区域。不出现任何彩虹色差。
```
English
```text
Long shot from high ground outside the walls, the whole of Troy burning at night. Copper-red and sulfur-gold flames swallow rooftops and temples; the buildings look like an oil painting burning through from the inside, flame edges carrying rough paper-fiber texture and halftone ash grain. The horse stands in the central square as the one black void in the sea of fire, entirely unlit. No figures are distinguishable. The pale stone of walls and gate forms a cold horizontal band below. Above, dense smoke and ink-blue night, with one relatively clean area kept clear. No rainbow accent at all.
```

### S6｜守城女神倒塌（07.0–08.5）

**A 首帧** — 中文
```text
巨大的冷象牙白大理石帕拉斯·雅典娜立像占据前景右侧，从膝部以上入画，背景是燃烧的城市。三到四条粗绳已经套在神像的颈部与矛杆上，被画面左下方几名希腊士兵拉紧，绳索绷直，神像还笔直站立。火光从背后和侧面照亮石像，石眼被照亮但面容完全平静。神像是纪念碑式的、被摧毁的秩序，不是受伤的人。上方保留一块相对干净的烟蓝天空。
```
**A** — English
```text
The colossal cold-ivory marble Pallas Athena occupies the right foreground, framed from the knees up, the burning city behind her. Three or four coarse ropes are already looped around the statue's neck and spear shaft, pulled taut by a few Greek soldiers at the lower left; the ropes are straight and the statue still stands upright. Firelight from behind and the side lights the stone, the stone eyes lit but the face entirely calm. The statue is a monumental order being destroyed, not a wounded person. Keep a relatively clean smoke-blue sky above.
```

**B 尾帧** — 中文
```text
同一机位、同一火光。神像已向镜头侧前方倾倒约三十度，绳索仍绷紧。颈部出现一道垂直的裂纹，头颅正在与身体分离，头盔与面部仍保持平静朝向前方。矛杆折断，小圆盾脱手。石屑和火星从颈部裂缝处飘出。面部不能有表情变化、不能眨眼、不能流血。背景火海不变。
```
**B** — English
```text
Same camera, same firelight. The statue has tilted about thirty degrees toward the camera's front-side, the ropes still taut. A vertical crack has opened at the neck; the head is separating from the body while helmet and face keep their calm forward gaze. The spear shaft breaks, the small round shield slips from the hand. Stone chips and sparks drift from the crack at the neck. The face must show no change of expression, no blink, no blood. The burning background is unchanged.
```

### S7｜断首落地，竖裂缝贯穿画面（08.5–09.2）

**A 首帧** — 中文
```text
极近景。巨大的大理石头颅正在坠向石板地面，额头、鼻梁与科林斯头盔几乎填满画面，地面在画面底部只占一条窄带。面容平静，冷象牙白石材上有火光的暖色反射与旧金箔痕迹。背景只有失焦的火光色块，不出现可辨认的建筑。上方保留一小块干净空间。
```
**A** — English
```text
Extreme close-up. The colossal marble head is falling toward the flagstone ground; forehead, bridge of the nose and Corinthian helmet nearly fill the frame, the ground only a narrow band at the bottom. The face is calm, the cold ivory stone carrying warm reflections of firelight and traces of old gold leaf. The background is only out-of-focus patches of fire color, no recognizable buildings. Keep a small clean space above.
```

**B 尾帧** — 中文
```text
同一机位。头颅已落在地面，没有爆炸和碎裂飞溅。从石像额心正中开始，一条完全垂直、居中的细裂缝向下贯穿整个画面直到底边，裂缝内部是极亮的冷白色，像一道静止的雷电。裂缝两侧的石材颗粒与地面石板清晰可见。除裂缝外全画没有其他亮部，火光只剩深暗的余温。这是全片竖线母题的第一次完整出现，裂缝必须是画面中唯一的一条直线，且严格位于画面水平中线上。
```
**B** — English
```text
Same camera. The head has landed on the ground, with no explosion and no flying fragments. From the exact center of the statue's forehead, one perfectly vertical, centered hairline crack runs down through the entire frame to the bottom edge; inside the crack is a very bright cold white, like a still bolt of lightning. Stone grain on both sides of the crack and the flagstones are clearly visible. Apart from the crack the picture has no other highlight; the firelight is only a deep dim afterglow. This is the first full appearance of the film's vertical-line motif: the crack must be the only straight line in the image and must sit exactly on the horizontal center of the frame.
```

### S8｜裂缝成为海平线 — 尾帧（09.2–10.0）

中文
```text
异常平静的清晨爱琴海。一条完全水平、笔直的海平线严格位于画面垂直中线上，与上一帧的竖裂缝成九十度对应。海面为深群青与深青，带细密的冷色晨光高光，像冷却后的石材颗粒；上方天空是平涂的、极干净的淡天青蓝，仍有两三颗即将消失的晨星。画面正中央的海平线上只有一艘很小的深色雪松木希腊长船，单桅、赭黄色方帆，小到只能辨认出轮廓。没有陆地、没有火、没有红色。这是新一天，也是漂流的开始。
```
English
```text
An unnaturally calm Aegean morning. One perfectly horizontal straight horizon line sits exactly on the vertical center of the frame, corresponding at ninety degrees to the vertical crack of the previous frame. The sea is deep ultramarine and deep teal with fine cool dawn highlights like cooled stone grain; above it the sky is a flat, extremely clean pale cerulean with two or three fading morning stars. On the horizon at the exact center of the frame is one very small dark-cedar Greek longship, single mast, worn ochre square sail, small enough that only its silhouette reads. No land, no fire, no red. This is a new day and the beginning of the drift.
```

## 5. 交付检查

- 13 张静帧均为 16:9、无文字、无画框、无暗角。
- 同一镜头 A/B：机位、焦距、光源方向一致，只发生描述中的那一个变化。
- 木马 / 城门 / 神像三条锁在跨帧中无漂移。
- S7-B 的裂缝严格垂直居中；S8-B 的海平线严格水平居中（网页 shader 依赖这两条线对齐）。
- 彩虹色差只允许出现在 S4-B 的火把轨迹；其余帧不出现。
- S8-B 的小船与 `01-sea-hub.md` 中的长船是同一艘。
