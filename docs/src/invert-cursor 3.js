(() => {
  const STYLE_ID = "red-invert-cursor-style"
  const CURSOR_CLASS = "red-invert-cursor"
  const CURSOR_SIZE = 14
  const POINTER_MEDIA = "(hover: hover) and (pointer: fine)"

  const VERTEX_SHADER_SOURCE = `
    attribute vec2 a_position;

    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `

  const FRAGMENT_SHADER_SOURCE = `
    precision mediump float;

    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `

  let canvas = null
  let gl = null
  let program = null
  let positionLocation = -1
  let buffer = null
  let frame = 0
  let pointerX = 0
  let pointerY = 0
  let pointerVisible = false

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return

    const style = document.createElement("style")
    style.id = STYLE_ID
    style.textContent = `
      .${CURSOR_CLASS} {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 2147483647;
        display: block;
        width: ${CURSOR_SIZE}px;
        height: ${CURSOR_SIZE}px;
        margin: 0;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: #fff;
        opacity: 0;
        pointer-events: none;
        mix-blend-mode: difference;
        image-rendering: pixelated;
        transform: translate3d(-100px, -100px, 0);
        will-change: transform, opacity;
        contain: strict;
      }

      .${CURSOR_CLASS}.is-visible {
        opacity: 1;
      }

      @media (hover: none), (pointer: coarse) {
        .${CURSOR_CLASS} {
          display: none;
        }
      }
    `
    document.head.appendChild(style)
  }

  function createShader(type, source) {
    const shader = gl?.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader)
      return null
    }
    return shader
  }

  function createRenderer() {
    gl = canvas?.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      stencil: false,
    })
    if (!gl) return false

    const vertexShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE)
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE)
    if (!vertexShader || !fragmentShader) return false

    program = gl.createProgram()
    if (!program) return false
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program)
      program = null
      return false
    }

    positionLocation = gl.getAttribLocation(program, "a_position")
    buffer = gl.createBuffer()
    if (positionLocation < 0 || !buffer) return false

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    )
    gl.useProgram(program)
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
    return true
  }

  function resizeCanvas() {
    if (!canvas) return
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1))
    const pixels = Math.max(1, Math.round(CURSOR_SIZE * dpr))
    if (canvas.width === pixels && canvas.height === pixels) return

    canvas.width = pixels
    canvas.height = pixels
    if (gl) gl.viewport(0, 0, pixels, pixels)
  }

  function render() {
    frame = 0
    if (!canvas) return

    resizeCanvas()
    canvas.style.transform = `translate3d(${Math.round(pointerX - CURSOR_SIZE / 2)}px, ${Math.round(pointerY - CURSOR_SIZE / 2)}px, 0)`
    canvas.classList.toggle("is-visible", pointerVisible)

    if (!gl || !program) return
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function scheduleRender() {
    if (frame) return
    frame = requestAnimationFrame(render)
  }

  function hideCursor() {
    pointerVisible = false
    scheduleRender()
  }

  function handlePointerMove(event) {
    if (event.pointerType === "touch" || event.isPrimary === false) {
      hideCursor()
      return
    }

    pointerX = event.clientX
    pointerY = event.clientY
    pointerVisible = true
    scheduleRender()
  }

  function handlePointerOut(event) {
    if (!event.relatedTarget) hideCursor()
  }

  function handleVisibilityChange() {
    if (document.hidden) hideCursor()
  }

  function start() {
    if (!window.matchMedia?.(POINTER_MEDIA).matches) return
    ensureStyle()

    canvas = document.createElement("canvas")
    canvas.className = CURSOR_CLASS
    canvas.setAttribute("aria-hidden", "true")
    canvas.width = CURSOR_SIZE
    canvas.height = CURSOR_SIZE
    document.body.appendChild(canvas)

    const renderedWithWebGL = createRenderer()
    canvas.dataset.renderer = renderedWithWebGL ? "webgl" : "fallback"
    resizeCanvas()
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerout", handlePointerOut, { passive: true })
    window.addEventListener("blur", hideCursor, { passive: true })
    window.addEventListener("resize", scheduleRender, { passive: true })
    document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true })
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true })
  } else {
    start()
  }
})()
