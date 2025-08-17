export interface BreathingPreset {
    id: string;
    name: string;
    color: string;
    phases: BreathingPhase[];
    totalDuration: number;
}

export interface BreathingPhase {
    name: 'inhale' | 'hold' | 'exhale';
    duration: number; // in seconds
    instruction: string;
}

export const BREATHING_PRESETS: BreathingPreset[] = [
    {
        id: 'coherent',
        name: 'Coherent',
        color: '#7FB3FF',
        phases: [
            { name: 'inhale', duration: 5, instruction: 'Inhale slowly and deeply' },
            { name: 'exhale', duration: 5, instruction: 'Exhale slowly and completely' }
        ],
        totalDuration: 10
    },
    {
        id: 'box',
        name: 'Box',
        color: '#9AD1C8',
        phases: [
            { name: 'inhale', duration: 4, instruction: 'Inhale for 4 seconds' },
            { name: 'hold', duration: 4, instruction: 'Hold your breath' },
            { name: 'exhale', duration: 4, instruction: 'Exhale for 4 seconds' },
            { name: 'hold', duration: 4, instruction: 'Hold empty lungs' }
        ],
        totalDuration: 16
    },
    {
        id: '478',
        name: '4-7-8',
        color: '#B3A4FF',
        phases: [
            { name: 'inhale', duration: 4, instruction: 'Inhale for 4 seconds' },
            { name: 'hold', duration: 7, instruction: 'Hold for 7 seconds' },
            { name: 'exhale', duration: 8, instruction: 'Exhale for 8 seconds' }
        ],
        totalDuration: 19
    }
];

export const getPresetById = (id: string): BreathingPreset | undefined => {
    return BREATHING_PRESETS.find(preset => preset.id === id);
};
