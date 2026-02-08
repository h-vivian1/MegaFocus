import Link from 'next/link'

export default function EmailConfirmedPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="w-full max-w-md space-y-8 text-center bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-500">

                {/* Ícone Animado ou Emoji */}
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 mb-6">
                    <span className="text-5xl animate-bounce">🎉</span>
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Email Confirmado!
                </h2>

                <p className="text-slate-600 dark:text-slate-400 text-lg">
                    Sua conta foi verificada com sucesso. Você já pode acessar seu painel e começar a organizar sua rotina.
                </p>

                <div className="pt-6">
                    <Link
                        href="/"
                        className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-6 py-4 text-white font-bold hover:bg-indigo-700 transition-all hover:scale-105 shadow-md hover:shadow-xl"
                    >
                        Ir para o Dashboard 🚀
                    </Link>
                </div>
            </div>
        </div>
    )
}
