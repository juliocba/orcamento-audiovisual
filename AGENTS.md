# AGENTS.md

## Visão Geral

Aplicação web de cálculo de orçamentos para serviços audiovisuais.
O sistema é uma plataforma SaaS leve para estimar custos, simular lucro e salvar orçamentos em Firebase Firestore.

## Objetivo do produto

Fornecer uma interface centralizada para:
- preencher dados de serviços audiovisuais
- gerar resumos financeiros em tempo real
- salvar orçamentos por usuário autenticado
- exibir métricas de faturamento simples

## Problema que resolve

Ajuda criadores e equipes de produção a estimar orçamentos de projetos audiovisuais com base em horas, equipamentos, revisões, deslocamento e extras.

## Público alvo

Produtores, freelancers e pequenas agências de audiovisual que precisam orçar projetos de vídeo, fotografia, edição, drone e transmissões.

## Arquitetura

### Stack

- React 18
- Vite
- Tailwind CSS
- Firebase (Authentication, Firestore, Storage)
- React Router Dom
- React Query
- Recharts
- Zod (dependência presente, ainda não usada explicitamente)
- Framer Motion e Lucide React (dependências presentes, sem uso direto nos arquivos inspecionados)

### Padrões arquiteturais

- SPA com roteamento cliente usando React Router
- Estado de autenticação via Context API
- Persistência em Firebase Firestore
- Componentização baseada em páginas e hooks simples

### Organização das pastas

- `src/App.jsx` - configuração de rotas e provider de autenticação
- `src/main.jsx` - bootstrap da aplicação, BrowserRouter e QueryClientProvider
- `src/contexts/AuthContext.jsx` - autenticação Firebase
- `src/firebase/firebase.js` - inicialização Firebase e exportação de auth, db, storage
- `src/pages/Login.jsx` - página de login e modo visitante
- `src/pages/Calculator.jsx` - cálculo, resumo financeiro e CRUD de orçamentos
- `src/pages/Dashboard.jsx` - dashboard protegido com gráficos de exemplo
- `src/routes/ProtectedRoute.jsx` - proteção de rota baseada em usuário autenticado
- `src/services/firestore.js` - abstração Firestore parcialmente existente
- `src/styles/index.css` - estilos globais Tailwind
- `index.html` - ponto de entrada estático
- `calculadora_servicos_audiovisuais_react_app.jsx` - componente adicional/legacy não usado pela aplicação atual

### Decisões técnicas

- uso de `BrowserRouter` para rotas no cliente
- firebase inicializado apenas quando todas as variáveis de ambiente estão presentes
- proteção de rota apenas para `/dashboard`
- cálculo de orçamento feito no cliente via `useEffect` em `Calculator.jsx`
- orçamentos salvos em coleção `orcamentos` do Firestore
- leitura em tempo real de orçamentos com `onSnapshot`

## Regras do Projeto

- Não editar ou expor segredos no repositório.
- `node_modules`, `/dist`, `.env` está ignorado.
- Aplicação deve funcionar em desenvolvimento com `npm run dev`.
- Usar apenas as variáveis de ambiente necessárias definidas em `src/firebase/firebase.js`.
- Preservar o padrão existente de rotas e componentes.

## Convenções

- Componentes React em PascalCase
- arquivos `.jsx` para componentes/páginas
- CSS utilitário do Tailwind diretamente em classes
- usar `async/await` para chamadas Firebase
- tratar `loading` e erros de inicialização do Firebase em `AuthContext`

## Padrões de nomenclatura

- `Page` não é usado em nomes de arquivos, mas componentes de página são `LoginPage`, `CalculatorPage`, `DashboardPage`
- Contexto: `AuthContext`, hook `useAuth`
- Rotas: `ProtectedRoute`
- Serviços Firestore: `createBudget`, `updateBudget`, `deleteBudget`, `getBudgetsByUser`

## Limitações conhecidas

- não há testes automatizados no repositório
- não há pipeline CI/CD configurado
- `src/services/firestore.js` não é usado pelo `Calculator.jsx`
- `calculadora_servicos_audiovisuais_react_app.jsx` não está integrado no fluxo da aplicação
- geração de PDF em tela não implementada; botão presente sem ação
- `react-query` está configurado, mas não é usado em componentes atuais
- `framer-motion` e `lucide-react` não são usados nos arquivos inspecionados

## Contextos Importantes

### Funcionalidades existentes

- login Google com Firebase Auth
- acesso opcional como visitante
- calcular orçamento com valores de serviços, horas, diárias, câmeras, operadores, edição, revisões, deslocamento e extras
- resumo financeiro em tempo real: subtotal, custo operacional, lucro, desconto e valor final
- salvar, editar, excluir orçamentos no Firestore
- marcar orçamentos como pagos
- dashboard protegido com gráficos de exemplo

### Integrações

- Firebase Authentication (Google)
- Firebase Firestore
- Firebase Storage inicializado, mas não usado explicitamente

### Dependências críticas

- `firebase`
- `react-router-dom`
- `tailwindcss`
- `vite`
- `recharts`

## Fluxos principais

- usuário navega para `/login`
- autenticação opcional via Google
- usuário acessa `/calculator`
- criação e persistência de orçamentos
- acesso protegido a `/dashboard`

## Fluxos Funcionais

### Autenticação

- `AuthProvider` observa `onAuthStateChanged`
- `signInWithGoogle` inicia popup Google
- `logout` faz sign out
- `ProtectedRoute` redireciona para `/login` se não houver usuário

### Entidades

- `user` (Firebase Auth)
- `budget` / `orcamento`
- `summary` de valores financeiros

### Navegação

- `/` e `/login` -> LoginPage
- `/calculator` -> CalculatorPage
- `/dashboard` -> DashboardPage (protegido)
- `*` -> redireciona para `/`

### Persistência

- orçamentos armazenados na coleção `orcamentos`
- cada documento contém `userId`, `createdAt`, `updatedAt`, `paid`, `summary`
- leitura em tempo real via `onSnapshot`

### Geração de documentos

- interface apresenta botão `Gerar PDF`, mas não há implementação funcional

### Eventos

- salvar orçamento
- editar orçamento
- excluir orçamento
- marcar orçamento como pago
- login/logout

## Decisões Arquiteturais

### Decisão: React + Firebase para MVP rápido
- Motivo: reduzir backend e acelerar desenvolvimento
- Impacto: produto depende do Firebase e do conjunto de env vars

### Decisão: rotas públicas para calculadora e login, dashboard protegido
- Motivo: permitir uso rápido sem login, mas guardar métricas em área privada
- Impacto: experiência de visitante e usuário autenticado coexistem

### Como Trabalhar Neste Projeto

- evitar regressões ao modificar lógica de cálculo e persistência
- preservar estrutura de páginas e rotas existentes
- escrever documentação para novos fluxos implementados
- validar funcionalidades no navegador com Firebase configurado
- atualizar `AGENTS.md` sempre que houver mudanças relevantes

# Eficiência de Contexto

Objetivo:
Definir regras permanentes para reduzir consumo de contexto/tokens durante futuras sessões de desenvolvimento.

Essa seção faz parte do comportamento padrão do agente neste projeto e tem prioridade operacional antes de:

- analisar código
- implementar features
- atualizar documentação
- explorar o repositório

## Não reanalisar o projeto inteiro, apenas quando solicitado

Antes de qualquer implementação:

Ordem obrigatória de leitura:

1. AGENTS.md
2. docs/domain-spec.md
3. README.md
4. Apenas arquivos relacionados à tarefa atual

Evitar:

- escanear o repositório completo
- abrir arquivos desnecessários
- reconstruir conhecimento já documentado

---

## Leitura incremental

Ao modificar funcionalidades:

Ler somente:

- arquivos diretamente impactados
- dependências imediatas
- contratos utilizados

Evitar exploração ampla sem necessidade.

---

## Documentação como memória persistente

Tratar:

- AGENTS.md como memória operacional
- domain-spec.md como memória funcional
- README.md como histórico de produto

Se a informação já estiver documentada: não reler o código sem necessidade.

---

## Atualizações parciais

Ao atualizar documentação:

Preferir:

- editar seções específicas
- adicionar blocos incrementais

Evitar:

- reescrever documentos completos
- reorganizar arquivos sem necessidade
- duplicar contexto

---

## Planejamento antes da implementação

Antes de alterar código:

Definir internamente:

- objetivo
- arquivos impactados
- estratégia

Evitar exploração excessiva antes de executar.

---

## Reutilização obrigatória

Antes de criar:

- componentes
- hooks
- services
- contexts
- schemas
- utilitários

Verificar se já existe implementação reutilizável.

---

## Política de atualização de documentação

Atualizar:

### AGENTS.md

Somente para:

- decisões arquiteturais
- padrões
- comportamento operacional
- regras técnicas

### docs/domain-spec.md

Somente para:

- mudanças funcionais
- regras de negócio
- novos fluxos
- novas entidades

### README.md

Somente para entregas de médio ou alto valor.

Não atualizar README para:

- ajustes pequenos
- refactors simples
- pequenas correções

---

## Controle de exploração

Se mais de 15 arquivos forem necessários para entender uma tarefa:

Parar e:

1. resumir entendimento atual
2. identificar dependências principais
3. propor plano de implementação
4. continuar apenas após consolidar contexto

---

## Consolidação de memória

Ao atualizar AGENTS.md:

- consolidar informações repetidas
- resumir histórico antigo
- manter decisões importantes
- evitar crescimento descontrolado

Objetivo:
manter AGENTS.md compacto e altamente útil.

---

## Regra final

Documentação válida deve substituir releitura desnecessária do código.

O agente deve priorizar:

1. contexto persistente
2. leitura direcionada
3. implementação incremental
4. economia de contexto
5. consistência arquitetural

## Histórico de Evolução

- Entrega inicial do produto: SPA React + Firebase com login Google, cálculo de orçamentos e CRUD de orçamentos.
- Documento gerado em 2026-05-21 com base no estado atual do repositório.
