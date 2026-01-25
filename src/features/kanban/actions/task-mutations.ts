"use server";

import { createClient } from "@/lib/supabase/server";
import { createTaskSchema, Task } from "../types"; // Reutilizamos o schema!
import { revalidatePath } from "next/cache";

// Action de Atualizar Texto/Prioridade
export async function updateTaskDetails(taskId: string, formData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Não autorizado" };

    // Validar os dados recebidos (Partial porque podemos não enviar tudo)
    const result = createTaskSchema.partial().safeParse(formData);

    if (!result.success) {
        return { error: "Dados inválidos" };
    }

    // TENTATIVA 1: Atualizar com TUDO (Cores, Categorias, Subtarefas)
    const { error } = await supabase
        .from("tasks")
        .update({
            ...result.data,
            updated_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .eq("user_id", user.id);

    // TENTATIVA 2: Fallback (Se der erro de coluna, salva só o básico)
    if (error) {
        console.error("Erro completo Supabase:", error);

        // Verifica se é erro de coluna inexistente (Postgres code 42703 ou mensagem "Could not find...")
        // Como o Supabase JS às vezes abstrai, verificamos a mensagem
        if (error.message.includes("Could not find") || error.code === "42703") {
            console.log("Tentando salvar modo compatibilidade (sem cores)...");

            const safeData = {
                title: result.data.title,
                description: result.data.description,
                status: result.data.status,
                priority: result.data.priority,
                updated_at: new Date().toISOString(),
            };

            const { error: retryError } = await supabase
                .from("tasks")
                .update(safeData)
                .eq("id", taskId)
                .eq("user_id", user.id);

            if (retryError) {
                return { error: `Erro fatal: ${retryError.message}` };
            }

            revalidatePath("/");
            return { success: true, warning: "Banco desatualizado. Cores não foram salvas." };
        }

        return { error: `Erro ao atualizar: ${error.message}` };
    }

    revalidatePath("/");
    return { success: true };
}

// Action de Deletar (Zona de Perigo)
export async function deleteTask(taskId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Não autorizado" };

    const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("user_id", user.id);

    if (error) return { error: "Erro ao deletar tarefa" };

    revalidatePath("/");
    return { success: true };
}

// Nova action para alternar subtarefa (Check/Uncheck)
export async function toggleSubtask(taskId: string, subtasks: any[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Auth required" };

    // Atualiza o array inteiro de subtasks
    const { error } = await supabase
        .from("tasks")
        .update({
            subtasks: subtasks, // O frontend manda o array atualizado
            updated_at: new Date().toISOString()
        })
        .eq("id", taskId)
        .eq("user_id", user.id);

    if (error) return { error: "Erro ao atualizar subtarefa" };

    revalidatePath("/");
    return { success: true };
}

// Action para mudar cor rápida
export async function updateTaskColor(taskId: string, colorClass: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Auth required" };

    const { error } = await supabase
        .from("tasks")
        .update({ color: colorClass })
        .eq("id", taskId)
        .eq("user_id", user.id);

    if (error) return { error: "Erro na cor" };

    revalidatePath("/");
    return { success: true };
}
