/**
 * Reserved V1 / branch types — not exported from core barrel (ARCHITECTURE §5.1).
 */

export type Zone = 'left' | 'center' | 'right';

export type SelectionState = Readonly<{
  phase: 'idle' | 'collect' | 'freeze' | 'resolved';
  zone: Zone | null;
  dwellMs: Readonly<Record<Zone, number>>;
  elapsedMs: number;
  winnerId: string | null;
}>;

export interface ZoneDwellSelector {
  begin(): void;
  update(frame: import('./contracts').InteractionFrame, dtMs: number): SelectionState;
  confirm(zone: Zone): SelectionState;
  readonly state: SelectionState;
}

export interface HtmlCanvasBridge {
  readonly mode: 'dom' | 'polyfill' | 'native';
  mount(host: HTMLElement, elements: readonly HTMLElement[]): void;
  updateGeometry(elementId: string, transform: DOMMatrix): void;
  requestPaint(elementId: string): void;
  destroy(): void;
}
