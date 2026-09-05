export class ChapterRuntime {
  private readonly fired = new Set<string>();

  mount() {
    this.fired.clear();
  }

  destroy() {
    this.fired.clear();
  }

  fireOnce(id: string): boolean {
    if (this.fired.has(id)) return false;
    this.fired.add(id);
    return true;
  }

  latch = (id: string) => this.fireOnce(id);
}
