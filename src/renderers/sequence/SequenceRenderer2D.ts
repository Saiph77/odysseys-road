import { SequenceSurface } from './SequenceSurface';
import type { DecodedFrame } from './FrameStore';
import type { SequenceDraw } from './sequenceFrame';

export class SequenceRenderer2D extends SequenceSurface {
  private drawing!: CanvasRenderingContext2D;
  protected initialize() {
    this.drawing = this.canvas.getContext('2d', { alpha: false })!;
    this.canvas.dataset.renderer = '2d';
  }
  protected draw(frame: SequenceDraw, from: DecodedFrame, to: DecodedFrame) {
    const drawCover = (image: DecodedFrame) => {
      // Pear SequenceCanvas.jsx:17-25, aspect-preserving cover geometry only.
      const scale =
        Math.max(this.canvas.width / image.width, this.canvas.height / image.height) * frame.zoom;
      const width = image.width * scale,
        height = image.height * scale;
      this.drawing.drawImage(
        image.image,
        (this.canvas.width - width) / 2,
        (this.canvas.height - height) / 2,
        width,
        height,
      );
    };
    this.drawing.globalAlpha = 1;
    drawCover(from);
    if (frame.from.asset.id !== frame.to.asset.id || frame.from.index !== frame.to.index) {
      this.drawing.globalAlpha = frame.progress;
      drawCover(to);
      this.drawing.globalAlpha = 1;
    }
  }
  protected dispose() {}
}
