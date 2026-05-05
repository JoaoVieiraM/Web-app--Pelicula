// ── Supabase client ──────────────────────
  const SUPA_URL = 'https://bsewiosciksmlzndvnro.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZXdpb3NjaWtzbWx6bmR2bnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MzU5ODYsImV4cCI6MjA5MjIxMTk4Nn0.A281sBioDuT1f9oy12e5P-JJb4DWVnGgEkS6WPrJ08w';
  const sb = supabase.createClient(SUPA_URL, SUPA_KEY, {
    auth: {
      persistSession:   true,
      autoRefreshToken: true,
      storageKey:       'markel_session',
    }
  });
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

    const remember = document.getElementById('login-remember')?.checked ?? true;
    const { error } = await sb.auth.signInWithPassword({ email, password });

    if (!error && !remember) {
      localStorage.removeItem('markel_session');
    }

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
  //  ESTADO GLOBAL
  // ════════════════════════════════════════════════════════
  const state = {
    client:    null,   // registro completo do cliente atual
    vehicles:  [],     // veículos do cliente atual
    vehicle:   null,   // veículo selecionado
    installs:  [],     // instalações do veículo selecionado
    filmTypes: [],     // catálogo carregado do Supabase
    role:      null,   // 'admin' | 'employee'
    userId:    null,   // UUID do usuário logado
    storeId:   null,   // UUID da loja do usuário
    storeName: null,   // nome da loja para exibição
    employees: [],     // instaladores carregados (página de gestão)
    installers: [],    // instaladores disponíveis para o formulário de instalação
    stores:    [],     // lojas carregadas (cache para selects de usuário)
  };

  // ════════════════════════════════════════════════════════
  //  HELPERS
  // ════════════════════════════════════════════════════════
  function fmtCPF(cpf) {
    const d = (cpf || '').replace(/\D/g, '');
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  function isValidCPF(cpf) {
    const d = (cpf || '').replace(/\D/g, '');
    if (d.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(d)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += +d[i] * (10 - i);
    let r = (sum * 10) % 11;
    if (r === 10 || r === 11) r = 0;
    if (r !== +d[9]) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += +d[i] * (11 - i);
    r = (sum * 10) % 11;
    if (r === 10 || r === 11) r = 0;
    return r === +d[10];
  }
  function validateCPFField(input) {
    const errEl = document.getElementById('nc-cpf-error');
    const btn   = document.getElementById('new-client-btn');
    const valid = isValidCPF(input.value);
    if (valid) {
      input.classList.remove('border-red-500', 'focus:ring-red-500');
      input.classList.add('border-slate-300');
      if (errEl) errEl.classList.add('hidden');
    } else {
      input.classList.add('border-red-500', 'focus:ring-red-500');
      input.classList.remove('border-slate-300');
      if (errEl) errEl.classList.remove('hidden');
    }
    if (btn) btn.disabled = !valid;
  }
  function fmtPhone(p) {
    const d = (p || '').replace(/\D/g, '');
    if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return p || '—';
  }
  function fmtDate(s) {
    if (!s) return '—';
    const [y, m, d] = s.split('-');
    return `${d}/${m}/${y}`;
  }
  function daysUntil(dateStr) {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
    return diff;
  }
  function partLabel(key) {
    const map = {
      parabrisa: 'Parabrisa',
      traseiro: 'Traseiro',
      lateral_dianteiro_esq: 'Lat. Diant. Esq.',
      lateral_dianteiro_dir: 'Lat. Diant. Dir.',
      lateral_traseiro_esq: 'Lat. Tras. Esq.',
      lateral_traseiro_dir: 'Lat. Tras. Dir.',
      teto_solar: 'Teto Solar',
    };
    return map[key] || key;
  }
  function statusBadge(status) {
    const cfg = {
      active:   { label: 'Ativa',             cls: 'bg-emerald-100 text-emerald-700' },
      expired:  { label: 'Expirada',          cls: 'bg-slate-100 text-slate-500'    },
      removed:  { label: 'Removida',          cls: 'bg-red-50 text-red-500'         },
      expiring: { label: 'Garantia a Vencer', cls: 'bg-amber-100 text-amber-700'    },
    };
    const c = cfg[status] || cfg.expired;
    return `<span class="px-2.5 py-1 rounded-full text-xs font-medium ${c.cls}">${c.label}</span>`;
  }
  function effectiveStatus(install) {
    if (install.status !== 'active') return install.status;
    const days = daysUntil(install.warranty_until);
    if (days !== null && days <= 30 && days >= 0) return 'expiring';
    return 'active';
  }

  // ════════════════════════════════════════════════════════
  //  CATÁLOGO DE TIPOS DE PELÍCULA
  // ════════════════════════════════════════════════════════
  async function loadFilmTypes() {
    const { data, error } = await sb
      .from('film_types')
      .select('id, name, brand, category, description, warranty_months, is_active')
      .order('name');
    if (error || !data) return;
    state.filmTypes = data;

    // Dropdown: apenas ativos
    const sel = document.getElementById('film-type');
    sel.innerHTML = '<option value="" disabled selected>Selecione o tipo...</option>';
    data.filter(ft => ft.is_active).forEach(ft => {
      const desc = ft.brand ? ` — ${ft.brand}` : '';
      const opt = document.createElement('option');
      opt.value = ft.id;
      opt.textContent = ft.name + desc;
      opt.dataset.warrantyMonths = ft.warranty_months || '';
      sel.appendChild(opt);
    });

    // Grid da página Tipos de Película: todos (ativos + inativos)
    renderTiposGrid(data);
  }

  function renderTiposGrid(types) {
    const grid = document.getElementById('tipos-grid');
    if (!grid) return;
    if (!types || types.length === 0) {
      grid.innerHTML = '<p class="text-sm text-slate-400 col-span-full">Nenhum tipo cadastrado.</p>';
      return;
    }
    const catLabel = { solar: 'Solar', premium: 'Premium', segurança: 'Segurança', decorativo: 'Decorativo' };
    grid.innerHTML = types.map(ft => {
      const active = ft.is_active;
      const cat    = (catLabel[ft.category] || ft.category || '');
      const sub    = [cat, ft.brand].filter(Boolean).join(' · ');
      return `
        <div class="card bg-white rounded-xl border border-slate-200 p-5${active ? '' : ' opacity-60'}">
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="font-semibold ${active ? 'text-slate-800' : 'text-slate-700'}">${ft.name}</p>
              ${sub ? `<p class="text-xs text-slate-500 mt-0.5">${sub}</p>` : ''}
            </div>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}">${active ? 'Ativo' : 'Inativo'}</span>
          </div>
          ${ft.description ? `<p class="text-xs text-slate-500 mb-3">${ft.description}</p>` : ''}
          <p class="text-xs text-slate-400">Garantia padrão: <strong class="${active ? 'text-slate-600' : 'text-slate-500'}">${ft.warranty_months ? ft.warranty_months + ' meses' : '—'}</strong></p>
        </div>`;
    }).join('');
  }

  // ════════════════════════════════════════════════════════
  //  BUSCA POR CPF
  // ════════════════════════════════════════════════════════
  async function searchByCPF() {
    const raw = document.getElementById('cpf-input').value.replace(/\D/g, '');
    if (raw.length !== 11) { alert('Digite um CPF válido com 11 dígitos.'); return; }

    const loading   = document.getElementById('search-loading');
    const resultDiv = document.getElementById('search-result');
    const notFound  = document.getElementById('not-found');

    loading.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    notFound.classList.add('hidden');

    const { data: clients, error } = await sb
      .from('clients')
      .select('*')
      .eq('cpf', raw)
      .limit(1);

    loading.classList.add('hidden');

    if (error || !clients || clients.length === 0) {
      // Pre-fill CPF in Novo Cliente form
      const ncCPF = document.getElementById('nc-cpf');
      if (ncCPF) {
        let fmt = raw;
        fmt = fmt.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        ncCPF.value = fmt;
      }
      notFound.classList.remove('hidden');
      return;
    }

    const client = clients[0];
    state.client = client;

    // Load vehicles with their latest installation
    const { data: vehicles } = await sb
      .from('vehicles')
      .select(`*, installations(id, status, warranty_until, film_type_id, film_types(name))`)
      .eq('client_id', client.id)
      .order('created_at', { ascending: false });

    state.vehicles = vehicles || [];
    renderSearchResult(client, state.vehicles);
  }

  function renderSearchResult(client, vehicles) {
    const resultDiv = document.getElementById('search-result');
    const cardEl    = document.getElementById('client-result-card');
    const listEl    = document.getElementById('search-vehicles-list');

    const city = [client.address_city, client.address_state].filter(Boolean).join(' — ');

    cardEl.innerHTML = `
      <div class="px-5 py-4 flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span class="text-blue-700 font-bold text-sm">${client.full_name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</span>
          </div>
          <div>
            <p class="font-semibold text-slate-800">${client.full_name}</p>
            <p class="text-xs text-slate-500">CPF: ${fmtCPF(client.cpf)}</p>
          </div>
        </div>
        <div class="flex items-center gap-6 text-sm text-slate-600">
          ${client.phone ? `<span>${fmtPhone(client.phone)}</span>` : ''}
          ${city ? `<span class="hidden sm:block">${city}</span>` : ''}
          <button onclick="openProfile()" class="btn-primary px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2">
            Ver Perfil
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
          </button>
        </div>
      </div>`;

    if (!vehicles || vehicles.length === 0) {
      listEl.innerHTML = '<p class="text-sm text-slate-400">Nenhum veículo cadastrado.</p>';
    } else {
      listEl.innerHTML = vehicles.map((v, idx) => {
        const installs = v.installations || [];
        const latest   = installs.sort((a,b) => new Date(b.warranty_until||0) - new Date(a.warranty_until||0))[0];
        const es = latest ? effectiveStatus(latest) : null;
        return `
          <div class="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between gap-3 hover:border-blue-300 transition-colors cursor-pointer" onclick="openVehicle(${idx})">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/></svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800">${v.brand} ${v.model} ${v.year}</p>
                <p class="text-xs text-slate-500">${v.plate}${v.color ? ' · ' + v.color : ''}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              ${es ? statusBadge(es) : '<span class="text-xs text-slate-400">Sem instalações</span>'}
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            </div>
          </div>`;
      }).join('');
    }

    resultDiv.classList.remove('hidden');
    setTimeout(() => resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  }

  // ════════════════════════════════════════════════════════
  //  PERFIL DO CLIENTE
  // ════════════════════════════════════════════════════════
  function openProfile() {
    renderProfile();
    navigate('perfil');
  }

  // Atualiza subtítulo da página "Novo Veículo" antes de navegar
  const _origNavigate = navigate;
  navigate = function(page) {
    if (page === 'novo-veiculo' && state.client) {
      document.getElementById('novo-veiculo-subtitle').textContent = state.client.full_name;
    }
    _origNavigate(page);
  };

  function renderProfile() {
    const c = state.client;
    if (!c) return;

    document.getElementById('profile-name').textContent = c.full_name;
    document.getElementById('profile-cpf').textContent  = 'CPF: ' + fmtCPF(c.cpf);

    const fields = [
      { label: 'Telefone',        val: fmtPhone(c.phone) },
      { label: 'E-mail',          val: c.email || '—'    },
      { label: 'Cidade',          val: c.address_city ? `${c.address_city}/${c.address_state}` : '—' },
      { label: 'Cliente desde',   val: fmtDate(c.created_at ? c.created_at.split('T')[0] : null) },
    ];
    document.getElementById('profile-client-data').innerHTML = fields.map(f => `
      <div>
        <p class="text-xs text-slate-400 mb-0.5">${f.label}</p>
        <p class="font-medium text-slate-800">${f.val}</p>
      </div>`).join('');

    renderProfileVehicles();
  }

  function renderProfileVehicles() {
    const vehicles = state.vehicles;
    const countEl  = document.getElementById('profile-vehicles-count');
    const gridEl   = document.getElementById('profile-vehicles-grid');

    countEl.textContent = `(${vehicles.length})`;

    if (vehicles.length === 0) {
      gridEl.innerHTML = '<p class="text-sm text-slate-400">Nenhum veículo cadastrado.</p>';
      return;
    }

    gridEl.innerHTML = vehicles.map((v, idx) => {
      const installs = v.installations || [];
      const latest   = installs.sort((a,b) => new Date(b.warranty_until||0) - new Date(a.warranty_until||0))[0];
      const es = latest ? effectiveStatus(latest) : null;
      const filmName = latest?.film_types?.name || null;
      return `
        <div class="card bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-semibold text-slate-800">${v.brand} ${v.model}</p>
              <p class="text-xs text-slate-500">${v.year}${v.color ? ' · ' + v.color : ''} · ${v.plate}</p>
            </div>
            ${es ? statusBadge(es) : ''}
          </div>
          ${filmName ? `<p class="text-xs text-slate-500">Última: <span class="font-medium text-slate-700">${filmName}</span></p>` : '<p class="text-xs text-slate-400">Sem instalações</p>'}
          <button onclick="openVehicle(${idx})" class="mt-auto text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer inline-flex items-center gap-1">
            Ver Histórico
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
          </button>
        </div>`;
    }).join('');
  }

  // ════════════════════════════════════════════════════════
  //  VEÍCULO + HISTÓRICO
  // ════════════════════════════════════════════════════════
  async function openVehicle(idx) {
    const v = state.vehicles[idx];
    if (!v) return;
    state.vehicle = v;

    let installs;
    try {
      const { data, error } = await sb
        .from('installations')
        .select('*, film_types(name, brand), employees!installer_id(full_name, photo_url)')
        .eq('vehicle_id', v.id)
        .order('installed_at', { ascending: false });
      if (error) throw error;
      installs = data;
    } catch {
      const { data } = await sb
        .from('installations')
        .select('*, film_types(name, brand)')
        .eq('vehicle_id', v.id)
        .order('installed_at', { ascending: false });
      installs = data;
    }

    state.installs = installs || [];
    renderVehicle();
    navigate('veiculo');
  }

  function renderVehicle() {
    const v = state.vehicle;
    const c = state.client;
    if (!v) return;

    document.getElementById('veiculo-title').textContent    = `${v.brand} ${v.model} ${v.year}`;
    document.getElementById('veiculo-subtitle').textContent = `${c ? c.full_name : ''} · ${v.plate}`;
    document.getElementById('nova-inst-subtitle').textContent = `${v.brand} ${v.model} ${v.year} · ${v.plate}${c ? ' · ' + c.full_name : ''}`;

    const fields = [
      { label: 'Marca',  val: v.brand  },
      { label: 'Modelo', val: v.model  },
      { label: 'Ano',    val: v.year   },
      { label: 'Cor',    val: v.color || '—' },
      { label: 'Placa',  val: v.plate  },
      { label: 'Observações', val: v.notes || '—' },
    ];
    document.getElementById('vehicle-data-grid').innerHTML = fields.map(f => `
      <div>
        <p class="text-xs text-slate-400 mb-0.5">${f.label}</p>
        <p class="font-medium text-slate-800">${f.val}</p>
      </div>`).join('');

    renderTimeline();
  }

  function renderTimeline() {
    const timeline = document.getElementById('vehicle-timeline');
    const installs = state.installs;

    if (installs.length === 0) {
      timeline.innerHTML = `
        <div class="text-center py-10 text-slate-400">
          <p class="text-sm">Nenhuma instalação registrada para este veículo.</p>
        </div>`;
      return;
    }

    timeline.innerHTML = installs.map(inst => {
      const es    = effectiveStatus(inst);
      const badge = statusBadge(es);
      const name  = inst.film_types?.name || 'Película não especificada';
      const brand = inst.film_types?.brand || '';
      const days  = daysUntil(inst.warranty_until);
      const parts = (inst.covered_parts || []).map(p => `<span class="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">${partLabel(p)}</span>`).join('');

      let iconBg, iconSvg;
      if (es === 'active' || es === 'expiring') {
        iconBg  = es === 'expiring' ? 'bg-amber-100' : 'bg-emerald-100';
        iconSvg = `<svg class="w-5 h-5 ${es === 'expiring' ? 'text-amber-600' : 'text-emerald-600'}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>`;
      } else if (es === 'removed') {
        iconBg  = 'bg-red-50';
        iconSvg = `<svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>`;
      } else {
        iconBg  = 'bg-slate-100';
        iconSvg = `<svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
      }

      const opacity = (es === 'expired') ? ' opacity-75' : (es === 'removed') ? ' opacity-60' : '';
      let footer = '';
      if (inst.warranty_until) {
        if (es === 'active') {
          footer = `<span>Garantia até ${fmtDate(inst.warranty_until)}</span>${days !== null ? `<span class="text-emerald-600 font-medium">${days} dias restantes</span>` : ''}`;
        } else if (es === 'expiring') {
          footer = `<span>Garantia até ${fmtDate(inst.warranty_until)}</span><span class="text-amber-600 font-medium">${days} dias restantes</span>`;
        } else if (es === 'expired') {
          footer = `<span>Garantia expirou em ${fmtDate(inst.warranty_until)}</span>`;
        } else {
          footer = `<span>Instalado em ${fmtDate(inst.installed_at)}</span>`;
        }
      } else {
        footer = `<span>Instalado em ${fmtDate(inst.installed_at)}</span>`;
      }

      const installer     = inst.employees;
      const installerPhoto = installer?.photo_url;
      const installerName  = installer?.full_name;
      const installerInitials = installerName
        ? installerName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
        : '';
      const installerBadge = installerName ? `
        <div class="flex items-center gap-2 text-xs text-slate-500">
          ${installerPhoto
            ? `<img src="${installerPhoto}" style="width:20px;height:20px;border-radius:50%;object-fit:cover;" />`
            : `<div style="width:20px;height:20px;border-radius:50%;background:#E2E8F0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:#64748B;">${installerInitials}</div>`
          }
          <span>${installerName}</span>
        </div>` : '';

      return `
        <div class="timeline-item relative pl-12">
          <div class="absolute left-0 top-0 w-10 h-10 rounded-full ${iconBg} border-2 border-white shadow flex items-center justify-center">
            ${iconSvg}
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4 ml-2${opacity}">
            <div class="flex items-start justify-between flex-wrap gap-2 mb-3">
              <div>
                <p class="font-semibold text-slate-800">${name}</p>
                <p class="text-xs text-slate-500 mt-0.5">${fmtDate(inst.installed_at)}${brand ? ' · ' + brand : ''}</p>
              </div>
              <div class="flex items-center gap-2">
                ${badge}
                <button onclick="printInvoice('${inst.id}')" title="Imprimir ficha"
                  style="padding:5px;border:1px solid #E2E8F0;border-radius:7px;background:white;cursor:pointer;color:#64748B;display:flex;align-items:center;"
                  onmouseover="this.style.background='#F8FAFC';this.style.color='#0369A1'" onmouseout="this.style.background='white';this.style.color='#64748B'">
                  <svg style="width:14px;height:14px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"/></svg>
                </button>
              </div>
            </div>
            ${parts ? `<div class="flex flex-wrap gap-1.5 mb-3">${parts}</div>` : ''}
            <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              ${footer ? `<div class="flex flex-wrap items-center gap-4 text-xs text-slate-500">${footer}</div>` : '<div></div>'}
              ${installerBadge}
            </div>
          </div>
        </div>`;
    }).join('');
  }

  // ════════════════════════════════════════════════════════
  //  FICHA DE INSTALAÇÃO — PDF (Ciclo 8)
  // ════════════════════════════════════════════════════════
  function computeFinalTime() {
    const hi = document.getElementById('hours-in')?.value;
    const ho = document.getElementById('hours-out')?.value;
    const display = document.getElementById('final-time-display');
    if (!display) return;
    if (!hi || !ho) { display.textContent = ''; return; }
    const [h1, m1] = hi.split(':').map(Number);
    const [h2, m2] = ho.split(':').map(Number);
    const minutes  = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (minutes <= 0) { display.textContent = ''; return; }
    display.textContent = `Tempo total: ${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`;
  }

  async function printInvoice(installId) {
    const inst = state.installs.find(i => i.id === installId);
    if (!inst) return;

    const v = state.vehicle;
    const c = state.client;

    if (!state.stores.length) {
      const { data } = await sb.from('stores').select('id, name, address, phone').eq('is_active', true).order('name');
      state.stores = data || [];
    }
    const store = state.stores.find(s => s.id === inst.store_id)
      || { name: state.storeName || 'Markel Film', address: '', phone: '' };

    const partLabelMap = {
      parabrisa:              'Parabrisa',
      traseiro:               'Traseiro',
      lateral_dianteiro_esq:  'Lat. Dianteiro Esq.',
      lateral_dianteiro_dir:  'Lat. Dianteiro Dir.',
      lateral_traseiro_esq:   'Lat. Traseiro Esq.',
      lateral_traseiro_dir:   'Lat. Traseiro Dir.',
      teto_solar:             'Teto Solar',
    };
    const parts = (inst.covered_parts || []).map(p => partLabelMap[p] || p);

    const fmtTime    = t => t ? t.slice(0, 5) : '—';
    const fmtMinutes = m => m ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}` : '—';

    const invoiceNum = inst.invoice_number
      ? String(inst.invoice_number).padStart(6, '0')
      : 'S/N';
    const payMethod      = inst.payment_method  || '—';
    const includesRemoval = inst.includes_removal ? 'Sim' : 'Não';
    const installerName  = inst.employees?.full_name || '—';
    const filmName       = inst.film_types?.name  || '—';
    const filmBrand      = inst.film_types?.brand ? ' · ' + inst.film_types.brand : '';

    const pdfName = `ficha_${inst.invoice_number || 'sem-numero'}_${inst.installed_at}.pdf`;

    // Estilos reutilizados inline (evita dependência de invoice.css no html2canvas)
    const S = {
      page:        'font-family:Arial,sans-serif;font-size:13px;line-height:1.5;color:#1A1A1C;background:#fff;width:794px;padding:40px 48px;box-sizing:border-box;',
      header:      'display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:18px;border-bottom:3px solid #D62828;',
      brandName:   'font-size:24px;font-weight:800;color:#D62828;letter-spacing:-0.5px;',
      brandSub:    'font-size:11px;color:#71717A;margin-top:2px;',
      storeBox:    'text-align:right;font-size:12px;color:#71717A;',
      storeStrong: 'display:block;color:#1A1A1C;font-size:13px;font-weight:600;margin-bottom:2px;',
      titleWrap:   'text-align:center;margin-bottom:16px;',
      titleH1:     'font-size:15px;font-weight:700;color:#D62828;letter-spacing:2px;text-transform:uppercase;margin:0 0 3px;',
      titleNum:    'font-size:13px;color:#71717A;',
      meta:        'display:flex;justify-content:space-around;background:#FAFAFA;border:1px solid #E4E4E7;border-radius:8px;padding:12px 16px;margin-bottom:18px;',
      metaItem:    'text-align:center;flex:1;padding:0 8px;',
      metaLabel:   'font-size:9px;text-transform:uppercase;letter-spacing:0.8px;color:#71717A;font-weight:700;',
      metaValue:   'font-size:14px;font-weight:700;color:#1A1A1C;margin-top:2px;',
      section:     'margin-bottom:14px;',
      secTitle:    'font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#71717A;background:#F4F4F5;border:1px solid #E4E4E7;border-bottom:none;border-radius:6px 6px 0 0;padding:6px 12px;',
      secBody:     'border:1px solid #E4E4E7;border-radius:0 0 6px 6px;padding:12px 14px;display:grid;grid-template-columns:1fr 1fr;gap:12px 24px;',
      secBodyFull: 'border:1px solid #E4E4E7;border-radius:0 0 6px 6px;padding:12px 14px;',
      fLabel:      'font-size:9px;color:#71717A;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;margin-bottom:2px;',
      fValue:      'font-size:13px;color:#1A1A1C;font-weight:500;',
      span2:       'grid-column:1/-1;',
      parts:       'display:flex;flex-wrap:wrap;gap:5px;margin-top:4px;',
      chip:        'background:#F4F4F5;border:1px solid #D4D4D8;border-radius:20px;padding:2px 10px;font-size:11px;color:#3A3A3E;font-weight:500;',
      warranty:    'display:flex;align-items:center;gap:16px;background:#F0FDF4;border:1.5px solid #86EFAC;border-radius:8px;padding:14px 18px;margin-bottom:14px;',
      wLabel:      'font-size:9px;text-transform:uppercase;letter-spacing:0.8px;color:#16A34A;font-weight:700;',
      wDate:       'font-size:20px;font-weight:800;color:#15803D;line-height:1.2;',
      wPeriod:     'font-size:11px;color:#166534;margin-top:1px;',
      sigs:        'display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:28px;',
      sigLine:     'border-top:1px solid #3A3A3E;padding-top:8px;text-align:center;font-size:11px;color:#71717A;',
      footer:      'margin-top:24px;text-align:center;font-size:10px;color:#71717A;border-top:1px solid #E4E4E7;padding-top:10px;',
    };

    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:0;left:0;width:794px;opacity:0;pointer-events:none;z-index:-9999;';
    el.innerHTML = `
      <div style="${S.page}">
        <div style="${S.header}">
          <div>
            <img src="src/assets/logomarkelsembg.png" alt="Markel Film" style="height:64px;width:auto;display:block;margin-bottom:4px;">
            <div style="${S.brandSub}">Películas Automotivas</div>
          </div>
          <div style="${S.storeBox}">
            <span style="${S.storeStrong}">${store.name}</span>
            ${store.address ? store.address + '<br>' : ''}
            ${store.phone   ? 'Tel: ' + store.phone  : ''}
          </div>
        </div>

        <div style="${S.titleWrap}">
          <div style="${S.titleH1}">Ficha de Instalação</div>
          <div style="${S.titleNum}">Nº ${invoiceNum}</div>
        </div>

        <div style="${S.meta}">
          <div style="${S.metaItem}">
            <div style="${S.metaLabel}">Data</div>
            <div style="${S.metaValue}">${fmtDate(inst.installed_at)}</div>
          </div>
          <div style="${S.metaItem}border-left:1px solid #E4E4E7;">
            <div style="${S.metaLabel}">Entrada</div>
            <div style="${S.metaValue}">${fmtTime(inst.hours_in)}</div>
          </div>
          <div style="${S.metaItem}border-left:1px solid #E4E4E7;">
            <div style="${S.metaLabel}">Saída</div>
            <div style="${S.metaValue}">${fmtTime(inst.hours_out)}</div>
          </div>
          <div style="${S.metaItem}border-left:1px solid #E4E4E7;">
            <div style="${S.metaLabel}">Tempo Total</div>
            <div style="${S.metaValue}">${fmtMinutes(inst.final_time)}</div>
          </div>
        </div>

        <div style="${S.section}">
          <div style="${S.secTitle}">Dados do Cliente</div>
          <div style="${S.secBody}">
            <div><div style="${S.fLabel}">Nome</div><div style="${S.fValue}">${c?.full_name || '—'}</div></div>
            <div><div style="${S.fLabel}">CPF</div><div style="${S.fValue}">${c?.cpf ? fmtCPF(c.cpf) : '—'}</div></div>
            <div><div style="${S.fLabel}">Telefone</div><div style="${S.fValue}">${c?.phone ? fmtPhone(c.phone) : '—'}</div></div>
            <div><div style="${S.fLabel}">E-mail</div><div style="${S.fValue}">${c?.email || '—'}</div></div>
          </div>
        </div>

        <div style="${S.section}">
          <div style="${S.secTitle}">Dados do Veículo</div>
          <div style="${S.secBody}">
            <div><div style="${S.fLabel}">Veículo</div><div style="${S.fValue}">${v?.brand || ''} ${v?.model || ''} ${v?.year || ''}</div></div>
            <div><div style="${S.fLabel}">Placa</div><div style="${S.fValue}">${v?.plate || '—'}</div></div>
            <div><div style="${S.fLabel}">Cor</div><div style="${S.fValue}">${v?.color || '—'}</div></div>
          </div>
        </div>

        <div style="${S.section}">
          <div style="${S.secTitle}">Serviço Realizado</div>
          <div style="${S.secBody}">
            <div><div style="${S.fLabel}">Película</div><div style="${S.fValue}">${filmName}${filmBrand}</div></div>
            <div><div style="${S.fLabel}">Instalador</div><div style="${S.fValue}">${installerName}</div></div>
            <div><div style="${S.fLabel}">Forma de Pagamento</div><div style="${S.fValue}">${payMethod}</div></div>
            <div><div style="${S.fLabel}">Remoção Incluída</div><div style="${S.fValue}">${includesRemoval}</div></div>
            <div style="${S.span2}">
              <div style="${S.fLabel}">Vidros Cobertos</div>
              <div style="${S.parts}">${parts.map(p => `<span style="${S.chip}">${p}</span>`).join('')}</div>
            </div>
            ${inst.notes ? `<div style="${S.span2}"><div style="${S.fLabel}">Observações</div><div style="${S.fValue}">${inst.notes}</div></div>` : ''}
          </div>
        </div>

        ${inst.warranty_until ? `
        <div style="${S.warranty}">
          <svg width="36" height="36" fill="none" stroke="#16A34A" stroke-width="2" viewBox="0 0 24 24" style="flex-shrink:0;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
          </svg>
          <div>
            <div style="${S.wLabel}">Garantia Válida Até</div>
            <div style="${S.wDate}">${fmtDate(inst.warranty_until)}</div>
            ${inst.warranty_months ? `<div style="${S.wPeriod}">${inst.warranty_months} meses de garantia</div>` : ''}
          </div>
        </div>` : ''}

        <div style="${S.sigs}">
          <div style="text-align:center;"><div style="height:40px;"></div><div style="${S.sigLine}">Assinatura do Cliente</div></div>
          <div style="text-align:center;"><div style="height:40px;"></div><div style="${S.sigLine}">Responsável pela Instalação</div></div>
        </div>

        <div style="${S.footer}">
          Markel Film — Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    `;

    document.body.appendChild(el);

    try {
      await html2pdf()
        .set({
          margin:      0,
          filename:    pdfName,
          image:       { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(el.firstElementChild)
        .save();
    } finally {
      document.body.removeChild(el);
    }
  }

  // ════════════════════════════════════════════════════════
  //  NOVO CLIENTE — submit real
  // ════════════════════════════════════════════════════════
  (function wireNewClient() {
    // Override the stub once the DOM is ready
    window.handleNewClientSubmit = async function(e) {
      e.preventDefault();
      const btn = document.getElementById('new-client-btn');
      const spinSVG = '<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>';
      btn.disabled = true;
      btn.innerHTML = spinSVG + ' Cadastrando...';

      const cpfRaw = document.getElementById('nc-cpf').value.replace(/\D/g,'');
      if (!isValidCPF(cpfRaw)) {
        validateCPFField(document.getElementById('nc-cpf'));
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"/></svg> Cadastrar Cliente';
        return;
      }
      const payload = {
        full_name:          document.getElementById('nc-nome').value.trim(),
        cpf:                cpfRaw,
        phone:              document.getElementById('nc-tel').value.replace(/\D/g,'') || null,
        email:              document.getElementById('nc-email').value.trim() || null,
        birth_date:         document.getElementById('nc-nasc').value || null,
        address_street:     document.getElementById('nc-rua').value.trim() || null,
        address_number:     document.getElementById('nc-num').value.trim() || null,
        address_complement: document.getElementById('nc-comp').value.trim() || null,
        address_district:   document.getElementById('nc-bairro').value.trim() || null,
        address_city:       document.getElementById('nc-cidade').value.trim() || null,
        address_state:      document.getElementById('nc-estado').value || null,
        address_zip_code:   document.getElementById('nc-cep').value.trim() || null,
      };

      const { data, error } = await sb.from('clients').insert(payload).select().single();

      if (error) {
        alert('Erro ao cadastrar: ' + (error.message.includes('unique') ? 'CPF já cadastrado.' : error.message));
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"/></svg> Cadastrar Cliente';
        return;
      }

      // Load into state and open profile
      state.client   = data;
      state.vehicles = [];
      renderProfile();
      navigate('perfil');
      e.target.reset();
      btn.disabled = false;
      btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"/></svg> Cadastrar Cliente';
    };
  })();

  // ════════════════════════════════════════════════════════
  //  NOVA INSTALAÇÃO — submit real
  // ════════════════════════════════════════════════════════
  (function wireInstallForm() {
    window.handleFormSubmit = async function(e) {
      e.preventDefault();
      const btn = document.getElementById('submit-btn');
      const spinSVG = '<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>';
      btn.disabled = true;
      btn.innerHTML = spinSVG + ' Salvando...';

      if (!state.vehicle) { alert('Nenhum veículo selecionado.'); btn.disabled = false; return; }

      const installerId = document.getElementById('installer-id').value || null;
      if (!installerId) {
        alert('Selecione o instalador responsável.');
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Registrar Instalação';
        return;
      }

      const partMap = {
        'Parabrisa':         'parabrisa',
        'Traseiro':          'traseiro',
        'Lat. Dianteiro Esq.': 'lateral_dianteiro_esq',
        'Lat. Dianteiro Dir.': 'lateral_dianteiro_dir',
        'Lat. Traseiro Esq.':  'lateral_traseiro_esq',
        'Lat. Traseiro Dir.':  'lateral_traseiro_dir',
        'Teto Solar':        'teto_solar',
      };
      const coveredParts = [...document.querySelectorAll('#page-nova-instalacao input[type=checkbox]:checked')]
        .map(cb => partMap[cb.closest('label').querySelector('span').textContent.trim()] )
        .filter(Boolean);

      const filmTypeId    = document.getElementById('film-type').value || null;
      const warrantyMonths = parseInt(document.getElementById('warranty').value) || null;

      // auto-fill warranty from film type if not manually set
      let resolvedWarranty = warrantyMonths;
      if (!resolvedWarranty && filmTypeId) {
        const ft = state.filmTypes.find(f => f.id === filmTypeId);
        if (ft) resolvedWarranty = ft.warranty_months;
      }

      const hoursIn  = document.getElementById('hours-in').value  || null;
      const hoursOut = document.getElementById('hours-out').value || null;
      let finalTime  = null;
      if (hoursIn && hoursOut) {
        const [h1, m1] = hoursIn.split(':').map(Number);
        const [h2, m2] = hoursOut.split(':').map(Number);
        const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (diff > 0) finalTime = diff;
      }

      const payload = {
        vehicle_id:       state.vehicle.id,
        film_type_id:     filmTypeId,
        installer_id:     installerId,
        installed_at:     document.getElementById('install-date').value,
        warranty_months:  resolvedWarranty,
        covered_parts:    coveredParts,
        notes:            document.getElementById('notes').value.trim() || null,
        payment_method:   document.getElementById('payment-method').value  || null,
        includes_removal: document.getElementById('includes-removal').checked,
        hours_in:         hoursIn,
        hours_out:        hoursOut,
        final_time:       finalTime,
      };

      const { error } = await sb.from('installations').insert(payload);

      if (error) {
        alert('Erro ao registrar instalação: ' + error.message);
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Registrar Instalação';
        return;
      }

      // reload vehicle page with fresh data
      const vehicleIdx = state.vehicles.findIndex(v => v.id === state.vehicle.id);
      await openVehicle(vehicleIdx >= 0 ? vehicleIdx : 0);
      btn.disabled = false;
      btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Registrar Instalação';
    };
  })();

  // ════════════════════════════════════════════════════════
  //  DASHBOARD — dados reais do Supabase
  // ════════════════════════════════════════════════════════
  async function loadDashboard() {
    const now       = new Date();
    const y         = now.getFullYear();
    const m         = String(now.getMonth() + 1).padStart(2, '0');
    const monthStart = `${y}-${m}-01`;

    // Rodar consultas em paralelo
    const [
      { count: totalClients },
      { count: monthInstalls },
      { count: activeInstalls },
      { data: expiring },
      { data: recent },
    ] = await Promise.all([
      sb.from('clients').select('*', { count: 'exact', head: true }),
      sb.from('installations').select('*', { count: 'exact', head: true }).gte('installed_at', monthStart),
      sb.from('installations').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      sb.from('warranties_expiring_soon').select('*').limit(8),
      sb.from('installations')
        .select('installed_at, status, film_types(name), vehicles(brand, model, year, plate, clients(full_name, cpf))')
        .order('installed_at', { ascending: false })
        .limit(5),
    ]);

    // Stats
    document.getElementById('dash-total-clients').textContent   = totalClients ?? '—';
    document.getElementById('dash-month-installs').textContent  = monthInstalls ?? '—';
    document.getElementById('dash-active-installs').textContent = activeInstalls ?? '—';
    document.getElementById('dash-expiring-count').textContent  = expiring ? expiring.length : '—';

    // Tabela instalações recentes
    const tbody = document.getElementById('dash-recent-tbody');
    if (!recent || recent.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="px-5 py-6 text-center text-slate-400 text-sm">Nenhuma instalação registrada.</td></tr>';
    } else {
      tbody.innerHTML = recent.map(inst => {
        const v    = inst.vehicles;
        const c    = v?.clients;
        const es   = effectiveStatus(inst);
        const badge = statusBadge(es);
        return `<tr class="hover:bg-slate-50 transition-colors">
          <td class="px-5 py-3.5"><p class="font-medium text-slate-800">${c?.full_name || '—'}</p><p class="text-xs text-slate-400">${c ? fmtCPF(c.cpf) : ''}</p></td>
          <td class="px-4 py-3.5 hidden sm:table-cell"><p class="text-slate-700">${v ? v.brand + ' ' + v.model : '—'}</p><p class="text-xs text-slate-400">${v?.plate || ''}</p></td>
          <td class="px-4 py-3.5 text-slate-600 hidden lg:table-cell">${inst.film_types?.name || '—'}</td>
          <td class="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">${fmtDate(inst.installed_at)}</td>
          <td class="px-4 py-3.5">${badge}</td>
        </tr>`;
      }).join('');
    }

    // Lista garantias a vencer
    const listEl = document.getElementById('dash-expiring-list');
    if (!expiring || expiring.length === 0) {
      listEl.innerHTML = '<div class="px-5 py-6 text-center text-slate-400 text-sm">Nenhuma garantia a vencer nos próximos 30 dias.</div>';
    } else {
      listEl.innerHTML = expiring.map(row => {
        const days = daysUntil(row.warranty_until);
        const cls  = days <= 7 ? 'bg-red-100 text-red-700' : days <= 14 ? 'bg-amber-100 text-amber-700' : 'bg-orange-100 text-orange-700';
        return `<div class="px-5 py-3.5 hover:bg-slate-50 transition-colors">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-sm font-medium text-slate-800 truncate">${row.client_name}</p>
              <p class="text-xs text-slate-500">${row.brand} ${row.model} ${row.year} · ${row.plate}</p>
            </div>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${cls} flex-shrink-0">${days} dia${days !== 1 ? 's' : ''}</span>
          </div>
        </div>`;
      }).join('');
    }
  }

  // ════════════════════════════════════════════════════════
  //  NOVO VEÍCULO — submit real
  // ════════════════════════════════════════════════════════
  async function handleNewVehicleSubmit(e) {
    e.preventDefault();
    if (!state.client) { alert('Nenhum cliente selecionado.'); return; }

    const btn = document.getElementById('new-vehicle-btn');
    const spinSVG = '<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>';
    btn.disabled = true;
    btn.innerHTML = spinSVG + ' Salvando...';

    const payload = {
      client_id: state.client.id,
      brand:     document.getElementById('nv-marca').value.trim(),
      model:     document.getElementById('nv-modelo').value.trim(),
      year:      parseInt(document.getElementById('nv-ano').value),
      color:     document.getElementById('nv-cor').value.trim() || null,
      plate:     document.getElementById('nv-placa').value.trim().toUpperCase(),
      notes:     document.getElementById('nv-obs').value.trim() || null,
    };

    const { data: newVehicle, error } = await sb.from('vehicles').insert(payload).select().single();

    if (error) {
      const msg = error.message.includes('unique') ? 'Placa já cadastrada no sistema.' : error.message;
      alert('Erro ao cadastrar veículo: ' + msg);
      btn.disabled = false;
      btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg> Adicionar Veículo';
      return;
    }

    // Recarrega veículos do cliente e volta ao perfil
    const { data: vehicles } = await sb
      .from('vehicles')
      .select('*, installations(id, status, warranty_until, film_type_id, film_types(name))')
      .eq('client_id', state.client.id)
      .order('created_at', { ascending: false });

    state.vehicles = vehicles || [];
    renderProfileVehicles();
    e.target.reset();
    btn.disabled = false;
    btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg> Adicionar Veículo';
    navigate('perfil');
  }

  // ════════════════════════════════════════════════════════
  //  ROLES — carrega perfil e controla visibilidade
  // ════════════════════════════════════════════════════════
  async function loadUserProfile(user) {
    state.userId = user.id;

    const { data: profile } = await sb
      .from('profiles')
      .select('role, display_name, is_active, store_id')
      .eq('user_id', user.id)
      .single();

    state.role    = profile?.role    || 'employee';
    state.storeId = profile?.store_id || null;

    if (state.storeId) {
      const { data: store } = await sb
        .from('stores')
        .select('name')
        .eq('id', state.storeId)
        .single();
      state.storeName = store?.name || null;
    }

    const storeEl = document.getElementById('sidebar-store-name');
    if (storeEl) {
      storeEl.textContent  = state.storeName || '';
      storeEl.style.display = state.storeName ? '' : 'none';
    }

    // Atualiza nome/iniciais se tiver display_name no perfil
    if (profile?.display_name) {
      const words    = profile.display_name.trim().split(' ');
      const initials = words.slice(0,2).map(w => w[0]).join('').toUpperCase();
      const nameEl   = document.querySelector('#sidebar [style*="white-space:nowrap"]');
      const initEl   = document.querySelector('#sidebar [style*="font-weight:700"]');
      if (nameEl) nameEl.textContent = profile.display_name;
      if (initEl) initEl.textContent = initials;
    }

    // Atualiza label de role na sidebar
    const roleEl = document.getElementById('sidebar-role-label');
    if (roleEl) roleEl.textContent = state.role === 'admin' ? 'Admin' : 'Atendente';

    updateUIForRole();

    // Navega para a página inicial correta
    await loadFilmTypes();
    if (state.role === 'admin') {
      navigate('dashboard');
    } else {
      navigate('busca');
    }
  }

  function updateUIForRole() {
    const isAdmin = state.role === 'admin';
    const show = el => { if (el) el.style.display = ''; };
    const hide = el => { if (el) el.style.display = 'none'; };

    if (isAdmin) {
      show(document.getElementById('nav-dashboard'));
      show(document.getElementById('nav-tipos'));
      show(document.getElementById('nav-instaladores'));
      show(document.getElementById('nav-usuarios'));
      // Botão "Editar" no perfil: visível para admin
      const editBtn = document.querySelector('#page-perfil .btn-primary.hidden');
      if (editBtn) editBtn.classList.remove('hidden');
    } else {
      hide(document.getElementById('nav-dashboard'));
      hide(document.getElementById('nav-tipos'));
      hide(document.getElementById('nav-instaladores'));
      hide(document.getElementById('nav-usuarios'));
    }
  }

  // ════════════════════════════════════════════════════════
  //  USUÁRIOS — gestão via Edge Function
  // ════════════════════════════════════════════════════════
  async function callEdgeFunction(action, body = {}) {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) throw new Error('Sessão expirada. Faça login novamente.');
    const { data, error } = await sb.functions.invoke('manage-user', {
      body: { action, ...body },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (error) throw new Error(error.message || 'Erro na chamada à função.');
    return data;
  }

  async function loadUsers() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="px-5 py-8 text-center text-slate-400 text-sm">Carregando...</td></tr>';
    try {
      if (!state.stores.length) {
        const { data } = await sb.from('stores').select('id, name').eq('is_active', true).order('name');
        state.stores = data || [];
      }
      const users = await callEdgeFunction('list');
      if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-5 py-8 text-center text-slate-400 text-sm">Nenhum usuário cadastrado.</td></tr>';
        return;
      }
      tbody.innerHTML = users.map(u => {
        const roleBadge = u.role === 'admin'
          ? '<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Admin</span>'
          : '<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Atendente</span>';
        const storeName = u.store_name
          || state.stores.find(s => s.id === u.store_id)?.name
          || (u.store_id ? '—' : '<span class="text-slate-400 italic text-xs">Nenhuma</span>');
        const statusBadge = u.is_active
          ? '<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Ativo</span>'
          : '<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">Inativo</span>';
        const isMe        = u.user_id === state.userId;
        const toggleLabel = u.is_active ? 'Desativar' : 'Ativar';
        const toggleColor = u.is_active ? 'color:#D97706' : 'color:#059669';
        const safeName    = (u.display_name || u.email).replace(/'/g, "\\'");
        return `
          <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
            <td class="px-5 py-3.5">
              <p class="text-sm font-medium text-slate-800">${u.display_name || '<span class="text-slate-400 italic">Sem nome</span>'}</p>
              <p class="text-xs text-slate-400 mt-0.5">${u.email}</p>
            </td>
            <td class="px-5 py-3.5">${roleBadge}</td>
            <td class="px-5 py-3.5 text-sm text-slate-600">${storeName}</td>
            <td class="px-5 py-3.5">${statusBadge}</td>
            <td class="px-5 py-3.5 text-right whitespace-nowrap">
              ${isMe
                ? '<span class="text-xs text-slate-400 italic">Você</span>'
                : `<button onclick="toggleUserActive('${u.user_id}')" style="font-size:12px;font-weight:500;${toggleColor};background:none;border:none;cursor:pointer;margin-right:12px;">${toggleLabel}</button><button onclick="confirmDeleteUser('${u.user_id}','${safeName}')" style="font-size:12px;font-weight:500;color:#EF4444;background:none;border:none;cursor:pointer;">Excluir</button>`
              }
            </td>
          </tr>`;
      }).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" class="px-5 py-8 text-center text-red-500 text-sm">Erro ao carregar: ${err.message}</td></tr>`;
    }
  }

  async function openCreateUserModal() {
    document.getElementById('cu-nome').value  = '';
    document.getElementById('cu-email').value = '';
    document.getElementById('cu-role').value  = 'employee';
    document.getElementById('create-user-error').style.display = 'none';

    const sel = document.getElementById('cu-store');
    sel.innerHTML = '<option value="">Carregando lojas...</option>';
    try {
      if (!state.stores.length) {
        const { data } = await sb.from('stores').select('id, name').eq('is_active', true).order('name');
        state.stores = data || [];
      }
      sel.innerHTML = '<option value="">Nenhuma (opcional para admin)</option>'
        + state.stores.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    } catch (_) {
      sel.innerHTML = '<option value="">Erro ao carregar lojas</option>';
    }
    sel.value = '';

    onCuRoleChange(document.getElementById('cu-role'));
    document.getElementById('modal-criar-usuario').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeCreateUserModal() {
    document.getElementById('modal-criar-usuario').style.display = 'none';
    document.body.style.overflow = '';
  }

  function onCuRoleChange(sel) {
    const isEmployee = sel.value === 'employee';
    document.getElementById('cu-store-required').style.visibility = isEmployee ? 'visible' : 'hidden';
    document.getElementById('cu-store-hint').textContent = isEmployee
      ? 'Obrigatório para Atendente.'
      : 'Admins podem ficar sem loja.';
    document.getElementById('cu-store').required = isEmployee;
  }

  function showAccessLinkModal(link, email) {
    document.getElementById('access-link-email').textContent = `Para: ${email}`;
    document.getElementById('access-link-input').value = link;
    document.getElementById('copy-link-btn').textContent = 'Copiar';
    document.getElementById('modal-access-link').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeAccessLinkModal() {
    document.getElementById('modal-access-link').style.display = 'none';
    document.body.style.overflow = '';
  }

  function copyAccessLink() {
    const input = document.getElementById('access-link-input');
    const btn   = document.getElementById('copy-link-btn');
    navigator.clipboard.writeText(input.value).then(() => {
      btn.textContent = 'Copiado!';
      setTimeout(() => { btn.textContent = 'Copiar'; }, 2000);
    }).catch(() => {
      input.select();
      document.execCommand('copy');
    });
  }

  async function handleCreateUserSubmit(e) {
    e.preventDefault();
    const btn   = document.getElementById('create-user-btn');
    const errEl = document.getElementById('create-user-error');
    const spinSVG = '<svg style="width:15px;height:15px;" class="animate-spin" fill="none" viewBox="0 0 24 24"><circle style="opacity:.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path style="opacity:.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>';

    const email   = document.getElementById('cu-email').value.trim();
    const role    = document.getElementById('cu-role').value;
    const storeId = document.getElementById('cu-store').value || null;

    if (role === 'employee' && !storeId) {
      errEl.textContent   = 'Selecione a loja para o Atendente.';
      errEl.style.display = 'block';
      return;
    }

    errEl.style.display = 'none';
    btn.disabled  = true;
    btn.innerHTML = spinSVG + ' Criando...';

    try {
      const result = await callEdgeFunction('create', {
        email,
        display_name: document.getElementById('cu-nome').value.trim() || null,
        role,
        store_id: storeId,
      });
      closeCreateUserModal();
      await loadUsers();
      if (result?.access_link) showAccessLinkModal(result.access_link, email);
    } catch (err) {
      errEl.textContent   = err.message.includes('already registered') ? 'Este e-mail já está cadastrado.' : err.message;
      errEl.style.display = 'block';
    } finally {
      btn.disabled  = false;
      btn.innerHTML = '<svg style="width:15px;height:15px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"/></svg> Criar usuário';
    }
  }

  async function toggleUserActive(userId) {
    try {
      await callEdgeFunction('toggle', { user_id: userId });
      await loadUsers();
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      const isSelfDeactivate = msg.includes('cannot deactivate') || msg.includes('própria conta') || msg.includes('yourself');
      alert(isSelfDeactivate
        ? 'Não é possível desativar a própria conta de admin.'
        : 'Erro: ' + err.message);
    }
  }

  async function confirmDeleteUser(userId, name) {
    if (!confirm(`Excluir o usuário "${name}"?\n\nEsta ação é permanente e não pode ser desfeita.`)) return;
    try {
      await callEdgeFunction('delete', { user_id: userId });
      await loadUsers();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  }

  // ════════════════════════════════════════════════════════
  //  MODAL: EDITAR CLIENTE
  // ════════════════════════════════════════════════════════
  function openEditClientModal() {
    const c = state.client;
    if (!c) return;
    document.getElementById('edit-modal-subtitle').textContent = 'CPF: ' + fmtCPF(c.cpf);
    document.getElementById('edit-nome').value    = c.full_name || '';
    document.getElementById('edit-tel').value     = fmtPhone(c.phone) || '';
    document.getElementById('edit-email').value   = c.email || '';
    document.getElementById('edit-nasc').value    = c.birth_date || '';
    document.getElementById('edit-cep').value     = c.address_zip_code || '';
    document.getElementById('edit-rua').value     = c.address_street || '';
    document.getElementById('edit-num').value     = c.address_number || '';
    document.getElementById('edit-comp').value    = c.address_complement || '';
    document.getElementById('edit-bairro').value  = c.address_district || '';
    document.getElementById('edit-cidade').value  = c.address_city || '';
    document.getElementById('edit-obs').value     = c.notes || '';
    const estadoSel = document.getElementById('edit-estado');
    estadoSel.value = c.address_state || '';
    document.getElementById('edit-client-error').style.display = 'none';
    const modal = document.getElementById('modal-editar-cliente');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeEditClientModal() {
    document.getElementById('modal-editar-cliente').style.display = 'none';
    document.body.style.overflow = '';
  }

  async function buscarCEPEdit() {
    const raw = document.getElementById('edit-cep').value.replace(/\D/g, '');
    if (raw.length !== 8) { alert('CEP deve ter 8 dígitos.'); return; }
    try {
      const r = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      const d = await r.json();
      if (d.erro) { alert('CEP não encontrado.'); return; }
      document.getElementById('edit-rua').value    = d.logradouro || '';
      document.getElementById('edit-bairro').value = d.bairro || '';
      document.getElementById('edit-cidade').value = d.localidade || '';
      document.getElementById('edit-estado').value = d.uf || '';
      document.getElementById('edit-cep').value    = d.cep || '';
    } catch { alert('Erro ao consultar o CEP.'); }
  }

  async function handleEditClientSubmit(e) {
    e.preventDefault();
    const c    = state.client;
    if (!c) return;
    const btn   = document.getElementById('edit-client-btn');
    const errEl = document.getElementById('edit-client-error');
    const spinSVG = '<svg style="width:15px;height:15px;" class="animate-spin" fill="none" viewBox="0 0 24 24"><circle style="opacity:.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path style="opacity:.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>';

    errEl.style.display = 'none';
    btn.disabled  = true;
    btn.innerHTML = spinSVG + ' Salvando...';

    const phone = document.getElementById('edit-tel').value.replace(/\D/g, '');
    const payload = {
      full_name:          document.getElementById('edit-nome').value.trim(),
      phone:              phone || null,
      email:              document.getElementById('edit-email').value.trim() || null,
      birth_date:         document.getElementById('edit-nasc').value || null,
      address_zip_code:   document.getElementById('edit-cep').value.trim() || null,
      address_street:     document.getElementById('edit-rua').value.trim() || null,
      address_number:     document.getElementById('edit-num').value.trim() || null,
      address_complement: document.getElementById('edit-comp').value.trim() || null,
      address_district:   document.getElementById('edit-bairro').value.trim() || null,
      address_city:       document.getElementById('edit-cidade').value.trim() || null,
      address_state:      document.getElementById('edit-estado').value || null,
      notes:              document.getElementById('edit-obs').value.trim() || null,
    };

    const { data: updated, error } = await sb
      .from('clients')
      .update(payload)
      .eq('id', c.id)
      .select()
      .single();

    btn.disabled  = false;
    btn.innerHTML = '<svg style="width:15px;height:15px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Salvar alterações';

    if (error) {
      errEl.textContent   = 'Erro ao salvar: ' + error.message;
      errEl.style.display = 'block';
      return;
    }

    state.client = updated;
    renderProfile();
    closeEditClientModal();
  }

  // ════════════════════════════════════════════════════════
  //  MODAL: NOVO TIPO DE PELÍCULA
  // ════════════════════════════════════════════════════════
  function openNovoTipoModal() {
    document.getElementById('nt-nome').value      = '';
    document.getElementById('nt-marca').value     = '';
    document.getElementById('nt-categoria').value = '';
    document.getElementById('nt-desc').value      = '';
    document.getElementById('nt-garantia').value  = '';
    document.getElementById('nt-ativo').checked   = true;
    document.getElementById('novo-tipo-error').style.display = 'none';
    const modal = document.getElementById('modal-novo-tipo');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeNovoTipoModal() {
    document.getElementById('modal-novo-tipo').style.display = 'none';
    document.body.style.overflow = '';
  }

  async function handleNovoTipoSubmit(e) {
    e.preventDefault();
    const btn   = document.getElementById('novo-tipo-btn');
    const errEl = document.getElementById('novo-tipo-error');
    const spinSVG = '<svg style="width:15px;height:15px;" class="animate-spin" fill="none" viewBox="0 0 24 24"><circle style="opacity:.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path style="opacity:.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>';

    errEl.style.display = 'none';
    btn.disabled  = true;
    btn.innerHTML = spinSVG + ' Cadastrando...';

    const garantia = document.getElementById('nt-garantia').value;
    const payload = {
      name:            document.getElementById('nt-nome').value.trim(),
      brand:           document.getElementById('nt-marca').value.trim() || null,
      category:        document.getElementById('nt-categoria').value || null,
      description:     document.getElementById('nt-desc').value.trim() || null,
      warranty_months: garantia ? parseInt(garantia, 10) : null,
      is_active:       document.getElementById('nt-ativo').checked,
    };

    const { error } = await sb.from('film_types').insert(payload);

    btn.disabled  = false;
    btn.innerHTML = '<svg style="width:15px;height:15px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg> Cadastrar';

    if (error) {
      errEl.textContent   = error.message.includes('unique') ? 'Já existe um tipo com este nome.' : 'Erro ao cadastrar: ' + error.message;
      errEl.style.display = 'block';
      return;
    }

    closeNovoTipoModal();
    await loadFilmTypes(); // atualiza dropdown + grid
  }

  // ════════════════════════════════════════════════════════
  //  EXPORTAR CSV
  // ════════════════════════════════════════════════════════
  function csvEscape(val) {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  function arrayToCSV(headers, rows) {
    const lines = [headers.join(',')];
    for (const row of rows) lines.push(row.map(csvEscape).join(','));
    return lines.join('\r\n');
  }

  function downloadCSV(filename, csvString) {
    const BOM  = '\uFEFF'; // BOM UTF-8 para Excel reconhecer acentuação no Windows
    const blob = new Blob([BOM + csvString], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function exportAllData() {
    const btn = document.getElementById('export-btn');
    const originalHTML = btn.innerHTML;
    const spinSVG = '<svg style="width:16px;height:16px;" class="animate-spin" fill="none" viewBox="0 0 24 24"><circle style="opacity:.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path style="opacity:.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>';

    btn.disabled  = true;
    btn.innerHTML = spinSVG + ' <span class="hidden sm:inline">Exportando...</span>';

    try {
      const today = new Date().toISOString().slice(0, 10);

      const [
        { data: clients,       error: err1 },
        { data: vehicles,      error: err2 },
        { data: installations, error: err3 },
      ] = await Promise.all([
        sb.from('clients').select('*').order('full_name'),
        sb.from('vehicles').select('*, clients(cpf, full_name)').order('created_at'),
        sb.from('installations')
          .select('*, film_types(name), vehicles(plate, brand, model, clients(full_name, cpf))')
          .order('installed_at', { ascending: false }),
      ]);

      if (err1 || err2 || err3) throw new Error((err1 || err2 || err3).message);

      // CSV 1: Clientes
      const clientHeaders = [
        'id','cpf','full_name','phone','email','birth_date',
        'address_street','address_number','address_complement',
        'address_district','address_city','address_state','address_zip_code','created_at'
      ];
      const clientRows = (clients || []).map(c => [
        c.id, c.cpf, c.full_name, c.phone, c.email, c.birth_date,
        c.address_street, c.address_number, c.address_complement,
        c.address_district, c.address_city, c.address_state, c.address_zip_code, c.created_at
      ]);
      downloadCSV(`clientes_${today}.csv`, arrayToCSV(clientHeaders, clientRows));

      // CSV 2: Veículos
      await new Promise(r => setTimeout(r, 300));
      const vehicleHeaders = [
        'id','client_cpf','client_name','brand','model','year','color','plate','notes','created_at'
      ];
      const vehicleRows = (vehicles || []).map(v => [
        v.id, v.clients?.cpf, v.clients?.full_name,
        v.brand, v.model, v.year, v.color, v.plate, v.notes, v.created_at
      ]);
      downloadCSV(`veiculos_${today}.csv`, arrayToCSV(vehicleHeaders, vehicleRows));

      // CSV 3: Instalações
      await new Promise(r => setTimeout(r, 300));
      const installHeaders = [
        'id','vehicle_plate','vehicle_brand','vehicle_model',
        'client_name','client_cpf','film_type_name',
        'installed_at','warranty_until','warranty_months',
        'status','covered_parts','notes','created_at'
      ];
      const installRows = (installations || []).map(inst => [
        inst.id,
        inst.vehicles?.plate, inst.vehicles?.brand, inst.vehicles?.model,
        inst.vehicles?.clients?.full_name, inst.vehicles?.clients?.cpf,
        inst.film_types?.name,
        inst.installed_at, inst.warranty_until, inst.warranty_months,
        inst.status,
        (inst.covered_parts || []).join(' | '),
        inst.notes, inst.created_at
      ]);
      downloadCSV(`instalacoes_${today}.csv`, arrayToCSV(installHeaders, installRows));

    } catch (err) {
      alert('Erro ao exportar dados: ' + err.message);
    } finally {
      btn.disabled  = false;
      btn.innerHTML = originalHTML;
    }
  }

  // ════════════════════════════════════════════════════════
  //  CURRENT USER HELPER
  // ════════════════════════════════════════════════════════
  function currentUser() {
    return {
      userId:    state.userId,
      role:      state.role,
      storeId:   state.storeId,
      storeName: state.storeName,
    };
  }

  // ════════════════════════════════════════════════════════
  //  DROPDOWN DE INSTALADOR — formulário de nova instalação
  // ════════════════════════════════════════════════════════
  async function loadInstallersForForm() {
    const sel = document.getElementById('installer-id');
    if (!sel) return;

    // Reset form fields ao navegar para a página
    sel.innerHTML = '<option value="" disabled selected>Carregando instaladores...</option>';
    document.getElementById('installer-preview')?.classList.add('hidden');
    const dateEl = document.getElementById('install-date');
    if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
    const pmEl = document.getElementById('payment-method');
    if (pmEl) pmEl.value = '';
    const remEl = document.getElementById('includes-removal');
    if (remEl) remEl.checked = false;
    const hiEl = document.getElementById('hours-in');
    if (hiEl) hiEl.value = '';
    const hoEl = document.getElementById('hours-out');
    if (hoEl) hoEl.value = '';
    const ftEl = document.getElementById('final-time-display');
    if (ftEl) ftEl.textContent = '';

    let query = sb
      .from('employees')
      .select('id, full_name, store_id, photo_url, stores(name)')
      .eq('is_active', true)
      .order('full_name');

    if (state.role !== 'admin' && state.storeId) {
      query = query.eq('store_id', state.storeId);
    }

    const { data, error } = await query;

    sel.innerHTML = '<option value="" disabled selected>Selecione o instalador...</option>';

    if (error || !data || data.length === 0) {
      const msg = error ? 'Erro ao carregar instaladores' : 'Nenhum instalador ativo cadastrado';
      sel.innerHTML = `<option value="" disabled selected>${msg}</option>`;
      state.installers = [];
      return;
    }

    state.installers = data;

    if (state.role === 'admin') {
      const byStore = {};
      data.forEach(emp => {
        const key = emp.stores?.name || 'Loja';
        if (!byStore[key]) byStore[key] = [];
        byStore[key].push(emp);
      });
      Object.entries(byStore).forEach(([storeName, emps]) => {
        const grp = document.createElement('optgroup');
        grp.label = storeName;
        emps.forEach(emp => {
          const opt = document.createElement('option');
          opt.value = emp.id;
          opt.textContent = emp.full_name;
          grp.appendChild(opt);
        });
        sel.appendChild(grp);
      });
    } else {
      data.forEach(emp => {
        const opt = document.createElement('option');
        opt.value = emp.id;
        opt.textContent = emp.full_name;
        sel.appendChild(opt);
      });
    }
  }

  function onInstallerChange(sel) {
    const preview  = document.getElementById('installer-preview');
    const photoEl  = document.getElementById('installer-preview-photo');
    const nameEl   = document.getElementById('installer-preview-name');
    const emp      = (state.installers || []).find(e => e.id === sel.value);
    if (!emp) { preview.classList.add('hidden'); return; }

    const initials = emp.full_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    photoEl.innerHTML = emp.photo_url
      ? `<img src="${emp.photo_url}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" />`
      : `<div style="width:36px;height:36px;border-radius:50%;background:#E2E8F0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:#64748B;">${initials}</div>`;
    nameEl.textContent = emp.full_name;
    preview.classList.remove('hidden');
  }

  // ════════════════════════════════════════════════════════
  //  INSTALADORES — CRUD admin
  // ════════════════════════════════════════════════════════
  async function loadEmployees() {
    const container = document.getElementById('employees-list');
    if (!container) return;
    container.innerHTML = '<p class="text-sm text-slate-400 py-8 text-center">Carregando...</p>';

    const { data, error } = await sb
      .from('employees')
      .select('*, stores(name)')
      .order('full_name');

    if (error) {
      container.innerHTML = `<p class="text-sm text-red-500 py-8 text-center">Erro ao carregar: ${error.message}</p>`;
      return;
    }

    state.employees = data || [];

    if (state.employees.length === 0) {
      container.innerHTML = '<p class="text-sm text-slate-400 py-8 text-center">Nenhum instalador cadastrado. Clique em "Novo Instalador" para começar.</p>';
      return;
    }

    const byStore = {};
    state.employees.forEach(emp => {
      const key = emp.store_id;
      if (!byStore[key]) byStore[key] = { name: emp.stores?.name || 'Loja desconhecida', emps: [] };
      byStore[key].emps.push(emp);
    });

    container.innerHTML = Object.values(byStore).map(group => `
      <div class="mb-8">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">${group.name}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${group.emps.map(emp => renderEmployeeCard(emp)).join('')}
        </div>
      </div>
    `).join('');
  }

  function renderEmployeeCard(emp) {
    const active   = emp.is_active;
    const hired    = emp.hired_at ? fmtDate(emp.hired_at) : '—';
    const initials = emp.full_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const photo    = emp.photo_url
      ? `<img src="${emp.photo_url}" alt="${emp.full_name}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0;" />`
      : `<div style="width:40px;height:40px;border-radius:50%;background:#E2E8F0;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px;font-weight:600;color:#64748B;">${initials}</div>`;
    const toggleLabel = active ? 'Inativar' : 'Ativar';
    const toggleColor = active ? '#D97706' : '#059669';
    return `
      <div class="card bg-white rounded-xl border border-slate-200 p-4${active ? '' : ' opacity-60'}">
        <div class="flex items-start gap-3">
          ${photo}
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <p class="font-medium text-slate-800 text-sm leading-tight">${emp.full_name}</p>
              <span class="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}">${active ? 'Ativo' : 'Inativo'}</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">Contratado: ${hired}</p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-4 mt-3 pt-3 border-t border-slate-100">
          <button onclick="openFuncionarioModal('${emp.id}')" style="font-size:12px;font-weight:500;color:#0369A1;background:none;border:none;cursor:pointer;">Editar</button>
          <button onclick="toggleEmployeeActive('${emp.id}', ${active})" style="font-size:12px;font-weight:500;color:${toggleColor};background:none;border:none;cursor:pointer;">${toggleLabel}</button>
        </div>
      </div>`;
  }

  async function openFuncionarioModal(empId) {
    const emp       = empId ? (state.employees || []).find(e => e.id === empId) : null;
    const titleEl   = document.getElementById('func-modal-title');
    const errEl     = document.getElementById('func-modal-error');
    const previewEl = document.getElementById('func-foto-preview');
    const iconSVG   = '<svg style="width:20px;height:20px;color:#CBD5E1;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>';

    document.getElementById('func-id').value         = emp?.id       || '';
    document.getElementById('func-nome').value       = emp?.full_name || '';
    document.getElementById('func-data').value       = emp?.hired_at  || '';
    document.getElementById('func-ativo').checked    = emp ? emp.is_active : true;
    document.getElementById('func-foto-input').value = '';
    titleEl.textContent  = emp ? 'Editar Instalador' : 'Novo Instalador';
    errEl.style.display  = 'none';
    previewEl.innerHTML  = emp?.photo_url
      ? `<img src="${emp.photo_url}" style="width:100%;height:100%;object-fit:cover;" />`
      : iconSVG;

    const sel = document.getElementById('func-loja');
    sel.innerHTML = '<option value="" disabled>Carregando...</option>';
    const { data: stores } = await sb.from('stores').select('id, name').eq('is_active', true).order('name');
    sel.innerHTML = `<option value="" disabled${emp ? '' : ' selected'}>Selecione a loja...</option>`;
    (stores || []).forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      if (s.id === emp?.store_id) opt.selected = true;
      sel.appendChild(opt);
    });

    document.getElementById('modal-funcionario').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeFuncionarioModal() {
    document.getElementById('modal-funcionario').style.display = 'none';
    document.body.style.overflow = '';
  }

  function previewFuncPhoto(input) {
    const file = input.files?.[0];
    if (!file) return;
    const previewEl = document.getElementById('func-foto-preview');
    const reader    = new FileReader();
    reader.onload   = e => { previewEl.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;" />`; };
    reader.readAsDataURL(file);
  }

  async function handleFuncionarioSubmit(e) {
    e.preventDefault();
    const btn     = document.getElementById('func-submit-btn');
    const errEl   = document.getElementById('func-modal-error');
    const spinSVG = '<svg style="width:15px;height:15px;" class="animate-spin" fill="none" viewBox="0 0 24 24"><circle style="opacity:.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path style="opacity:.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>';
    const saveSVG = '<svg style="width:15px;height:15px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';

    errEl.style.display = 'none';
    btn.disabled  = true;
    btn.innerHTML = spinSVG + ' Salvando...';

    const empId    = document.getElementById('func-id').value || null;
    const fullName = document.getElementById('func-nome').value.trim();
    const storeId  = document.getElementById('func-loja').value;
    const hiredAt  = document.getElementById('func-data').value || null;
    const isActive = document.getElementById('func-ativo').checked;
    const file     = document.getElementById('func-foto-input').files?.[0];
    let   photoUrl = empId ? (state.employees.find(em => em.id === empId)?.photo_url || null) : null;

    try {
      if (file) {
        const ext  = file.name.split('.').pop();
        const path = `${Date.now()}.${ext}`;
        const { error: upErr } = await sb.storage.from('employee-photos').upload(path, file, { upsert: true });
        if (upErr) throw new Error('Erro no upload da foto: ' + upErr.message);
        const { data: urlData } = sb.storage.from('employee-photos').getPublicUrl(path);
        photoUrl = urlData?.publicUrl || null;
      }

      const payload = { full_name: fullName, store_id: storeId, hired_at: hiredAt, is_active: isActive, photo_url: photoUrl };

      if (empId) {
        const { error } = await sb.from('employees').update(payload).eq('id', empId);
        if (error) throw error;
      } else {
        const { error } = await sb.from('employees').insert(payload);
        if (error) throw error;
      }

      closeFuncionarioModal();
      await loadEmployees();
    } catch (err) {
      errEl.textContent   = err.message || 'Erro ao salvar.';
      errEl.style.display = 'block';
    } finally {
      btn.disabled  = false;
      btn.innerHTML = saveSVG + ' Salvar';
    }
  }

  async function toggleEmployeeActive(id, currentActive) {
    try {
      const { error } = await sb.from('employees').update({ is_active: !currentActive }).eq('id', id);
      if (error) throw error;
      await loadEmployees();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  }

  // ════════════════════════════════════════════════════════
  //  INIT — carrega dados após login
  // ════════════════════════════════════════════════════════
  const _origShowApp = showApp;
  window.showApp = function(user) {
    _origShowApp(user);
    // loadUserProfile carrega o perfil, define o role,
    // atualiza a sidebar e navega para a página correta
    loadUserProfile(user);
  };

  // Páginas exclusivas para admin
  const ADMIN_PAGES = ['dashboard', 'tipos', 'instaladores', 'usuarios'];

  // Recarrega dados ao navegar + protege páginas admin
  const _origNavigate2 = navigate;
  navigate = function(page) {
    // Bloqueia acesso de não-admins às páginas restritas
    if (ADMIN_PAGES.includes(page) && state.role !== 'admin') {
      _origNavigate2('busca');
      return;
    }
    _origNavigate2(page);
    if (page === 'dashboard')        loadDashboard();
    if (page === 'nova-instalacao')  loadInstallersForForm();
    if (page === 'instaladores')     loadEmployees();
    if (page === 'usuarios')         loadUsers();
  };
