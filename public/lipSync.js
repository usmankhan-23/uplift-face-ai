class LipSyncEngine {
  constructor(audioElement, options = {}) {
    this.audio = audioElement;

    this.attackMs = options.attackMs || 35;
    this.releaseMs = options.releaseMs || 130;
    this.noiseFloor = options.noiseFloor || 0.02;

    this.audioContext = null;
    this.analyser = null;
    this.source = null;

    this.data = null;
    this.openness = 0;
    this.peak = 0.05;

    this.running = false;
    this.lastTime = performance.now();

    this.onUpdate = options.onUpdate || (() => {});
  }

  async attach() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();

      this.source = this.audioContext.createMediaElementSource(this.audio);

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 1024;

      this.data = new Float32Array(this.analyser.fftSize);

      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    if (!this.running) {
      this.running = true;
      this.lastTime = performance.now();
      requestAnimationFrame(() => this.update());
    }
  }

  update() {
    if (!this.running) return;

    const now = performance.now();
    const deltaTime = Math.max(1, now - this.lastTime);
    this.lastTime = now;

    this.analyser.getFloatTimeDomainData(this.data);

    let sum = 0;

    for (let i = 0; i < this.data.length; i++) {
      sum += this.data[i] * this.data[i];
    }

    const rms = Math.sqrt(sum / this.data.length);

    this.peak = Math.max(rms, this.peak * 0.995);

    let target = rms / Math.max(this.peak, 0.0001);

    if (rms < this.noiseFloor) {
      target = 0;
    }

    target = Math.max(0, Math.min(1, target));

    const timeConstant =
      target > this.openness ? this.attackMs : this.releaseMs;

    const smoothing = 1 - Math.exp(-deltaTime / timeConstant);

    this.openness += (target - this.openness) * smoothing;

    this.onUpdate(this.openness);

    requestAnimationFrame(() => this.update());
  }

  getOpenness() {
    return this.openness;
  }

  stop() {
    this.running = false;
  }
}
