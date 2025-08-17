import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  Platform
} from 'react-native';
import { Audio } from 'expo-av';
import { BreatheMode } from './components/breathe/BreatheMode';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BALL_SIZE = 60;
const BOUNDARY_PADDING = BALL_SIZE / 2;

export default function App() {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [trail, setTrail] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [ballColor, setBallColor] = useState('#4dd0e1'); // Default cyan
  const [ballSpeed, setBallSpeed] = useState(1.5); // Default speed
  const [mode, setMode] = useState('bounce'); // Default to bounce mode
  const [ambientSound, setAmbientSound] = useState(null);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [ambientType, setAmbientType] = useState('rain');
  const isPlayingRef = useRef(false);
  const isSoundEnabledRef = useRef(false);
  const isAmbientPlayingRef = useRef(false);

  // Animation values
  const ballX = useRef(new Animated.Value(screenWidth / 2 - BALL_SIZE / 2)).current;
  const ballY = useRef(new Animated.Value(screenHeight / 2 - BALL_SIZE / 2)).current;

  // Velocity and direction (customizable speed)
  const velocityX = useRef(ballSpeed * 0.8);
  const velocityY = useRef(ballSpeed);
  const currentX = useRef(screenWidth / 2 - BALL_SIZE / 2);
  const currentY = useRef(screenHeight / 2 - BALL_SIZE / 2);

  // Animation loop
  const animate = () => {
    console.log('Animate called, isPlaying:', isPlayingRef.current);
    if (!isPlayingRef.current) {
      return; // Stop if not playing
    }

    // Update position
    currentX.current += velocityX.current;
    currentY.current += velocityY.current;

    console.log('Ball position:', currentX.current, currentY.current);

    // Bounce off walls with better collision detection
    if (currentX.current <= BOUNDARY_PADDING) {
      velocityX.current = Math.abs(velocityX.current) * 0.98; // Minimal energy loss
      currentX.current = BOUNDARY_PADDING;
      playBounceSound();
    } else if (currentX.current >= screenWidth - BOUNDARY_PADDING) {
      velocityX.current = -Math.abs(velocityX.current) * 0.98; // Minimal energy loss
      currentX.current = screenWidth - BOUNDARY_PADDING;
      playBounceSound();
    }

    if (currentY.current <= BOUNDARY_PADDING + 50) {
      velocityY.current = Math.abs(velocityY.current) * 0.98; // Minimal energy loss
      currentY.current = BOUNDARY_PADDING + 50;
      playBounceSound();
    } else if (currentY.current >= screenHeight - BOUNDARY_PADDING - 100) {
      velocityY.current = -Math.abs(velocityY.current) * 0.98; // Minimal energy loss
      currentY.current = screenHeight - BOUNDARY_PADDING - 100;
      playBounceSound();
    }

    // Ensure minimum velocity to prevent getting stuck
    if (Math.abs(velocityX.current) < 0.5) {
      velocityX.current = velocityX.current > 0 ? 0.5 : -0.5;
    }
    if (Math.abs(velocityY.current) < 0.5) {
      velocityY.current = velocityY.current > 0 ? 0.5 : -0.5;
    }

    // Add slight randomness to prevent perfect patterns (more calming)
    if (Math.random() < 0.003) {
      velocityX.current += (Math.random() - 0.5) * 0.2;
      velocityY.current += (Math.random() - 0.5) * 0.2;
    }

    // Update trail effect
    setTrail(prevTrail => {
      const newTrail = [
        { x: currentX.current, y: currentY.current, timestamp: Date.now() },
        ...prevTrail.slice(0, 8) // Keep last 8 positions
      ];
      return newTrail.filter(point => Date.now() - point.timestamp < 1000); // Remove old points
    });

    // Update animated values directly
    ballX.setValue(currentX.current - BALL_SIZE / 2);
    ballY.setValue(currentY.current - BALL_SIZE / 2);

    // Continue animation
    if (isPlayingRef.current) {
      requestAnimationFrame(animate);
    }
  };

  // Load sounds
  const loadSounds = async () => {
    try {
      // Set up audio mode for React Native
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Load local bounce sound from assets
      try {
        console.log('Attempting to load bounce.mp3...');
        const { sound: bounceSound } = await Audio.Sound.createAsync(
          require('./assets/bounce.mp3'),
          { shouldPlay: false, volume: 0.3, rate: 1.0 }
        );
        setSound(bounceSound);
        // Sound is always loaded and ready - toggle controls whether it plays
        setIsSoundEnabled(false);
        console.log('Local bounce sound loaded and ready (disabled by default)');
      } catch (error) {
        console.log('Failed to load local bounce sound:', error);
        console.log('Error details:', error.message);
        // Try to create a simple beep sound as fallback
        try {
          console.log('Creating fallback beep sound...');
          const { sound: beepSound } = await Audio.Sound.createAsync(
            { uri: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=' },
            { shouldPlay: false, volume: 0.2 }
          );
          setSound(beepSound);
          setIsSoundEnabled(false);
          console.log('Fallback beep sound created successfully');
        } catch (fallbackError) {
          console.log('Fallback sound also failed:', fallbackError);
          setIsSoundEnabled(false);
        }
      }

      // Load default ambient sound (rain)
      try {
        console.log('Loading default ambient sound (rain)...');
        const { sound: rainSound } = await Audio.Sound.createAsync(
          require('./assets/rain.mp3'),
          { shouldPlay: false, volume: 0.15, isLooping: true }
        );
        setAmbientSound(rainSound);
        console.log('Default ambient sound loaded successfully');
      } catch (error) {
        console.log('Failed to load ambient sound:', error);
      }
    } catch (error) {
      console.log('Error setting up audio:', error);
      setIsSoundEnabled(false);
    }
  };

  const playBounceSound = async () => {
    // Use ref to get the most current sound setting
    const shouldPlaySound = isSoundEnabledRef.current && sound;

    if (shouldPlaySound && isPlayingRef.current) {
      try {
        await sound.replayAsync();
        console.log('Bounce sound played! 🎵');
      } catch (error) {
        console.log('Error playing sound:', error);
        // Fallback to haptic feedback if sound fails
        try {
          const Haptics = await import('expo-haptics');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (hapticError) {
          console.log('Haptic feedback also failed:', hapticError);
        }
      }
    } else if (isPlayingRef.current) {
      // If sound is disabled, use haptic feedback instead
      try {
        const Haptics = await import('expo-haptics');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        console.log('Haptic feedback played (sound disabled)');
      } catch (hapticError) {
        console.log('Haptic feedback failed:', hapticError);
      }
    }
  };

  const toggleAnimation = () => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    isPlayingRef.current = newIsPlaying;

    console.log('Toggle animation, newIsPlaying:', newIsPlaying);

    if (newIsPlaying) {
      // Starting animation - reset ball position and velocity
      currentX.current = screenWidth / 2 - BALL_SIZE / 2;
      currentY.current = screenHeight / 2 - BALL_SIZE / 2;
      velocityX.current = ballSpeed * 0.8;
      velocityY.current = ballSpeed;
      ballX.setValue(currentX.current - BALL_SIZE / 2);
      ballY.setValue(currentY.current - BALL_SIZE / 2);
      console.log('Starting animation, ball position:', currentX.current, currentY.current);
      animate();
    } else {
      // Pausing - clear trail
      setTrail([]);
      console.log('Pausing animation');
    }
  };

  // Update ball speed when speed changes
  const updateBallSpeed = (newSpeed) => {
    setBallSpeed(newSpeed);
    if (isPlaying) {
      // Update current velocity if animation is running
      velocityX.current = newSpeed * 0.8;
      velocityY.current = newSpeed;
    }
  };

  // Handle mode switching - stop ball animation when switching to breathe mode
  const handleModeSwitch = (newMode) => {
    if (newMode === 'breathe' && isPlaying) {
      // Stop the bouncing ball animation when switching to breathe mode
      setIsPlaying(false);
      isPlayingRef.current = false;
      setTrail([]); // Clear the trail
      console.log('Stopped ball animation when switching to breathe mode');
    }
    setMode(newMode);
  };

  // Ambient sound controls
  const toggleAmbient = async () => {
    if (!ambientSound) return;

    try {
      if (isAmbientPlaying) {
        console.log('Stopping ambient sound...');
        await ambientSound.stopAsync();
        setIsAmbientPlaying(false);
        isAmbientPlayingRef.current = false;
        console.log('Ambient sound stopped');
      } else {
        console.log('Starting ambient sound...');
        await ambientSound.playAsync();
        setIsAmbientPlaying(true);
        isAmbientPlayingRef.current = true;
        console.log('Ambient sound started');
      }
    } catch (error) {
      console.log('Error toggling ambient sound:', error);
      setIsAmbientPlaying(false);
      isAmbientPlayingRef.current = false;
    }
  };

  const changeAmbientSound = async (type) => {
    if (isAmbientPlaying && ambientSound) {
      await ambientSound.stopAsync();
      setIsAmbientPlaying(false);
      isAmbientPlayingRef.current = false;
    }

    try {
      // Use local audio files
      const localAudioFiles = {
        rain: require('./assets/rain.mp3'),
        forest: require('./assets/forest.mp3'),
        ocean: require('./assets/ocean.mp3'),
        deeplow: require('./assets/deeplow.mp3')
      };

      const { sound: newAmbient } = await Audio.Sound.createAsync(
        localAudioFiles[type],
        { shouldPlay: false, volume: 0.15, isLooping: true }
      );

      if (ambientSound) {
        ambientSound.unloadAsync();
      }

      setAmbientSound(newAmbient);
      setAmbientType(type);
      console.log(`Ambient sound changed to: ${type}`);
    } catch (error) {
      console.log('Error changing ambient sound:', error);
    }
  };

  useEffect(() => {
    loadSounds();
  }, []);

  // Keep refs in sync with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isSoundEnabledRef.current = isSoundEnabled;
  }, [isSoundEnabled]);

  useEffect(() => {
    isAmbientPlayingRef.current = isAmbientPlaying;
  }, [isAmbientPlaying]);

  // Update velocities when speed changes
  useEffect(() => {
    if (isPlaying) {
      velocityX.current = ballSpeed * 0.8;
      velocityY.current = ballSpeed;
    }
  }, [ballSpeed, isPlaying]);

  // Cleanup sounds on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (ambientSound) {
        ambientSound.unloadAsync();
      }
    };
  }, [sound, ambientSound]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />

      {/* Mode Toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'bounce' && styles.modeButtonActive
          ]}
          onPress={() => handleModeSwitch('bounce')}
          accessibilityLabel="Switch to Bounce mode"
          accessibilityRole="button"
        >
          <Text style={[
            styles.modeButtonText,
            mode === 'bounce' && styles.modeButtonTextActive
          ]}>
            🏀 Bounce
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'breathe' && styles.modeButtonActive
          ]}
          onPress={() => handleModeSwitch('breathe')}
          accessibilityLabel="Switch to Breathe mode"
          accessibilityRole="button"
        >
          <Text style={[
            styles.modeButtonText,
            mode === 'breathe' && styles.modeButtonTextActive
          ]}>
            🫁 Breathe
          </Text>
        </TouchableOpacity>
      </View>

      {/* Render based on selected mode */}
      {mode === 'bounce' ? (
        <>
          {/* Trail effect */}
          {trail.map((point, index) => (
            <View
              key={`${point.timestamp}-${index}`}
              style={[
                styles.trailPoint,
                {
                  left: point.x - BALL_SIZE / 4,
                  top: point.y - BALL_SIZE / 4,
                  opacity: (trail.length - index) / trail.length * 0.3,
                  transform: [{ scale: (trail.length - index) / trail.length * 0.5 + 0.1 }],
                  backgroundColor: ballColor,
                  shadowColor: ballColor,
                }
              ]}
            />
          ))}

          {/* Ball */}
          <Animated.View
            style={[
              styles.ball,
              {
                left: ballX,
                top: ballY,
                backgroundColor: ballColor,
                shadowColor: ballColor,
              },
            ]}
          >
            {/* Inner glow */}
            <View style={[styles.ballInner, { backgroundColor: ballColor }]} />
          </Animated.View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.button, isPlaying ? styles.pauseButton : styles.playButton]}
              onPress={toggleAnimation}
            >
              <Text style={styles.buttonText}>
                {isPlaying ? '⏸️ Pause' : '▶️ Start'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.settingsButton]}
              onPress={() => setShowSettings(!showSettings)}
            >
              <Text style={styles.buttonText}>
                {showSettings ? '🔒 Close Settings' : '⚙️ Settings'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.instructionText}>
              {isPlaying
                ? 'Watch the bouncing ball to help calm your nerves'
                : 'Tap Start to begin the calming your nerves'
              }
            </Text>
          </View>
        </>
      ) : (
        <BreatheMode
          ambientSound={ambientSound}
          isAmbientPlaying={isAmbientPlaying}
          ambientType={ambientType}
          onToggleAmbient={toggleAmbient}
          onChangeAmbientSound={changeAmbientSound}
        />
      )}

      {/* Settings Panel */}
      {showSettings && (
        <TouchableWithoutFeedback onPress={() => setShowSettings(false)}>
          <View style={styles.settingsOverlay}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={styles.settingsPanel}>
                <Text style={styles.settingsTitle}>Customize Your Ball</Text>

                {/* Color Picker */}
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Ball Color:</Text>
                  <View style={styles.colorPicker}>
                    {['#4dd0e1', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'].map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          ballColor === color && styles.colorOptionSelected
                        ]}
                        onPress={() => setBallColor(color)}
                      />
                    ))}
                  </View>
                </View>

                {/* Speed Slider */}
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Ball Speed: {ballSpeed.toFixed(1)}x</Text>
                  <View style={styles.speedSlider}>
                    <TouchableOpacity
                      style={styles.speedButton}
                      onPress={() => updateBallSpeed(Math.max(0.5, ballSpeed - 0.2))}
                    >
                      <Text style={styles.speedButtonText}>-</Text>
                    </TouchableOpacity>
                    <View style={styles.speedDisplay}>
                      <Text style={styles.speedText}>{ballSpeed.toFixed(1)}x</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.speedButton}
                      onPress={() => updateBallSpeed(Math.min(3.0, ballSpeed + 0.2))}
                    >
                      <Text style={styles.speedButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Sound Toggle */}
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Bounce Sound:</Text>
                  <TouchableOpacity
                    style={[styles.button, styles.soundButton, isSoundEnabled ? styles.soundEnabled : styles.soundDisabled]}
                    onPress={() => setIsSoundEnabled(!isSoundEnabled)}
                  >
                    <Text style={styles.buttonText}>
                      {isSoundEnabled ? '🔊 On' : '🔇 Off'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Ambient Sound Selection */}
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Ambient Sound:</Text>
                  <View style={styles.ambientButtons}>
                    <TouchableOpacity
                      style={[
                        styles.ambientTypeButton,
                        ambientType === 'rain' && styles.ambientTypeButtonActive
                      ]}
                      onPress={() => changeAmbientSound('rain')}
                    >
                      <Text style={styles.ambientTypeButtonText}>🌧️ Rain</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.ambientTypeButton,
                        ambientType === 'forest' && styles.ambientTypeButtonActive
                      ]}
                      onPress={() => changeAmbientSound('forest')}
                    >
                      <Text style={styles.ambientTypeButtonText}>🌲 Forest</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.ambientTypeButton,
                        ambientType === 'ocean' && styles.ambientTypeButtonActive
                      ]}
                      onPress={() => changeAmbientSound('ocean')}
                    >
                      <Text style={styles.ambientTypeButtonText}>🌊 Ocean</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.ambientTypeButton,
                        ambientType === 'deeplow' && styles.ambientTypeButtonActive
                      ]}
                      onPress={() => changeAmbientSound('deeplow')}
                    >
                      <Text style={styles.ambientTypeButtonText}>🔊 Deep Low</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Ambient Sound Toggle */}
                  <TouchableOpacity
                    style={[styles.button, styles.ambientButton, isAmbientPlaying && styles.ambientActive]}
                    onPress={toggleAmbient}
                  >
                    <Text style={styles.buttonText}>
                      {isAmbientPlaying ? '🔊 Ambient On' : '🔇 Ambient Off'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23', // Deep space blue
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a2e',
    opacity: 0.8,
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: '#4dd0e1', // Soft cyan
    shadowColor: '#4dd0e1',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballInner: {
    width: BALL_SIZE * 0.6,
    height: BALL_SIZE * 0.6,
    borderRadius: (BALL_SIZE * 0.6) / 2,
    backgroundColor: '#80deea',
    shadowColor: '#ffffff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  trailPoint: {
    position: 'absolute',
    width: BALL_SIZE / 2,
    height: BALL_SIZE / 2,
    borderRadius: BALL_SIZE / 4,
    backgroundColor: '#4dd0e1',
    shadowColor: '#4dd0e1',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  controls: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    minWidth: 120,
  },
  playButton: {
    backgroundColor: '#26c6da',
  },
  pauseButton: {
    backgroundColor: '#ff7043',
  },
  soundButton: {
    marginTop: 10,
  },
  soundEnabled: {
    backgroundColor: '#66bb6a',
  },
  soundDisabled: {
    backgroundColor: '#757575',
  },
  settingsButton: {
    backgroundColor: '#9c27b0',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  instructionText: {
    color: '#b39ddb',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  settingsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsPanel: {
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4dd0e1',
    minWidth: 300,
    maxWidth: '90%',
  },
  settingsTitle: {
    color: '#4dd0e1',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  settingRow: {
    marginBottom: 20,
  },
  settingLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#ffffff',
    borderWidth: 3,
  },
  speedSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  speedButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4dd0e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  speedDisplay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    minWidth: 80,
    alignItems: 'center',
  },
  speedText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modeToggle: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 4,
    zIndex: 1000,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  modeButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#1a1a2e',
    fontWeight: '700',
  },
  ambientButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  ambientTypeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ambientTypeButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  ambientTypeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  ambientButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  ambientActive: {
    backgroundColor: '#4CAF50',
  },
});
