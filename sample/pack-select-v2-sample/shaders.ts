export const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const fragmentShader = `
  uniform sampler2D map;
  uniform float isRare;
  uniform float time;
  uniform float opacity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  vec3 rainbow(float t) {
    vec3 c = 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
    return c;
  }

  void main() {
    vec4 texColor = texture2D(map, vUv);

    if (isRare > 0.5) {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      float viewDot = dot(viewDir, normal);

      float pattern = sin((vUv.x * 10.0 + vUv.y * 20.0) + time * 3.0) * 0.5 + 0.5;
      pattern += sin((vUv.x * 20.0 - vUv.y * 10.0) - time * 2.0) * 0.3;

      vec3 holoColor = rainbow(vUv.y + vUv.x * 0.5 + time * 0.3 + viewDot * 1.5);

      float shine = 0.4 + pow(max(0.0, 1.0 - abs(viewDot)), 1.5) * 1.2;
      shine *= (0.6 + 0.4 * pattern);

      texColor.rgb += holoColor * shine * 0.7;
      texColor.rgb += vec3(1.0) * shine * pattern * 0.3;
    }

    gl_FragColor = vec4(texColor.rgb, texColor.a * opacity);
  }
`;
