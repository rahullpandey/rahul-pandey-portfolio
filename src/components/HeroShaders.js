export const vertexShader = `
varying vec2 vUv;
uniform float uHovered;
uniform float uScale;

void main() {
  vUv = uv;
  
  // Very subtle zoom in effect on hover
  vec3 pos = position;
  float scale = 1.0 + (uHovered * uScale);
  // Scale from the center
  pos *= scale;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const fragmentShader = `
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform vec2 uMouse;
uniform float uHovered;
uniform float uRadius;
uniform float uSoftness;
uniform vec2 uResolution;
uniform vec2 uTexture1Resolution;
uniform vec2 uTexture2Resolution;

varying vec2 vUv;

vec2 getCoverUv(vec2 uv, vec2 textureResolution) {
  vec2 ratio = vec2(
    min((uResolution.x / uResolution.y) / (textureResolution.x / textureResolution.y), 1.0),
    min((uResolution.y / uResolution.x) / (textureResolution.y / textureResolution.x), 1.0)
  );

  vec2 centeredUv = uv - vec2(0.5);
  return centeredUv * ratio + vec2(0.5);
}

vec2 getContainUv(vec2 uv, vec2 textureResolution) {
  vec2 ratio = vec2(
    max((uResolution.x / uResolution.y) / (textureResolution.x / textureResolution.y), 1.0),
    max((uResolution.y / uResolution.x) / (textureResolution.y / textureResolution.x), 1.0)
  );

  vec2 centeredUv = uv - vec2(0.5);
  return centeredUv * ratio + vec2(0.5);
}

vec4 sampleContainedTexture(sampler2D textureSampler, vec2 uv, vec2 textureResolution) {
  vec2 containUv = getContainUv(uv, textureResolution);

  if (
    containUv.x < 0.0 || containUv.x > 1.0 ||
    containUv.y < 0.0 || containUv.y > 1.0
  ) {
    return vec4(0.0);
  }

  return texture2D(textureSampler, containUv);
}

void main() {
  vec2 baseUv = getCoverUv(vUv, uTexture1Resolution);
  vec4 color1 = texture2D(uTexture1, baseUv);
  
  // Add a slight distortion for the top layer near the mask edge
  
  // Calculate mask
  // Correct mouse distance for aspect ratio of the screen so the mask is perfectly circular
  vec2 screenRatio = vec2(uResolution.x / uResolution.y, 1.0);
  if (uResolution.y > uResolution.x) {
    screenRatio = vec2(1.0, uResolution.y / uResolution.x);
  }
  
  vec2 uvMouse = vUv * screenRatio;
  vec2 cursor = uMouse * screenRatio;

  float dist = distance(uvMouse, cursor);
  
  // Add an effect where the mask scales in when uHovered increases (from 0 to 1)
  float currentRadius = uRadius * uHovered;

  // The mask (1.0 where top image shows, 0.0 where bottom image shows)
  float mask = 1.0 - smoothstep(currentRadius - uSoftness, currentRadius + uSoftness, dist);
  
  // Add a small ripple / distortion on the edge of the mask
  vec2 distortedUv = vUv + (mask * (1.0 - mask)) * 0.05 * uHovered;
  vec4 color2 = sampleContainedTexture(uTexture2, distortedUv, uTexture2Resolution);

  // Respect the portrait bounds so it only appears inside the reveal area.
  float reveal = mask * color2.a;
  vec4 finalColor = mix(color1, vec4(color2.rgb, 1.0), reveal);

  // Add subtle light bloom/glow near the cursor using the cursor distance
  float glow = 1.0 - smoothstep(0.0, currentRadius * 1.5, dist);
  finalColor.rgb += vec3(0.05, 0.08, 0.1) * glow * uHovered;

  gl_FragColor = finalColor;
}
`;
