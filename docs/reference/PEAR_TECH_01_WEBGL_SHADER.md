# 分册 01 · WebGL 宿主与 GLSL 转场效果库

> 源码：`references/pear-no/src/components/HeroCanvas.jsx`（354 行）、`src/glsl/hero_main_fragment.glsl`（949 行）、`src/glsl/hero_vertex.glsl`、`src/components/FooterTransitionCanvas.jsx`、`src/glsl/transition_fragment.glsl`（55 行）。
> 本册已完整阅读：HeroCanvas.jsx 全文、GLSL 1–668 行（辅助函数、5 种 mode、ring 快速路径、tear/smear、dither/halftone 后处理、burn）、668–760 行（coda/paper）、transition_fragment.glsl 全文。**未逐行读**：GLSL 760–949 行（plate 窗口、rays 光线、end 收尾、scrim），仅按作者注释索引记录用途。

## 1. WebGL 宿主最小骨架（`HeroCanvas.jsx`）

### 1.1 上下文与全屏三角形

```js
// HeroCanvas.jsx:53
const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });
// :91-96  单个覆盖全屏的大三角形（比两个三角的 quad 少一条对角线接缝）
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
// :339
gl.drawArrays(gl.TRIANGLES, 0, 3);
```

顶点着色器只做 `vUv = aPos*0.5+0.5`（`hero_vertex.glsl`，6 行）。

### 1.2 纹理单元固定分配

```js
// HeroCanvas.jsx:100-113
for (let unit = 0; unit < 6; unit += 1) {            // 6 个单元，先填 1×1 深色占位像素
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([11, 10, 9, 255]));
}
['uA', 'uB', 'uC', 'uE', 'uG', 'uP'].forEach((name, unit) => gl.uniform1i(gl.getUniformLocation(program, name), unit));
```

| 单元 | sampler | 内容 | 上传时机 |
| --- | --- | --- | --- |
| 0 | `uA` | hero 视频 / poster | `presentedFrames` 变化时（:220） |
| 1 | `uB` | model 序列帧（bridge 121 + renaissance 362） | 帧对象变化时（:229） |
| 2 | `uC` | plate 静态图 | onload 一次（:140） |
| 3 | `uE` | coda 序列（89 帧） | codaProgress>0（:234） |
| 4 | `uG` | tree 序列（121 帧） | road≥2100（:255） |
| 5 | `uP` | plan 序列（121 帧） | road≥2100（:243） |

上传函数区分首次 `texImage2D` 与同尺寸 `texSubImage2D`（:115-130），并顺带写入 `uResX` 分辔率 uniform。占位像素保证 Shader 在资源未到时采样到的是暗色而非未定义。

### 1.3 progress → uniform 的分段映射（可作为"章节 → 参数表"范式）

```js
// HeroCanvas.jsx:203-215
const p = clamp(stateRef.current.scrollProgress);
const modelProgress   = clamp(p / ROAD.model);
const panProgress     = clamp((p - ROAD.model) / ROAD.pan);
const codaProgress    = clamp((p - ROAD.model - ROAD.pan) / ROAD.coda);
const paperProgress   = clamp((p - ROAD.model - ROAD.pan - ROAD.coda) / ROAD.paper);
// 章节内再切子段
const intro        = smooth(clamp(modelProgress / 0.04));                       // 前 4%：视频→序列 转场
const reelProgress = clamp((modelProgress - 0.04) / (0.76 - 0.04));             // 4%~76%：播序列帧
const burn         = clamp((modelProgress - 0.775) / 0.14);                     // 77.5%~91.5%：烧穿到 plate
const treatment    = Math.max(Math.sin(Math.PI * clamp((intro - 0.4) / 0.6)),
                              burn > 0 && burn < 1 ? Math.sin(Math.PI * burn) : 0);   // 钟形，转场中段最强
```

之后 :274-334 把这些标量写入 ~60 个 uniform。**关键模式**：
- 每个效果的强度都是 `常量 × smooth(clamp((x - start)/len))` 形式，如 `uSplit = 0.05*smooth(clamp(burn/0.58))`、`uSeam = 0.85*smooth(burn/0.55)*(1-smooth((burn-0.55)/0.4))`（钟形窗口）。
- 视频在 `intro>=0.999` 时 `pause()`，回滚时 `play()`（:224-225）——视频只在需要时解码。
- `prefers-reduced-motion` 时 `baseZoom = 1`（:264）。

### 1.4 cover-fit 与 pan 的 JS/GLSL 一致性（**头部探视章节要用**）

JS 侧（:260-272）计算手机竖屏下允许的平移像素：

```js
const canvasAspect = canvas.width / canvas.height, imageAspect = sourceWidth / sourceHeight;
const positionX = clamp(film.pos[positionTier] + stateRef.current.maskPosX - 0.5);  // 0..1 取景锚点
let panPx = 0;
if (canvasAspect < imageAspect) {                    // 画布比素材"瘦"：按高 fit，两侧有裁切余量
  const cropSlack = 1 - canvasAspect / imageAspect / Math.max(0.1, effectiveZoom);
  panPx = cropSlack * (positionX - 0.5) * canvas.width * (imageAspect / canvasAspect);
}
```

GLSL 侧（`hero_main_fragment.glsl:132-157`）：

```glsl
vec2 coverFit(vec2 uv, vec2 tex, float panPx, float zoom){
  float ca = uRes.x/uRes.y, ia = tex.x/tex.y;
  if (ca > ia) {                                   // 画布更宽：按宽 fit，上下裁
    uv.y = (uv.y-0.5)*(ia/ca)/zoom+0.5;
    uv.x = (uv.x-0.5)/zoom+0.5;
    uv.x += panPx / uRes.x;
    uv.y += (uPanY / uRes.y) * (ia/ca);
  } else {                                         // 画布更高：按高 fit，左右裁
    float k = (ca/ia)/zoom;
    uv.x = (uv.x-0.5)*k+0.5;
    uv.y = (uv.y-0.5)/zoom+0.5;
    float slack = max(0.0, (1.0 - k) * 0.5);       // 只允许在裁切余量内平移，否则采到边缘黑
    uv.x += clamp((panPx / uRes.x) * (ca/ia), -slack, slack);
    uv.y += uPanY / uRes.y;
  }
  return uv;
}
// :166-176 逆函数：素材帧坐标 → 屏幕坐标（用来把 ring 圆心钉在画面某点）
vec2 uncover(vec2 t, vec2 tex){ ... }
```

**对《归航》斯库拉章的意义**：`docs/HEAD_COUPLED_PEEK_TECHNICAL_DESIGN.md` 的"单序列 UV 偏移"正是这套数学——把 `panPx` 的来源从 `maskPosX` 换成头部 `head.x`，`uPanY` 换成 `head.y`，并保持 `slack` 夹取即可。`uncover()` 则用于把"命运接管"时的注意力焦点钉到画面内某个物体。

### 1.5 resize / DPR / 清理

- `dpr = min(devicePixelRatio, isMobile ? 1.5 : 2)`（:180）。
- 卸载时 `deleteProgram / deleteBuffer / deleteTexture` + `video.pause()`（:343-350）。没有处理 `webglcontextlost`——迁移时补。

## 2. GLSL 辅助函数库（`hero_main_fragment.glsl:75-127`）

可直接复用的无依赖工具：

```glsl
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
float bayer2(vec2 a){ a = floor(a); return fract(a.x/2.0 + a.y*a.y*0.75); }      // 2×2 有序抖动
float bayer4(vec2 a){ return bayer2(0.5*a)*0.25 + bayer2(a); }                    // 递归成 4×4
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<4;i++){ v += a*vnoise(p); p *= 2.03; a *= 0.5; } return v / 0.9375; }
#ifdef PHONE   // 手机上纹理类 fbm 只跑 2 个八度（:87-99），"决定运动"的场仍用 4 个
float fbmQ(vec2 p){ ... 2 octaves ... }
#else
float fbmQ(vec2 p){ return fbm(p); }
#endif
```

**5×5 位图字形**（:101-127）：10 个字符 `' ' . : - + = * % # @` 按墨量排序，每字形 5 行 5-bit 整数；`glyph(i, p)` 用 `mod(floor(r/exp2(x)),2)` 取位。用于 ASCII 化效果，无纹理图集。若《归航》需要"文字/符文侵蚀"效果可替换字形表。

## 3. 转场效果库（`uMode` 0–5，:196-320）

所有 mode 都是 `col = mix(A(uv'), B(uv''), m)`，差别在 **UV 位移函数** 和 **混合掩码 m** 的生成。`t = uT ∈ [0,1]`。

| mode | 名称（作者注释） | 掩码 m | UV 位移 | 摘要 |
| --- | --- | --- | --- | --- |
| 0 | breathe | 中心圆 `1-smoothstep(t*1.05-0.30, t*1.05, dist)` | 内层 `uv + cv*(lens-1)` 放大，外层 `uv - cv*(lens*0.5+t*0.2)` 收缩 | 一层吸气一层呼气 |
| 1 | slabs | `step(0, 1-(uv.x+t))` 直线扫过 | 5 条竖带按 `step(0.2k ∓ vert, uv.x)` 累加 `±0.3t` 剪切 | 阶梯式错位 |
| 2 | halftone | 圆点半径 `r=cov*1.55`，`cov = t*1.6-0.3+(fbm-0.5)*0.55` | 无 | 点阵从云状前沿长出直到融合 |
| 3 | warp | `smoothstep(n-0.1, n+0.1, t*1.25-0.12)`，n=fbm | 两层沿同一噪声场反向位移 `±d*0.22` | 接缝永不是直线 |
| 4 | static wave | 对角线距离场 + fbm 扰动 | 行撕裂、双八度块化、RGB 分离、ASCII | 见 §3.1 |
| 5 | ring（uMode2 叠加 treatment） | 从 `uncover(uOrigin)` 出发的环 | 同上 + 角向谐波 | 见 §3.2 |

### 3.1 mode 4 "信号故障波"完整拆解（:250-319）

```glsl
float ar = uRes.x/uRes.y;
float d  = ((1.0 - uv.x)*ar + uv.y) / (ar + 1.0);            // 到右下角的 45° 距离（宽高比校正）
d += (fbm(uv*2.4 + vec2(uTime*0.03, 0.0)) - 0.5)*0.17;       // 慢噪声让前沿不像直尺
float W    = 0.34;                                           // 前沿半宽
float ph   = d - (t*(1.0 + 2.0*W) - W);                      // t∈[0,1] 时前沿从画外到画外
float pass = smoothstep(W, -W, ph);                          // 0 = 前方（A），1 = 后方（B）
float band = clamp(1.0 - abs(ph)/W, 0.0, 1.0);  band = band*band*(3.0-2.0*band)*uHeat;   // 只在波峰附近
float fld = fbm(uv*3.4 + vec2(uTime*0.06, uTime*0.31));
float brk = smoothstep(0.63 - band*0.26, 0.80 - band*0.18, fld) * band;   // 波峰内只有部分斑块真正"坏掉"
// 1 行撕裂（7px 行，15Hz 时钟，量化到 1/7 步）
float row = floor(uv.y*uRes.y/7.0);
float rj  = floor((hash(vec2(row, floor(uTime*15.0))) - 0.5)*7.0)/7.0;
vec2 tuv = uv + vec2(rj*0.22*brk, 0.0);
// 2 双八度马赛克（uBlk=11px 与 0.28 倍细块按 5Hz 互换）
float fine = step(0.24, hash(floor(uv*15.0) + floor(uTime*5.0)));
float cs   = mix(uBlk, uBlk*0.28, fine);
vec2  blk = floor(tuv*uRes/cs);  vec2 suv = (blk + 0.5)*cs/uRes;
vec2  puv = mix(tuv, suv, brk);
// 3 每块在自己的随机时刻交接 → 锯齿边
float h = hash(blk);  float m = smoothstep(h*0.55, h*0.55 + 0.45, pass);
vec3 c = mix(A(puv), B(puv), m);
// 4 RGB 通道分离 11px*brk
float o = (11.0*brk)/uRes.x;
c.r = mix(A(puv + vec2(o,0)), B(puv + vec2(o,0)), m).r;
c.b = mix(A(puv - vec2(o,0)), B(puv - vec2(o,0)), m).b;
// 5 ASCII 拓印：每 uAsc=9px 格读底图亮度 → 挑字形
vec2 gp = floor(uv*uRes/uAsc);  vec2 gc = (gp + 0.5)*uAsc/uRes;
float lum = dot(mix(A(gc), B(gc), gm), vec3(0.299, 0.587, 0.114));
float ink = glyph(floor(lum*9.99), fract(uv*uRes/uAsc) - 0.5);
vec3 ascii = mix(gcol*0.14 + 0.02, gcol*1.5 + 0.06, ink);
ascii = mix(ascii, vec3(hash(floor(uv*uRes) + floor(uTime*26.0))), 0.10*brk);   // 雪花
col = mix(c, ascii, smoothstep(0.55, 0.95, brk));               // 只有最"热"的地方变成字
```

**《归航》改造思路**：把"信号故障"换成"海浪/风暴"语义——保留 `d`（前沿距离场）+ `pass/band/brk` 三层掩码结构，把行撕裂改为水平拖尾、把 ASCII 换成油画笔触/裂纹纹理采样，RGB 分离保留可做"水下折射"。

### 3.2 mode 5 ring：以画面某点为圆心的同结构（:320-540）

- 圆心 `org = uncover(uOrigin, uResA)`，`uOrigin` 来自 `films.js` 每部影片的 `origin`。
- `reach` = 圆心到四角最远距离，`r = length(p)/reach` 归一化，保证 t=1 时环一定扫完全帧（:326-333）。
- 前沿加两组角向谐波 `wob = (fbm(ang*1.9, uTime*0.20)-0.5) + (fbm(ang*5.3, uTime*0.38)-0.5)*0.55`，让环呈"叶瓣状"而非圆（:417-420）。
- **性能快速路径**（:365-395）：因为 `wob*0.30 ∈ ±0.24`，`r > t*1.6+0.26` 必在前沿之外、`r < t*1.6-0.86` 必在其后，这两片区域跳过全部谐波/撕裂/字形计算，只做 `mix(A,B,step(...))` + 位移。**这是"证明边界然后分支"的通用优化方法。**
- `uMode2`/`uT2` 叠加的 treatment（:337-363）：slabs 剪切、fbm 扭曲、块撕裂（粗/细）、列滑移、马赛克（cell 2→30px）、Bayer 有序抖动色阶（`lv = mix(24,3,uT2)`）、半色调色彩通道。`treatment` 在 JS 侧是钟形曲线，所以效果"来了又走"。
- 后段 tear/smear（:452-515）：
  - `uSplit`：以 `uBurnX` 为轴，`side = smoothstep(-uSeamSoft, uSeamSoft, uv.x-uBurnX)*2-1` 让两半反向分开（注释说明用 smoothstep 代替 sign 是为了消除中线 1px 硬边）。
  - `uReelZ`/`uDrift`：绕撕裂点（非画面中心）推近，模拟"跌入缝隙"。
  - `uSpin`：绕同一点旋转，宽高比校正后旋转再还原。
  - `uMBlur`：沿分离方向 5 tap 方向模糊，`o2 = mb*((k-2)*0.25)`。
  - `uEdgeBl`：径向 3 tap 边缘柔化。

### 3.3 The Burn：噪声弯曲的擦除 + 碳化 + 余烬（:579-666）

```glsl
vec2 pix = floor(gl_FragCoord.xy / 2.0);  vec2 quv = (pix*2.0 + 1.0)/uRes;   // 掩码场按 2px 格采样，图像仍全分辨率
float big  = fbm(nuv*0.9 - uTime*0.0087)*2.0 - 1.0;                          // 大叶瓣
float fine = (vnoise(quv*asp*90.0) - 0.5) * mix(0.3, 0.6, 0.5+0.5*sin(uTime - quv.x*10.0));
float ord  = bayer4(pix) - 0.5;  float rnd = hash(pix + 37.0) - 0.5;
vec2 d = vec2((quv.x - uBurnX)*uBurnAB.x, (quv.y - uBurnY)*uBurnAB.y);      // 各向异性距离
float th = (uShape==1) ? max(|d|) : (uShape==2) ? |d.x|+|d.y| : (uShape==3) ? L4 范数 : length(d);  // 方/菱/超椭圆/椭圆
th += big*uBurnFld.x + fine*uBurnFld.y + ord*uBurnFld.z + rnd*uBurnFld.w;    // 四种扰动权重 (0.295,0.125,0.052,0.15)
float edge  = mix(uBurnE.x, uBurnE.y, uBurn) - th;                            // uBurnE=(-0.16,1.3) 两端留余量
float blend = smoothstep(-AAW(edge), AAW(edge), edge);
// 碳化：进入带内深度 → 变暗、斑驳、抖动成点刻
float charT = clamp(-edge / uBurnChr.y, 0.0, 1.0);
vec3 tint   = mix(vec3(0.72,0.55,0.40), vec3(0.14,0.10,0.09), charT*mix(0.65,1.0,mottle));
col = mix(col, col*tint + ..., charAmt);
col = mix(col, nxt, blend);                                                   // 露出 plate
// 余烬：切口两侧薄带过曝
float glow = smoothstep(0.0, uBurnChr.z, abs(edge));
vec3 hot = col*mult + vec3(1.0,0.62,0.26)*(1.0-glow)*0.55;
col = mix(col, hot, 1.0 - glow);
```

**通用价值**：这是一个参数化的"距离场阈值擦除"模板——`th(形状) + Σ 噪声扰动 → edge → smoothstep`。《归航》"雷击沉船"可用同一模板，把 tint 换成闪电白/海水蓝、`uShape` 用菱形或射线。

### 3.4 Coda / Paper 纸张材质（:668-745）

`uFlat` 驱动一张程序化"纸"：`pulp`(fbmQ×1.7) 决定冷暖、`fibA/fibB` 两个方向的纤维（频率 24×2.1 与 2.8×38）、`tooth` 逐像素 hash 颗粒、`fleck` 稀疏深色杂点（`smoothstep(0.981,1,hash)`）。颜色 `uPaperC=(226,208,177)/255`。作者注释强调"所有质感随 uFlat 一起到达，不能先出现平色再叠纹理"——即**避免二次出现的瞬间**。这对油画/羊皮纸风格直接可用。

### 3.5 未逐行阅读的段落（按注释索引，:745-949）

| 行 | 内容 | 用途 |
| --- | --- | --- |
| 745-826 | THE PLATE：plan 序列在纸上的窗口，从满屏缩回到页边，`uPlan.x` 控制退回，"从中间浸开"的环形软边 | 图片嵌入纸张 |
| 826-852 | 光线 rays（`uRay1/uRay2`），"某物在纸与太阳之间移动" | 氛围 |
| 853-940 | THE CLOSE：`uEnd` 驱动第二次 burn 揭示 tree 序列，带 scorch 带、stipple、背景运动 | 章节收尾 |
| 942-949 | renaissance scrim `uScrim`：原本是 DOM 全屏遮罩，被"烘进" Shader | 降低 DOM 层数 |

以及 :541-558 后处理：有序抖动色阶（`floor(col*lv + bayer4)/lv`）与半色调（按亮度调点径），均只在 `uT2>0.001` 时执行。

### 3.6 早退优化

`if (uCoda < 0.999 && uBurn < 0.999) { ...全部转场... }`（:188-196）：当后续章节完全覆盖时整段跳过；`if (uBurn >= 0.999) { col = nxt; } else {...}`（:604-606）；`eDone` 预判 close 前沿已过则跳过 paper 链（:672-699）。**原则：每个阶段的"饱和"都要有一条 bit-for-bit 等价的短路。**

## 4. 页脚小型转场 Shader（`transition_fragment.glsl`，全文 55 行）

独立、通用、可直接搬走的"两纹理转场"：

```glsl
uniform sampler2D t1, t2;
uniform float progress, grade, scaleB, mode, radius, width, intensity, time;
uniform vec2 res, img;
vec2 cover(vec2 uv){ float ca = res.x/res.y, ia = img.x/img.y;
  if (ca > ia) uv.y = (uv.y-0.5)*(ia/ca)+0.5; else uv.x = (uv.x-0.5)*(ca/ia)+0.5; return uv; }
vec3 lift(vec3 c){ float l = dot(c, vec3(0.2126,0.7152,0.0722)); return clamp(vec3(l) + (c-vec3(l))*grade, 0.0, 1.0); }  // 饱和度/对比"分级"
float hnoise(vec2 x){ ... value noise ... }
void main(){
  vec2 p = cover(vUv);  vec2 pB = (p-0.5)/scaleB + 0.5;   // B 稍微放大 1.018 消边
  if (mode < 0.5) {        // 0 圆形扩散 + 噪声边 + 两层反向缩放
    float n = hnoise(p*res/220.0 + time*0.06);  float pr = progress*0.66 + n*0.04;
    float circ = 1.0 - smoothstep(-width, 0.0, radius*distance(vec2(0.5,0.47)*asp, p*asp) - pr*(1.+width));
    A = texture2D(t1, (p-0.5)*(1.0-k)+0.5).rgb;  B = lift(texture2D(t2, (pB-0.5)*k+0.5).rgb);
    gl_FragColor = vec4(mix(A,B,k), 1.0); return; }
  if (mode < 1.5) {        // 1 垂直位移 + 噪声调制的 crossfade（页脚实际用的）
    float hn = hnoise(p*res/intensity);  vec2 d = vec2(0.0, normalize(vec2(0.5,0.5) - p).y);
    A = texture2D(t1, p + d*progress/5.0*(1.0+hn/2.0)).rgb;
    B = lift(texture2D(t2, pB - d*(1.0-progress)/5.0*(1.0+hn/2.0)).rgb);
    gl_FragColor = vec4(mix(A,B,progress), 1.0); return; }
  if (mode < 2.5) {        // 2 自下而上的 smoothstep 擦除 + 缩放
    float x = smoothstep(0.0, 1.0, progress*2.0 + p.y - 1.0); ... }
  // 3 线性 crossfade；4 硬切
}
```

驱动侧要点（`FooterTransitionCanvas.jsx`）：
- `grade` 不是常量，而是 `0.955 / footerLuma(footer.currentTime)`（:122），`footerLuma` 是对视频前 10 秒亮度的分段线性表（:7-15）——**用 JS 侧预测的亮度曲线补偿视频自身的明暗变化**，让 crossfade 不闪。
- 视频只在 `transition > 0.0005` 时 `play()`，否则 `pause()`（:86-90）。

## 5. 对《归航》的 Shader 组织建议

1. **不要复制 949 行单体**。按本册切成可组合的 GLSL 片段：`common.glsl`（hash/noise/bayer/cover）、`wipe_distance.glsl`（§3.3 模板）、`wipe_front.glsl`（§3.1 pass/band/brk 三层）、`treatments.glsl`（§3.2 表）、`paper.glsl`（§3.4）。
2. JS 侧保留"章节进度 → 参数表"的写法（§1.3），但参数表由 `story.config` 生成，Renderer 不知道 Road 数字。
3. 手机端：`#define PHONE`、`fbmQ` 降八度、`dpr≤1.5`、掩码场 2px 格采样——四招都低成本。
4. 每个效果加"饱和短路"（§3.6）。
5. 新增"WebGL 不可用 → 静态图 + CSS 淡入"路径；参考项目只 `console.warn` 后返回，不够。
