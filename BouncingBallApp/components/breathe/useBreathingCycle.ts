import { useState, useEffect, useRef, useCallback } from 'react';
import { BreathingPreset, BreathingPhase } from './PRESETS';
import * as Haptics from 'expo-haptics';

export interface BreathingState {
    currentPhase: BreathingPhase;
    phaseIndex: number;
    timeRemaining: number;
    isActive: boolean;
    progress: number; // 0 to 1
}

export const useBreathingCycle = (preset: BreathingPreset) => {
    const [state, setState] = useState({
        currentPhase: preset.phases[0],
        phaseIndex: 0,
        timeRemaining: preset.phases[0].duration,
        isActive: false,
        progress: 0
    } as BreathingState);

    const intervalRef = useRef(null);
    const startTimeRef = useRef(0);

    const startCycle = useCallback(() => {
        setState(prev => ({
            ...prev,
            isActive: true,
            currentPhase: preset.phases[0],
            phaseIndex: 0,
            timeRemaining: preset.phases[0].duration,
            progress: 0
        }));
        startTimeRef.current = Date.now();

        // Haptic feedback for inhale start
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, [preset]);

    const pauseCycle = useCallback(() => {
        setState(prev => ({ ...prev, isActive: false }));
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const resetCycle = useCallback(() => {
        setState({
            currentPhase: preset.phases[0],
            phaseIndex: 0,
            timeRemaining: preset.phases[0].duration,
            isActive: false,
            progress: 0
        });
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, [preset]);

    const nextPhase = useCallback(() => {
        setState(prev => {
            const nextIndex = (prev.phaseIndex + 1) % preset.phases.length;
            const nextPhase = preset.phases[nextIndex];

            // Haptic feedback for phase transitions
            if (nextPhase.name === 'inhale') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } else if (nextPhase.name === 'exhale') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } else if (nextPhase.name === 'hold') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            return {
                ...prev,
                currentPhase: nextPhase,
                phaseIndex: nextIndex,
                timeRemaining: nextPhase.duration,
                progress: 0
            };
        });
    }, [preset]);

    useEffect(() => {
        if (!state.isActive) return;

        intervalRef.current = setInterval(() => {
            setState(prev => {
                const newTimeRemaining = prev.timeRemaining - 0.1;
                const phaseProgress = 1 - (newTimeRemaining / prev.currentPhase.duration);

                if (newTimeRemaining <= 0) {
                    nextPhase();
                    return prev;
                }

                return {
                    ...prev,
                    timeRemaining: newTimeRemaining,
                    progress: phaseProgress
                };
            });
        }, 100);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [state.isActive, nextPhase]);

    // Update when preset changes
    useEffect(() => {
        resetCycle();
    }, [preset, resetCycle]);

    return {
        state,
        startCycle,
        pauseCycle,
        resetCycle,
        preset
    };
};
