import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/features/auth/components/auth-form";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-black p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Bem-vindo ao MegaFocus</CardTitle>
                    <CardDescription>
                        Entre ou crie sua conta para gerenciar suas tarefas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AuthForm />
                </CardContent>
            </Card>
        </div>
    );
}
