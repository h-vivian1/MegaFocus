"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, Save, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Task, createTaskSchema, CreateTaskInput } from "../types";
import { updateTaskDetails, deleteTask } from "../actions/task-mutations";
import { cn } from "@/lib/utils";
import { triggerConclusionEffects } from "@/lib/conclusion-effects";

interface EditTaskSheetProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
}

// Cores disponíveis (Pastel Moderno)
const CARD_COLORS = [
    { name: "Default", value: "bg-white dark:bg-slate-950 border-l-slate-200", preview: "bg-slate-200 dark:bg-slate-700" },
    { name: "Red", value: "bg-red-50 dark:bg-red-950/30 border-l-red-500", preview: "bg-red-500" },
    { name: "Blue", value: "bg-blue-50 dark:bg-blue-950/30 border-l-blue-500", preview: "bg-blue-500" },
    { name: "Green", value: "bg-emerald-50 dark:bg-emerald-950/30 border-l-emerald-500", preview: "bg-emerald-500" },
    { name: "Purple", value: "bg-purple-50 dark:bg-purple-950/30 border-l-purple-500", preview: "bg-purple-500" },
    { name: "Orange", value: "bg-orange-50 dark:bg-orange-950/30 border-l-orange-500", preview: "bg-orange-500" },
];

export function EditTaskSheet({ task, isOpen, onClose }: EditTaskSheetProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [subtasks, setSubtasks] = useState<any[]>(task?.subtasks as any[] || []);
    const [newSubtask, setNewSubtask] = useState("");

    // Hook Form populado com os dados da task recebida
    const form = useForm<CreateTaskInput>({
        // @ts-ignore - Resolving a temporary strict type mismatch between Zod 3.24 and RHF
        resolver: zodResolver(createTaskSchema),
        values: task ? {
            title: task.title,
            description: task.description || "",
            status: task.status as "todo" | "doing" | "done",
            priority: task.priority as "low" | "medium" | "high",
            category: task.category || "",
            color: task.color || "",
            due_date: task.due_date,
        } : undefined,
    });

    // Sincroniza estado das subtasks quando a prop task muda (ex: abre outra tarefa)
    useEffect(() => {
        setSubtasks(task?.subtasks as any[] || []);
        form.reset(task ? {
            title: task.title,
            description: task.description || "",
            status: task.status as "todo" | "doing" | "done",
            priority: task.priority as "low" | "medium" | "high",
            category: task.category || "",
            color: task.color || "",
            due_date: task.due_date,
        } : undefined);
    }, [task, form]);

    const onSubmit = async (values: CreateTaskInput) => {
        if (!task) return;

        // Verifica se completou agora
        const isCompleting = task.status !== "done" && values.status === "done";

        const result = await updateTaskDetails(task.id, { ...values, subtasks });

        if (result.error) {
            toast.error(result.error);
        } else {
            // @ts-ignore
            if (result.warning) {
                // @ts-ignore
                toast.warning(result.warning);
            } else {
                toast.success("Tarefa atualizada!");
            }

            if (isCompleting) {
                triggerConclusionEffects();
            }

            onClose();
        }
    };

    const handleDelete = async () => {
        if (!task) return;
        setIsDeleting(true);
        const result = await deleteTask(task.id);
        setIsDeleting(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Tarefa removida.");
            onClose();
        }
    };

    // Adicionar Subtarefa
    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;

        const updated = [...subtasks, { id: crypto.randomUUID(), title: newSubtask, completed: false }];
        setSubtasks(updated);
        setNewSubtask("");
        // Não precisa setar no form instantaneamente se formos salvar 'subtasks' via argumento do updateTaskDetails
        // Mas como o createTaskSchema pode não ter subtasks, vamos passar 'subtasks' separado no onSubmit ou adicionar no schema
    };

    // Remover Subtarefa
    const removeSubtask = (index: number) => {
        const updated = subtasks.filter((_, i) => i !== index);
        setSubtasks(updated);
    };

    if (!task) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-[500px] overflow-y-auto">
                <SheetHeader className="mb-4">
                    <SheetTitle>Detalhes da Tarefa</SheetTitle>
                </SheetHeader>


                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* 1. SELETOR DE CORES INTELIGENTE */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">Cor do Cartão</label>
                        <div className="flex gap-2 flex-wrap">
                            {CARD_COLORS.map((color) => (
                                <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => form.setValue("color", color.value, { shouldDirty: true })}
                                    className={cn(
                                        "w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
                                        color.preview,
                                        form.watch("color") === color.value ? "ring-2 ring-slate-900 dark:ring-slate-100 scale-110" : "opacity-80 hover:opacity-100 hover:scale-105"
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">Título</label>
                        <Input {...form.register("title")} className="font-semibold text-base h-9" />
                    </div>

                    {/* CAMPO DE DATA (VENCIMENTO) */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">Prazo de Entrega</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal h-9",
                                        !form.watch("due_date") && "text-muted-foreground"
                                    )}
                                >
                                    {form.watch("due_date") ? (
                                        format(new Date(form.watch("due_date")!), "PPP", { locale: ptBR })
                                    ) : (
                                        <span>Selecione uma data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={form.watch("due_date") ? new Date(form.watch("due_date")!) : undefined}
                                    onSelect={(date) => form.setValue("due_date", date?.toISOString(), { shouldDirty: true })}
                                    initialFocus
                                    locale={ptBR}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Status</label>
                            <Select
                                onValueChange={(val) => form.setValue("status", val as any)}
                                defaultValue={task.status}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todo">A Fazer</SelectItem>
                                    <SelectItem value="doing">Em Progresso</SelectItem>
                                    <SelectItem value="done">Concluído</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Prioridade</label>
                            <Select
                                onValueChange={(val) => form.setValue("priority", val as any)}
                                defaultValue={task.priority ?? "medium"}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Baixa</SelectItem>
                                    <SelectItem value="medium">Média</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">Categoria</label>
                        <Input
                            {...form.register("category")}
                            list="categories-list"
                            placeholder="Ex: Trabalho..."
                            className="h-9"
                        />
                        {/* Datalist nativo do HTML para autocomplete simples */}
                        <datalist id="categories-list">
                            <option value="Trabalho" />
                            <option value="Pessoal" />
                            <option value="Estudos" />
                            <option value="Saúde" />
                        </datalist>
                    </div>

                    {/* 3. GERENCIADOR DE SUBTAREFAS (TO-DO) */}
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-slate-500">Checklist</label>
                            <span className="text-[10px] text-slate-400">
                                {subtasks.filter(s => s.completed).length}/{subtasks.length}
                            </span>
                        </div>

                        {/* Lista */}
                        <div className="space-y-1 max-h-[100px] overflow-y-auto">
                            {subtasks.map((st, idx) => (
                                <div key={idx} className="flex items-center gap-2 group">
                                    <Checkbox checked={st.completed} disabled className="h-3 w-3" />
                                    <span className={cn("text-xs flex-1 truncate", st.completed && "line-through text-slate-400")}>{st.title}</span>
                                    <button type="button" onClick={() => removeSubtask(idx)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Input Add */}
                        <div className="flex gap-2">
                            <Input
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                placeholder="Nova subtarefa..."
                                className="h-7 text-xs"
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask(e) }}
                            />
                            <Button type="button" size="sm" onClick={handleAddSubtask} variant="outline" className="h-7 w-7 p-0">
                                <Plus className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>


                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">Descrição</label>
                        <Textarea
                            className="min-h-[80px] text-sm"
                            {...form.register("description")}
                        />
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t mt-auto">
                        {/* Delete com Confirmação de Segurança */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" type="button" disabled={isDeleting}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Essa ação não pode ser desfeita. A tarefa será apagada permanentemente.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                                        Sim, excluir
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button type="submit">
                            <Save className="mr-2 h-4 w-4" />
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet >
    );
}
