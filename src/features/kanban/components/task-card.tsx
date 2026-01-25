"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { GripVertical, Zap } from "lucide-react";
import { Task } from "../types";
import { cn } from "@/lib/utils";
import { toggleSubtask } from "../actions/task-mutations";
import { useEffect, useState } from "react";
import { isToday, isTomorrow, parseISO } from "date-fns";

interface TaskCardProps {
    task: Task;
    onClick: (task: Task) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
    const [localSubtasks, setLocalSubtasks] = useState(task.subtasks as any[] || []);

    useEffect(() => {
        setLocalSubtasks(task.subtasks as any[] || []);
    }, [task.subtasks]);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: { type: "Task", task },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // Cores personalizadas e lógica de Urgência
    const isUrgent = task.priority === 'high';
    const isDueSoon = task.due_date && (isToday(parseISO(task.due_date)) || isTomorrow(parseISO(task.due_date)));

    // Se urgente, força estilo vermelho. Se não, usa cor escolhida ou padrão.
    let finalCardColor = task.color || "bg-white dark:bg-slate-900";
    if (isUrgent && task.status !== 'done') {
        finalCardColor = "bg-red-100 dark:bg-red-950/40";
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none group block">
            <Card
                onClick={() => onClick(task)}
                className={cn(
                    "mb-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all border-l-4",
                    finalCardColor,
                    task.status === "done" && "opacity-60 grayscale hover:grayscale-0 hover:opacity-100",

                    // Borda Amarela Piscante para Urgentes
                    (isUrgent && task.status !== 'done') && "border-2 border-yellow-400",
                    (isUrgent && isDueSoon && task.status !== 'done') && "animate-pulse shadow-yellow-200 dark:shadow-yellow-900/20"
                )}
            >
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                    <div className="flex flex-col gap-1 w-full">
                        {/* Categoria Badge */}
                        {task.category && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 opacity-70">
                                {task.category}
                            </span>
                        )}
                        <CardTitle className="text-base font-semibold leading-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            {task.title}
                            {isUrgent && <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500 animate-bounce" />}
                        </CardTitle>
                    </div>
                    <GripVertical className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                    {/* Descrição Visível (limitada a 2 linhas) */}
                    {task.description && (
                        <p className={cn(
                            "text-xs line-clamp-2",
                            isUrgent ? "text-red-800 dark:text-red-200" : "text-slate-500 dark:text-slate-400"
                        )}>
                            {task.description}
                        </p>
                    )}

                    {/* Subtarefas Visíveis e Interativas */}
                    {localSubtasks.length > 0 && (
                        <div className="space-y-1 pt-1">
                            {localSubtasks.map((st: any, idx: number) => (
                                <div key={idx} className="flex items-center space-x-2">
                                    <div onClick={(e) => handleToggleSubtask(idx, st.completed, e)}>
                                        <Checkbox
                                            checked={st.completed}
                                            className="h-3.5 w-3.5 rounded-full data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                        />
                                    </div>
                                    <span className={cn(
                                        "text-xs truncate",
                                        st.completed ? "text-slate-400 line-through decoration-slate-400" : "text-slate-600 dark:text-slate-300"
                                    )}>
                                        {st.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer do Card: Prioridade + Data */}
                    <div className="flex items-center justify-between pt-1">
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-white/50 backdrop-blur-sm">
                            {task.priority || "medium"}
                        </Badge>
                        {isDueSoon && task.status !== 'done' && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                                {isToday(parseISO(task.due_date!)) ? 'HOJE' : 'AMANHÃ'}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
