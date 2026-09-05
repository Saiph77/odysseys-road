import { SequenceSurface } from './SequenceSurface';
import { createSequenceProgram } from './program';
import type { DecodedFrame } from './FrameStore';
import type { SequenceDraw } from './sequenceFrame';

export class SequenceRendererGL extends SequenceSurface {
  private gl!: WebGLRenderingContext;
  private program!: WebGLProgram;
  private buffer!: WebGLBuffer;
  private textures: WebGLTexture[] = [];
  private uploaded: string[] = [];
  private sizes: string[] = [];
  private readonly locations = new Map<string, WebGLUniformLocation | null>();

  protected initialize() {
    const gl = this.canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
    });
    if (!gl) throw new Error('WebGL unavailable');
    this.gl = gl;
    this.canvas.dataset.renderer = 'webgl';
    this.canvas.addEventListener('webglcontextlost', this.onLost);
    this.program = createSequenceProgram(gl);
    gl.useProgram(this.program);
    this.buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    // Pear HeroCanvas.jsx:53, full-screen triangle geometry only.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const attribute = gl.getAttribLocation(this.program, 'aPosition');
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    this.textures = [0, 1].map((unit) => {
      const texture = gl.createTexture()!;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return texture;
    });
    gl.uniform1i(this.uniform('uFrom'), 0);
    gl.uniform1i(this.uniform('uTo'), 1);
  }

  private onLost = (event: Event) => {
    event.preventDefault();
    this.canvas.dispatchEvent(new CustomEvent('sequence-context-lost', { bubbles: true }));
  };
  private uniform(name: string) {
    if (!this.locations.has(name))
      this.locations.set(name, this.gl.getUniformLocation(this.program, name));
    return this.locations.get(name)!;
  }

  protected draw(
    frame: SequenceDraw,
    from: DecodedFrame & { key: string },
    to: DecodedFrame & { key: string },
  ) {
    const gl = this.gl;
    if (gl.isContextLost()) return;
    gl.useProgram(this.program);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    for (const [unit, image] of [from, to].entries()) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, this.textures[unit]);
      if (this.uploaded[unit] !== image.key) {
        const size = `${image.width}:${image.height}`;
        if (this.sizes[unit] !== size) {
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            image.image as ImageBitmap,
          );
          this.sizes[unit] = size;
        } else
          gl.texSubImage2D(
            gl.TEXTURE_2D,
            0,
            0,
            0,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            image.image as ImageBitmap,
          );
        this.uploaded[unit] = image.key;
      }
    }
    gl.uniform2f(this.uniform('uViewport'), this.canvas.width, this.canvas.height);
    gl.uniform2f(this.uniform('uFromSize'), from.width, from.height);
    gl.uniform2f(this.uniform('uToSize'), to.width, to.height);
    gl.uniform1f(this.uniform('uT'), frame.progress);
    gl.uniform1f(this.uniform('uZoom'), frame.zoom);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  protected dispose() {
    if (!this.gl) return;
    this.canvas.removeEventListener('webglcontextlost', this.onLost);
    this.textures.forEach((texture) => this.gl.deleteTexture(texture));
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteProgram(this.program);
  }
}
