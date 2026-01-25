"use server";

import { createClient } from "@/lib/supabase/server";
import { Task } from "../types";

export async function getTasks(): Promise<Task[]> {
    const supabase = await createClient();

    // O RLS (segurança do banco) já garante que o usuário só veja as tasks dele
    // Ordenamos por created_at para manter consistência visual inicial
    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Erro ao buscar tarefas:", error);
        return []; // Fail gracefully retornando array vazio
    }

    return data || [];
}
