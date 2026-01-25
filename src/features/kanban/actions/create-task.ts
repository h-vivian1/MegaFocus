"use server";

import { createClient } from "@/lib/supabase/server";
import { createTaskSchema, CreateTaskInput } from "../types";
import { revalidatePath } from "next/cache";

export async function createTask(rawInput: CreateTaskInput) {
    // 1. Validação Dupla (Frontend já validou, mas Backend não confia em ninguém)
    const result = createTaskSchema.safeParse(rawInput);

    if (!result.success) {
        return { error: "Dados inválidos. Verifique os campos." };
    }

    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        // Fallback temporário para desenvolvimento caso não tenha auth
        // Em produção, isso seria um erro fatal
        console.warn("Usuário não autenticado. Tentando criar sem user_id (pode falhar dependendo do RLS)");
        // return { error: "Usuário não autenticado." };
    }

    // Se tivermos usuário, usamos o ID. Se não, o Supabase vai reclamar se a coluna for NOT NULL.
    // Baseado no schema.sql, user_id é NOT NULL. 
    // No entanto, para teste local sem login implementado, talvez precisemos de um ajuste ou login anonimo.
    // Vamos assumir que o dev já tem o token ou vai implementar login em breve.
    // Se o smoke test passou e retornou [], a conexão está ok.

    // 2. Inserção no Banco
    const title = result.data.title;
    const description = result.data.description;
    const status = result.data.status;
    const priority = result.data.priority;
    const due_date = result.data.due_date ? result.data.due_date : null;
    const user_id = userData.user?.id;

    console.log("Tentando criar task para user:", user_id);

    if (!user_id) {
        return { error: "Usuário não autenticado. Faça login para criar tarefas." };
    }

    const { error } = await supabase.from("tasks").insert({
        title,
        description,
        status,
        priority,
        due_date,
        user_id,
    });

    if (error) {
        console.error("Erro Supabase ao inserir:", error);
        return { error: `Erro ao salvar: ${error.message}` };
    }

    console.log("Task criada com sucesso!");

    // 3. A Mágica do Next.js: Atualiza a tela sem refresh
    revalidatePath("/");

    return { success: true };
}
