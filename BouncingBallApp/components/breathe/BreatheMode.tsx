import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { BREATHING_PRESETS, BreathingPreset } from './PRESETS';
import { useBreathingCycle } from './useBreathingCycle';
import { SegmentedControl } from './SegmentedControl';
import { BreathingBall } from './BreathingBall';

interface BreatheModeProps {
    ambientSound: Audio.Sound | null;
    isAmbientPlaying: boolean;
    ambientType: string;
    onToggleAmbient: () => void;
    onChangeAmbientSound: (type: string) => void;
}

export const BreatheMode = ({
    ambientSound,
    isAmbientPlaying,
    ambientType,
    onToggleAmbient,
    onChangeAmbientSound
}: BreatheModeProps) => {
    const [selectedPreset, setSelectedPreset] = useState(BREATHING_PRESETS[0] as BreathingPreset);
    const [chimeSound, setChimeSound] = useState(null as Audio.Sound | null);
    const [customSoundUrl, setCustomSoundUrl] = useState('');
    const [isCustomSound, setIsCustomSound] = useState(false);

    const { state, startCycle, pauseCycle, resetCycle } = useBreathingCycle(selectedPreset);

    // Load chime sound only
    useEffect(() => {
        const loadChimeSound = async () => {
            try {
                // Set up audio mode
                console.log('Setting up audio context for chime...');
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    staysActiveInBackground: false,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });

                // Load chime sound for phase changes
                console.log('Loading chime sound...');
                const { sound: chime } = await Audio.Sound.createAsync(
                    require('../../assets/switch.wav'),
                    { shouldPlay: false, volume: 0.4 }
                );

                setChimeSound(chime);
                console.log('Chime sound loaded successfully');
            } catch (error) {
                console.log('Error loading chime sound:', error);
                setChimeSound(null);
            }
        };

        loadChimeSound();

        return () => {
            if (chimeSound) chimeSound.unloadAsync();
        };
    }, []);

    // Play chime on phase change
    useEffect(() => {
        if (chimeSound && state.isActive) {
            try {
                chimeSound.replayAsync().catch(error => {
                    console.log('Error playing chime:', error);
                    // Fallback to haptics if audio fails
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                });
            } catch (error) {
                console.log('Error with chime sound:', error);
                // Fallback to haptics
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
        } else if (state.isActive) {
            // Use haptics if no chime sound is available
            try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (hapticError) {
                console.log('Haptic feedback also failed:', hapticError);
            }
        }
    }, [state.currentPhase, chimeSound, state.isActive]);

    // Custom sound loading (if needed)
    const loadCustomSound = async (url: string) => {
        if (!url.trim()) return;
        // Note: Custom sound functionality moved to parent component
        console.log('Custom sound loading moved to parent component');
    };

    const handlePresetChange = (preset: BreathingPreset) => {
        setSelectedPreset(preset);
        resetCycle();
        Haptics.selectionAsync();
    };

    const handleStart = () => {
        startCycle();
        // Automatically start ambient sound when breathing begins
        if (ambientSound && !isAmbientPlaying) {
            onToggleAmbient();
        }
    };

    const handlePause = () => {
        pauseCycle();
        // Keep ambient sound playing even when paused
        // This creates a continuous relaxing atmosphere
    };

    const handleReset = () => {
        resetCycle();
        // Keep ambient sound playing for continuous relaxation
        // Only stop if user manually toggles it off
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

            {/* Ambient Sound Selection */}
            <View style={styles.ambientSelection}>
                <Text style={styles.ambientLabel}>Ambient Sounds:</Text>
                <View style={styles.ambientButtons}>
                    <TouchableOpacity
                        style={[
                            styles.ambientTypeButton,
                            ambientType === 'rain' && styles.ambientTypeButtonActive
                        ]}
                        onPress={() => onChangeAmbientSound('rain')}
                    >
                        <Text style={styles.ambientTypeButtonText}>🌧️ Rain</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.ambientTypeButton,
                            ambientType === 'forest' && styles.ambientTypeButtonActive
                        ]}
                        onPress={() => onChangeAmbientSound('forest')}
                    >
                        <Text style={styles.ambientTypeButtonText}>🌲 Forest</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.ambientTypeButton,
                            ambientType === 'ocean' && styles.ambientTypeButtonActive
                        ]}
                        onPress={() => onChangeAmbientSound('ocean')}
                    >
                        <Text style={styles.ambientTypeButtonText}>🌊 Ocean</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.ambientTypeButton,
                            ambientType === 'deeplow' && styles.ambientTypeButtonActive
                        ]}
                        onPress={() => onChangeAmbientSound('deeplow')}
                    >
                        <Text style={styles.ambientTypeButtonText}>🔊 Deep Low</Text>
                    </TouchableOpacity>
                </View>

                {/* Custom Sound Input */}
                {/* <View style={styles.customSoundSection}>
                    <Text style={styles.customSoundLabel}>Or add your own sound:</Text>
                    <View style={styles.customSoundInput}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Paste sound URL here..."
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            value={customSoundUrl}
                            onChangeText={setCustomSoundUrl}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity
                            style={[styles.button, styles.loadButton]}
                            onPress={() => loadCustomSound(customSoundUrl)}
                        >
                            <Text style={styles.buttonText}>Load</Text>
                        </TouchableOpacity>
                    </View>
                    {isCustomSound && (
                        <Text style={styles.customSoundStatus}>
                            ✅ Custom sound loaded: {customSoundUrl.substring(0, 30)}...
                        </Text>
                    )}
                </View> */}
            </View>

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
                    onPress={onToggleAmbient}
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
        height: '70%',
        marginTop: 60,
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
    ambientSelection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    ambientLabel: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        opacity: 0.8,
    },
    ambientButtons: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
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
    customSoundSection: {
        alignItems: 'center',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    customSoundLabel: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 10,
        opacity: 0.8,
    },
    customSoundInput: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        width: '100%',
    },
    textInput: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        color: '#ffffff',
        fontSize: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    loadButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#4CAF50',
        minWidth: 80,
    },
    customSoundStatus: {
        color: '#4CAF50',
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
        opacity: 0.8,
    },
});
