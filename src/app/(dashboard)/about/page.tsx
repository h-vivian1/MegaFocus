import {
    LayoutDashboard,
    Timer,
    CalendarDays,
    Heart,
    Clock,
    Rocket,
    CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* 1. HERO SECTION: A Promessa */}
            <div className="text-center space-y-4 mb-16">
                <Badge variant="secondary" className="px-4 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Filosofia MegaFocus
                </Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Organização é sinônimo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">ganhar tempo</span>.
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Nós não gerenciamos apenas tarefas. Nós gerenciamos energia, foco e resultados.
                    O MegaFocus foi desenhado para tirar o ruído da sua mente e colocar a clareza na sua tela.
                </p>
            </div>

            {/* 2. FEATURE SHOWCASE: O Arsenal de Produtividade */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">

                {/* Feature 1: Kanban */}
                <Card className="border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow bg-slate-50/50 dark:bg-slate-900/50">
                    <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-600">
                            <LayoutDashboard className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl">Fluxo Visual (Kanban)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        Pare de tentar lembrar de tudo. Visualize seu trabalho em colunas claras.
                        Mover um card de <span className="font-semibold text-slate-900 dark:text-slate-200">A Fazer</span> para <span className="font-semibold text-slate-900 dark:text-slate-200">Concluído</span> libera dopamina e mantém você no controle do progresso.
                    </CardContent>
                </Card>

                {/* Feature 2: Pomodoro */}
                <Card className="border-t-4 border-t-red-500 hover:shadow-lg transition-shadow bg-slate-50/50 dark:bg-slate-900/50">
                    <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 text-red-600">
                            <Timer className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl">Foco Profundo (Pomodoro)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        Multitarefa é um mito. O MegaFocus traz um timer integrado para sessões de trabalho focado.
                        Trabalhe intensamente, descanse estrategicamente e evite o burnout. Seu cérebro agradece.
                    </CardContent>
                </Card>

                {/* Feature 3: Calendar */}
                <Card className="border-t-4 border-t-emerald-500 hover:shadow-lg transition-shadow bg-slate-50/50 dark:bg-slate-900/50">
                    <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 text-emerald-600">
                            <CalendarDays className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl">Visão de Longo Prazo</CardTitle>
                    </CardHeader>
                    <CardContent className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        Nunca mais perca um prazo. Com a agenda integrada, você conecta suas tarefas aos dias reais.
                        Planeje sua semana com antecedência e entre na segunda-feira já sabendo o que vencer.
                    </CardContent>
                </Card>

            </div>

            {/* 3. WHY IT WORKS Section */}
            <div className="flex flex-col md:flex-row items-center gap-12 mb-20 bg-white dark:bg-slate-950 p-8 rounded-2xl border shadow-sm">
                <div className="flex-1 space-y-6">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                        <Rocket className="text-orange-500" />
                        Por que usar o MegaFocus?
                    </h3>
                    <ul className="space-y-3">
                        {[
                            "Centralize tudo em um único lugar.",
                            "Reduza a ansiedade de esquecer tarefas importantes.",
                            "Acompanhe sua evolução visualmente.",
                            "Interface limpa que não atrapalha seu pensamento.",
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Quote Block */}
                <div className="flex-1 border-l-4 border-slate-200 dark:border-slate-800 pl-8 italic text-slate-500">
                    "O tempo é o único recurso que não se renova. Quando você organiza seu ambiente externo, você acalma seu ambiente interno, permitindo que a criatividade flua."
                </div>
            </div>

            <Separator className="mb-12" />

            {/* 4. CREDITS: Feito com Amor */}
            <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-pink-100 to-blue-100 dark:from-pink-900/20 dark:to-blue-900/20 rounded-full mb-4">
                    <Heart className="h-8 w-8 text-pink-500 fill-pink-500 animate-pulse" />
                </div>

                <h2 className="text-2xl font-bold">Dedicação Total</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    Este projeto não é apenas código. É o resultado da vontade de tornar a vida mais leve e produtiva.
                </p>

                <div className="mt-8 pt-8 border-t border-dashed border-slate-300 dark:border-slate-800 inline-block w-full max-w-sm">
                    <p className="text-sm font-medium text-slate-900 dark:text-white uppercase tracking-widest mb-2">
                        Desenvolvido por
                    </p>
                    <div className="text-3xl font-signature text-blue-600 dark:text-blue-400 font-bold">
                        Henrique Vivian
                    </div>
                    <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        Engenharia de Software & Produtividade
                    </p>
                </div>
            </div>

        </div>
    );
}
