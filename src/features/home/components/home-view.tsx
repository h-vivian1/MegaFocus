"use client";

import { useState } from "react";
import { Task } from "@/features/kanban/types";
import { format, isToday, isPast, isTomorrow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    CheckCircle2,
    Circle,
    Calendar,
    Clock,
    ChevronDown,
    ChevronRight,
    AlignLeft,
    Tag,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { updateTaskStatus } from "@/features/kanban/actions/update-task";
import { toast } from "sonner";

interface HomeViewProps {
    initialTasks: Task[];
    user: any;
}

export function HomeView({ initialTasks, user }: HomeViewProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);

    // Filtrar apenas tarefas "A Fazer" ou "Em Progresso" (Excluir "Concluído" da Home p/ focar no que importa)
    // O usuário pediu "visualização geral de todas as tarefas por fazer"
    const todoTasks = tasks.filter(t => t.status !== 'done');

    const handleTaskComplete = async (taskId: string) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'done' } : t));
        toast.success("Tarefa concluída!");

        await updateTaskStatus(taskId, 'done');
    };

    return (
        <div className="h-full flex flex-col p-8 bg-slate-50 dark:bg-black overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                        Minha Agenda
                    </h1>
                    <p className="text-slate-500">
                        Um resumo do que precisa ser feito. Foco no hoje.
                    </p>
                </div>

                <div className="space-y-6">
                    {todoTasks.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>Tudo limpo! Você não tem tarefas pendentes.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {todoTasks.map(task => (
                                <TaskListItem
                                    key={task.id}
                                    task={task}
                                    onComplete={() => handleTaskComplete(task.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TaskListItem({ task, onComplete }: { task: Task, onComplete: () => void }) {
    const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date));
    const isDueToday = task.due_date && isToday(parseISO(task.due_date));

    return (
        <Accordion type="single" collapsible className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 px-4">
            <AccordionItem value={task.id} className="border-none">
                <div className="flex items-center gap-4 py-4">
                    {/* Checkbox Customizado para Completar */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onComplete(); }}
                        className="group flex-shrink-0 text-slate-300 hover:text-green-500 transition-colors"
                    >
                        <Circle className="w-6 h-6" />
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className={cn("text-base font-semibold truncate text-slate-800 dark:text-slate-200", task.status === 'doing' && "text-blue-600 dark:text-blue-400")}>
                                {task.title}
                            </h3>
                            {task.priority === 'high' && (
                                <Badge variant="destructive" className="text-[10px] px-1.5 h-5">Urgente</Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            {task.due_date && (
                                <span className={cn("flex items-center gap-1", isOverdue ? "text-red-500 font-medium" : isDueToday ? "text-blue-600 font-medium" : "")}>
                                    <Calendar className="w-3 h-3" />
                                    {format(parseISO(task.due_date), "dd 'de' MMM", { locale: ptBR })}
                                </span>
                            )}
                            {task.category && (
                                <span className="flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    {task.category}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                {task.subtasks?.length ? `${task.subtasks.filter((s: any) => s.completed).length}/${task.subtasks.length} sub` : "0 sub"}
                            </span>
                        </div>
                    </div>

                    <AccordionTrigger className="p-0 hover:no-underline w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        {/* <ChevronDown className="w-5 h-5 text-slate-400" />  Trigger já renderiza icone por padrão se não customizar children? Vamos ver. Shadcn accordion trigger usually includes icon. */}
                    </AccordionTrigger>
                </div>

                <AccordionContent className="pb-4 pt-0 pl-10 pr-4">
                    <div className="space-y-4">
                        {task.description && (
                            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                                <p className="whitespace-pre-wrap flex gap-2">
                                    <AlignLeft className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
                                    {task.description}
                                </p>
                            </div>
                        )}

                        {task.subtasks && task.subtasks.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Checklist</h4>
                                <div className="space-y-1">
                                    {task.subtasks.map((sub: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                            <Checkbox checked={sub.completed} disabled className="h-4 w-4 rounded-full" />
                                            <span className={sub.completed ? "line-through opacity-50" : ""}>{sub.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
