import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Task, TaskStatus } from "../types";
import { TaskCard } from "./task-card";
import { isToday, isTomorrow, isPast, isThisWeek, parseISO, compareAsc } from "date-fns";

// Helper para ordenar por prioridade (High > Medium > Low)
const priorityValue = { high: 3, medium: 2, low: 1 };

function sortTasks(tasks: Task[]) {
    return [...tasks].sort((a, b) => {
        // 1. Data de Vencimento (Mais cedo primeiro)
        if (a.due_date && b.due_date) {
            const dateComparison = compareAsc(parseISO(a.due_date), parseISO(b.due_date));
            if (dateComparison !== 0) return dateComparison;
        }
        // Tasks com data vêm antes das sem data? Ou depois?
        // Vamos colocar SEM data no final
        if (a.due_date && !b.due_date) return -1;
        if (!a.due_date && b.due_date) return 1;

        // 2. Prioridade (Maior primeiro)
        const pA = priorityValue[a.priority as keyof typeof priorityValue] || 0;
        const pB = priorityValue[b.priority as keyof typeof priorityValue] || 0;
        return pB - pA;
    });
}

function groupTasksByDate(tasks: Task[]) {
    // Primeiro ordena tudo
    const sorted = sortTasks(tasks);

    const groups: Record<string, Task[]> = {
        "Atrasados": [],
        "Hoje": [],
        "Amanhã": [],
        "Esta Semana": [],
        "Futuro": [],
        "Sem Data": []
    };

    sorted.forEach(task => {
        if (!task.due_date) {
            groups["Sem Data"].push(task);
            return;
        }

        const date = parseISO(task.due_date);
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Normalizar hoje

        if (isPast(date) && !isToday(date)) {
            groups["Atrasados"].push(task);
        } else if (isToday(date)) {
            groups["Hoje"].push(task);
        } else if (isTomorrow(date)) {
            groups["Amanhã"].push(task);
        } else if (isThisWeek(date)) {
            groups["Esta Semana"].push(task);
        } else {
            groups["Futuro"].push(task);
        }
    });

    return groups;
}

interface KanbanColumnProps {
    id: TaskStatus;
    title: string;
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export function KanbanColumn({ id, title, tasks, onTaskClick }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div className="flex flex-col w-80 shrink-0">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {tasks.length}
                </span>
            </div>

            <div ref={setNodeRef} className="flex-1 rounded-xl bg-slate-50/50 p-2 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 min-h-[500px] flex flex-col gap-2">
                <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    {/* Renderização agrupada e ordenada */}
                    {Object.entries(groupTasksByDate(tasks)).map(([group, groupTasks]) => {
                        if (groupTasks.length === 0) return null;
                        return (
                            <div key={group} className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 mt-2 mb-1">
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{group}</span>
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                                </div>
                                {groupTasks.map((task) => (
                                    <TaskCard key={task.id} task={task} onClick={onTaskClick} />
                                ))}
                            </div>
                        );
                    })}
                </SortableContext>
            </div>
        </div>
    );
}
