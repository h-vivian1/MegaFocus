"use client";

import { Play, Pause, RefreshCw, Coffee, Brain, Armchair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePomodoro } from "../hooks/use-pomodoro";
import { cn } from "@/lib/utils";

// Formatação mm:ss
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export function PomodoroTimer() {
    const { mode, timeLeft, isActive, toggleTimer, resetTimer, setMode, progress, cycles } = usePomodoro();

    return (
        <div className="w-full max-w-sm mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center relative overflow-hidden">

            {/* Barra de Progresso no Topo */}
            <div className="absolute top-0 left-0 h-1 bg-slate-100 w-full">
                <div
                    className={cn("h-full transition-all duration-1000 ease-linear",
                        mode === 'focus' ? "bg-red-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Tabs de Modo */}
            <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button
                    onClick={() => setMode("focus")}
                    className={cn(
                        "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                        mode === "focus"
                            ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                            : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <Brain className="w-4 h-4" /> Foco
                </button>
                <button
                    onClick={() => setMode("shortBreak")}
                    className={cn(
                        "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                        mode === "shortBreak"
                            ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                            : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <Coffee className="w-4 h-4" /> Curta
                </button>
                <button
                    onClick={() => setMode("longBreak")}
                    className={cn(
                        "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                        mode === "longBreak"
                            ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                            : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <Armchair className="w-4 h-4" /> Longa
                </button>
            </div>

            <div className="mb-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Ciclo #{cycles + 1}
            </div>

            {/* Timer Gigante */}
            <div className="text-8xl font-bold font-mono tracking-tighter text-slate-900 dark:text-white mb-8 tabular-nums">
                {formatTime(timeLeft)}
            </div>

            {/* Controles */}
            <div className="flex items-center gap-4">
                <Button
                    size="lg"
                    className={cn(
                        "h-16 w-16 rounded-full transition-all text-white shadow-lg hover:scale-105 active:scale-95",
                        mode === 'focus' ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600",
                        isActive && "animate-pulse" // Pulsa quando ativo
                    )}
                    onClick={toggleTimer}
                >
                    {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </Button>

                <Button size="icon" variant="ghost" className="h-12 w-12 rounded-full" onClick={resetTimer}>
                    <RefreshCw className="w-5 h-5" />
                </Button>
            </div>

        </div>
    );
}
