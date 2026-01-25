"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { login, signup } from "@/features/auth/actions/auth-actions";

export function AuthForm() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData, action: "login" | "signup") {
        setIsLoading(true);
        setError(null);

        const serverAction = action === "login" ? login : signup;

        // Chamamos a server action e esperamos a resposta
        const result = await serverAction(formData);

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            // Sucesso! O redirect acontece no server action
            // Mas se o redirect demorar, mantemos o loading
        }
    }

    return (
        <div className="grid gap-4">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="m@exemplo.com"
                        required
                        disabled={isLoading}
                        autoComplete="email"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        disabled={isLoading}
                        autoComplete="current-password"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox id="remember" name="remember" />
                    <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Manter conectado
                    </Label>
                </div>

                <div className="flex flex-col gap-2 mt-2" suppressHydrationWarning>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        formAction={(formData) => handleSubmit(formData, "login")}
                        className="w-full"
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Entrar"}
                    </Button>

                    <Button
                        type="submit"
                        variant="outline"
                        disabled={isLoading}
                        formAction={(formData) => handleSubmit(formData, "signup")}
                        className="w-full"
                    >
                        Criar Conta
                    </Button>
                </div>
            </form>
        </div>
    );
}
