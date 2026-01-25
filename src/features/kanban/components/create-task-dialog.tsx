"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Cores disponíveis (Pastel Moderno)
const CARD_COLORS = [
    { name: "Default", value: "bg-white dark:bg-slate-950 border-l-slate-200", preview: "bg-slate-200 dark:bg-slate-700" },
    { name: "Red", value: "bg-red-50 dark:bg-red-950/30 border-l-red-500", preview: "bg-red-500" },
    { name: "Blue", value: "bg-blue-50 dark:bg-blue-950/30 border-l-blue-500", preview: "bg-blue-500" },
    { name: "Green", value: "bg-emerald-50 dark:bg-emerald-950/30 border-l-emerald-500", preview: "bg-emerald-500" },
    { name: "Purple", value: "bg-purple-50 dark:bg-purple-950/30 border-l-purple-500", preview: "bg-purple-500" },
    { name: "Orange", value: "bg-orange-50 dark:bg-orange-950/30 border-l-orange-500", preview: "bg-orange-500" },
];

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { createTaskSchema, CreateTaskInput } from "../types";
import { createTask } from "../actions/create-task";

interface CreateTaskDialogProps {
    open?: boolean; // Agora pode ser controlado por fora
    onOpenChange?: (open: boolean) => void;
    defaultDate?: Date | null;
}

export function CreateTaskDialog({ open: controlledOpen, onOpenChange: controlledOnOpenChange, defaultDate }: CreateTaskDialogProps) {
    // Estado interno caso não seja controlado
    const [internalOpen, setInternalOpen] = useState(false);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = controlledOnOpenChange || setInternalOpen;

    // Hook Form conectado ao Zod Schema
    const form = useForm<CreateTaskInput>({
        // @ts-ignore - Resolving a temporary strict type mismatch between Zod 3.24 and RHF
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            title: "",
            description: "",
            status: "todo",
            priority: "medium",
            color: CARD_COLORS[0].value,
            category: "",
            due_date: defaultDate ? defaultDate.toISOString() : undefined,
        },
    });

    // Resetar form quando a data mudar (se o usuário clicar em outro dia)
    useEffect(() => {
        if (defaultDate) {
            form.setValue("due_date", defaultDate.toISOString());
        }
    }, [defaultDate, form]);

    const isLoading = form.formState.isSubmitting;

    async function onSubmit(values: CreateTaskInput) {
        const result = await createTask(values);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Tarefa criada com sucesso!");
            setOpen(false);
            form.reset();
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            {!controlledOpen && (
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Nova Tarefa
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Criar Tarefa</DialogTitle>
                    <DialogDescription>
                        Adicione uma nova tarefa ao seu quadro.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* 1. SELETOR DE CORES INTELIGENTE */}
                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-xs font-medium text-slate-500">Cor do Cartão</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2 flex-wrap">
                                            {CARD_COLORS.map((color) => (
                                                <button
                                                    key={color.name}
                                                    type="button"
                                                    onClick={() => form.setValue("color", color.value, { shouldDirty: true })}
                                                    className={cn(
                                                        "w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
                                                        color.preview,
                                                        (form.watch("color") || CARD_COLORS[0].value) === color.value ? "ring-2 ring-slate-900 dark:ring-slate-100 scale-110" : "opacity-80 hover:opacity-100 hover:scale-105"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Título */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-xs font-medium text-slate-500">Título</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Finalizar relatório..." {...field} className="font-semibold text-base h-9" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* CAMPO DE DATA (VENCIMENTO) */}
                        <FormField
                            control={form.control}
                            name="due_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col space-y-1">
                                    <FormLabel className="text-xs font-medium text-slate-500">Prazo de Entrega</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal h-9",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(new Date(field.value), "PPP", { locale: ptBR })
                                                    ) : (
                                                        <span>Selecione uma data</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) => field.onChange(date?.toISOString())}
                                                initialFocus
                                                locale={ptBR}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            {/* Prioridade */}
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-xs font-medium text-slate-500">Prioridade</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Baixa</SelectItem>
                                                <SelectItem value="medium">Média</SelectItem>
                                                <SelectItem value="high">Alta</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Categoria */}
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-xs font-medium text-slate-500">Categoria</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    list="create-categories-list"
                                                    placeholder="Ex: Trabalho..."
                                                    className="h-9"
                                                />
                                                <datalist id="create-categories-list">
                                                    <option value="Trabalho" />
                                                    <option value="Pessoal" />
                                                    <option value="Estudos" />
                                                    <option value="Saúde" />
                                                </datalist>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Descrição */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-xs font-medium text-slate-500">Descrição</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Detalhes da tarefa..." {...field} className="min-h-[80px] text-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Criando..." : "Salvar Tarefa"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
