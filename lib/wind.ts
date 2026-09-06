// Vento suave sobre uma foto: WebGL desloca as amostras da textura com ondas lentas,
// mais fortes no alto da imagem (as flores) e quase nulas embaixo (os caules).
// Sem WebGL, ou com "reduzir movimento" ativo, a foto fica parada: quem chama mantém o <img>.
export type WindOptions = {
  focusY?: number; // ponto da imagem alinhado ao ponto do quadro (object-position vertical), 0..1
  amplitude?: number; // deslocamento máximo em fração da largura da imagem
  speed?: number;
  maxDpr?: number;
};

const VERT = `
attribute vec2 a;
varying vec2 p;
void main(){ p = vec2(a.x * 0.5 + 0.5, 0.5 - a.y * 0.5); gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
varying vec2 p;
uniform sampler2D tex;
uniform float t, amp, focus;
uniform vec2 cover; // (escala x, escala y) para cobrir o quadro como object-fit: cover
void main(){
  vec2 uv = vec2(0.5 + (p.x - 0.5) * cover.x, focus + (p.y - focus) * cover.y);
  float m = smoothstep(1.0, 0.2, uv.y);          // sopra mais no alto, quase nada na base
  float gust = 0.7 + 0.3 * sin(t * 0.37 + uv.x * 2.0);
  float dx = sin(uv.y * 7.0 + t) + 0.5 * sin(uv.y * 13.0 - t * 1.3 + uv.x * 3.0);
  float dy = 0.35 * cos(uv.x * 9.0 + t * 0.8 + uv.y * 4.0);
  uv += amp * gust * m * vec2(dx, dy);
  gl_FragColor = texture2D(tex, clamp(uv, 0.002, 0.998));
}`;

export function startWind(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  options: WindOptions = {},
): () => void {
  const { focusY = 0.5, amplitude = 0.006, speed = 0.9, maxDpr = 1.5 } = options;
  const context = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
  if (!context) return () => {};
  const gl = context;

  function shader(type: number, source: string): WebGLShader | null {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, source);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  const vs = shader(gl.VERTEX_SHADER, VERT);
  const fs = shader(gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return () => {};
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return () => {};
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const a = gl.getAttribLocation(program, 'a');
  gl.enableVertexAttribArray(a);
  gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  const uT = gl.getUniformLocation(program, 't');
  const uAmp = gl.getUniformLocation(program, 'amp');
  const uFocus = gl.getUniformLocation(program, 'focus');
  const uCover = gl.getUniformLocation(program, 'cover');
  gl.uniform1f(uAmp, amplitude);
  gl.uniform1f(uFocus, focusY);

  const imageAspect = image.naturalWidth / image.naturalHeight;
  function resize() {
    const dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    const canvasAspect = w / h;
    // object-fit: cover — recorta o eixo em que a imagem sobra
    if (imageAspect > canvasAspect) gl.uniform2f(uCover, canvasAspect / imageAspect, 1);
    else gl.uniform2f(uCover, 1, imageAspect / canvasAspect);
  }

  let frame = 0;
  let running = true;
  let visible = true;
  const start = performance.now();
  function draw(now: number) {
    frame = 0;
    if (!running) return;
    resize();
    gl.uniform1f(uT, ((now - start) / 1000) * speed);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (visible && document.visibilityState === 'visible') frame = requestAnimationFrame(draw);
  }
  function wake() {
    if (running && !frame) frame = requestAnimationFrame(draw);
  }
  const observer =
    'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
          visible = entries.some((entry) => entry.isIntersecting);
          if (visible) wake();
        })
      : null;
  observer?.observe(canvas);
  document.addEventListener('visibilitychange', wake);
  window.addEventListener('resize', wake);
  wake();

  return () => {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    observer?.disconnect();
    document.removeEventListener('visibilitychange', wake);
    window.removeEventListener('resize', wake);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}

// Curva suave (Catmull-Rom → Bézier cúbica) por uma sequência de pontos; usada pelo fio dourado.
export function smoothPath(points: Array<[number, number]>): string {
  if (points.length < 2) return '';
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}
