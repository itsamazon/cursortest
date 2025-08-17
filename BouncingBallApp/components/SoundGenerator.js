// Simple tone generator for calming bounce sounds
export class SoundGenerator {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
    this.oscillator = null;
    this.gainNode = null;
  }

  async initialize() {
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // Resume audio context if suspended (needed for mobile browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
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

      // Configure the sound - softer and more calming
      oscillator.type = 'sine'; // Soft sine wave
      oscillator.frequency.setValueAtTime(180, this.audioContext.currentTime); // Lower pitch
      oscillator.frequency.exponentialRampToValueAtTime(360, this.audioContext.currentTime + 0.15); // Gentle pitch rise

      // Volume envelope for smooth sound - even softer
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.05, this.audioContext.currentTime + 0.02); // Lower volume
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.25);

      // Play the sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.25);

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

  // Method to create a simple beep sound that works on most platforms
  createSimpleBeep() {
    if (!this.initialized || !this.audioContext) {
      return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.03, this.audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);

    } catch (error) {
      console.log('Error creating beep:', error);
    }
  }
}