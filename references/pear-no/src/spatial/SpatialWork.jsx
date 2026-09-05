import React, { useCallback, useEffect, useRef, useState } from 'react';
import './SpatialWork.css';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const essays = [
  {
    id: 'build',
    number: '01',
    label: 'BUILD',
    title: ['A machine', 'worth finding.'],
    lead: 'The product and the way it is discovered are designed as one system.',
    chapter: 'Systems, not deliverables',
    body: 'We build the storefront, marketplace or booking engine around the real path from intent to revenue. Architecture, language and speed share the same brief.',
    quote: 'If the product cannot be found, it was never fully built.'
  },
  {
    id: 'rank',
    number: '02',
    label: 'RANK',
    title: ['Discovery is', 'in the structure.'],
    lead: 'Search begins in the first commit, not after the launch party.',
    chapter: 'An indexable imagination',
    body: 'Every route, relationship and sentence creates a signal. We shape those signals into a body of work that can be read by people and machines without compromise.',
    quote: 'Visibility is not decoration. It is product infrastructure.'
  },
  {
    id: 'share',
    number: '03',
    label: 'SHARE',
    title: ['The outcome', 'is the contract.'],
    lead: 'No clock, no retainer: our fee begins only where growth begins.',
    chapter: 'Aligned by consequence',
    body: 'We agree on the baseline, finance the work and share the revenue it creates. The model makes attention finite, decisions sharper and the result visible to both sides.',
    quote: 'We do not sell the hours. We co-own what the hours make.'
  }
];

function SpatialSource({ essay }) {
  return (
    <article
      className="spatial-source"
      data-spatial-source={essay.id}
      data-label={essay.label}
    >
      <header className="spatial-source__top">
        <span>Pear / Field note</span>
        <span>{essay.number}</span>
      </header>
      <div className="spatial-source__hero">
        <span className="spatial-source__index">THE WORK · {essay.number}</span>
        <h2>{essay.title.map((line) => <span key={line}>{line}</span>)}</h2>
        <p>{essay.lead}</p>
      </div>
      <section className="spatial-source__section">
        <span>I</span>
        <div>
          <h3>{essay.chapter}</h3>
          <p>{essay.body}</p>
        </div>
      </section>
      <blockquote>{essay.quote}</blockquote>
      <section className="spatial-source__section spatial-source__section--last">
        <span>II</span>
        <div>
          <h3>Measured in movement</h3>
          <p>Look across the room to change focus. Continue down the page to move only this document through its own depth.</p>
        </div>
      </section>
      <footer>
        <span>Not an agency on the clock</span>
        <b>PEAR°</b>
      </footer>
    </article>
  );
}

export default function SpatialWork({ scrollProgress = 0 }) {
  const canvasHostRef = useRef(null);
  const sourceHostRef = useRef(null);
  const videoRef = useRef(null);
  const sceneRef = useRef(null);
  const trackerRef = useRef(null);
  const mountedRef = useRef(false);
  const progressRef = useRef(0);
  const activeRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0, z: 0, focusX: 0, detected: true });
  const [cameraState, setCameraState] = useState('pointer');
  const [rendererName, setRendererName] = useState('Preparing HTML');
  const [focus, setFocus] = useState({ label: 'RANK', progress: 0, index: 1 });

  const road = scrollProgress * 5350;
  const sectionProgress = clamp((road - 1200) / 600);
  const visibility = smooth(sectionProgress / 0.1) * (1 - smooth((sectionProgress - 0.9) / 0.1));
  progressRef.current = sectionProgress;
  activeRef.current = visibility > 0.04;

  const enableCamera = useCallback(async () => {
    if (!videoRef.current || cameraState === 'loading') return;
    if (cameraState === 'active') {
      trackerRef.current?.stop();
      trackerRef.current = null;
      setCameraState('pointer');
      return;
    }

    setCameraState('loading');
    try {
      const { default: MediaPipeHeadTracker } = await import('./MediaPipeHeadTracker');
      const tracker = await MediaPipeHeadTracker.create(videoRef.current);
      if (!mountedRef.current) {
        tracker.stop();
        return;
      }
      trackerRef.current?.stop();
      trackerRef.current = tracker;
      setCameraState('active');
    } catch (error) {
      console.error('Pear spatial head view could not start.', error);
      trackerRef.current = null;
      if (mountedRef.current) setCameraState('unavailable');
    }
  }, [cameraState]);

  useEffect(() => {
    mountedRef.current = true;
    const canvasHost = canvasHostRef.current;
    const sourceHost = sourceHostRef.current;
    if (!canvasHost || !sourceHost) return undefined;

    let cancelled = false;
    let animationFrame = 0;
    let lastLabel = 'RANK';
    const smoothHead = { x: 0, y: 0, z: 0 };
    let smoothFocusX = 0;

    const onPointerMove = (event) => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = 1 - (event.clientY / window.innerHeight) * 2;
      pointerRef.current.focusX = pointerRef.current.x;
    };

    const onWheel = (event) => {
      if (!activeRef.current || !sceneRef.current) return;
      const next = sceneRef.current.scrollFocused(event.deltaY / 1150);
      setFocus(next);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });

    const sources = [...sourceHost.querySelectorAll('[data-spatial-source]')];
    void import('./createSpatialScene')
      .then(({ createSpatialScene }) => createSpatialScene(canvasHost, sources))
      .then((spatialScene) => {
        if (cancelled) {
          spatialScene.dispose();
          return;
        }
        sceneRef.current = spatialScene;
        setRendererName(spatialScene.rendererName);

        const render = (now) => {
          if (cancelled) return;
          const tracked = trackerRef.current?.getSample(now);
          const sample = tracked?.detected ? tracked : pointerRef.current;
          smoothHead.x += (sample.x - smoothHead.x) * 0.082;
          smoothHead.y += (sample.y - smoothHead.y) * 0.082;
          smoothHead.z += (sample.z - smoothHead.z) * 0.082;
          smoothFocusX += (sample.focusX - smoothFocusX) * 0.11;

          const current = spatialScene.update({
            now,
            head: smoothHead,
            focusX: smoothFocusX,
            sectionProgress: progressRef.current
          });
          if (current && current.label !== lastLabel) {
            lastLabel = current.label;
            setFocus(current);
          }
          animationFrame = requestAnimationFrame(render);
        };
        animationFrame = requestAnimationFrame(render);
      })
      .catch((error) => {
        console.error('Pear spatial scene could not be composed.', error);
        setRendererName('Unavailable');
      });

    return () => {
      cancelled = true;
      mountedRef.current = false;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('wheel', onWheel);
      trackerRef.current?.stop();
      trackerRef.current = null;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  const onLight = road >= 1900 && road < 2890;
  const cameraLabel = cameraState === 'active'
    ? 'Disable head view'
    : cameraState === 'loading'
      ? 'Calibrating…'
      : 'Enable head view';
  const controlVisible = (road > 1030 && road < 1900) || cameraState === 'active' || cameraState === 'loading';

  return (
    <div className={`spatial-work${onLight ? ' spatial-work--light' : ''}`} aria-hidden={visibility < 0.02}>
      <div
        ref={canvasHostRef}
        className="spatial-work__canvas"
        style={{ opacity: visibility }}
      />

      <div ref={sourceHostRef} className="spatial-source-host" aria-hidden="true">
        {essays.map((essay) => <SpatialSource essay={essay} key={essay.id} />)}
      </div>
      <video ref={videoRef} className="spatial-work__video" muted playsInline aria-hidden="true" />

      <aside
        className="spatial-view-control"
        aria-label="Spatial view controls"
        aria-hidden={!controlVisible}
        style={{ opacity: controlVisible ? 1 : 0, pointerEvents: controlVisible ? 'auto' : 'none' }}
      >
        <span><i className={cameraState === 'active' ? 'is-live' : ''} />Spatial view</span>
        <button
          type="button"
          onClick={enableCamera}
          disabled={cameraState === 'loading' || !controlVisible}
          tabIndex={controlVisible ? 0 : -1}
        >
          {cameraLabel}
        </button>
        <small>{cameraState === 'unavailable' ? 'Camera unavailable · pointer retained' : 'Local processing · no recording'}</small>
      </aside>

      <output
        className="spatial-focus-readout"
        style={{ opacity: visibility }}
        aria-live="polite"
      >
        <span>Focus / 0{focus.index + 1}</span>
        <strong>{focus.label}</strong>
        <i><b style={{ transform: `scaleX(${focus.progress})` }} /></i>
        <small>{Math.round(focus.progress * 100).toString().padStart(2, '0')}% · {rendererName}</small>
      </output>
    </div>
  );
}
