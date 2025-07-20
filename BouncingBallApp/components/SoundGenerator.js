// Simple tone generator for calming bounce sounds
export class SoundGenerator {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.initialized = true;
      return true;
    } catch (error) {
      console.log('Audio context not available:', error);
      return false;
    }
  }

  playBounceSound() {
    if (!this.initialized || !this.audioContext) {
      return;
    }

    try {
      // Create a gentle, calming tone
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure the sound
      oscillator.type = 'sine'; // Soft sine wave
      oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3 note
      oscillator.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.1); // Gentle pitch rise

      // Volume envelope for smooth sound
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);

      // Play the sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);

    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }

  playAmbientTone() {
    if (!this.initialized || !this.audioContext) {
      return;
    }

    try {
      // Create a very gentle ambient tone
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(110, this.audioContext.currentTime); // Low A note

      // Very quiet background tone
      gainNode.gain.setValueAtTime(0.02, this.audioContext.currentTime);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 5); // 5 second ambient tone

    } catch (error) {
      console.log('Error playing ambient sound:', error);
    }
  }
}