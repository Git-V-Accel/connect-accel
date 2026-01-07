/**
 * Utility function to play notification sound
 * Uses Web Audio API to generate a pleasant notification sound
 */
export function playNotificationSound(): void {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for the sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound: pleasant two-tone chime
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    oscillator.type = 'sine';
    
    // Set volume envelope (fade in and out)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    // Play the sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    // Clean up
    oscillator.onended = () => {
      audioContext.close();
    };
  } catch (error) {
    // Silently fail if audio context is not available (e.g., autoplay restrictions)
    console.debug('Could not play notification sound:', error);
  }
}

