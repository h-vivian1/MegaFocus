"use client";

import { useEffect, useRef } from "react";
import { usePomodoroStore } from "@/lib/store/pomodoro-store";
import { toast } from "sonner";

export function usePomodoro() {
    const {
        mode,
        timeLeft,
        isActive,
        initialTime,
        cyclesCompleted: cycles, // Alias to match previous interface
        startTimer,
        pauseTimer,
        resetTimer,
        setMode,
        tick,
        sounds
    } = usePomodoroStore();

    // Toggle wrapper
    const toggleTimer = () => {
        if (isActive) pauseTimer();
        else startTimer();
    };

    // Main Timer Effect REMOVED
    // The timer logic is now centralized in PomodoroSidebar (or a global provider)
    // to avoid multiple intervals running faster than real time.
    // This hook now only subscribes to the store updates.

    // Calcular progresso
    const progress = ((initialTime - timeLeft) / initialTime) * 100;

    return {
        mode,
        timeLeft,
        isActive,
        cycles,
        toggleTimer,
        resetTimer,
        setMode,
        progress
    };
}
