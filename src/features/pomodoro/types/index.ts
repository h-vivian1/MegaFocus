export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroState {
    mode: TimerMode;
    timeLeft: number; // em segundos
    isActive: boolean;
    cycles: number;
}

export const POMODORO_SETTINGS = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
};
