import html2canvas from 'html2canvas';
import { CanvasTexture, SRGBColorSpace } from 'three';

const waitForPaint = () => new Promise((resolve) => {
  requestAnimationFrame(() => requestAnimationFrame(resolve));
});

const makeTexture = (canvas) => {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

const nativeContext = () => {
  const context = document.createElement('canvas').getContext('2d');
  if (typeof context?.drawElementImage === 'function') return 'drawElementImage';
  if (typeof context?.drawElement === 'function') return 'drawElement';
  return null;
};

async function nativeTexture(element, width, height, method) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.setAttribute('layoutsubtree', '');
  const context = canvas.getContext('2d');
  const drawable = element.cloneNode(true);
  drawable.setAttribute('aria-hidden', 'true');

  if (method === 'drawElementImage') {
    canvas.style.cssText = [
      'position:fixed',
      'inset:0 auto auto 0',
      `width:${width}px`,
      `height:${height}px`,
      'z-index:-100',
      'pointer-events:none'
    ].join(';');
    canvas.appendChild(drawable);
    document.body.appendChild(canvas);
    try {
      await waitForPaint();
      await context.drawElementImage(drawable, 0, 0);
    } finally {
      canvas.remove();
    }
  } else {
    await context.drawElement(element, 0, 0, width, height);
  }

  return makeTexture(canvas);
}

async function fallbackTexture(element, width, height) {
  await document.fonts.ready;
  const canvas = await html2canvas(element, {
    width,
    height,
    scale: 1,
    backgroundColor: null,
    logging: false,
    useCORS: false,
    removeContainer: true
  });
  return makeTexture(canvas);
}

export async function createHtmlTexture(element, width, height) {
  const method = nativeContext();
  if (method) {
    try {
      return {
        texture: await nativeTexture(element, width, height, method),
        rendererName: 'Native HTML-in-Canvas'
      };
    } catch (error) {
      console.warn('Native HTML-in-Canvas capture failed; using the DOM fallback.', error);
    }
  }

  return {
    texture: await fallbackTexture(element, width, height),
    rendererName: 'Fallback DOM capture'
  };
}

