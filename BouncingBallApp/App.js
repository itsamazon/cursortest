import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  View, 
  Dimensions, 
  Animated, 
  Easing,
  TouchableOpacity,
  Text,
  Platform
} from 'react-native';
import { Audio } from 'expo-av';
import { SoundGenerator } from './components/SoundGenerator';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BALL_SIZE = 60;
const BOUNDARY_PADDING = BALL_SIZE / 2;

export default function App() {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [trail, setTrail] = useState([]);
  const soundGenerator = useRef(new SoundGenerator()).current;
  
  // Animation values
  const ballX = useRef(new Animated.Value(screenWidth / 2 - BALL_SIZE / 2)).current;
  const ballY = useRef(new Animated.Value(screenHeight / 2 - BALL_SIZE / 2)).current;
  
  // Velocity and direction (slower for more calming effect)
  const velocityX = useRef(2);
  const velocityY = useRef(2.5);
  const currentX = useRef(screenWidth / 2 - BALL_SIZE / 2);
  const currentY = useRef(screenHeight / 2 - BALL_SIZE / 2);

  // Animation loop
  const animate = () => {
    // Update position
    currentX.current += velocityX.current;
    currentY.current += velocityY.current;

    // Bounce off walls with smoother collision detection
    if (currentX.current <= BOUNDARY_PADDING || currentX.current >= screenWidth - BOUNDARY_PADDING) {
      velocityX.current *= -0.95; // Slight energy loss for more natural bounce
      velocityX.current *= -1;
      currentX.current = Math.max(BOUNDARY_PADDING, Math.min(currentX.current, screenWidth - BOUNDARY_PADDING));
      playBounceSound();
    }
    
    if (currentY.current <= BOUNDARY_PADDING + 50 || currentY.current >= screenHeight - BOUNDARY_PADDING - 100) {
      velocityY.current *= -0.95; // Slight energy loss for more natural bounce
      velocityY.current *= -1;
      currentY.current = Math.max(BOUNDARY_PADDING + 50, Math.min(currentY.current, screenHeight - BOUNDARY_PADDING - 100));
      playBounceSound();
    }

    // Add slight randomness to prevent perfect patterns (more calming)
    if (Math.random() < 0.01) {
      velocityX.current += (Math.random() - 0.5) * 0.1;
      velocityY.current += (Math.random() - 0.5) * 0.1;
    }

    // Update trail effect
    setTrail(prevTrail => {
      const newTrail = [
        { x: currentX.current, y: currentY.current, timestamp: Date.now() },
        ...prevTrail.slice(0, 8) // Keep last 8 positions
      ];
      return newTrail.filter(point => Date.now() - point.timestamp < 1000); // Remove old points
    });

    // Animate to new position
    Animated.parallel([
      Animated.timing(ballX, {
        toValue: currentX.current - BALL_SIZE / 2,
        duration: 16,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(ballY, {
        toValue: currentY.current - BALL_SIZE / 2,
        duration: 16,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Continue animation
      if (isPlaying) {
        requestAnimationFrame(animate);
      }
    });
  };

  // Load sound 
  const loadSound = async () => {
    try {
      if (Platform.OS === 'web') {
        // Use web audio for web platform
        const initialized = await soundGenerator.initialize();
        setIsSoundEnabled(initialized);
      } else {
        // Use expo-av for mobile platforms
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        setIsSoundEnabled(true);
      }
    } catch (error) {
      console.log('Error loading sound:', error);
    }
  };

  const playBounceSound = () => {
    if (isSoundEnabled && isPlaying) {
      if (Platform.OS === 'web') {
        soundGenerator.playBounceSound();
      } else {
        // For mobile, you could add actual sound file playback here
        console.log('Bounce!');
      }
    }
  };

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      animate();
    }
  };

  useEffect(() => {
    loadSound();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      animate();
    }
  }, [isPlaying]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />
      
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
              transform: [{ scale: (trail.length - index) / trail.length * 0.5 + 0.1 }]
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
          },
        ]}
      >
        {/* Inner glow */}
        <View style={styles.ballInner} />
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
          style={[styles.button, styles.soundButton, isSoundEnabled ? styles.soundEnabled : styles.soundDisabled]}
          onPress={() => setIsSoundEnabled(!isSoundEnabled)}
        >
          <Text style={styles.buttonText}>
            {isSoundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.instructionText}>
          {isPlaying 
            ? 'Watch the bouncing ball to help calm your nerves' 
            : 'Tap Start to begin the calming animation'
          }
        </Text>
      </View>
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
});
