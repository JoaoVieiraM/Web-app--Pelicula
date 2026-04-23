// ── Supabase client ──────────────────────
  const SUPA_URL = 'https://bsewiosciksmlzndvnro.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZXdpb3NjaWtzbWx6bmR2bnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MzU5ODYsImV4cCI6MjA5MjIxMTk4Nn0.A281sBioDuT1f9oy12e5P-JJb4DWVnGgEkS6WPrJ08w';
  const sb = supabase.createClient(SUPA_URL, SUPA_KEY);
  window.supabase = sb;

  // ── Auth helpers ─────────────────────────
  function showApp(user) {
    document.getElementById('auth-gate').style.display    = 'none';
    document.getElementById('app-container').style.display = 'block';
    // update sidebar username
    const emailParts = user.email.split('@')[0];
    const display = emailParts.charAt(0).toUpperCase() + emailParts.slice(1);
    const initials = display.slice(0,2).toUpperCase();
    const nameEl = document.querySelector('#sidebar [style*="white-space:nowrap"]');
    const initEl = document.querySelector('#sidebar [style*="font-weight:700"]');
    if (nameEl) nameEl.textContent = display;
    if (initEl) initEl.textContent = initials;
  }

  function showLogin() {
    document.getElementById('auth-gate').style.display    = 'flex';
    document.getElementById('app-container').style.display = 'none';
  }

  // ── Check existing session on load ───────
  sb.auth.getSession().then(({ data }) => {
    if (data.session) {
      showApp(data.session.user);
    } else {
      showLogin();
    }
  });

  // ── Listen for auth changes ───────────────
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      showLoginPanel();
      document.getElementById('login-card').style.display  = 'none';
      document.getElementById('reset-panel').style.display = 'block';
      return;
    }
    if (session) showApp(session.user);
    else         showLogin();
  });

  // ── Login handler ─────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn      = document.getElementById('login-btn');
    const errEl    = document.getElementById('login-error');

    errEl.style.display = 'none';
    btn.disabled = true;
    btn.innerHTML = '<svg class="animate-spin" style="width:16px;height:16px;" fill="none" viewBox="0 0 24 24"><circle style="opacity:.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path style="opacity:.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Entrando...';

    const { error } = await sb.auth.signInWithPassword({ email, password });

    if (error) {
      let msg = 'Credenciais inválidas. Verifique e-mail e senha.';
      if (error.message.includes('Email not confirmed')) msg = 'Confirme o e-mail antes de entrar.';
      errEl.textContent  = msg;
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = '<svg style="width:16px;height:16px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/></svg> Entrar';
    }
    // success handled by onAuthStateChange
  }

  // ── Logout handler ────────────────────────
  async function handleLogout() {
    await sb.auth.signOut();
  }

  // ── Auth panel switcher helpers ───────────
  function showLoginPanel() {
    document.getElementById('login-card').style.display   = 'block';
    document.getElementById('forgot-panel').style.display = 'none';
    document.getElementById('reset-panel').style.display  = 'none';
    document.getElementById('forgot-error').style.display   = 'none';
    document.getElementById('forgot-success').style.display = 'none';
    document.getElementById('reset-error').style.display    = 'none';
  }

  function showForgotPanel() {
    document.getElementById('login-card').style.display   = 'none';
    document.getElementById('forgot-panel').style.display = 'block';
    document.getElementById('reset-panel').style.display  = 'none';
    document.getElementById('forgot-email').value = '';
  }

  // ── Forgot password — envia e-mail de recuperação ─
  async function handleForgotPassword(e) {
    e.preventDefault();
    const email  = document.getElementById('forgot-email').value.trim();
    const btn    = document.getElementById('forgot-btn');
    const errEl  = document.getElementById('forgot-error');
    const succEl = document.getElementById('forgot-success');
    const spinSVG = '<svg style="width:16px;height:16px;" class="animate-spin" fill="none" viewBox="0 0 24 24"><circle style="opacity:.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path style="opacity:.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>';
    const sendSVG = '<svg style="width:16px;height:16px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>';

    errEl.style.display  = 'none';
    succEl.style.display = 'none';
    btn.disabled  = true;
    btn.innerHTML = spinSVG + ' Enviando...';

    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/'
    });

    btn.disabled  = false;
    btn.innerHTML = sendSVG + ' Enviar link de recuperação';

    if (error) {
      errEl.textContent   = 'Erro ao enviar e-mail. Verifique o endereço e tente novamente.';
      errEl.style.display = 'block';
      return;
    }
    // Supabase retorna sucesso mesmo para e-mails inexistentes (segurança por design).
    succEl.textContent   = 'Se este e-mail estiver cadastrado, você receberá o link em instantes. Verifique também a caixa de spam.';
    succEl.style.display = 'block';
    btn.disabled = true;
  }

  // ── Password reset — define nova senha ────
  async function handlePasswordReset(e) {
    e.preventDefault();
    const newPw   = document.getElementById('reset-password').value;
    const confirm = document.getElementById('reset-confirm').value;
    const btn     = document.getElementById('reset-btn');
    const errEl   = document.getElementById('reset-error');
    const spinSVG = '<svg style="width:16px;height:16px;" class="animate-spin" fill="none" viewBox="0 0 24 24"><circle style="opacity:.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path style="opacity:.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>';
    const saveSVG = '<svg style="width:16px;height:16px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';

    errEl.style.display = 'none';

    if (newPw !== confirm) {
      errEl.textContent   = 'As senhas não coincidem. Verifique e tente novamente.';
      errEl.style.display = 'block';
      return;
    }
    if (newPw.length < 8) {
      errEl.textContent   = 'A senha deve ter pelo menos 8 caracteres.';
      errEl.style.display = 'block';
      return;
    }

    btn.disabled  = true;
    btn.innerHTML = spinSVG + ' Salvando...';

    const { error } = await sb.auth.updateUser({ password: newPw });

    if (error) {
      errEl.textContent   = 'Erro ao salvar senha: ' + error.message;
      errEl.style.display = 'block';
      btn.disabled  = false;
      btn.innerHTML = saveSVG + ' Salvar nova senha';
      return;
    }
    // Sucesso: onAuthStateChange dispara SIGNED_IN e chama showApp() automaticamente.
  }

  // ── Toggle password visibility ────────────
  let pwVisible = false;
  function togglePassword() {
    pwVisible = !pwVisible;
    const inp = document.getElementById('login-password');
    inp.type  = pwVisible ? 'text' : 'password';
  }

  // ── ViaCEP integration ────────────────────
  async function simulateCEP() {
    const cepRaw = document.getElementById('nc-cep').value.replace(/\D/g, '');
    if (cepRaw.length !== 8) {
      alert('Digite um CEP válido com 8 dígitos.');
      return;
    }
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${cepRaw}/json/`);
      const data = await res.json();
      if (data.erro) { alert('CEP não encontrado.'); return; }
      document.getElementById('nc-rua').value    = data.logradouro || '';
      document.getElementById('nc-bairro').value = data.bairro     || '';
      document.getElementById('nc-cidade').value = data.localidade || '';
      document.getElementById('nc-estado').value = data.uf         || '';
    } catch {
      alert('Erro ao buscar CEP. Verifique sua conexão.');
    }
  }

  // ════════════════════════════════════════════════════════

  //  ROLES — carrega perfil e controla visibilidade

  //  USUÁRIOS — gestão via Edge Function

