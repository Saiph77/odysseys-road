precision mediump float;
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform vec2 uViewport;
uniform vec2 uFromSize;
uniform vec2 uToSize;
uniform float uT;
uniform float uZoom;
varying vec2 vUv;
vec2 coverUv(vec2 uv, vec2 size) {
  float viewportAspect = uViewport.x / uViewport.y;
  float imageAspect = size.x / size.y;
  vec2 scale = min(vec2(1.0), vec2(viewportAspect / imageAspect, imageAspect / viewportAspect));
  return (uv - 0.5) * scale / uZoom + 0.5;
}
void main() {
  vec3 fromColor = texture2D(uFrom, coverUv(vUv, uFromSize)).rgb;
  vec3 toColor = texture2D(uTo, coverUv(vUv, uToSize)).rgb;
  gl_FragColor = vec4(mix(fromColor, toColor, uT), 1.0);
}
