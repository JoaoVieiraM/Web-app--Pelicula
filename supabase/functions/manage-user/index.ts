import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_ANON_KEY     = Deno.env.get('SUPABASE_ANON_KEY')!
    const SUPABASE_SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // 1. Verifica o JWT do usuário que fez a chamada
    const token = authHeader.replace('Bearer ', '').trim()
    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    })
    
    const { data: { user }, error: authError } = await callerClient.auth.getUser(token)
    if (authError || !user) {
      console.error('[auth.getUser ERROR]:', authError)
      return new Response(JSON.stringify({ error: authError?.message || 'Unauthorized user' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 2. Client com service role (bypassa RLS para operações de admin)
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // 3. Verifica se o usuário tem role = 'admin'
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (callerProfile?.role !== 'admin') {
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }

    const body   = await req.json()
    const { action } = body

    // ── LIST ────────────────────────────────────────────────
    if (action === 'list') {
      const { data: profiles, error } = await adminClient
        .from('profiles')
        .select('user_id, email, display_name, role, is_active, created_at')
        .order('created_at')

      if (error) throw error
      return new Response(JSON.stringify(profiles), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── CREATE ───────────────────────────────────────────────
    if (action === 'create') {
      const { email, password, display_name, role } = body
      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: 'E-mail e senha são obrigatórios.' }),
          { status: 400, headers: corsHeaders },
        )
      }

      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // confirma o e-mail automaticamente
      })

      if (createError) {
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: corsHeaders },
        )
      }

      const { error: profileError } = await adminClient.from('profiles').insert({
        user_id:      newUser.user.id,
        email,
        display_name: display_name || null,
        role:         role || 'employee',
        is_active:    true,
      })

      if (profileError) {
        // Rollback: remove o usuário auth se o perfil falhou
        await adminClient.auth.admin.deleteUser(newUser.user.id)
        throw profileError
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── TOGGLE ACTIVE ────────────────────────────────────────
    if (action === 'toggle') {
      const { user_id } = body
      if (!user_id) {
        return new Response(JSON.stringify({ error: 'user_id obrigatório.' }), { status: 400, headers: corsHeaders })
      }

      const { data: p, error: fetchError } = await adminClient
        .from('profiles')
        .select('is_active')
        .eq('user_id', user_id)
        .single()

      if (fetchError || !p) {
        return new Response(JSON.stringify({ error: 'Usuário não encontrado.' }), { status: 404, headers: corsHeaders })
      }

      const newActive = !p.is_active

      // Bane ou desbane no Supabase Auth
      await adminClient.auth.admin.updateUserById(user_id, {
        ban_duration: newActive ? 'none' : '876600h', // ~100 anos = banido permanentemente
      })

      await adminClient.from('profiles').update({ is_active: newActive }).eq('user_id', user_id)

      return new Response(JSON.stringify({ success: true, is_active: newActive }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── DELETE ───────────────────────────────────────────────
    if (action === 'delete') {
      const { user_id } = body
      if (!user_id) {
        return new Response(JSON.stringify({ error: 'user_id obrigatório.' }), { status: 400, headers: corsHeaders })
      }

      // Impede o admin de excluir a própria conta
      if (user_id === user.id) {
        return new Response(
          JSON.stringify({ error: 'Não é possível excluir sua própria conta.' }),
          { status: 400, headers: corsHeaders },
        )
      }

      const { error: deleteError } = await adminClient.auth.admin.deleteUser(user_id)
      if (deleteError) throw deleteError
      // O perfil é excluído automaticamente via ON DELETE CASCADE

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response('Bad Request', { status: 400, headers: corsHeaders })

  } catch (err) {
    console.error('[manage-user]', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Erro interno.' }),
      { status: 500, headers: corsHeaders },
    )
  }
})
