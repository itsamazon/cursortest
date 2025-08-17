import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import {
    GestureDetector,
    Gesture,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface SqueezableWrapperProps {
    children: any;
    onSqueezeStart?: () => void;
    onSqueezeEnd?: () => void;
}

export const SqueezableWrapper = ({
    children,
    onSqueezeStart,
    onSqueezeEnd,
}: SqueezableWrapperProps) => {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const longPressActive = useSharedValue(false);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            savedScale.value = scale.value;
        })
        .onUpdate((event) => {
            scale.value = Math.max(0.7, Math.min(1.2, savedScale.value * event.scale));
        })
        .onEnd(() => {
            scale.value = withSpring(1, {
                damping: 15,
                stiffness: 150,
            });
        });

    const longPressGesture = Gesture.LongPress()
        .minDuration(500)
        .onStart(() => {
            longPressActive.value = true;
            scale.value = withTiming(0.8, { duration: 200 });
            if (onSqueezeStart) {
                runOnJS(onSqueezeStart)();
            }
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        })
        .onEnd(() => {
            longPressActive.value = false;
            scale.value = withSpring(1, {
                damping: 15,
                stiffness: 150,
            });
            if (onSqueezeEnd) {
                runOnJS(onSqueezeEnd)();
            }
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        });

    const composed = Gesture.Simultaneous(pinchGesture, longPressGesture);

    return (
        <GestureHandlerRootView>
            <View style={styles.container}>
                <GestureDetector gesture={composed}>
                    <Animated.View style={[styles.wrapper, animatedStyle]}>
                        {children}
                    </Animated.View>
                </GestureDetector>
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
