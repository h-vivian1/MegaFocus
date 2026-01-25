
import { createClient } from "@/lib/supabase/server";
import { CalendarView } from "@/features/calendar/components/calendar-view";
import { getTasks } from "@/features/kanban/actions/get-tasks";

export default async function CalendarPage() {
    const supabase = await createClient(); // Await createClient

    // Proteção de Rota
    const { data: { user } } = await supabase.auth.getUser();

    // Buscamos TODAS as tasks para plotar no calendário
    const tasks = await getTasks();

    return (
        <div className="p-8 h-screen overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Agenda</h1>
                <p className="text-sm text-slate-500">Visualize seus prazos e organize seu mês.</p>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <CalendarView tasks={tasks} />
            </div>
        </div>
    );
}
