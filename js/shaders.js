export const vertexShader = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const fragmentShader = /* glsl */`
precision highp float;
uniform vec2 uResolution;
uniform vec2 uOffset;
uniform vec2 uMouse;
uniform float uTime;
uniform float uDPR;

float blob(vec2 p, vec2 c, float r) {
  float d = length(p - c);
  return (r*r) / max(1e-3, d*d);
}

void main() {
  vec2 globalUV = (uOffset + gl_FragCoord.xy) / uResolution;
  vec2 p = globalUV;

  vec2 c1 = vec2(0.5 + 0.28 * sin(uTime*0.7), 0.5 + 0.22 * cos(uTime*1.1));
  vec2 c2 = vec2(1.0) - c1;

  if (uMouse.x >= 0.0) {
    c1 = mix(c1, uMouse, 0.35);
  }

  float f1 = blob(p, c1, 0.18 + 0.04 * sin(uTime*0.9));
  float f2 = blob(p, c2, 0.18 + 0.04 * cos(uTime*1.2));
  float field = f1 + f2;

  float glow = smoothstep(0.6, 1.9, field);
  float edge = smoothstep(0.8, 1.1, field) - smoothstep(1.1, 1.4, field);
  float w1 = f1 / max(1e-3, f1 + f2);
  vec3 col = mix(vec3(1.0, 0.25, 0.25), vec3(0.25, 1.0, 0.6), w1);
  float vignette = smoothstep(1.2, 0.2, distance(p, vec2(0.5)));

  col *= (0.25 + 0.9 * glow);
  col += edge * 0.9;
  col *= vignette;

  vec2 px = gl_FragCoord.xy;
  float seam = step(0.0, mod(uOffset.x + px.x, 2.0));
  col *= mix(1.0, 0.995, seam);

  gl_FragColor = vec4(col, 1.0);
}
`;
