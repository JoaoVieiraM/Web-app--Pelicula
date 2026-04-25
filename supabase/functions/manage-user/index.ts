import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_ANON_KEY    = Deno.env.get('SUPABASE_ANON_KEY')!
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Padrão correto para Edge Functions: injeta o header globalmente
    // e chama getUser() sem argumento — evita o 401 espúrio
    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth:   { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })

    const { data: { user }, error: authError } = await callerClient.auth.getUser()
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, 401)
    }

    // Client com service role — bypassa RLS para operações de admin
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })

    // Verifica se o chamador é admin
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (callerProfile?.role !== 'admin') {
      return json({ error: 'Forbidden' }, 403)
    }

    const body           = await req.json()
    const { action }     = body

    // ── LIST ─────────────────────────────────────────────────
    if (action === 'list') {
      const { data: profiles, error } = await adminClient
        .from('profiles')
        .select('user_id, email, display_name, role, is_active, store_id, created_at')
        .order('created_at')

      if (error) throw error
      return json(profiles)
    }

    // ── CREATE ────────────────────────────────────────────────
    if (action === 'create') {
      const { email, password, display_name, role, store_id } = body

      if (!email || !password) {
        return json({ error: 'E-mail e senha são obrigatórios.' }, 400)
      }

      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (createError) {
        return json({ error: createError.message }, 400)
      }

      const { error: profileError } = await adminClient.from('profiles').insert({
        user_id:      newUser.user.id,
        email,
        display_name: display_name || null,
        role:         role || 'admin',
        store_id:     store_id || null,
        is_active:    true,
      })

      if (profileError) {
        await adminClient.auth.admin.deleteUser(newUser.user.id)
        throw profileError
      }

      // Gera link de primeiro acesso (reset de senha) para o novo admin
      const origin = req.headers.get('origin') || SUPABASE_URL
      const { data: linkData } = await adminClient.auth.admin.generateLink({
        type:    'recovery',
        email,
        options: { redirectTo: `${origin}/` },
      })

      return json({
        success:      true,
        user_id:      newUser.user.id,
        access_link:  linkData?.properties?.action_link ?? null,
      })
    }

    // ── TOGGLE ACTIVE ─────────────────────────────────────────
    if (action === 'toggle') {
      const { user_id } = body
      if (!user_id) return json({ error: 'user_id obrigatório.' }, 400)

      if (user_id === user.id) {
        return json({ error: 'Não é possível desativar sua própria conta.' }, 400)
      }

      const { data: p, error: fetchError } = await adminClient
        .from('profiles')
        .select('is_active')
        .eq('user_id', user_id)
        .single()

      if (fetchError || !p) return json({ error: 'Usuário não encontrado.' }, 404)

      const newActive = !p.is_active

      await adminClient.auth.admin.updateUserById(user_id, {
        ban_duration: newActive ? 'none' : '876600h',
      })

      await adminClient
        .from('profiles')
        .update({ is_active: newActive })
        .eq('user_id', user_id)

      return json({ success: true, is_active: newActive })
    }

    // ── DELETE (soft) ─────────────────────────────────────────
    if (action === 'delete') {
      const { user_id } = body
      if (!user_id) return json({ error: 'user_id obrigatório.' }, 400)

      if (user_id === user.id) {
        return json({ error: 'Não é possível excluir sua própria conta.' }, 400)
      }

      const { error: deleteError } = await adminClient.auth.admin.deleteUser(user_id)
      if (deleteError) throw deleteError

      return json({ success: true })
    }

    return new Response('Bad Request', { status: 400, headers: corsHeaders })

  } catch (err) {
    console.error('[manage-user]', err)
    return json({ error: err.message || 'Erro interno.' }, 500)
  }
})
