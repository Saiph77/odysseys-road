# 《归航 / NOSTOS》互动叙事完整脚本文稿

> 版本：V1.0（故事锁定稿）  
> 形式：桌面端优先的长滚动互动网页  
> 建议体验时长：14–18 分钟  
> 结构：序章 → 海上中枢选择 → 任意 Track → 海上中枢选择 → 任意未完成 Track → 海上中枢选择 → 最后一个 Track → 终章

> 当前用途：后续长版蓝图，不是第一版路演的制作基准。第一版以 [`ROADSHOW_60S_CUT.md`](ROADSHOW_60S_CUT.md) 的六章 60 秒结构为准。

---

## 一、创作锁定

### 核心命题

奥德修斯赢得了特洛伊，却在归途中逐渐失去舰队、同伴、身份和骄傲。真正的归乡，不是英雄凯旋，而是一个被剥去一切的人仍然选择回去。

### 核心旁白

每次回到海上中枢，都重复同一句话，但语气和画面逐渐改变：

> 海不会替人记住道路。  
> 海只记得每一次代价。

### 叙事原则

1. 三个 Track 可以由玩家任意选择体验顺序，也可以由三个开发单元并行制作；每个 Track 内部的三个 Episode 仍按固定顺序播放。
2. 每个 Track 从统一的海上中枢进入，最后回到同一个中枢状态。
3. Track 内的 Episode 使用专属转场；Track 之间不制作直接转场。
4. 交互用于让玩家“感受”奥德修斯的处境，不制造会改变主线的伪分支。
5. 所有标题、字幕和正文由网页 DOM 渲染，生成画面中不得包含文字。

### 原典与改编边界

主要事件的历史顺序取自《奥德赛》第 8–13 卷：木马回忆、莲食者、独眼巨人、风神、食人巨人、喀耳刻、冥界、塞壬、斯库拉与卡律布狄斯、太阳神牛群和雷击沉船。互动版本把航程表现为奥德修斯已经经历过、正在重新浮现的三股“记忆之流”，因此玩家选择的是回忆顺序，不是在神话时间线上重新决定事件顺序。

为了控制篇幅，本稿省略卡吕普索岛、瑙西卡、费埃克斯人送归、求婚者和重夺王宫等支线；终章将雅典娜求情、宙斯结束流放和奥德修斯抵达伊萨卡压缩为一次连续的神意转折。这是明确的艺术改编，不是对原典情节的逐字复述。

---

## 二、视觉世界观锁定

### 色彩

- 天青蓝：`#1D5FA8`
- 深海蓝：`#0A3152`
- 旧金：`#B58A3C`
- 大理石：`#E6D8BD`
- 牛血红：`#6D2E2B`
- 炭黑：`#15120F`
- 雷光白：`#F4EBD6`

### 奥德修斯角色锁定

- 约 42 岁的爱琴海男性。
- 橄榄色皮肤，瘦削但强健。
- 肩长、深褐色卷发，两鬓有少量灰发。
- 修短的卷须胡，左眉上方有一道浅疤。
- 风化的象牙白短袍、褪色牛血红披风、青铜猫头鹰胸针、深蓝黑腰绳。
- 眼神敏锐、疲惫，避免现代超级英雄式肌肉与姿态。

### 船只锁定

- 深色雪松木希腊长船。
- 单桅、方形赭黄色旧帆。
- 船首有红白相间的眼睛图案与小型青铜撞角。
- 绳索粗糙、船板有盐渍；损伤会随故事积累。

### 画面语言

- 宽幅新古典主义油画，人物姿态清晰、庄严、克制。
- 平涂、高饱和天青蓝天空；不使用现代电影式青橙调色。
- 白色大理石、旧金属、粗糙木材和织物具有可感知的物质纹理。
- 半色调圆点、同心信号环、纸张纤维和极少量彩虹故障作为数字时代痕迹。
- 每幅画只允许一个主要视觉奇观；其余区域保持秩序和留白。

---

## 三、完整剧本

## 00 序章：木马之夜 / THE HORSE

**建议时长：** 90–120 秒  
**叙事目标：** 让观众先见证奥德修斯最辉煌的胜利，再意识到这场胜利并没有给他带来归途。

### Beat 00.1：缪斯

画面全黑。先听见海浪，再听见木头在石地上缓慢摩擦。细小金色颗粒在黑暗中组成一条水平线。

屏幕文字：

> ΝΟΣΤΟΣ  
> 归航

旁白：

> 缪斯，请讲述那个历经万转之人。  
> 他用智慧结束了一场战争，却无法命令一阵风把他送回家。

交互：用户第一次滚动时，水平线变成特洛伊城门下的石缝。

### Beat 00.2：木马入城

巨大的木马从右侧缓慢进入。城中人群举着火把，木马腹部偶尔透出极弱的呼吸和金属反光。

旁白：

> 十年，希腊人的长矛未能穿过这道城墙。  
> 最后进入特洛伊的，不是一支军队，而是一个谎言。

交互：鼠标或头部轻微移动时，观看角度偏移，可短暂看见藏在木马内部的士兵。继续滚动，城门在用户面前合拢。

### Beat 00.3：胜利

黑暗被火光撕开。特洛伊燃烧，金色庆典碎屑与灰烬混在一起。所有人都在欢呼，只有奥德修斯站在城墙缺口处望向海面。

旁白：

> 当城门从内部打开，所有人都称他为英雄。  
> 只有他望着东方，想起一座更小的城、一间尚未熄灯的屋子。

屏幕文字：

> 胜利不是归途。

### Beat 00.4：出航

火焰被拉成长条，变成日出映在海面上的金光。十二艘船驶离岸边，特洛伊在远处逐渐沉入蓝雾。

旁白：

> 他带着十二艘船离开特洛伊。  
> 他相信海只是两块陆地之间的距离。

转场：特洛伊城墙沿不规则烧灼边缘向两侧裂开，后方显露海上中枢。

---

## 01 海上中枢：无名之海 / THE OPEN SEA

**建议时长：** 每次出现 20–35 秒  
**功能：** Track 的统一入口与出口；承担资源预加载、章节标题、船只损伤状态和情绪重置。

画面：船位于画面中央偏下，天空占据约三分之二。星点或云层组成下一 Track 的象征图形。海面始终保持同一地平线和镜头位置，只有天气、船体损伤和远方星座变化。

首次旁白：

> 海不会替人记住道路。  
> 海只记得每一次代价。

刚完成 Track 1 时的旁白：

> 海记住了他的名字。  
> 也把这个名字交给了愤怒的神。

刚完成 Track 2 时的旁白：

> 舰队已经消失。  
> 剩下的人继续把“活着”误认为“能够回家”。

刚完成 Track 3 时的旁白：

> 警告已经走到尽头。  
> 海上只剩结果，和最后一艘船。

交互：水平移动视角可以观察船体伤痕；进入选择仪式后，三股星座连线分别组成三个 Track 的空间入口。

### 海上中枢的 Track 选择仪式

第一次进入中枢时，旁白补充：

> 航程已经发生。  
> 但记忆从不按照海图归来。  
> 看向你想先记起的那一段。

海面上方浮现三块具有真实前后深度的网页画卷：

1. **智慧与傲慢**：莲花、独眼与风袋。
2. **诱惑与死亡**：石港、金杯与冥界石碑。
3. **歌声与牺牲**：音波、双崖与黑色太阳。

用户主动启用“凝视航向”后，摄像头只在本地估计头部方向。看向某块画卷时：

- 该画卷轻微前移、变清晰，金色边缘开始积累停留时间。
- 其余画卷后退并降低亮度，但水平位置保持不变。
- 三块画卷按照累计停留时间显示第一、第二、第三关注层级；排名只改变深度和亮度，不交换左右位置。
- 连续停留约 1.8 秒后，画卷进入“待确认”状态。
- 再持续凝视约 0.6 秒，画卷占据中央并自动进入对应 Track。
- 在确认完成前移开视线，选择立即取消。

摄像头被拒绝、无法识别人脸或用户选择关闭时，交互自动切换为鼠标、触摸和键盘；三种输入具有相同的视觉反馈。

每完成一个 Track，返回中枢时对应画卷会变成一块有裂痕的金色航海铭牌，并移入上方“已记起”区域。已完成 Track 不再参与主线停留排名，但可以在最终菜单中重看。

如果 Track 3 在 Track 2 之前被选择，Track 3 的开场使用“预言尚未被说出”版本；如果 Track 2 在 Track 3 之后被选择，冥界章节明确告诉用户：正在听见一条已经实现的预言。三条全部完成后，选择画卷消失，天空只剩一条垂直白线，直接进入终章。

---

## Track 1：智慧与傲慢 / CUNNING & PRIDE

**章节命题：** 智慧使奥德修斯一次次脱险，骄傲却让每次脱险都留下新的灾难。

章节开场旁白：

> 他最相信的武器不是剑，而是自己的头脑。  
> 但最锋利的武器，也会割伤握住它的人。

若该 Track 不是第一个被选择，在前面增加：

> 海把另一段记忆推回岸边。  
> 这一次，奥德修斯记起自己的名字如何成为诅咒。

### EP 1.1：莲食者之岛 / THE LOTUS EATERS

**建议时长：** 60–75 秒

#### 进入

海面变得平滑得不自然。白色石阶从水中升起，岛民安静地递出淡金与粉白色莲花。

旁白：

> 岛上没有敌人，没有牢门，也没有人要求他们留下。  
> 岛民只递来一朵花。

#### 诱惑

船员吃下莲花后放下武器。他们的脸仍然快乐，身后的姓名、家乡和亲人却逐字消失。

旁白：

> 他们没有忘记怎样呼吸。  
> 他们只是忘了为什么要回去。

交互：花朵跟随指针缓慢张开；滚动阻力逐渐增加。画面中的 DOM 文字开始缺失字符，只有“伊萨卡”保持完整。

#### 离开

用户按住或拖动“伊萨卡”细线，奥德修斯把船员逐个拖回船上。花田仍在身后安静摇动。

奥德修斯：

> 你可以忘记自己的名字。  
> 但在回到船上以前，我会替你记住。

结尾旁白：

> 第一次，他从幸福中救出了同伴。

专属转场：莲花花心不断放大，金色花粉变为黑暗中的瞳孔。

### EP 1.2：独眼巨人的洞穴 / NOBODY

**建议时长：** 80–100 秒

#### 洞穴

洞口被巨石封住。波吕斐摩斯占据画面中央，人物在他脚边只像小型雕塑。

旁白：

> 他们进入洞穴寻找食物。  
> 等主人回来，洞穴才显露出真正的用途。

#### 名字

巨人询问奥德修斯的名字。

波吕斐摩斯：

> 小东西，你叫什么？

奥德修斯：

> 无人。我的名字叫无人。

交互：巨眼随鼠标或头部位置移动。用户必须让羊群保持在巨人视野边缘，才能推动逃亡进度。

#### 逃生

烧红的木桩刺入巨眼，画面短暂变为反相白色。幸存者藏在羊腹下离开洞穴。

波吕斐摩斯：

> 无人伤害了我！

#### 骄傲

船已离岸。画面出现提示：“不要说出你的名字。”奥德修斯仍转身喊向海岸。

奥德修斯：

> 记住！刺瞎你的是伊萨卡之王——奥德修斯！

旁白：

> 他的计谋救了所有人。  
> 他的名字又把灾祸带回船上。

巨人向波塞冬祈祷，海面出现第一道黑色同心环。

专属转场：独眼的虹膜旋转，变成风神之袋上的圆形绳结。

### EP 1.3：风神之袋 / THE BAG OF WINDS

**建议时长：** 65–80 秒

#### 礼物

风神埃俄罗斯将所有逆风封入皮袋，只留下通往伊萨卡的顺风。

旁白：

> 风神把世上所有逆风装进一个袋子。  
> 他没有封住猜疑。

#### 故乡在望

远方山坡出现微弱灯火。奥德修斯连续掌舵九日，终于睡去。船员围住皮袋。

船员低语：

> 他从特洛伊带回的黄金，就藏在这里。  
> 难道我们只能带着空手回家？

交互：风袋位于真实 3D 深度中。鼠标靠近时绳结震动，袋面向外鼓起；用户无法阻止船员，只能看见故乡越来越近。

#### 逆风释放

绳结突然松开。所有文字、网格、星点和船只同时向远离伊萨卡的方向飞走。

旁白：

> 家已经近到能够看见炊烟。  
> 他们却败给了一根绳结。

Track 结尾：风暴清空所有内容，最后一艘船从高处跌回统一海上中枢。

---

## Track 2：诱惑与死亡 / DESIRE & DEATH

**章节命题：** 前方不再只有怪物；安逸、食物、爱和死去的人同样可以让旅程停止。

章节开场旁白：

> 有些危险张开牙齿。  
> 另一些危险摆好宴席，请你坐下。

若玩家已经完成 Track 3，在后面增加：

> 你已经看见预言如何实现。  
> 现在，记忆将带你去听见它第一次被说出。

### EP 2.1：食人巨人的港湾 / THE CLOSED HARBOR

**建议时长：** 55–70 秒

#### 安全港

十一艘船驶入高耸峡湾，只有奥德修斯的船停在入口外。水面没有波纹，两侧岩壁像白色大理石宫墙。

旁白：

> 他们寻找避风港。  
> 港口平静、狭窄，像一双等待合拢的手。

#### 袭击

拉斯特律戈涅斯巨人出现在崖顶。第一块巨石落下，平静水面突然充满断桅和尸体。

交互：滚动速度影响岩石落下的节奏；停止滚动时，画面静止，只保留水中扩散的涟漪。

旁白：

> 港口像怀抱一样合拢。  
> 原来那不是怀抱，是牙齿。

#### 逃离

奥德修斯砍断缆绳，唯一停在港口外的船冲向外海。身后的十一艘船消失在飞石之中。

屏幕文字：

> 十二艘船，只剩一艘。

专属转场：落石激起的圆形水纹收缩，成为一只金色酒杯的杯口。

### EP 2.2：喀耳刻的宫殿 / THE BEAUTIFUL CAGE

**建议时长：** 75–90 秒

#### 宴席

金色宫殿立在森林中。喀耳刻为船员斟酒，酒液泛着不自然的蓝色光泽。

旁白：

> 她没有举起武器。  
> 她只在酒里放进一种更古老的命令。

#### 变形

船员的古典人物轮廓逐渐变成野猪，但眼睛仍保留人的恐惧。

交互：人物通过 WebGL 噪声、纸张撕裂与形体交叉淡化发生变形。指针经过时，可在动物轮廓下看见原来的人形。

#### 对峙

赫尔墨斯赐予的草药让奥德修斯免受魔法。奥德修斯拔剑，喀耳刻却没有后退。

喀耳刻：

> 你抵抗得了魔药。  
> 但你抵抗得了休息吗？

#### 停留

四季在宫殿外迅速交替，宴席越来越华丽，远方伊萨卡航线越来越暗。

旁白：

> 有些牢笼没有门。  
> 它只让你不再想离开。

用户继续滚动，奥德修斯终于从宴席起身。喀耳刻告诉他：要找到回家的路，必须先向死者问路。

专属转场：杯中酒液变黑，溢出桌面并向屏幕下方渗透。

### EP 2.3：冥界问路 / THE HOUSE OF THE DEAD

**建议时长：** 90–110 秒

#### 下沉

船抵达没有太阳的海岸。黑色液体覆盖整个画面，人物和石碑从下方不同深度浮现。

旁白：

> 为了回到活人的家，他先走进死人的国度。

#### 三个声音

空间中出现三块石碑：母亲安提克勒娅、阿伽门农、先知特瑞西阿斯。

交互：鼠标或头部朝向决定当前靠近的石碑；滚轮只推进当前石碑内部的文字纹理。

母亲：

> 不是疾病带走了我。  
> 是等待你的年月。

阿伽门农：

> 战争中的胜利，并不能教会一个人怎样走进自己的家门。

特瑞西阿斯：

> 太阳神的牛不可触碰。  
> 若同伴违誓，你将独自归去——迟归、贫穷，并乘别人的船。

若 Track 3 已完成，旁白替换为：

> 这不是新的警告。  
> 这是已经发生的灾难，终于找到了最初说出它的声音。

#### 返回

奥德修斯试图拥抱母亲三次，每一次她都像烟一样从手臂间散开。

旁白：

> 活人向死人询问道路。  
> 死人没有告诉他方向，只告诉他代价。

Track 结尾：黑色墨水被海水从中央冲开，船回到统一海上中枢。

---

## Track 3：歌声与牺牲 / SONG & SACRIFICE

**章节命题：** 奥德修斯已经知道所有警告，但知道灾难并不意味着能够避开灾难。

章节开场旁白：

若 Track 2 已完成：

> 先知已经说出结局。  
> 他们仍然必须亲自走完通往结局的每一段海路。

若 Track 2 尚未完成：

> 结局早已被一个尚未出现的声音看见。  
> 他们还不知道警告的内容，却已经驶进了警告之中。

### EP 3.1：塞壬之歌 / THE SONG THAT KNOWS YOU

**建议时长：** 70–85 秒

#### 准备

船员把蜡塞入耳中，将奥德修斯绑在桅杆上。远处白色礁石像舞台帷幕一样打开。

旁白：

> 他命令所有人不要听。  
> 又命令他们让自己听见一切。

#### 歌声

塞壬没有直接出现，只以女性面孔、鸟翼和白色织物的局部形态在云与浪之间若隐若现。

塞壬：

> 奥德修斯，我们知道特洛伊城下发生的一切。  
> 靠近一些。没有人比我们更懂得你的名字。

交互：空间音频随指针或头部方向改变。用户偏离航线时，画面出现半色调、色差和水平撕裂；绳索会将镜头重新拉回桅杆。

#### 通过

奥德修斯挣扎着命令船员解开绳索，船员反而绑得更紧。歌声渐远，只剩绳索勒进皮肤的声音。

旁白：

> 他听见了世上最懂自己的声音。  
> 救他的，是无人回应。

专属转场：歌声波形逐渐实体化，变成相对而立的两面峭壁。

### EP 3.2：斯库拉与卡律布狄斯 / THE PRICE OF PASSAGE

**建议时长：** 80–95 秒

#### 两种死亡

左侧是吞噬整艘船的巨大漩涡，右侧峭壁上藏着六首怪物斯库拉。

特瑞西阿斯的回声：

> 不要寻找没有代价的航线。  
> 这里不存在那样的路。

#### 探视

交互：用户不能改变已经发生的航线。向左探头，漩涡的尺度、扭曲与低频变得清晰；向右探头，峭壁薄雾退开，斯库拉的六道阴影逐渐显现。船始终沿唯一叙事序列前进，头部、鼠标或键盘只改变视窗、显影与声音。

旁白：

> 有时智慧不是找到正确答案。  
> 只是决定承受哪一种失去。

#### 六个人

斯库拉抓走六名船员。每失去一人，界面中的一颗星、一道桨声和一个人物剪影永久熄灭。

奥德修斯：

> 我记得他们呼喊我的名字。  
> 我也记得自己没有回头。

专属转场：漩涡中心收缩成太阳神牛眼中的金色反光。

### EP 3.3：太阳神的牛 / THE FORBIDDEN HERD

**建议时长：** 75–90 秒

#### 禁令

金色牛群在极度安静的牧场中吃草。天空澄蓝，海面平静，这是全篇最温暖、最安逸的画面。

旁白：

> 他们终于来到一个没有怪物的岛。  
> 岛上只有一条禁令。

屏幕文字：

> 不要触碰太阳神的牛。

#### 饥饿

暴风将船困在岛上。食物耗尽，船员的身体逐渐消瘦。奥德修斯在远处祈祷后睡去。

交互：用户可以画出或拉起一条金色边界，但船员的影子从边界下方穿过；交互明确表现“你无法替别人守住誓言”。

#### 违誓

刀落下时不表现鲜血。画面中的金色牛群突然全部转头看向观众。被剥下的牛皮仍在地面爬行，烤肉发出类似人声的低鸣。

旁白：

> 他守住了誓言。  
> 饥饿的人没有。

#### 控诉

太阳神赫利俄斯的金色圆盘遮蔽天空。

赫利俄斯：

> 若这罪没有代价，我将把光带到死者的国度。

Track 结尾：太阳圆盘变为乌云后的雷光。船驶入最后一次海上中枢；此时只剩一船、残帆和极少数船员。

---

## 终章：不能完整地回去 / THE LAST SHIP

**建议时长：** 100–130 秒  
**叙事目标：** 完成“英雄 → 幸存者”的转化，让归乡成为失去一切之后仍然存在的微弱方向。

### Beat F.1：判决

天空完全失去颜色。所有船员听见雷声，却看不见闪电。海面上出现一道从天空延伸到船体中央的白色细线。

宙斯：

> 禁令已经说过。  
> 代价现在抵达。

### Beat F.2：船裂

雷电击中桅杆。时间冻结半秒，随后船体沿白色细线裂成两半。

视觉顺序：

1. 雷光白闪。
2. 船体左右位移。
3. 裂口出现烧灼、纤维和有序抖动边缘。
4. 画面发生运动模糊、半色调破碎和彩虹色差。
5. 船员声音全部消失。
6. 海水从裂口覆盖画面。

旁白：

> 十二艘船离开特洛伊。  
> 海上再没有第二个人回答他的名字。

### Beat F.3：漂流

黑暗中只看见奥德修斯抱住断桅。盔甲、王冠和披风逐一沉入水下；最后只留下破损白袍和左眉上的疤。

旁白：

> 当智慧、军队、身份和胜利都沉入海底，  
> 剩下的东西仍然朝着家乡漂去。

### Beat F.4：神意转折

云层高处出现雅典娜的银色眼睛或大理石侧影，但不表现完整神像。

雅典娜：

> 他已经付出舰队、同伴与十年的光阴。  
> 让流放结束吧。

宙斯：

> 我不归还他失去的东西。  
> 我只允许风记起伊萨卡的方向。

西风吹起。海水从炭黑变成深蓝，再变回全片开头的天青蓝。

### Beat F.5：伊萨卡

星点在黎明前连成岛屿山脊。断桅漂向岸边。远处山坡有一缕炊烟，窗口中隐约可见一名正在织布的女性剪影，但奥德修斯尚未走进家门。

旁白：

> 他离开特洛伊时，是一位胜利者。  
> 他回到伊萨卡时，只是一个活着的人。

最终屏幕文字：

> 家不是奖赏。  
> 家是失去一切以后，仍然没有消失的方向。

画面停留，海浪继续运动。用户最后一次滚动后，标题 `ΝΟΣΤΟΣ / 归航` 从水中缓慢浮现。

---

## 四、声音脚本原则

- 海上中枢始终使用同一组海浪底声，但每完成一个 Track 就减少一层桨声和船员环境声。
- 莲食者使用近乎无节奏的人声呼吸。
- 独眼巨人使用低频石壁震动，不采用怪兽吼叫素材堆叠。
- 风袋释放时先抽空低频，再以宽频风声瞬间占满声场。
- 冥界的人声应干燥、近距离，不加传统洞穴混响。
- 塞壬是全片唯一完整旋律；旋律结束后不可在其他章节复用。
- 雷击沉船后保持 2–3 秒近乎完全静音，让最终海浪重新出现。

---

## 五、生图提示词系统

### 使用方法

每张图使用以下组合：

```text
[MASTER STYLE LOCK]
+ [CHARACTER / OBJECT LOCKS]
+ [对应场景提示词]
+ [GLOBAL NEGATIVE PROMPT]
```

不要只使用单独的场景段。固定保留 Master、角色锁和 Negative，才能让所有章节保持同一世界观。

### MASTER STYLE LOCK

```text
A wide cinematic tableau painted as a single NEOCLASSICAL OIL PAINTING, smooth refined painterly rendering inspired by Jacques-Louis David and Jean-Auguste-Dominique Ingres, elegant idealized anatomy, disciplined monumental composition, restrained theatrical gestures, believable ancient Greek materials, subtle aged canvas texture. A flat saturated cerulean-blue sky or deep Aegean blue atmosphere, warm ivory marble, aged gold accents, oxblood-red cloth, charcoal-black shadows. Strong separation between foreground figures, middle-ground architecture or ship, and a generous uncluttered background area reserved for interface typography. Integrate sparse coarse black-and-white halftone dots, one controlled concentric signal motif, and at most one very small rainbow chromatic glitch accent. Painterly but clean, solemn, mythic, tactile, highly coherent, 16:9 landscape composition, no text inside the image.
```

### CHARACTER / OBJECT LOCKS

```text
Odysseus is always the same man: a 42-year-old lean and strong Aegean king with olive skin, shoulder-length dark brown curly hair with slight grey at the temples, a short curled beard, a straight prominent nose, a faint scar above the left eyebrow, intelligent exhausted eyes, a weathered ivory-white short chiton, a faded oxblood-red cloak fastened by a small bronze owl fibula, and a dark blue-black waist cord. He must look human, weathered and calculating, never like a modern superhero.

The ship is always the same dark cedar Greek longship with one mast, a worn square ochre sail, coarse ropes, salt-stained planks, a small bronze ram, and a painted red-and-white eye on the prow. Damage accumulates over the journey but the hull design never changes.

The crew are weathered Mediterranean sailors in varied off-white chitons with muted oxblood and ochre details, historically inspired silhouettes, no identical faces, no modern clothing or equipment.
```

### GLOBAL NEGATIVE PROMPT

```text
No text, no letters, no captions, no logo, no watermark, no frame, no modern objects, no modern ships, no Viking design, no Roman imperial armor, no medieval armor, no fantasy plate armor, no superhero anatomy, no photorealistic photography, no glossy 3D render, no anime, no comic-book style, no pixel art, no cross-stitch, no steampunk, no generic fantasy concept art, no teal-and-orange cinematic grading, no excessive lens flare, no gradient sky, no vignette, no random rainbow effects, no crowded composition, no extra limbs, no duplicated people, no inconsistent Odysseus costume, no changing ship design.
```

---

## 六、章节与 Episode 场景提示词

以下每条均接在 Master 与 Locks 后使用。

### Prompt 00：序章《木马之夜》

```text
Night at the fall of Troy, a colossal wooden horse entering through monumental pale-stone city gates from the right, torch-bearing Trojan citizens pulling it with ropes, tiny slits in the wooden belly revealing only subtle bronze reflections and human breath, burning Troy beginning in the far background, Odysseus standing apart at a broken wall and looking toward a narrow strip of dark sea. Celebration and ash share the same air. The wooden horse is the dominant object, Odysseus is secondary but clearly recognizable. Reserve a broad clean dark-blue upper-left sky for interface typography. One tiny rainbow smear appears only on a bronze edge of the horse.
```

### Prompt 01：海上中枢《无名之海》

```text
The recurring open-sea hub at dawn, the same dark cedar Greek longship centered low in frame, sailing on a vast calm Aegean sea beneath an enormous flat cerulean sky, a thin ivory horizon, sparse halftone clouds, faint constellation-like white points suggesting three possible currents in the sky, Odysseus alone near the mast looking forward. Monumental negative space, restrained motion, the ship small against the sea, calm but never safe. Keep the upper-left and center sky especially clean for chapter titles.
```

### Prompt 01B：海上中枢《三股记忆之流》选择画面

```text
Above the recurring calm Aegean sea and the same small dark cedar longship, three monumental floating ivory-marble picture tablets hang at stable left, center and right positions with believable independent depth. The left tablet carries only painted symbols of a pale lotus, a single black eye and a tied leather wind bag. The center tablet carries only a closing stone harbor, a gold cup and three dark funerary stelae. The right tablet carries only a pale musical waveform, two opposing cliffs and a darkened golden sun. Thin constellation lines connect each tablet to a different current in the sea. The tablets contain no words and no letters. The center tablet is slightly nearer and brighter as an example of visual attention, surrounded by a restrained incomplete gold dwell ring. Vast clean cerulean sky, solemn selection ritual, not a game menu, no holographic science-fiction interface.
```

### Prompt T1：Track 1《智慧与傲慢》章节封面

```text
Odysseus in three-quarter profile on the ship holding a short wooden navigation staff like a strategist, behind him three symbolic forms align across the cerulean sky: a pale lotus blossom, a colossal single black eye, and a tied bronze-brown leather wind bag. A thin concentric halftone signal travels from the eye toward the ship, foreshadowing Poseidon's curse. The composition feels intelligent, controlled and slightly arrogant, with generous open sky at upper left.
```

### Prompt 1.1：莲食者之岛

```text
A tranquil island of pale marble steps rising directly from glass-like blue water, silent lotus eaters in flowing ivory garments offering luminous pale-gold and blush-white lotus flowers to exhausted Greek sailors, several sailors smiling as their weapons and oars slip from their hands. Odysseus stands at the right pulling one sailor back toward the dark cedar ship with a taut dark-blue rope. The beauty must feel soothing rather than overtly sinister. Lotus pollen forms sparse halftone dots in the air, with a large clean cerulean area in the upper left.
```

### Prompt 1.2：独眼巨人的洞穴

```text
Inside a monumental limestone cave, the giant Cyclops Polyphemus dominates the center as a massive rugged pastoral figure with one enormous eye, while Odysseus and his surviving sailors appear tiny beneath hanging sheep and rough stone shelves. Odysseus holds a long olive-wood stake whose tip glows red, but the image captures the tense instant before the strike. Sheep create a path toward the cave entrance, a narrow wedge of cerulean daylight. The giant's eye contains one controlled concentric halftone ring; no gore, no exaggerated horror aesthetic.
```

### Prompt 1.3：风神之袋

```text
Night aboard the same Greek longship, the mountainous silhouette and tiny warm household lights of Ithaca visible very close on the horizon, Odysseus asleep from exhaustion beside the steering oar, suspicious sailors gathered around a large tied weathered leather bag that bulges with impossible wind. The knot is the exact visual center, ropes lifting before they open, cloaks and sail beginning to pull backward. The scene holds the tragic instant just before release, with the homeland clearly visible but unreachable. Wind pressure appears as sparse curved halftone bands.
```

### Prompt T2：Track 2《诱惑与死亡》章节封面

```text
Odysseus standing between a welcoming golden banquet table and a black descending doorway to the underworld, while colossal pale harbor cliffs close behind him like stone jaws. A gold cup, a dark cypress branch and three distant funeral stelae form a precise symbolic triangle. The mood is seductive, grave and still, with ivory, aged gold and charcoal black held against the same cerulean world.
```

### Prompt 2.1：食人巨人的港湾

```text
A deceptively calm narrow harbor enclosed by colossal vertical ivory cliffs, eleven Greek longships trapped inside while the same ship of Odysseus remains just outside the entrance. Enormous Laestrygonian silhouettes appear along the cliff tops and lift white boulders, one boulder frozen in mid-fall above the water. Odysseus cuts the mooring rope on the surviving ship. The scale difference must feel terrifying and architectural, the water unnaturally smooth, with a clean blue opening toward the sea.
```

### Prompt 2.2：喀耳刻的宫殿

```text
Inside Circe's golden woodland palace, an elegant powerful sorceress in an ivory peplos and muted gold mantle stands behind a long banquet table, calmly pouring blue-glowing wine. Greek sailors transform into boars through overlapping painterly human and animal silhouettes, their human eyes still visible. Odysseus stands at left with a drawn bronze sword and a small luminous moly herb in his other hand. The room is luxurious, balanced and inviting rather than dark, a beautiful cage, with one small rainbow chromatic fracture only inside the wine.
```

### Prompt 2.3：冥界问路

```text
The shore of the underworld beneath a sunless charcoal sky, black water reflecting no light, Odysseus kneeling beside a ritual trench while three pale human presences emerge at different depths: his grieving mother Anticlea, the armored shade of Agamemnon, and the blind prophet Tiresias holding a dark staff. Tall ivory funerary stelae float like pages in space, their surfaces blank for later interface text. Odysseus reaches toward his mother but his arms pass through translucent smoke. Sparse white halftone particles drift upward like reversed ash.
```

### Prompt T3：Track 3《歌声与牺牲》章节封面

```text
The damaged Greek longship crossing a narrow mythic sea route, a pale musical waveform on the left, two opposing cliffs in the center, and a distant herd of luminous golden cattle beneath a darkening sun on the right. Odysseus is bound upright to the mast, already understanding the cost ahead. Six small white stars hover above six crew silhouettes as a visual count. The composition is prophetic, severe and inevitable.
```

### Prompt 3.1：塞壬之歌

```text
Odysseus bound tightly to the mast of the same longship, body straining toward distant white reefs while his crew row with pale wax sealing their ears. The Sirens are never fully shown: fragments of serene female faces, white bird wings and flowing ivory cloth emerge from clouds and sea spray as one ambiguous apparition. Curved musical lines and coarse halftone rings bend around the ship, while the ropes remain sharply detailed and real. The seductive space lies to the right; reserve the upper-left sky for interface typography.
```

### Prompt 3.2：斯库拉与卡律布狄斯

```text
The same damaged longship follows one fixed central course through a narrow channel, with a colossal spiral whirlpool occupying the outer-left third and a vertical white cliff occupying the outer-right third, where six long shadowed necks of Scylla descend toward exactly six sailors. Odysseus grips the steering oar and looks toward the men he knows he cannot save. Compose both dangers in the same 16:9 master image, keep the ship and all irreversible action inside the central safe area, and leave controlled visual breathing room near both horizontal edges for subtle viewport peeking. The moral geometry must remain legible under a small left or right crop: total destruction on one side, six individual losses on the other. Six small stars above the crew are beginning to extinguish, no gore, no chaotic fantasy-monster clutter.
```

### Prompt 3.3：太阳神的牛

```text
A perfectly calm sacred island in warm late-afternoon light, a herd of magnificent golden-white cattle grazing among pale grasses beside a flat cerulean sea. In the foreground hungry exhausted sailors cross beneath a thin golden boundary rope while Odysseus sleeps far away near a dark cypress tree after prayer. Every cow has turned its head toward the viewer at the same moment. A vast golden solar disc begins to darken behind them, beauty and violation held in one still composition, no blood.
```

### Prompt F：终章《最后一艘船》

```text
The exact instant a blinding vertical thunderbolt strikes the mast of the final damaged Greek longship in a charcoal storm, splitting the cedar hull into two separating halves along a bright irregular seam. Odysseus is thrown toward the broken mast while the remaining crew become small silhouettes swallowed by white spray. Torn wood fibres, ash-like dither and one restrained rainbow chromatic split appear only along the lightning seam. Above the storm, a subtle colossal marble profile of Athena is barely visible in the clouds. Far beyond the black sea, an almost invisible thin cerulean dawn suggests Ithaca. Monumental, tragic, clean and painterly, no gore.
```

### Prompt F2：终章尾帧《伊萨卡》

```text
Quiet dawn after the storm, Odysseus alone and exhausted clinging to a broken cedar mast as gentle waves carry him toward the rocky shore of Ithaca. He has lost his cloak, weapons and ornaments, wearing only a torn ivory chiton and the dark waist cord, but his face and left-eyebrow scar remain unmistakable. A thin column of household smoke rises from a distant olive-covered hill; through one tiny warm window, the restrained silhouette of a woman at a loom can barely be seen. The sky returns to flat saturated cerulean blue, sparse stars form the island ridge, immense peaceful negative space, no triumphant pose.
```

---

## 七、每个 Track 的交付契约

每个并行开发单元最终必须提供：

1. 一个 Track 章节封面。
2. 三个 Episode 的关键画面和文字稿。
3. 两个 Episode 间的专属转场，共两段。
4. 一个从 `SEA_NEUTRAL` 进入 Track 的入口状态。
5. 一个返回 `SEA_NEUTRAL` 的出口状态。
6. 桌面与移动端各自的素材清单。
7. 音频 stem：环境、人物、事件、音乐四类。
8. 所有素材均不得内嵌标题和字幕。

统一海上中枢、Track 选择仪式、序章和终章由主线团队维护。Track 团队不能修改海上中枢的镜头、船只基础模型、凝视选择协议和全局角色设定，只能通过状态参数增加天气、损伤、星座标记和完成后的航海铭牌。

---

## 八、原典核对入口

- 木马回忆：《奥德赛》第八卷  
  https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0136:book=8
- 莲食者与独眼巨人：《奥德赛》第九卷  
  https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0136:book=9
- 风神、食人巨人、喀耳刻：《奥德赛》第十卷  
  https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0136:book=10
- 冥界：《奥德赛》第十一卷  
  https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0136:book=11
- 塞壬、斯库拉与卡律布狄斯、太阳神牛群及沉船：《奥德赛》第十二卷  
  https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0136:book=12
- 漂流与归抵伊萨卡的原典背景：《奥德赛》第五卷、第十三卷  
  https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0136:book=5  
  https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0136:book=13
