// WebGL Relativistic Black Hole Renderer with Accretion Disk & Gravitational Lensing

export interface RendererOptions {
  canvas: HTMLCanvasElement;
}

export interface BlackHoleRenderer {
  ready: Promise<void>;
  dispose: () => void;
}

export function createRenderer(options: RendererOptions): BlackHoleRenderer {
  const { canvas } = options;
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  if (!gl) {
    console.warn('WebGL not supported on this device');
    return {
      ready: Promise.resolve(),
      dispose: () => {},
    };
  }

  let animationFrameId: number;
  let isDisposed = false;

  // Vertex Shader
  const vsSource = `
    attribute vec2 position;
    varying vec2 vUv;
    void main() {
      vUv = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // Fragment Shader: Black Hole Accretion Disk + Gravitational Lensing
  const fsSource = `
    precision highp float;
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
      float r = length(uv);
      float theta = atan(uv.y, uv.x);

      // Event Horizon
      float eventHorizon = 0.18;
      if (r < eventHorizon) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }

      // Gravitational Lensing Distortion
      float bend = eventHorizon / (r * 1.8);
      float distR = r - bend * 0.08;

      // Accretion Disk Spiral
      float spiral = sin(theta * 3.0 + uTime * 2.5 - 1.0 / (r * 0.5));
      float disk = smoothstep(0.48, 0.22, abs(distR - 0.28)) * (0.6 + 0.4 * spiral);

      // Relativistic Doppler Beaming (left side brighter)
      float doppler = 1.0 - 0.45 * sin(theta);

      // Photon Ring (Bright boundary around event horizon)
      float photonRing = smoothstep(0.015, 0.0, abs(r - eventHorizon - 0.015)) * 2.5;

      // Accretion Disk Color (Fiery Amber & Neon Blue Corona)
      vec3 diskColor = mix(vec3(1.0, 0.4, 0.05), vec3(1.0, 0.85, 0.3), disk);
      vec3 coronaColor = vec3(0.1, 0.4, 1.0) * smoothstep(0.65, 0.2, r);

      vec3 finalColor = diskColor * disk * doppler + vec3(photonRing * 1.2, photonRing * 0.95, photonRing * 0.7) + coronaColor;

      // Background Starfield (Gravitationally lensed)
      float stars = step(0.996, fract(sin(dot(uv * (1.0 + bend * 2.0), vec2(12.9898, 78.233))) * 43758.5453));
      finalColor += vec3(stars) * (1.0 - smoothstep(0.2, 0.45, disk));

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  // Compile Shader Helper
  function compileShader(type: number, source: string): WebGLShader | null {
    if (!gl) return null;
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = compileShader(gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) {
    return { ready: Promise.resolve(), dispose: () => {} };
  }

  const program = gl.createProgram();
  if (!program) return { ready: Promise.resolve(), dispose: () => {} };

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const posAttr = gl.getAttribLocation(program, 'position');
  const uTimeLoc = gl.getUniformLocation(program, 'uTime');
  const uResLoc = gl.getUniformLocation(program, 'uResolution');

  const resize = () => {
    if (!canvas || isDisposed) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth * dpr;
    const height = canvas.clientHeight * dpr;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      if (gl) gl.viewport(0, 0, width, height);
    }
  };

  window.addEventListener('resize', resize);
  resize();

  const startTime = performance.now();

  const render = () => {
    if (isDisposed || !gl) return;
    resize();

    const elapsed = (performance.now() - startTime) * 0.001;

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1f(uTimeLoc, elapsed);
    gl.uniform2f(uResLoc, canvas.width, canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationFrameId = requestAnimationFrame(render);
  };

  render();

  return {
    ready: Promise.resolve(),
    dispose: () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(quadBuffer);
      }
    },
  };
}
