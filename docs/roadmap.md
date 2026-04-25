# Roadmap

# Roadmap — Markel Film App

**Documento operacional. Este arquivo é a referência principal para o desenvolvimento.**

Versão: 1.0
Data de início prevista: _(preencher)_
Data de entrega contratual: _(preencher, 30 dias após início)_
Status: não iniciado

---

## 1. Contexto do contrato

- Cliente: **Markel Film** (loja de instalação de insulfilm automotivo).
- Unidades: **4 lojas** em São Paulo.
- Volume estimado: 800–900 instalações por mês.
- Prazo contratual: **30 dias corridos** a partir do dia de início.
- Pagamento: **100% na entrega**.
- Forma de operação nas lojas: **terminais fixos** (PCs), com aplicativo Electron em shell mode apontando para Vercel.
- Perfis de acesso: **admin** (dono, login com senha) e **terminal operacional** (PC da loja sempre logado, com dropdown de instalador para atribuir cada venda).

---

## 2. Decisões já tomadas

Todas essas decisões já foram validadas e fecham o escopo. Não voltamos a discutir durante execução.

- Aplicação web em HTML + CSS + JavaScript Vanilla, com código consolidado em `web/src/js/app.js`.
- Backend no Supabase (PostgreSQL, Auth, Edge Functions), região sa-east-1.
- Hospedagem Vercel Hobby.
- Electron em shell mode apontando para URL da Vercel.
- Instalador `.exe` via electron-builder.
- Sem assinatura de código na v1 (aceita aviso do Windows na instalação presencial).
- Auto-início com Windows habilitado.
- Validação de CPF local, algoritmo de dígitos verificadores, disparo no `onBlur`.
- Clientes compartilhados entre lojas.
- Ficha pós-venda em PDF via html2pdf.js, replicando layout atual da Markel.
- Tabela `profiles` com coluna `role` já existe e é a base do controle de acesso.

---

## 3. Estado atual do projeto

- Reorganização estrutural concluída (Fases 1 a 5).
- Estrutura de pastas: `web/`, `supabase/`, `desktop/`, `docs/` — todas prontas.
- Código web funcional em `web/src/js/app.js`.
- Banco com tabelas `clients`, `vehicles`, `film_types`, `installations`, `profiles`, triggers e cron ativos.
- Bugs pré-existentes conhecidos: 401 na Edge Function `manage-user`, Tailwind via CDN (não bloqueantes na v1).

---

## 4. Premissas de execução

- Trabalho sem folga durante 30 dias (cliente aceitou esse ritmo no contrato e o desenvolvedor aceitou assumir).
- Uso intensivo de Claude Code e Antigravity como multiplicadores de produtividade.
- Claude Code executa desenvolvimento no terminal. Antigravity executa migrations SQL e RLS via MCP Supabase.
- Um dono por arquivo: código web → Claude Code; banco e policies → Antigravity; documentação → ambos.
- Testes manuais em cada ciclo antes de seguir adiante.
- Commits atômicos com mensagem clara de ciclo e feature.

---

## 5. Estrutura de ciclos

O projeto está dividido em **10 ciclos**. Cada ciclo tem escopo fechado, critério de conclusão e duração estimada em dias corridos.

| # | Ciclo | Dias | Acumulado |
|---|---|---|---|
| 1 | Validação de CPF local | 1 | dia 1 |
| 2 | Multi-loja + roles | 3 | dia 4 |
| 3 | Reescrita das RLS | 3 | dia 7 |
| 4 | Contas terminal + sessão persistente | 2 | dia 9 |
| 5 | Tabela employees + CRUD admin | 3 | dia 12 |
| 6 | Frontend condicional por role + dropdown de instalador | 3 | dia 15 |
| 7 | Área admin de usuários (Edge Function) | 3 | dia 18 |
| 8 | Ficha pós-venda em PDF | 4 | dia 22 |
| 9 | Conversão para Electron + instalador | 4 | dia 26 |
| 10 | Testes finais + implantação nas 4 lojas | 4 | dia 30 |

**Folga embutida:** zero. Isso é um risco consciente. Ver seção 9 para plano de contingência.

---

## 6. Detalhamento dos ciclos

### Ciclo 1 — Validação de CPF local

**Duração:** 1 dia
**Dono:** Claude Code (web)
**Dependências:** nenhuma

**Objetivo:** implementar validação matemática de CPF no formulário de cadastro de cliente.

**Escopo:**
- Função `isValidCPF(cpf)` em `web/src/js/app.js` com algoritmo completo de dígitos verificadores.
- Rejeitar sequências inválidas conhecidas (`11111111111`, `22222222222`, etc.).
- Disparo da validação no evento `onBlur` do campo CPF.
- Feedback visual imediato (campo vermelho + mensagem "CPF inválido").
- Botão de salvar desabilitado enquanto CPF inválido.

**Critério de conclusão:**
- Cadastrar cliente com CPF válido funciona.
- Cadastrar com CPF inválido é bloqueado visualmente e via validação.
- Testes manuais com 5 CPFs válidos e 5 inválidos (incluindo sequências).

---

### Ciclo 2 — Multi-loja + roles

**Duração:** 3 dias
**Dono:** Antigravity (banco) + Claude Code (frontend mínimo)
**Dependências:** nenhuma

**Objetivo:** criar infraestrutura de banco para 4 lojas com diferenciação admin/employee.

**Escopo:**
- Criar tabela `stores` com colunas: `id`, `name`, `address`, `phone`, `is_active`, `created_at`.
- Seed inicial com as 4 lojas da Markel.
- Adicionar coluna `store_id` em `installations` (NOT NULL com default para loja 1 nos registros existentes).
- Garantir que tabela `profiles` tem coluna `role` populada corretamente (`admin` ou `employee`).
- Criar script de seed `supabase/seeds/01_stores.sql`.
- Exibir nome da loja ativa no header do frontend (consulta simples via JWT claims).

**Critério de conclusão:**
- Tabela `stores` criada com 4 registros.
- Todas as `installations` existentes têm `store_id`.
- Frontend mostra qual loja está ativa no header.
- Documentação do banco atualizada em `docs/database.md`.

---

### Ciclo 3 — Reescrita das RLS policies

**Duração:** 3 dias
**Dono:** Antigravity
**Dependências:** Ciclo 2

**Objetivo:** policies RLS diferenciando admin (acesso total) e employee (acesso só à loja do terminal).

**Escopo:**
- Remover policies antigas genéricas.
- Criar policies por tabela e por operação (SELECT, INSERT, UPDATE, DELETE):
  - `stores`: admin lê tudo, employee lê só a própria loja.
  - `clients`: ambos leem/editam tudo (clientes são compartilhados).
  - `vehicles`: ambos leem/editam tudo.
  - `installations`: admin lê/edita tudo, employee lê/edita só da própria loja.
  - `film_types`: ambos leem, só admin edita.
  - `profiles`: admin lê/edita tudo, employee lê só o próprio.
- Helper SQL function `get_user_store_id()` que lê o `store_id` do perfil do usuário autenticado.
- Helper SQL function `is_admin()` que retorna true se `role = 'admin'`.
- **Testes obrigatórios** com 2 usuários de teste (1 admin, 1 employee) validando cada combinação.

**Critério de conclusão:**
- Usuário admin de teste consegue ler/editar dados de todas as 4 lojas.
- Usuário employee da loja 1 não consegue ler nem editar dados das lojas 2, 3 e 4.
- Tentativa de employee escrever em tabela protegida retorna erro 403.
- Documentação de policies adicionada em `docs/database.md`.

**Ponto crítico:** este é o ciclo de maior risco técnico. Se as RLS estiverem erradas, tudo depois quebra em cascata. Não avance sem ter testado isolamento entre lojas manualmente.

---

### Ciclo 4 — Contas terminal + sessão persistente

**Duração:** 2 dias
**Dono:** Antigravity (criação de contas) + Claude Code (persistência)
**Dependências:** Ciclo 3

**Objetivo:** cada loja terá uma conta de usuário terminal que permanece logada permanentemente no PC físico.

**Escopo:**
- Criar 4 contas no Supabase Auth: `terminal.loja1@markelfilm.internal`, ..., `terminal.loja4@markelfilm.internal`.
- Popular `profiles` dessas contas com `role = 'employee'` e `store_id` da respectiva loja.
- Guardar senhas (aleatórias fortes) em local seguro: **cria um arquivo `supabase/seeds/terminal-credentials.SECRET.md` que está no `.gitignore`**.
- Ajustar frontend para persistir sessão no `localStorage` com refresh token válido de longa duração.
- Adicionar flag `rememberMe` no login com default true para contas terminal.

**Critério de conclusão:**
- Login com conta terminal persiste entre reloads da página.
- Fechar e abrir o navegador mantém a sessão.
- Sessão sobrevive a 24h sem interação.
- Arquivo de credenciais criado e ignorado pelo Git.

---

### Ciclo 5 — Tabela employees + CRUD admin

**Duração:** 3 dias
**Dono:** Antigravity (banco) + Claude Code (UI)
**Dependências:** Ciclo 3

**Objetivo:** cadastrar instaladores (pessoas físicas) por loja, não confundir com usuários do sistema.

**Escopo:**
- Criar tabela `employees` com colunas: `id`, `full_name`, `store_id`, `is_active`, `hired_at`, `photo_url` (opcional), `created_at`, `updated_at`.
- Policies RLS: admin lê/edita tudo, employee lê só da própria loja.
- Tela admin de cadastro de instaladores (`/admin/employees`):
  - Lista de instaladores por loja.
  - Formulário de criar/editar.
  - Toggle ativo/inativo (não permitir deletar por integridade histórica).
- Upload de foto opcional via Supabase Storage (bucket `employee-photos`).

**Critério de conclusão:**
- Admin consegue cadastrar, editar e inativar instaladores de qualquer loja.
- Employee comum não consegue acessar essa tela.
- Fotos uploadadas aparecem na lista.

---

### Ciclo 6 — Frontend condicional + dropdown de instalador

**Duração:** 3 dias
**Dono:** Claude Code
**Dependências:** Ciclos 3, 4, 5

**Objetivo:** interface que muda conforme role do usuário logado, e dropdown obrigatório de instalador na ficha de instalação.

**Escopo:**
- Função `currentUser()` retorna dados do perfil + role + store_id.
- Componente de menu lateral esconde itens conforme role:
  - Admin vê: Dashboard, Clientes, Veículos, Instalações, Tipos de Película, Instaladores, Usuários, Relatórios.
  - Employee vê: apenas Busca de Clientes e acesso ao histórico do cliente encontrado.
- Redirect automático após login:
  - Admin vai para Dashboard.
  - Employee vai direto para tela de Busca.
- No formulário de nova instalação:
  - Novo campo obrigatório **Instalador responsável** (dropdown).
  - Dropdown filtra por `store_id` do usuário logado (queryfiltrada).
  - Sem default value — atendente tem que escolher conscientemente.
  - Foto do instalador ao lado do nome (se houver).
  - Validação impede salvar sem instalador selecionado.
- Adicionar coluna `installer_id` em `installations` (foreign key para `employees`).

**Critério de conclusão:**
- Login como admin mostra menu completo.
- Login como employee (terminal) mostra só busca e é redirecionado direto para ela.
- Não é possível registrar instalação sem escolher instalador.
- `installer_id` é salvo corretamente em `installations`.

---

### Ciclo 7 — Área admin de usuários (Edge Function)

**Duração:** 3 dias
**Dono:** Claude Code + Antigravity
**Dependências:** Ciclos 3, 5

**Objetivo:** admin pode criar/desativar outros admins via interface, usando Edge Function com Service Role Key.

**Escopo:**
- Revisar/corrigir a Edge Function `manage-user` já existente (resolver o 401 pendente).
- Endpoints:
  - `POST /manage-user` cria novo usuário admin (valida chamador é admin, cria em `auth.users` + `profiles`).
  - `PATCH /manage-user/:id` atualiza role ou is_active.
  - `DELETE /manage-user/:id` (soft delete via `is_active = false`).
- Tela admin `/admin/users`:
  - Lista de usuários do sistema com role e status.
  - Formulário de novo admin (nome, e-mail, senha inicial).
  - Toggle ativar/desativar.
- E-mail automático enviado para novo admin com link de primeiro acesso.

**Critério de conclusão:**
- Admin consegue cadastrar outro admin.
- Novo admin recebe e-mail e consegue fazer primeiro login.
- Desativação impede login do usuário inativo.
- Employee comum não tem acesso a essa tela.

---

### Ciclo 8 — Ficha pós-venda em PDF

**Duração:** 4 dias
**Dono:** Claude Code
**Dependências:** Ciclos 2, 6

**Objetivo:** gerar ficha em PDF replicando layout atual da Markel, com dados da venda preenchidos.

**Escopo:**
- Biblioteca: html2pdf.js (via CDN).
- Template HTML da ficha com CSS dedicado (`web/src/css/invoice.css`).
- Campos preenchidos automaticamente:
  - Cabeçalho: logo Markel, endereço da loja (pelo `store_id` da instalação), telefone, horário de atendimento.
  - Data, nº do pedido (sequencial), funcionário, período.
  - Cliente: nome, endereço, telefone, CPF.
  - Veículo: modelo, ano, portas, cor, placa, município.
  - Instalação: produto (tipo de película), posição/partes cobertas, garantia em anos, valor total.
  - Forma de pagamento (novo campo em `installations`).
  - Remoção (sim/não) (novo campo).
  - Rodapé legal com texto da resolução CONTRAN. **Corrigir "GARATIA" → "GARANTIA"**.
- Botão "Imprimir ficha" na tela de detalhes da instalação.
- Gerar PDF com nome `ficha_{numero_pedido}_{data}.pdf`.
- Adicionar colunas em `installations`: `payment_method`, `includes_removal`, `invoice_number`, `hours_in`, `hours_out`, `final_time`.

**Critério de conclusão:**
- PDF é gerado corretamente e abre em qualquer leitor.
- Layout visualmente similar à ficha original (print da foto de referência).
- Todos os campos preenchidos corretamente.
- Erro de digitação "GARATIA" corrigido.
- Teste com 3 instalações diferentes de lojas diferentes — cada uma gera ficha com dados da loja correta.

---

### Ciclo 9 — Conversão para Electron + instalador

**Duração:** 4 dias
**Dono:** Claude Code
**Dependências:** Ciclo 8 (aplicação web precisa estar 100% funcional antes)

**Objetivo:** aplicativo desktop Windows pronto para instalação nas lojas.

**Escopo:**
- Criar projeto Electron em `desktop/` com shell mode apontando para URL da Vercel.
- Arquivos: `main.js`, `preload.js`, `package.json`, `assets/icon.ico`.
- Configuração electron-builder para gerar `.exe`.
- Ícones em todos os tamanhos (16x16, 32x32, 48x48, 256x256) a partir de PNG 1024x1024.
- Persistência de sessão via `userData` do Electron.
- Auto-início com Windows configurável (habilitado por padrão).
- Janela padrão: 1280x800, redimensionável, não tela cheia forçada.
- Menu nativo simplificado (sem "File > Open" e afins desnecessários).
- Script npm `build:win` que gera instalador final.
- Teste em máquina Windows limpa antes de distribuir.

**Critério de conclusão:**
- Instalador `.exe` gerado com sucesso.
- Em máquina Windows limpa, instalador cria atalho na área de trabalho e menu iniciar.
- App abre corretamente, carrega URL da Vercel, permite login.
- Sessão persiste entre fechamentos.
- Auto-início com Windows funciona.

**Ponto crítico:** esse ciclo é onde mais aparecem problemas imprevistos (path errado, permissão, ícone corrompido). Reservar 1 dos 4 dias para resolução de imprevistos.

---

### Ciclo 10 — Testes finais + implantação nas 4 lojas

**Duração:** 4 dias
**Dono:** humano (você)
**Dependências:** todos os ciclos anteriores

**Objetivo:** validar em ambiente real e deixar as 4 lojas operando com o sistema.

**Escopo:**
- **Dia 27: testes finais em casa.**
  - Rodar smoke test completo: login admin → cadastrar cliente → cadastrar veículo → registrar instalação → gerar ficha → logout → login terminal → busca cliente → registrar instalação pelo terminal.
  - Rodar em 2 máquinas diferentes para garantir portabilidade.
  - Corrigir os últimos bugs encontrados.
- **Dia 28: preparação da implantação.**
  - Pendrive com instalador + arquivo de credenciais.
  - Instalar AnyDesk ou RustDesk em cada PC (fazer remoto se possível).
  - Confirmar com cada loja: quantos PCs, Windows 10+, Chrome atualizado.
- **Dia 29: implantação nas lojas 1 e 2.**
  - Instalar app, logar na conta terminal correspondente, marcar auto-início.
  - Treinar equipe: 30 min de treinamento básico por loja.
  - Testar impressão da ficha em cada PC.
- **Dia 30: implantação nas lojas 3 e 4 + entrega formal.**
  - Mesmo processo das lojas 1 e 2.
  - Reunião final com dono da Markel para entrega formal.
  - Cobrança do pagamento.

**Critério de conclusão:**
- 4 lojas operando com o sistema.
- Equipe treinada minimamente em cada loja.
- Nenhum bug crítico aberto.
- Pagamento recebido.

---

## 7. Dependências entre ciclos

```
1 (CPF)  ──┐
            ├─► independente
2 (Stores) ─►─► 3 (RLS) ─►─► 4 (Terminal) ─►─► 6 (Frontend) ─►─► 8 (Ficha) ─►─► 9 (Electron) ─►─► 10 (Implantação)
                     │                        ▲
                     └─►─► 5 (Employees) ─────┘
                                    │
                                    └─►─► 7 (Admin Users)
```

**Caminho crítico (sequência que define o prazo mínimo):** 2 → 3 → 4 → 6 → 8 → 9 → 10.
Total do caminho crítico: 21 dias. Sobram 9 dias nos outros ciclos (1, 5, 7) para paralelismo ou absorção de atraso.

---

## 8. Checkpoints obrigatórios

Em cada um destes dias, pare tudo e faça auto-avaliação por 1h. Anote no diário do projeto.

**Checkpoint 1 — fim do dia 7 (Ciclo 3 concluído).**
- As RLS estão funcionando? Isolamento entre lojas é real?
- Está no prazo? Se já está 1 dia atrasado aqui, é sinal vermelho.

**Checkpoint 2 — fim do dia 15 (Ciclo 6 concluído).**
- Aplicação web está 100% funcional em ambiente de teste?
- Faltam só ficha PDF, Electron e implantação?
- Se está mais de 2 dias atrasado, acionar plano de contingência (seção 9).

**Checkpoint 3 — fim do dia 22 (Ciclo 8 concluído).**
- Web 100% pronta?
- Se não estiver, **parar Ciclo 9 e focar em fechar web primeiro.** Electron sem web funcional é inútil.

**Checkpoint 4 — fim do dia 26 (Ciclo 9 concluído).**
- Instalador gerado e testado em máquina limpa?
- Se não, **adiar implantação** e comunicar cliente imediatamente.

---

## 9. Riscos e planos de contingência

### Risco 1: RLS quebra em produção (probabilidade média, impacto alto)
**Plano:** manter branch `backup-original` intocada. Se algo derreter, `git reset --hard backup-original` e retomar.

### Risco 2: Atraso de 2+ dias em qualquer ciclo até dia 15 (probabilidade alta, impacto alto)
**Plano:** cortar escopo do Ciclo 7 (área admin de usuários) e migrar para v1.1 pós-entrega. Você cria admins manualmente via Supabase Dashboard no dia da implantação. Ganho: 3 dias.

### Risco 3: Bug imprevisto no Electron (probabilidade alta, impacto médio)
**Plano:** se até o dia 28 o instalador não estiver estável, entregar como **PWA** instalado via Chrome (ícone na área de trabalho, sessão persistida). Não é o ideal, mas funciona. Ganho: 2-3 dias, mas compromisso de evoluir para Electron em 30 dias pós-entrega sem custo adicional.

### Risco 4: Markel muda escopo no meio (probabilidade baixa-média, impacto alto)
**Plano:** contrato deve estar claro em escopo. Qualquer mudança solicitada vira aditivo cobrado à parte. Não aceitar verbalmente. Registrar por e-mail toda solicitação nova.

### Risco 5: Exaustão física do desenvolvedor (probabilidade alta, impacto alto)
**Plano:** regra sagrada — dormir no mínimo 6h por noite. Se dormir menos que isso 3 noites seguidas, parar execução por 24h e voltar. Código feito cansado quebra o projeto.

### Risco 6: Problema de internet/infraestrutura em alguma loja no dia da implantação
**Plano:** levar roteador 4G de backup. Se a loja não tiver internet estável, deixa instalado mas documenta que a primeira sessão precisa de conexão. PWA offline fica como fallback futuro.

---

## 10. Regras operacionais durante os 30 dias

1. **Um commit por feature concluída**, nunca commits gigantes misturando várias coisas.
2. **Mensagem de commit no padrão:** `ciclo N: descrição curta`.
3. **Push diário no mínimo**, mesmo que seja WIP em branch separada.
4. **Documentação é parte do ciclo**, não deixa para o final.
5. **Se travar mais de 2h em um problema**, para e vem conversar comigo. Não se enterra sozinho.
6. **Não abrir novas abas de features** no meio de um ciclo. Anota numa lista "backlog pós-entrega" e continua o que está fazendo.
7. **Banho e comida existem.** Não é frescura. Cérebro limpo codifica menos bug.

---

## 11. Lista de pendências do backlog pós-entrega (v1.1)

Itens importantes mas não críticos que ficam para depois da entrega:

- Trocar Tailwind CDN por build local.
- Configurar Sentry para observabilidade.
- Exportação XLSX com 4 abas (clientes, veículos, instalações, tipos de película).
- Testes automatizados end-to-end com Playwright ou Cypress.
- Notificação de garantia via WhatsApp.
- Relatórios gerenciais e dashboard comparativo entre unidades.
- Consulta pública de garantia por CPF (landing page).
- Agendamento online.
- Integração NFS-e.
- NPS pós-serviço automático.
- Botão de review no Google Maps.

---

## 12. Como usar este documento

1. **Todo dia de manhã**, abrir o roadmap e confirmar qual ciclo está ativo.
2. **Todo dia à noite**, escrever 3 linhas no final desta seção: o que foi feito, o que travou, qual é o plano de amanhã.
3. **Todo domingo**, revisar se está no ritmo esperado (ver tabela da seção 5).
4. **Se atrasar**, consultar seção 9 imediatamente.

---

## 13. Diário de execução

_Preencher a partir do dia 1._

### Dia 1 — data: _(preencher)_
- Feito:
- Travou:
- Plano amanhã:

### Dia 2 — data: _(preencher)_
- Feito:
- Travou:
- Plano amanhã:

_(continuar até o dia 30)_