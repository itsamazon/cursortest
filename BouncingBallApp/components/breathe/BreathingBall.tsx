import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { BreathingState } from './useBreathingCycle';
import { ProgressRing } from './ProgressRing';
import { SqueezableWrapper } from './SqueezableWrapper';

interface BreathingBallProps {
    state: BreathingState;
    color: string;
    size?: number;
}

export const BreathingBall = ({
    state,
    color,
    size = 120,
}: BreathingBallProps) => {
    const ballScale = useSharedValue(1);
    const progressRingSize = size + 40;

    useEffect(() => {
        if (state.currentPhase.name === 'inhale') {
            ballScale.value = withTiming(1.2, {
                duration: state.currentPhase.duration * 1000,
                easing: Easing.inOut(Easing.ease),
            });
        } else if (state.currentPhase.name === 'exhale') {
            ballScale.value = withTiming(1, {
                duration: state.currentPhase.duration * 1000,
                easing: Easing.inOut(Easing.ease),
            });
        } else if (state.currentPhase.name === 'hold') {
            // Keep current scale during hold
        }
    }, [state.currentPhase, state.currentPhase.duration]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ballScale.value }],
    }));

    const getPhaseInstruction = () => {
        const phase = state.currentPhase;
        switch (phase.name) {
            case 'inhale':
                return 'Inhale';
            case 'exhale':
                return 'Exhale';
            case 'hold':
                return 'Hold';
            default:
                return '';
        }
    };

    return (
        <View style={styles.container}>
            {/* Progress Ring */}
            <ProgressRing
                progress={state.progress}
                size={progressRingSize}
                strokeWidth={4}
                color={color}
            />

            {/* Breathing Ball */}
            <SqueezableWrapper children={
                <Animated.View
                    style={[
                        styles.ball,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            backgroundColor: color,
                        },
                        animatedStyle,
                    ]}
                    accessibilityLabel={`Breathing ball, current phase: ${getPhaseInstruction()}`}
                    accessibilityRole="image"
                >
                    {/* Inner glow */}
                    <View
                        style={[
                            styles.ballInner,
                            {
                                width: size * 0.6,
                                height: size * 0.6,
                                borderRadius: (size * 0.6) / 2,
                                backgroundColor: color,
                            },
                        ]}
                    />
                </Animated.View>
            } />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    ball: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ballInner: {
        shadowColor: '#ffffff',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 10,
    },
});
