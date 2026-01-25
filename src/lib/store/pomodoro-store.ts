import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface PomodoroState {
    timeLeft: number;
    isActive: boolean;
    mode: TimerMode;
    initialTime: number;
    cyclesCompleted: number; // Quantos pomodoros completos

    // Configs
    sounds: {
        focusFinished: string;
        breakFinished: string;
    };

    // Actions
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    setMode: (mode: TimerMode) => void;
    tick: () => { justFinished: boolean, newMode: TimerMode }; // Retorna info pro componente tocar som
    setSound: (type: 'focusFinished' | 'breakFinished', url: string) => void;
}

const MODES = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
};

// Sons Padrão
const DEFAULT_SOUNDS = {
    focusFinished: '/alarm-digital.mp3',
    breakFinished: '/alarm-whistle-bird.mp3',
};

export const usePomodoroStore = create<PomodoroState>()(
    persist(
        (set, get) => ({
            mode: 'focus',
            timeLeft: MODES.focus,
            initialTime: MODES.focus,
            isActive: false,
            cyclesCompleted: 0,
            sounds: DEFAULT_SOUNDS,

            startTimer: () => set({ isActive: true }),
            pauseTimer: () => set({ isActive: false }),

            resetTimer: () => {
                const { mode } = get();
                set({ isActive: false, timeLeft: MODES[mode], initialTime: MODES[mode] });
            },

            setMode: (mode) => set({
                mode,
                timeLeft: MODES[mode],
                initialTime: MODES[mode],
                isActive: false
            }),

            setSound: (type, url) => set((state) => ({
                sounds: { ...state.sounds, [type]: url }
            })),

            tick: () => {
                const { timeLeft, mode, cyclesCompleted } = get();

                if (timeLeft <= 0) {
                    // Lógica de Fim de Timer
                    const isFocus = mode === 'focus';
                    const newCycles = isFocus ? cyclesCompleted + 1 : cyclesCompleted;

                    // Define o próximo modo automaticamente
                    let nextMode: TimerMode = 'focus';
                    let shouldAutoStart = false; // Por padrão, pausa e espera

                    if (isFocus) {
                        // Fim de Foco -> Vai para Descanso (Auto Start!)
                        nextMode = (newCycles % 3 === 0 && newCycles > 0) ? 'longBreak' : 'shortBreak';
                        shouldAutoStart = true; // Descanso começa sozinho
                    } else {
                        // Fim de Descanso -> Vai para Foco (AGORA AUTOMÁTICO TAMBÉM)
                        nextMode = 'focus';
                        shouldAutoStart = true; // Foco começa sozinho
                    }

                    set({
                        isActive: shouldAutoStart,
                        timeLeft: MODES[nextMode],
                        initialTime: MODES[nextMode],
                        mode: nextMode,
                        cyclesCompleted: newCycles
                    });

                    // Retorna o modo que ACABOU e o NOVO modo para tocar o som correto
                    // Se newMode é focus, então acabou o break -> Tocar som de break finished
                    return { justFinished: true, newMode: nextMode }; // Sinaliza pro UI tocar som
                }

                set({ timeLeft: timeLeft - 1 });
                return { justFinished: false, newMode: mode };
            },
        }),
        {
            name: 'pomodoro-storage',
        }
    )
);
