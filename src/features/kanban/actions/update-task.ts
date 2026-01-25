"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateTaskStatus(taskId: string, newStatus: "todo" | "doing" | "done") {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Usuário não autenticado" };

    const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", taskId)
        .eq("user_id", user.id); // Segurança extra

    if (error) {
        console.error("Erro ao atualizar status:", error);
        return { error: "Erro ao atualizar tarefa." };
    }

    revalidatePath("/"); // Opcional se usar otimismo no client, mas bom para consistência
    return { success: true };
}
