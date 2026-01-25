"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Schema simples para validação
const authSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export async function login(formData: FormData) {
    const supabase = await createClient();

    // Extrair e validar dados
    const data = Object.fromEntries(formData);
    const parsed = authSchema.safeParse(data);

    if (!parsed.success) {
        return { error: "Dados inválidos." };
    }

    try {
        const { error } = await supabase.auth.signInWithPassword(parsed.data);

        if (error) {
            console.error("Login Error:", error);
            if (error.message.includes("Invalid login credentials")) {
                return { error: "Email ou senha incorretos." };
            }
            if (error.message.includes("fetch failed")) {
                return { error: "Erro de conexão. Verifique sua internet." };
            }
            return { error: error.message };
        }

        revalidatePath("/", "layout");
    } catch (err) {
        console.error("Unexpected Login Error:", err);
        return { error: "Erro inesperado ao tentar entrar. Tente novamente." };
    }

    redirect("/");
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const data = Object.fromEntries(formData);
    const parsed = authSchema.safeParse(data);

    if (!parsed.success) {
        return { error: "Senha muito curta ou email inválido." };
    }

    // Envia email de confirmação por padrão
    const { error } = await supabase.auth.signUp(parsed.data);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/");
}
