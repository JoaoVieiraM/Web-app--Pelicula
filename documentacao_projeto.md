# Documentação Técnica do Projeto: PeliculaApp

## 1. Visão Geral
O **PeliculaApp** é uma aplicação web focada na gestão de clientes, veículos e serviços de instalação de películas automotivas (e arquitetura/afins). Ele roda sob um frontend HTML/JS SPA (Single Page Application) leve, integrado com um backend robusto provido em nuvem pelo **Supabase**.

A missão do sistema é automatizar a rotina operacional do lojista: gerenciar de maneira visual o tempo de garantia, gerar referências em tempo real, manter o histórico unificado chassi/placa e assegurar a máxima integridade e segurança de dados dos seus clientes e produtos instalados de forma simplificada.

---

## 2. Pilha de Tecnologias

### 2.1 Frontend Estrutural
- **HTML5 e CSS3:** Estrutura semântica fundamental com CSS customizado, usando variáveis padrão de projeto.
- **Javascript (Vanilla):** Toda a inteligência da aplicação, gerenciamento do roteador manual entre abas, validações de DOM, manipulação de UI interativa e comunicação assíncrona (SDK Supabase). 
- **TailwindCSS (via CDN):** Framework base adotado para construção ágil da visualização responsiva e elegante (Mobile-first, Flexbox, Cards).
- **Consumo de APIs (ViaCEP):** Busca dinâmica acoplada ao evento `onBlur` preenchendo automaticamente o endereço no formulário do cliente assim que ele fornece os 8 dígitos válidos, otimizando o workflow do funcionário.

### 2.2 Backend & Integração (Supabase / Postgres)
A infraestrutura foi implantada operando no modelo BaaS sob a região **sa-east-1** (São Paulo), contendo:
- **PostgreSQL 15+ central:** Motor que guarda os relacionamentos do app com `uuid` e Foreign Keys. O mapeamento SQL puro está reservado no documento anexo na raiz do repositório (`banco-de-dados-supabase.md`).
- **Autenticação (GoTrue):** Barreira mandatória JWT do sistema. O acesso ao painel só é permitido aos usuários que portarem credenciais autorizadas. Sem sessão ativa, o script local desliga as chaves de manipulação e mostra o "Auth Gate".
- **Supabase JS SDK v2:** Importado por pacote CDN no fechamento do body no HTML do app e mapeado via objeto global `window.supabase`, que constrói os metadados do BD atrelados ao projeto da *Vercel*.
- **Worker/Cron Job Diário (`pg_cron`):** Empregado em rotina automatizada (disparo 03:00 UTC diário). Ele invoca proceduralmente a function de "Limpeza" para olhar todos as películas cuja validade (`warranty_until`) está atrasada convertendo para o enum de status `'expired'`, salvando a tela do app de loops processadores enormes.
- **Cloud Triggers Internos (PL/pgSQL):** Proteção subjacente. Ao invés do Frontend ter que lidar com manipulação de relógios para controle de garantias ou versionamentos, *Triggers* atualizam a coluna `updated_at` a cada hit de form salvo.
- **Row Level Security (RLS):** Defesa magna em formato Policy SQL. A API desliga requisições (read/write) originárias por malha de rede de hackers protegendo ativamente, deixando somente o SDK (`Authenticated level claim access`) inserir e interagir após provar ser um logado legítimo.

---

## 3. Arquitetura Funcional / UX

A navegação inter-telas é programada por visões SPA (transição apagando views com a classe `active`). O app foi concebido usando 5 pilares funcionais essenciais (Features Técnicas integradas).

### Feature 1: Catálogo de Películas
* Exibição visual (`film_types`), mapeando todo portifólio das peças. 
* O form **"Novo Tipo"** injeta nome, categoria geral e, vitalmente, os *meses de garantia de fábrica*. 
* O campo textual de Nomenclatura no banco (`name`) traz consigo constraint de banco tipo `UNIQUE`. Caso o Frontend cadastre o mesmo modelo repetido do produto, a dupla integridade PostgreSQL grita um *Block* provando para a interface subir as popups nativas garantindo limpeza e nenhuma repetição indevida. 

### Feature 2: O CRM do Cliente
* Tela inicial acoplada a um "módulo de captação super rápida". Uma digitação no campo de Busca converte a View trazendo dados, ativando filtro `CPF`. A chave no painel trava duplicidade. A tela base acarreta os contatos gerais para facilitar as abordagens dos funcionários na vida real.
* **Ajuste Fino:** O botão de Edição mapeia colunas como endereços e telefones via `UPDATE` de SDK autêntico RLS sem problemas de permissão SQL. Para integridade máxima, a janela paralela do formulário trava inputs do número `CPF` forçando seu grau de leitura (*read only*) para evitar bugs relacionais da árvore de veículos atrelados.

### Feature 3: Histórico e Lifecycle do Veículo
* O Veículo pertence à hierarquia com cascade delete se o pai (cliente) vazar. 
* O painel histórico exorbita visualmente os ícones mudando entre Verde/Amarelo e Vermelho balizado matematicamente de acordo com as datas. 
* Na abertura para uma **Nova Instalação**, um evento salva dados em tabela genérica transacional, vinculando informações textuais para estocar o motivo da peça (e.g., *Sombreado no Vidro Traseiro*) ao tipo exato do SKU escolhido e em sua placa (`installations`).

### Feature 4: Recuperação Automática e Reset de Acesso (Login & Forgot)
* Em formato de *Forgot Password*, o roteamento da ferramenta provou sua segurança exigindo Configurações base alteradas nos blocos da "Vercel". O serviço dispara ao funcionário logado a redefinição de e-mail ancorado aos parâmetros `Redirects/Site URL`, puxando o SDK via URL limpa gerada (`{ ConfirmationURL }`) com base personalizada ao template corporativo da loja, permitindo fluida redigitação na tela.

### Feature 5: A Dashboard Inteligente Preditiva
* Com zero interações, a placa Home abre cruzando métricas operacionais que importam para a gerência. 
* A tabela referencial e viva da UI lista os clientes/serviços que demandam abordagem baseando-se explicitamente num View Postgres nativa (`warranties_expiring_soon`), que pré-mastiga quem vencerá na janela dos sub-30 dias aliviando 100% o load client-side. Em escopo, soma o total do acervo e os logotipos do negócio prontos.
