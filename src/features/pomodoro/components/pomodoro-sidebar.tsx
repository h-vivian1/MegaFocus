"use client";

import { useEffect, useState } from "react";
import { usePomodoroStore } from "@/lib/store/pomodoro-store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Coffee, Brain, Armchair, Settings2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SleepingZ } from "./sleeping-z";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PomodoroSidebar() {
    const {
        timeLeft,
        isActive,
        mode,
        initialTime,
        cyclesCompleted,
        sounds,
        startTimer,
        pauseTimer,
        resetTimer,
        setMode,
        tick,
        setSound
    } = usePomodoroStore();

    const [mounted, setMounted] = useState(false);

    // Hidratação segura (por causa do persist)
    useEffect(() => {
        setMounted(true);
    }, []);

    // O Relógio Core Loop
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                const { justFinished, newMode } = tick();

                if (justFinished) {
                    // Toca o som apropriado
                    const isBreakStarting = newMode !== 'focus'; // Se acabou foco, começa break
                    const soundUrl = isBreakStarting ? sounds.focusFinished : sounds.breakFinished;

                    console.log(`[Pomodoro] Tentando tocar som: ${soundUrl}`);

                    const audio = new Audio(soundUrl);
                    audio.volume = 1.0; // Volume máximo

                    const playPromise = audio.play();

                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => {
                                console.log("[Pomodoro] Som tocado com sucesso.");
                            })
                            .catch(error => {
                                console.error("[Pomodoro] Falha ao tocar som:", error);
                                toast.error("O navegador bloqueou o som automático. Interaja com a página para habilitar.");
                            });
                    }

                    if (isBreakStarting) {
                        toast.success("Foco completo! Hora do descanso. ☕");
                    } else {
                        toast.info("Descanso acabou! De volta ao trabalho. 🚀");
                    }
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, tick, sounds]);


    // Formatar MM:SS
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Título da aba
    useEffect(() => {
        document.title = isActive ? `(${formattedTime}) MegaFocus` : "MegaFocus";
    }, [formattedTime, isActive]);

    // Cálculo da barra de progresso (invertida)
    const progress = 100 - (timeLeft / initialTime) * 100;

    if (!mounted) return null; // Evita mismatch de hidratação

    // Cores Dinâmicas
    const getTheme = () => {
        switch (mode) {
            case 'focus': return 'bg-slate-900 border-slate-800 text-white';
            case 'shortBreak': return 'bg-emerald-500 border-emerald-600 text-white';
            case 'longBreak': return 'bg-blue-500 border-blue-600 text-white';
        }
    };

    const getButtonTheme = () => {
        if (mode === 'focus') return "bg-white text-slate-900 hover:bg-slate-200";
        return "bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-sm";
    }

    return (
        <aside className={cn(
            "fixed right-0 top-0 h-screen w-[320px] p-6 flex flex-col shadow-2xl z-40 transition-colors duration-700 ease-in-out border-l",
            getTheme()
        )}>

            {/* Elementos Decorativos de Sono */}
            {(mode === 'shortBreak' || mode === 'longBreak') && <SleepingZ />}

            {/* Header */}
            <div className="mb-4 mt-2 flex justify-between items-start opacity-90">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        Pomodoro
                        {mode === 'focus' && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1 bg-black/20 w-fit px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 opacity-70" />
                        <span className="text-xs font-medium opacity-80">Ciclo #{cyclesCompleted + 1}</span>
                    </div>
                </div>

                {/* Configurações de Som */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                            <Settings2 className="w-4 h-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-4">
                        <div className="grid gap-4">
                            <h4 className="font-medium leading-none mb-2">Sons & Alertas</h4>

                            {/* Helper para renderizar seletor com preview */}
                            {[
                                { id: 'focusFinished', label: 'Foco (Fim)', value: sounds.focusFinished },
                                { id: 'breakFinished', label: 'Pausa (Fim)', value: sounds.breakFinished }
                            ].map((setting) => (
                                <div key={setting.id} className="grid gap-2">
                                    <Label className="text-xs text-slate-500 font-semibold uppercase">{setting.label}</Label>
                                    <div className="flex gap-2">
                                        <Select
                                            value={setting.value}
                                            onValueChange={(v) => setSound(setting.id as any, v)}
                                        >
                                            <SelectTrigger className="h-9 flex-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="/alarm-digital.mp3">Digital (Padrão)</SelectItem>
                                                <SelectItem value="/alarm-nature.mp3">Natureza</SelectItem>
                                                <SelectItem value="/alarm-bell.mp3">Sino</SelectItem>
                                                <SelectItem value="/alarm-whistle-bird.mp3">Pássaro</SelectItem>
                                                <SelectItem value="/task_complete.mp3">Sucesso</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-9 w-9 shrink-0"
                                            onClick={() => {
                                                const audio = new Audio(setting.value);
                                                audio.volume = 0.5;
                                                audio.play().catch(console.error);
                                            }}
                                        >
                                            <Play className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Timer Gigante Clean */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-10">

                {/* Mostrador Numérico Puro */}
                <div className="scale-120">
                    <div className="text-[7rem] leading-none font-bold tracking-tighter tabular-nums text-center drop-shadow-xl select-none">
                        {formattedTime}
                    </div>
                    <div className="text-center font-medium uppercase tracking-[0.3em] opacity-60 mt-2 text-sm">
                        {mode === 'focus' ? 'Foco Total' : mode === 'shortBreak' ? 'Descanso Curto' : 'Descanso Longo'}
                    </div>
                </div>

                {/* Barra de Progresso Sutil */}
                <div className="w-full px-4 opacity-50">
                    <Progress value={100 - progress} className="h-1 bg-white/20 [&>*]:bg-white" />
                    {/* Hack: Progress root com bg-white/20, indicator com bg-white */}
                </div>

                {/* Controles Principais */}
                <div className="flex gap-6 items-center">

                    {/* Reset fica menor na esquerda */}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-12 w-12 rounded-full hover:bg-white/20 text-white"
                        onClick={resetTimer}
                    >
                        <RotateCcw className="h-5 w-5" />
                    </Button>

                    {/* Play/Pause Gigante */}
                    {!isActive ? (
                        <Button size="lg" className={cn("w-20 h-20 rounded-full text-2xl shadow-xl transition-transform hover:scale-105", getButtonTheme())} onClick={startTimer}>
                            <Play className="fill-current h-8 w-8 ml-1" />
                        </Button>
                    ) : (
                        <Button size="lg" className={cn("w-20 h-20 rounded-full text-2xl shadow-xl transition-transform hover:scale-105", getButtonTheme())} onClick={pauseTimer}>
                            <Pause className="fill-current h-8 w-8" />
                        </Button>
                    )}

                </div>
            </div>

            {/* Seletor de Modos (Footer Clean) */}
            <div className="mt-auto bg-black/20 backdrop-blur-md rounded-2xl p-1.5 grid grid-cols-3 gap-1">
                <button
                    onClick={() => setMode('focus')}
                    className={cn(
                        "flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-semibold transition-all",
                        mode === 'focus' ? "bg-white text-slate-900 shadow-sm" : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                >
                    <Brain className="h-4 w-4 mb-1" />
                    Foco
                </button>
                <button
                    onClick={() => setMode('shortBreak')}
                    className={cn(
                        "flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-semibold transition-all",
                        mode === 'shortBreak' ? "bg-white text-emerald-600 shadow-sm" : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                >
                    <Coffee className="h-4 w-4 mb-1" />
                    Curto
                </button>
                <button
                    onClick={() => setMode('longBreak')}
                    className={cn(
                        "flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-semibold transition-all",
                        mode === 'longBreak' ? "bg-white text-blue-600 shadow-sm" : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                >
                    <Armchair className="h-4 w-4 mb-1" />
                    Longo
                </button>
            </div>
        </aside>
    );
}
