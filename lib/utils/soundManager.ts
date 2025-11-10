class SoundManager {
  audioContext: AudioContext | null = null;
  sounds: { [key: string]: AudioBuffer } = {};
  isMuted: boolean = true;
  volume: number = 1.0;

  constructor() {
    if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.loadSettings();
    }
  }

  loadSound(name: string, url: string) {
    if (!this.audioContext) return;
    window.fetch(url)
      .then(response => response.arrayBuffer())
      .then(buffer => this.audioContext!.decodeAudioData(buffer))
      .then(audioBuffer => {
        this.sounds[name] = audioBuffer;
      });
  }

  playSound(name: string) {
    if (!this.audioContext || !this.sounds[name] || this.isMuted) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[name];

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = this.volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(0);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.saveSettings();
  }

  setVolume(volume: number) {
    this.volume = volume;
    this.saveSettings();
  }

  saveSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundSettings', JSON.stringify({
        isMuted: this.isMuted,
        volume: this.volume
      }));
    }
  }

  loadSettings() {
    if (typeof window !== 'undefined') {
      const settings = localStorage.getItem('soundSettings');
      if (settings) {
        const { isMuted, volume } = JSON.parse(settings);
        this.isMuted = isMuted;
        this.volume = volume;
      }
    }
  }
}

const soundManager = new SoundManager();
export default soundManager;
