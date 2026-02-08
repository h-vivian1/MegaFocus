import { NextResponse } from 'next/server'
// Importando o client correto que você já usa no projeto
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    // Se houver um parâmetro "next", usamos ele (ex: /email-confirmed), senão vai para home
    const next = searchParams.get('next') ?? '/email-confirmed'

    if (code) {
        const supabase = await createClient()

        // Troca o código temporário por uma sessão válida no navegador do usuário
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // SUCESSO: Manda para a interface bonita
            // Importante: Redireciona para a URL do site + o caminho (next)
            // Usamos 'origin' mas em produção/Vercel às vezes é melhor garantir HTTPS
            // Se 'origin' vier http mas seu site é https, pode dar conflito de cookie, mas geralmente ok.
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // ERRO: Se o código for inválido ou expirado
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
