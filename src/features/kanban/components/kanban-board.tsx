"use client";

import { useEffect, useState } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { Task, TaskStatus } from "../types";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { EditTaskSheet } from "./edit-task-sheet";
import { ClientOnly } from "@/components/client-only";
import confetti from "canvas-confetti";
import { toast } from "sonner";


interface KanbanBoardProps {
    initialTasks: Task[];
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
    { id: "todo", title: "A Fazer" },
    { id: "doing", title: "Em Progresso" },
    { id: "done", title: "Concluído" },
];

export function KanbanBoard({ initialTasks }: KanbanBoardProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Sincroniza o estado local quando novas tasks chegam do servidor (ex: após criar)
    // O useState(initialTasks) só roda na primeira vez, por isso precisamos disto.
    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    // Sensores para detectar mouse/touch de forma inteligente
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5 // Previne drags acidentais ao apenas clicar
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Lógica quando o drag começa (apenas visual)
    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
        }
    }

    // Lógica quando solta o card
    function onDragEnd(event: DragEndEvent) {
        setActiveTask(null);
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        if (!isActiveTask) return;

        // Dropping task over a column (empty area)
        const isOverColumn = COLUMNS.some((col) => col.id === overId);

        if (isActiveTask && isOverColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const newStatus = overId as TaskStatus;

                // Se moveu para "Done", faz a festa! 🎉
                if (tasks[activeIndex].status !== "done" && newStatus === "done") {
                    triggerConclusionEffects();
                }

                // Otimisticamente atualiza a UI
                tasks[activeIndex].status = newStatus;

                // Chama o servidor para persistir
                import("../actions/update-task").then(({ updateTaskStatus }) => {
                    updateTaskStatus(activeId as string, newStatus);
                });

                // Força re-render na nova posição (final da lista da coluna)
                return arrayMove(tasks, activeIndex, activeIndex);
            });
        } else if (isActiveTask && isOverTask) {
            // Dropping task over another task
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);

                // Garantir que o status é válido (não nulo)
                const newStatus = (tasks[overIndex].status || "todo") as TaskStatus;

                // Se moveu para "Done" (mesmo que soltando em cima de outro card de done), faz a festa!
                if (tasks[activeIndex].status !== "done" && newStatus === "done") {
                    triggerConclusionEffects();
                }

                if (tasks[activeIndex].status !== newStatus) {
                    tasks[activeIndex].status = newStatus;

                    // Persistir no servidor
                    import("../actions/update-task").then(({ updateTaskStatus }) => {
                        updateTaskStatus(activeId as string, newStatus);
                    });
                }

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }
    }

    // Função para tocar som e disparar confete
    const triggerConclusionEffects = () => {
        // 1. Som
        const audio = new Audio("/task_complete.mp3");
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play failed (user interaction needed first)", e));

        // 2. Confete
        const end = Date.now() + 1000;
        const colors = ['#10b981', '#3b82f6', '#f59e0b'];

        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());

        toast.success("Tarefa Concluída! Parabéns! 🚀");
    };

    return (
        <ClientOnly>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
            >
                <div className="flex h-full gap-3 overflow-x-auto pb-2">
                    {COLUMNS.map((col) => (
                        <KanbanColumn
                            key={col.id}
                            id={col.id}
                            title={col.title}
                            tasks={tasks.filter((t) => t.status === col.id)}
                            onTaskClick={setEditingTask}
                        />
                    ))}
                </div>

                {/* Overlay: O card que "flutua" enquanto você arrasta */}
                <DragOverlay>
                    {activeTask ? <TaskCard task={activeTask} onClick={() => { }} /> : null}
                </DragOverlay>
            </DndContext>

            <EditTaskSheet
                task={editingTask}
                isOpen={!!editingTask}
                onClose={() => setEditingTask(null)}
            />
        </ClientOnly>
    );
}
