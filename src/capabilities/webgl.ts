export function renderingCapabilities() {
  const query = new URLSearchParams(location.search);
  const probe = document.createElement('canvas');
  const context = probe.getContext('webgl');
  const available = !!context;
  context?.getExtension('WEBGL_lose_context')?.loseContext();
  return {
    webgl: available && query.get('renderer') !== '2d',
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    effects: query.get('effects') !== 'off',
  };
}
