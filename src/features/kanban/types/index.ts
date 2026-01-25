import { z } from "zod";
import { Database } from "@/types/supabase";

// Extraímos o tipo direto do banco mas estendemos manualmente enquanto não rodamos o gen types de novo
export type Task = Database['public']['Tables']['tasks']['Row'] & {
    color?: string | null;
    category?: string | null;
    subtasks?: any; // JSONB
};

// Tipos para facilitar nosso frontend
export type TaskStatus = 'todo' | 'doing' | 'done';

export interface KanbanColumn {
    id: TaskStatus;
    title: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
    { id: "todo", title: "A Fazer" },
    { id: "doing", title: "Em Andamento" },
    { id: "done", title: "Concluído" },
];

// Schema para VALIDAR a criação/edição de tarefas
export const createTaskSchema = z.object({
    title: z.string().min(1, "O título é obrigatório").max(100),
    description: z.string().optional(),
    status: z.enum(['todo', 'doing', 'done']).default('todo'),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    due_date: z.string().optional(),
    color: z.string().optional(),
    category: z.string().optional(),
    subtasks: z.array(z.any()).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
