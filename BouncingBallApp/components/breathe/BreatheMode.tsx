import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { BREATHING_PRESETS, BreathingPreset } from './PRESETS';
import { useBreathingCycle } from './useBreathingCycle';
import { SegmentedControl } from './SegmentedControl';
import { BreathingBall } from './BreathingBall';

export const BreatheMode = () => {
    const [selectedPreset, setSelectedPreset] = useState(BREATHING_PRESETS[0] as BreathingPreset);
    const [ambientSound, setAmbientSound] = useState(null as Audio.Sound | null);
    const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
    const [chimeSound, setChimeSound] = useState(null as Audio.Sound | null);

    const { state, startCycle, pauseCycle, resetCycle } = useBreathingCycle(selectedPreset);

    // Load sounds
    useEffect(() => {
        const loadSounds = async () => {
            try {
                // Load chime sound
                const { sound: chime } = await Audio.Sound.createAsync(
                    { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT' },
                    { shouldPlay: false, volume: 0.3 }
                );
                setChimeSound(chime);

                // Load ambient sound (placeholder)
                const { sound: ambient } = await Audio.Sound.createAsync(
                    { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT' },
                    { shouldPlay: false, volume: 0.1, isLooping: true }
                );
                setAmbientSound(ambient);
            } catch (error) {
                console.log('Error loading sounds:', error);
            }
        };

        loadSounds();

        return () => {
            if (chimeSound) chimeSound.unloadAsync();
            if (ambientSound) ambientSound.unloadAsync();
        };
    }, []);

    // Play chime on phase change
    useEffect(() => {
        if (chimeSound && state.isActive) {
            chimeSound.replayAsync().catch(console.log);
        }
    }, [state.currentPhase, chimeSound, state.isActive]);

    const toggleAmbient = async () => {
        if (!ambientSound) return;

        try {
            if (isAmbientPlaying) {
                await ambientSound.stopAsync();
                setIsAmbientPlaying(false);
            } else {
                await ambientSound.playAsync();
                setIsAmbientPlaying(true);
            }
        } catch (error) {
            console.log('Error toggling ambient sound:', error);
        }
    };

    const handlePresetChange = (preset: BreathingPreset) => {
        setSelectedPreset(preset);
        resetCycle();
        Haptics.selectionAsync();
    };

    const handleStart = () => {
        startCycle();
        if (ambientSound && !isAmbientPlaying) {
            toggleAmbient();
        }
    };

    const handlePause = () => {
        pauseCycle();
    };

    const handleReset = () => {
        resetCycle();
        if (ambientSound && isAmbientPlaying) {
            toggleAmbient();
        }
    };

    return (
        <View style={styles.container}>
            {/* Preset Selection */}
            <SegmentedControl
                presets={BREATHING_PRESETS}
                selectedPreset={selectedPreset}
                onPresetChange={handlePresetChange}
            />

            {/* Breathing Ball */}
            <View style={styles.ballContainer}>
                <BreathingBall
                    state={state}
                    color={selectedPreset.color}
                    size={120}
                />
            </View>

            {/* Phase Instruction */}
            <Text style={styles.phaseInstruction}>
                {state.currentPhase.instruction}
            </Text>

            {/* Controls */}
            <View style={styles.controls}>
                {!state.isActive ? (
                    <TouchableOpacity
                        style={[styles.button, styles.startButton]}
                        onPress={handleStart}
                        accessibilityLabel="Start breathing exercise"
                        accessibilityRole="button"
                    >
                        <Text style={styles.buttonText}>Start Breathing</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.activeControls}>
                        <TouchableOpacity
                            style={[styles.button, styles.pauseButton]}
                            onPress={handlePause}
                            accessibilityLabel="Pause breathing exercise"
                            accessibilityRole="button"
                        >
                            <Text style={styles.buttonText}>Pause</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.resetButton]}
                            onPress={handleReset}
                            accessibilityLabel="Reset breathing exercise"
                            accessibilityRole="button"
                        >
                            <Text style={styles.buttonText}>Reset</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Ambient Sound Toggle */}
                <TouchableOpacity
                    style={[styles.button, styles.ambientButton, isAmbientPlaying && styles.ambientActive]}
                    onPress={toggleAmbient}
                    accessibilityLabel={`${isAmbientPlaying ? 'Stop' : 'Start'} ambient sound`}
                    accessibilityRole="button"
                >
                    <Text style={styles.buttonText}>
                        {isAmbientPlaying ? '🔊 Ambient On' : '🔇 Ambient Off'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Instructions
            <Text style={styles.instructions}>
                Pinch to resize • Long press to squeeze
            </Text> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 200,
    },
    ballContainer: {
        marginVertical: 40,
    },
    phaseInstruction: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 30,
        opacity: 0.9,
    },
    controls: {
        alignItems: 'center',
        marginBottom: 20,
    },
    button: {
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        marginBottom: 15,
        minWidth: 150,
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: '#4CAF50',
    },
    pauseButton: {
        backgroundColor: '#FF9800',
    },
    resetButton: {
        backgroundColor: '#F44336',
    },
    ambientButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    ambientActive: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    activeControls: {
        flexDirection: 'row',
        gap: 15,
    },
    instructions: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 20,
    },
});
