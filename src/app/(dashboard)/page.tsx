import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { KanbanBoard } from "@/features/kanban/components/kanban-board";
import { getTasks } from "@/features/kanban/actions/get-tasks";
import { CreateTaskDialog } from "@/features/kanban/components/create-task-dialog";
import { ClientOnly } from "@/components/client-only";
import { PomodoroSidebar } from "@/features/pomodoro/components/pomodoro-sidebar";

export default async function Home() {
  const supabase = await createClient(); // Await createClient
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const tasks = await getTasks();

  return (
    <div className="h-full flex flex-col p-8 bg-slate-50 dark:bg-black">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">MegaFocus</h1>
          <p className="text-sm text-slate-500">Bem-vindo, {user.email?.split('@')[0]}</p>
        </div>
        <CreateTaskDialog />
      </div>

      <ClientOnly>
        <div className="flex-1 overflow-hidden">
          <KanbanBoard initialTasks={tasks} />
        </div>
      </ClientOnly>
    </div>
  );
}
