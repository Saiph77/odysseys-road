import {
  AmbientLight,
  BufferGeometry,
  CanvasTexture,
  ClampToEdgeWrapping,
  Color,
  DirectionalLight,
  Float32BufferAttribute,
  Group,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  Vector2,
  WebGLRenderer
} from 'three';
import { createHtmlTexture } from './htmlTexture';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const CARD_WIDTH = 768;
const CARD_HEIGHT = 1680;
const VIEWPORT_HEIGHT = 920;

function createCard(source, result, index) {
  const widths = [1.58, 1.68, 1.8];
  const width = widths[index];
  const height = width * (VIEWPORT_HEIGHT / CARD_WIDTH);
  const viewportRatio = VIEWPORT_HEIGHT / CARD_HEIGHT;
  const texture = result.texture;
  texture.wrapS = texture.wrapT = ClampToEdgeWrapping;
  texture.repeat.set(1, viewportRatio);
  texture.offset.set(0, 1 - viewportRatio);

  const material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthWrite: true
  });
  const mesh = new Mesh(new PlaneGeometry(width, height), material);
  const positions = [
    [-2.08, -0.05, -0.22],
    [0, 0.1, -0.82],
    [2.08, -0.02, -1.42]
  ];
  const rotations = [0.13, 0, -0.13];
  mesh.position.set(...positions[index]);
  mesh.rotation.y = rotations[index];
  mesh.userData = {
    id: source.dataset.spatialSource,
    label: source.dataset.label,
    baseX: positions[index][0],
    baseY: positions[index][1],
    baseZ: positions[index][2],
    baseRotationY: rotations[index],
    scrollCurrent: 0,
    scrollTarget: 0,
    maxTextureOffset: 1 - viewportRatio,
    texture
  };
  return mesh;
}

function createPearVolume() {
  const profile = [
    [0.03, -1.38], [0.48, -1.25], [0.83, -0.9], [0.96, -0.36],
    [0.84, 0.18], [0.55, 0.7], [0.24, 1.08], [0.12, 1.35], [0.04, 1.5]
  ].map(([radius, y]) => new Vector2(radius, y));
  const geometry = new LatheGeometry(profile, 48);
  const material = new MeshStandardMaterial({
    color: new Color('#eadab4'),
    wireframe: true,
    transparent: true,
    opacity: 0.13,
    roughness: 0.72,
    metalness: 0.05
  });
  const pear = new Mesh(geometry, material);
  pear.position.set(0, -0.42, -2.35);
  pear.scale.setScalar(0.82);
  return pear;
}

function createSignalField() {
  const positions = [];
  for (let index = 0; index < 180; index += 1) {
    const angle = index * 2.399963;
    const radius = 0.7 + (index % 31) * 0.105;
    positions.push(
      Math.cos(angle) * radius,
      Math.sin(angle * 1.17) * (0.72 + radius * 0.2) - 0.28,
      -2.1 - (index % 13) * 0.08
    );
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return new Points(
    geometry,
    new PointsMaterial({ color: '#f4e6c5', size: 0.024, transparent: true, opacity: 0.36 })
  );
}

export async function createSpatialScene(host, sources) {
  await document.fonts.ready;
  const textureResults = [];
  for (const source of sources) {
    textureResults.push(await createHtmlTexture(source, CARD_WIDTH, CARD_HEIGHT));
  }

  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-label', 'Head-coupled spatial work documents');
  host.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(43, 1, 0.1, 40);
  const root = new Group();
  scene.add(root);
  scene.add(new AmbientLight('#e9d8b2', 1.7));
  const light = new DirectionalLight('#fff5dc', 3.2);
  light.position.set(-3, 4, 5);
  scene.add(light);

  const cards = sources.map((source, index) => createCard(source, textureResults[index], index));
  cards.forEach((card) => root.add(card));
  const pear = createPearVolume();
  const signalField = createSignalField();
  root.add(pear, signalField);

  let focusedIndex = 1;
  let focusedCard = cards[focusedIndex];
  let width = 0;
  let height = 0;

  const resize = () => {
    const nextWidth = canvas.clientWidth;
    const nextHeight = canvas.clientHeight;
    if (!nextWidth || !nextHeight || (nextWidth === width && nextHeight === height)) return;
    width = nextWidth;
    height = nextHeight;
    renderer.setSize(width, height, false);
  };

  const focusByX = (value) => {
    if (focusedIndex === 0 && value > -0.14) focusedIndex = 1;
    else if (focusedIndex === 1 && value < -0.3) focusedIndex = 0;
    else if (focusedIndex === 1 && value > 0.3) focusedIndex = 2;
    else if (focusedIndex === 2 && value < 0.14) focusedIndex = 1;
    focusedCard = cards[focusedIndex];
    return focusedCard;
  };

  const scrollFocused = (delta) => {
    focusedCard.userData.scrollTarget = clamp(focusedCard.userData.scrollTarget + delta);
    return {
      label: focusedCard.userData.label,
      progress: focusedCard.userData.scrollTarget,
      index: focusedIndex
    };
  };

  const update = ({ now, head, focusX, sectionProgress }) => {
    resize();
    if (!width || !height) return null;
    focusByX(focusX);

    const enter = smooth(sectionProgress / 0.08);
    const leave = 1 - smooth((sectionProgress - 0.88) / 0.12);
    const reveal = enter * leave;
    const aspect = width / Math.max(height, 1);
    const compact = aspect < 0.9;

    if (reveal < 0.001) {
      return {
        label: focusedCard.userData.label,
        progress: focusedCard.userData.scrollTarget,
        index: focusedIndex
      };
    }

    cards.forEach((card, index) => {
      const data = card.userData;
      data.scrollCurrent += (data.scrollTarget - data.scrollCurrent) * 0.105;
      data.texture.offset.y = data.maxTextureOffset * (1 - data.scrollCurrent);

      const active = card === focusedCard;
      const depth = Math.abs(data.baseZ) + 0.5;
      const targetScale = (active ? 1.045 : 0.965) * enter;
      const currentScale = card.scale.x || 0.001;
      const nextScale = currentScale + (targetScale - currentScale) * 0.115;
      card.scale.setScalar(nextScale);
      card.material.opacity += ((active ? 1 : 0.48) * reveal - card.material.opacity) * 0.12;
      const layoutX = compact ? (index - focusedIndex) * 2.15 : data.baseX;
      card.position.x = layoutX + (1 - enter) * (index - 1) * 0.72;
      card.position.y = data.baseY + (1 - enter) * (index === 1 ? 0.7 : -0.42);
      card.position.z = data.baseZ - (1 - enter) * 1.2;
      card.rotation.y = data.baseRotationY + (1 - enter) * (index - 1) * 0.25;
      card.rotation.z = (index - 1) * 0.008 * Math.sin(now * 0.00025 + depth);
    });

    pear.material.opacity += (0.13 * reveal - pear.material.opacity) * 0.08;
    pear.rotation.y = now * 0.00008 + head.x * 0.16;
    pear.rotation.z = -0.08 + head.y * 0.06;
    signalField.material.opacity += (0.36 * reveal - signalField.material.opacity) * 0.08;
    signalField.rotation.z = now * 0.000025;

    const eyeX = head.x * 0.82;
    const eyeY = head.y * 0.58;
    const eyeZ = 5.8 - head.z * 0.72;
    const near = 0.1;
    const far = 40;
    const screenZ = 1.15;
    const screenHeight = 4.35;
    const screenWidth = screenHeight * aspect;
    const scale = near / Math.max(1.6, eyeZ - screenZ);
    camera.position.set(eyeX, eyeY, eyeZ);
    camera.rotation.set(0, 0, 0);
    camera.near = near;
    camera.far = far;
    camera.projectionMatrix.makePerspective(
      (-screenWidth * 0.5 - eyeX) * scale,
      (screenWidth * 0.5 - eyeX) * scale,
      (screenHeight * 0.5 - eyeY) * scale,
      (-screenHeight * 0.5 - eyeY) * scale,
      near,
      far
    );
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    renderer.render(scene, camera);

    return {
      label: focusedCard.userData.label,
      progress: focusedCard.userData.scrollTarget,
      index: focusedIndex
    };
  };

  return {
    rendererName: textureResults.every((result) => result.rendererName === 'Native HTML-in-Canvas')
      ? 'Native HTML-in-Canvas'
      : 'Fallback DOM capture',
    scrollFocused,
    update,
    dispose() {
      root.traverse((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
        else object.material?.dispose?.();
      });
      textureResults.forEach(({ texture }) => {
        if (texture instanceof CanvasTexture) texture.dispose();
      });
      renderer.dispose();
      canvas.remove();
    }
  };
}
