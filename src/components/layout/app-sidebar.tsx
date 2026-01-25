"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Info, Moon, Sun, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const MENU_ITEMS = [
    { icon: Calendar, label: "Home", href: "/home" },
    { icon: LayoutDashboard, label: "Kanban", href: "/" },
    { icon: CalendarDays, label: "Calendário", href: "/calendar" },
    { icon: Info, label: "Sobre", href: "/about" }, // Placeholder
];

export function AppSidebar() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();

    return (
        <aside className="fixed left-0 top-0 z-50 flex h-screen w-20 flex-col items-center border-r bg-white py-8 dark:bg-black dark:border-slate-800">
            {/* Logo / Brand */}
            <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/30">
                MF
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col gap-4">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex flex-col items-center justify-center gap-1 p-3 rounded-2xl transition-all",
                                isActive
                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-900"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Theme Toggle (Footer) */}
            <div className="mt-auto">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
            </div>
        </aside>
    );
}
