  //  ESTADO GLOBAL

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
  const ADMIN_PAGES = ['dashboard', 'tipos', 'usuarios'];

  // Recarrega dados ao navegar + protege páginas admin
  const _origNavigate2 = navigate;
  navigate = function(page) {
    // Bloqueia acesso de não-admins às páginas restritas
    if (ADMIN_PAGES.includes(page) && state.role !== 'admin') {
      _origNavigate2('busca');
      return;
    }
    _origNavigate2(page);
    if (page === 'dashboard') loadDashboard();
    if (page === 'usuarios')  loadUsers();
  };

