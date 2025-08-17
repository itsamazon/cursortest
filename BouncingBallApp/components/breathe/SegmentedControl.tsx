import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BreathingPreset } from './PRESETS';

interface SegmentedControlProps {
    presets: BreathingPreset[];
    selectedPreset: BreathingPreset;
    onPresetChange: (preset: BreathingPreset) => void;
}

export const SegmentedControl = ({
    presets,
    selectedPreset,
    onPresetChange
}: SegmentedControlProps) => {
    return (
        <View style={styles.container}>
            {presets.map((preset) => (
                <TouchableOpacity
                    key={preset.id}
                    style={[
                        styles.segment,
                        selectedPreset.id === preset.id && styles.segmentSelected
                    ]}
                    onPress={() => onPresetChange(preset)}
                    accessibilityLabel={`Select ${preset.name} breathing pattern`}
                    accessibilityRole="button"
                >
                    <Text
                        style={[
                            styles.segmentText,
                            selectedPreset.id === preset.id && styles.segmentTextSelected
                        ]}
                    >
                        {preset.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 25,
        padding: 4,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    segment: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    segmentSelected: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    segmentText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        fontWeight: '600',
    },
    segmentTextSelected: {
        color: '#1a1a2e',
        fontWeight: '700',
    },
});
