uniform sampler2D uTexture;
uniform sampler2D uMask1;
uniform sampler2D uMask2;
uniform sampler2D uMask3;
uniform sampler2D uMask4;
uniform sampler2D uNoise;
uniform float uProgress;

varying vec2 vUv;

float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

void main() {

  vec2 rainbowUv = vUv;
  rainbowUv.x = remap(rainbowUv.x, 0.0, 1.0, -0.05, 1.05);

  vec4 rainbowTexture = texture2D(uTexture, rainbowUv);
  vec3 color = rainbowTexture.rgb;
  float alpha = 1.0;

  float scaleY = vUv.y;
  // if (vUv.y > (1.3 - uProgress)) discard;

  // float mask1 = texture2D(uMask1, vUv).r;
  // alpha *= smoothstep(0.1, 0.8, mask1);

  vec2 discardUv = vUv;
  discardUv.y += uProgress * 0.25;
  float discardMask = texture2D(uMask2, discardUv).r;
  discardMask = smoothstep(0.4, 0.6, discardMask);
  if (discardMask > 0.5) discard;

  vec2 mask2Uv = vUv;
  mask2Uv.y += uProgress * 0.42;
  float mask2 = texture2D(uMask2, mask2Uv).r;
  mask2 = smoothstep(0.6, 0.4, mask2);
  alpha *= mask2;


  
  // vec2 mask3Uv = vUv;
  // float mask3 = texture2D(uMask3, mask3Uv).r;
  // alpha  *= smoothstep(0.8, 0.1, mask3);
  // alpha  *= 1.0 - mask3;

  
  // float mask4Start = 0.15;
  // float mask4Offset = 1.2;
  
  vec2 mask4RUv = vUv;
  float mask4r = texture2D(uMask4, mask4RUv).r;

  vec2 mask4GUv = vUv;
  mask4GUv.y -= uProgress * 0.5;
  float mask4g = texture2D(uMask4, mask4GUv).g;

  float mask4 = mask4r * mask4g;
  mask4 = smoothstep(0.8, 0.1, mask4);

  alpha *= mask4;
  
  float mask4Offset = mask4r * mask4g;
  mask4Offset = smoothstep(0.0, 1.0, mask4Offset);  
  
  // color = vec3(mask4);
  // alpha = 1.0;

  // Noise
  // vec2 noiseUv = vUv;
  // noiseUv.x *= 3.0;
  // vec3 noise = texture2D(uNoise, noiseUv * 20.0).rgb;
  // color += (noise - 0.5) * 0.05;  


  vec3 bgColor = vec3(14.0 / 255.0);
  color = mix(bgColor, color, alpha);

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
