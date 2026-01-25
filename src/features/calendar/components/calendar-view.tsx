"use client";

import { useState, useEffect } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
    parseISO
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, List, LayoutGrid, Calendar as CalendarIcon, Zap, Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "@/features/kanban/types";
import { cn } from "@/lib/utils";
import { CreateTaskDialog } from "@/features/kanban/components/create-task-dialog";
import { EditTaskSheet } from "@/features/kanban/components/edit-task-sheet";
import { updateTaskDetails } from "@/features/kanban/actions/task-mutations";
import { toast } from "sonner";
import { isTomorrow } from "date-fns";
import { triggerConclusionEffects } from "@/lib/conclusion-effects";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    useDraggable,
    useDroppable,
    closestCenter
} from "@dnd-kit/core";

interface CalendarViewProps {
    tasks: Task[];
}

// -- Componentes Internos de Drag & Drop --

function DraggableTaskItem({ task, onClick }: { task: Task; onClick: () => void }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: task.id,
        data: { task },
    });

    const isUrgent = task.priority === 'high';

    // Simplificação: date-fns isTomorrow já funciona bem para objetos Date
    const isActuallyDueSoon = task.due_date && (isToday(parseISO(task.due_date)) || isTomorrow(parseISO(task.due_date)));

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={cn(
                "text-[10px] px-1.5 py-1 rounded border-l-2 truncate font-medium mb-1 shadow-sm cursor-grab active:cursor-grabbing flex items-center justify-between group/item",

                // Estilo Concluído
                task.status === 'done' ? "opacity-50 line-through bg-slate-100 dark:bg-slate-800 border-slate-200" : "",

                // Estilo Normal
                (task.status !== 'done' && !isUrgent) ? (task.color ? task.color : "bg-white dark:bg-slate-800 border-l-slate-300") : "",

                // Estilo Urgente - Fundo Vermelho e Borda Amarela
                (isUrgent && task.status !== 'done') && "bg-red-50 dark:bg-red-950/30 border-l-red-500 border-y-2 border-r-2 border-yellow-400 text-red-700 dark:text-red-200",

                // Piscar Borda (Se Urgente + Hoje/Amanhã) - Usando ring para não afetar layout
                (isUrgent && isActuallyDueSoon && task.status !== 'done') && "animate-[pulse_1.5s_ease-in-out_infinite] ring-2 ring-yellow-400 ring-offset-0",

                isDragging && "opacity-30 scale-105 rotate-2 z-50"
            )}
            title={task.title}
        >
            <span className="truncate flex-1">{task.title}</span>
            {isUrgent && !isDragging && <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0 ml-1 animate-bounce" />}
        </div>
    );
}

function DroppableDayCell({ day, isCurrentMonth, isTodayDate, tasks, onDayClick, onTaskClick }: any) {
    const { setNodeRef, isOver } = useDroppable({
        id: day.toISOString(),
    });

    return (
        <div
            ref={setNodeRef}
            onClick={() => onDayClick(day)}
            className={cn(
                "relative border-r border-b dark:border-slate-800 p-2 transition-all min-h-[100px] flex flex-col group",
                !isCurrentMonth && "bg-slate-50/50 dark:bg-slate-950/50 text-slate-400",
                isOver && "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-inset ring-blue-500", // Highlight drop zone
                !isOver && "hover:bg-slate-50 dark:hover:bg-slate-900/50"
            )}
        >
            {/* Header do Dia */}
            <div className="flex justify-between items-start mb-1 flex-shrink-0">
                <span className={cn(
                    "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                    isTodayDate ? "bg-blue-600 text-white" : "text-slate-700 dark:text-slate-300"
                )}>
                    {format(day, "d")}
                </span>
                <Plus className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
            </div>

            {/* Lista de Tarefas (Com Scrollbar agora!) */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-1">
                {tasks.map((task: Task) => (
                    <DraggableTaskItem
                        key={task.id}
                        task={task}
                        onClick={(e: any) => { e.stopPropagation(); onTaskClick(task); }}
                    />
                ))}
            </div>
        </div>
    );
}

// -- View Principal --

export function CalendarView({ tasks: initialTasks }: CalendarViewProps) {
    const [tasks, setTasks] = useState(initialTasks);

    // Sincroniza quando o servidor atualiza
    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Estado de Edição
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const handleTaskClick = (task: Task) => {
        setEditingTask(task);
    };

    // Estado do Drag
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    // Estado da View (Grade vs Lista)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Previne drag acidental ao clicar
            },
        })
    );

    // Navegação
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    // Cálculos do Calendário
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setIsDialogOpen(true);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = active.data.current?.task as Task;
        setActiveTask(task);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = active.id as string;
        const newDateIso = over.id as string;
        const task = tasks.find(t => t.id === taskId);

        // Se data não mudou, ignora
        if (task?.due_date && isSameDay(parseISO(task.due_date), parseISO(newDateIso))) {
            return;
        }

        // Atualização Otimista
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, due_date: newDateIso } : t
        ));

        toast.success("Data atualizada!");

        // Server Action
        await updateTaskDetails(taskId, { due_date: newDateIso });
    };

    // Renderização em Lista
    const renderListView = () => {
        // Agrupar tarefas por dia
        // Apenas tarefas com data definida
        const tasksWithDate = tasks.filter(t => t.due_date).sort((a, b) =>
            new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
        );

        // Criar Map: DataISO -> Task[]
        const grouped: Record<string, Task[]> = {};
        tasksWithDate.forEach(t => {
            const dateKey = t.due_date!.split('T')[0]; // YYYY-MM-DD
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(t);
        });

        const sortedDates = Object.keys(grouped).sort();

        if (sortedDates.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                    <p>Nenhuma tarefa agendada.</p>
                </div>
            );
        }

        return (
            <div className="max-w-3xl mx-auto w-full p-6 space-y-8">
                {sortedDates.map(dateStr => {
                    const date = parseISO(dateStr);
                    const dayTasks = grouped[dateStr];

                    return (
                        <div key={dateStr} className="flex gap-4">
                            {/* Coluna da Data */}
                            <div className="flex flex-col items-center min-w-[60px] pt-1">
                                <span className="text-sm font-semibold text-slate-500 uppercase">
                                    {format(date, "EEE", { locale: ptBR })}
                                </span>
                                <span className={cn(
                                    "text-2xl font-bold h-10 w-10 flex items-center justify-center rounded-full mt-1",
                                    isToday(date) ? "bg-blue-600 text-white" : "text-slate-900 dark:text-white"
                                )}>
                                    {format(date, "d")}
                                </span>
                            </div>

                            {/* Coluna das Tarefas */}
                            <div className="flex-1 space-y-2 pt-1">
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">
                                    {format(date, "MMMM", { locale: ptBR })} • {dayTasks.length} tarefas
                                </span>
                                {dayTasks.map(task => {
                                    const isDone = task.status === 'done';

                                    // Handler de Conclusão Rápida
                                    const handleToggleDone = async (e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        const newStatus = isDone ? 'todo' : 'done';

                                        // Update Local
                                        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus as any } : t));

                                        // Efeitos!
                                        if (newStatus === 'done') {
                                            console.log("Calling triggerConclusionEffects...");
                                            triggerConclusionEffects();
                                        }

                                        // Server Action
                                        await updateTaskDetails(task.id, { status: newStatus as any });
                                    };

                                    return (
                                        <div
                                            key={task.id}
                                            className={cn(
                                                "p-3 rounded-lg border flex items-center gap-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                                                isDone && "opacity-60"
                                            )}
                                            onClick={() => handleTaskClick(task)}
                                        >
                                            {/* Circulo/Checkbox Interativo */}
                                            <div
                                                onClick={handleToggleDone}
                                                className={cn(
                                                    "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer hover:scale-110",
                                                    task.color ? task.color.replace("bg-", "ring-").replace("border-l-", "text-") : "ring-slate-300 text-slate-300",
                                                    isDone ? (task.color || "bg-slate-400") : "bg-transparent ring-2",
                                                )}
                                            >
                                                {isDone && <Check className="w-3 h-3 text-white font-bold" />}
                                            </div>

                                            <span className={cn("flex-1 text-sm font-medium", isDone && "line-through text-slate-400")}>{task.title}</span>
                                            <div className="text-xs text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                {task.priority === 'high' ? '🔥' : task.priority === 'medium' ? '⚡' : '🌱'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col h-full bg-white dark:bg-black rounded-lg shadow-sm border dark:border-slate-800 overflow-hidden">
                {/* Header do Calendário */}
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold capitalize text-slate-900 dark:text-slate-100">
                            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                        </h2>
                        <div className="flex gap-1">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    viewMode === 'grid' ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    viewMode === 'list' ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Conteúdo Principal */}
                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-black relative">
                    {viewMode === 'grid' ? (
                        <>
                            {/* Grid de Dias da Semana (Fixed) */}
                            <div className="grid grid-cols-7 border-b dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
                                {weekDays.map((day) => (
                                    <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Grid de Dias */}
                            <div className="grid grid-cols-7 auto-rows-[140px]">
                                {calendarDays.map((day) => {
                                    const dayTasks = tasks.filter(task =>
                                        task.due_date && isSameDay(parseISO(task.due_date), day)
                                    );

                                    return (
                                        <DroppableDayCell
                                            key={day.toISOString()}
                                            day={day}
                                            isCurrentMonth={isSameMonth(day, monthStart)}
                                            isTodayDate={isToday(day)}
                                            tasks={dayTasks}
                                            onDayClick={handleDayClick}
                                            // onTaskClick={(t) => { setSelectedDate(day); setIsDialogOpen(true); }} // TODO: Abrir task direta
                                            onTaskClick={handleTaskClick}
                                        />
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        renderListView()
                    )}
                </div>

                {/* Overlay do Drag (Item Fantasma) */}
                <DragOverlay>
                    {activeTask ? (
                        <div className={cn(
                            "text-[10px] px-1.5 py-1 rounded border-l-2 truncate font-medium mb-1 shadow-lg bg-white dark:bg-slate-800 border-l-blue-500 ring-2 ring-blue-500 opacity-90 scale-105 rotate-2",
                            activeTask.color
                        )}>
                            {activeTask.title}
                        </div>
                    ) : null}
                </DragOverlay>

                {/* Modal de Criação Controlado */}
                <CreateTaskDialog
                    // @ts-ignore
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    defaultDate={selectedDate}
                />

                {/* Modal de Edição */}
                <EditTaskSheet
                    task={editingTask}
                    isOpen={!!editingTask}
                    onClose={() => setEditingTask(null)}
                />
            </div>
        </DndContext>
    );
}
