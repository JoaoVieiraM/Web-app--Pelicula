# Integração do Banco de Dados Supabase — PeliculaApp

Este documento detalha como o banco de dados do **PeliculaApp** está estruturado e quais foram as etapas exatas executadas para provisionar e integrar o projeto backend do Supabase com o frontend (`mockup.html`).

---

## 1. Como o Banco de Dados é (Estrutura)

O banco de dados foi desenvolvido para gerir clientes, veículos e histórico de instalação de películas de proteção. A modelagem abrange as seguintes entidades principais no PostgreSQL:

- **`clients`**: Contém as informações pessoais e de contato (CPF, nome completo, email, telefone, endereço). A chave primária é gerada dinamicamente via `uuid_generate_v4()`.
- **`vehicles`**: Relacionada *1:N* com os clientes, possuindo informações sobre Marca, Modelo, Ano, Cor e Placa. O relacionamento utiliza deleção em cascata (`ON DELETE CASCADE`), o que significa que deletar um cliente automaticamente limpa do banco todos os seus carros e histórico.
- **`film_types`**: O catálogo com os produtos disponíveis. Traz características estáticas do material (marca, categoria, meses de garantia padrão, entre outras regras).
- **`installations`**: Tabela transacional interligando Veículos e Tipos de Película. Detém o ciclo de vida e a saúde da instalação. Possui um Enum listando status (`active`, `expired`, `removed`) e pode listar quais peças de vidro específico foram cobertas na forma de arrays de itens.

**Recursos Avançados e Regras de Segurança Envolvidas:**
- **Automações em Nuvem (Triggers):** Injeções de segurança que asseguram que toda alteração atualize de forma obrigatória a coluna de `updated_at`. Existe também um gatilho de inteligência do lado do server: ao enviar que a película X foi instalada hoje, o trigger automaticamente calcula o delta da garantia e insere seu dia exato de fim de durabilidade (`warranty_until`).
- **Rotinas Diárias (`pg_cron`):** Foi programado um *Cron job* autônomo que visita o banco de dados todo dia às 03:00 e desativa as garantias cujo prazo oficial de durabilidade tenha sido esgotado trocando para `'expired'`, poupando carga de CPU do frontend.
- **Isolamento de Segurança Subjacente (RLS):** Toda a camada final de tráfego teve as defesas e bloqueios `Row Level Security` blindados e atrelados por *Role Claims*, garantindo que apenas usuários portadores de tokens JWT assinados da classe oficial do painel de `autenticação` consigam aprovar leitura, deleção e escrita (proteção contra acesso anônimo usando senhas expostas).

---

## 2. Como as Operações e Conexões Foram Feitas (Workflow)

Toda a infraestrutura foi processada e provisionada diretamente aplicando comandos do *Model Context Protocol* (MCP) seguindo estas etapas:

1. **Levantamento e Planejamento Custos**: Após auditar a solidez dos scripts no arquivo anterior fornecido (`banco-de-dados-supabase.md`), foi checado o mapa de organizações (`VM`) da sua conta autenticada do Supabase via leitura de SDK e extraído um orçamento que previu que a configuração poderia prosseguir no projeto Gratuito (`Free Plan`).
2. **Instanciamento do Servidor**: Por dentro da inteligência conversacional criamos sua base com o projeto sob a flag nomeada de `PeliculaApp` localizado na mesma região do Brasil (`sa-east-1` São Paulo).
3. **Carga e Setup das Migrações (DDL)**: Todo o conjunto robusto do roteiro SQL foi empacotado para o server da seguinte forma:
   - Uma migração unificada e limpa que subiu de uma só vez as Extensões de UIID, Funções, Índices Otimizados (como FTS de full_text_search para a procura de nomes), e regras de Cron com suas injeções mockadas.
   - Um Job extra avulso via query remota final para validar e acordar a instância agendada do Supabase no trigger às três da manhã.
4. **Acoplagem da Aplicação Frontend**: Pegamos a `API_URL` primária devolvida do backend e a sua recém validada `Publishable API KEY / Anon Key`. Para finalizar o fluxo, a interface original local (`mockup.html`) recebeu as tags de importação:
   - Foi utilizado nosso sistema interno de file_editor para fixar antes do fechamento `</body>` o script para instanciar via CDN toda a malha de componentes em Javascript assíncrono padrão do pacote oficial (`@supabase/supabase-js@2`).
   - Com as variáveis ancoradas, um comando autônomo executa um `createClient`, vincula as engrenagens a área aberta do `window.supabase` com validação logada de console, liberando que todo formulário a partir de agora possa receber botões para despachar funções POST do SDK com acesso ativo, livre de corrupções.
