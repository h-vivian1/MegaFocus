import { AppSidebar } from "@/components/layout/app-sidebar";
import { PomodoroSidebar } from "@/features/pomodoro/components/pomodoro-sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            {/* Menu Lateral Esquerdo */}
            <AppSidebar />

            {/* Conteúdo Principal */}
            {/* Padding Left 20 (80px) para o menu + Padding Right para o Pomodoro */}
            <main className="flex-1 pl-20 pr-[320px]">
                {children}
            </main>

            {/* Menu Lateral Direito (Pomodoro) */}
            {/* O PomodoroSidebar já tem position fixed, então ele "flutua" ali */}
            <PomodoroSidebar />
        </div>
    );
}
