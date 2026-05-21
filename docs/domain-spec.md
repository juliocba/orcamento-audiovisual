# Domain Specification

## Contexto de Negócio

A aplicação permite estimar e gerenciar orçamentos de serviços audiovisuais com foco em custos de produção e margens de lucro.
O produto serve para pequenas equipes e profissionais que precisam orçar trabalhos de vídeo, fotografia, edição, drone, locução e ativos móveis.

## Glossário

- Orçamento / Budget: estimativa financeira de um serviço audiovisual.
- Cliente: nome do solicitante do serviço.
- Serviço: tipo de trabalho audiovisual executado.
- Usuário: pessoa autenticada via Firebase Google Auth.
- Visitante: usuário não autenticado que pode acessar a calculadora.
- Resumo Financeiro: conjunto de valores calculados automaticamente.
- Orçamento Pago: status de pagamento do orçamento.

## Domínios

### 1. Autenticação

#### Objetivo

Validar e manter sessão de usuário usando Firebase Authentication.

#### Responsabilidades

- inicializar Firebase Auth
- permitir login com Google
- manter estado do usuário
- permitir logout
- tratar erros de inicialização e autenticação

#### Entidades

- `user` (Firebase User)
- `authError`
- `loading`

#### Casos de Uso

- Login com Google
- Redirecionar usuário autenticado para `/calculator`
- Proteger `/dashboard`
- Logout do aplicativo

#### Regras de Negócio

- se `user` não existir, acesso a `/dashboard` é negado
- se `firebaseInitError` existir, exibir mensagem de erro e impedir operações de login
- visitante pode usar `/calculator` sem autenticação

#### Dependências

- Firebase Auth
- `onAuthStateChanged`
- `signInWithPopup`
- `GoogleAuthProvider`
- React Context API

#### Eventos

- `signInWithGoogle`
- `logout`
- `onAuthStateChanged`

#### Restrições

- autenticação depende das env vars do Firebase
- apenas Google Auth está implementado

### 2. Orçamento

#### Objetivo

Calcular valores financeiros de um orçamento audiovisual e permitir gerenciamento no Firestore.

#### Responsabilidades

- capturar dados do projeto
- calcular subtotal, custo operacional, lucro, desconto e valor final
- persistir orçamentos no Firestore
- permitir edição, exclusão e marcação de pagamento

#### Entidades

- `budget` / `orcamento`
- `summary`
- `cliente`
- `servico`
- `horasGravacao`
- `diarias`
- `cameras`
- `operadores`
- `videosFinais`
- `horasEdicao`
- `revisoes`
- `deslocamento`
- `desconto`
- `drone`
- `locucao`
- `design`
- `paid`
- `createdAt`
- `updatedAt`
- `userId`

#### Casos de Uso

- preencher formulário de orçamento
- calcular valores em tempo real
- salvar novo orçamento
- atualizar orçamento existente
- excluir orçamento
- alternar status `paid`
- carregar orçamentos do Firestore para o usuário

#### Regras de Negócio

- campos numéricos não podem ser negativos
- `subtotal` é soma de todos custos diretos e extras
- `custoOperacional = subtotal * 0.25`
- `lucro = subtotal * 0.2`
- `valorTotal = subtotal + custoOperacional + lucro`
- `valorFinal = max(0, valorTotal - desconto)`
- salvar orçamento requer `cliente` e `servico`
- orçamentos são filtrados por `userId` do Firebase

#### Dependências

- Firebase Firestore
- `collection`, `addDoc`, `updateDoc`, `deleteDoc`, `onSnapshot`, `query`, `where`, `serverTimestamp`
- `db` do Firebase
- `useEffect`, `useState`, `useMemo`

#### Eventos

- `handleSave`
- `handleEdit`
- `handleDelete`
- `handlePaidToggle`
- `onSnapshot` de orçamentos

#### Restrições

- coleção usada: `orcamentos`
- o documento Firestore usa `userId` e timestamps server-side
- não há validação de dados no backend Firestore além do que o cliente envia

### 3. Visão Financeira

#### Objetivo

Exibir métricas e tendências de faturamento a partir de orçamentos salvos.

#### Responsabilidades

- calcular receita total, lucro total e clientes ativos
- gerar dados para gráfico mensal
- exibir painel de métricas simples

#### Entidades

- `dashboardMetrics`
- `monthlyChartData`

#### Casos de Uso

- apresentar receita acumulada
- apresentar lucro acumulado
- apresentar contagem de clientes distintos
- exibir gráfico de tendência mensal

#### Regras de Negócio

- clients distintos são contados por nome de cliente nos orçamentos
- agregação mensal usa `createdAt` do Firestore
- se não houver dados, gráfico exibe zero

#### Dependências

- `recharts`
- dados de `budgets`

#### Restrições

- métricas são derivadas apenas dos orçamentos carregados no client
- não há agregação server-side ou banco de dados analítico

## Linha do Tempo das Entregas

### Entrega inicial (estado atual)

- implementação do fluxo de login Google
- calculadora de orçamento com entrada de dados e resumo financeiro
- persistência de orçamentos em Firestore
- edição, exclusão e marcação de pagamento
- dashboard protegido com gráfico exemplo
- suporte a modo visitante
- documentação de contexto criada em 2026-05-21

## Backlog Técnico Detectado

- `src/services/firestore.js` não é utilizado pelo fluxo principal de `Calculator.jsx`
- falta documentação de variáveis de ambiente e `.env.example`
- botão `Gerar PDF` sem implementação funcional
- `react-query` configurado, mas não usado em consultas existentes
- falta testes unitários e e2e
- não há CI/CD ou pipeline no repositório
- `calculadora_servicos_audiovisuais_react_app.jsx` existe como artefato não referenciado
- não há validação de formulário além de campos obrigatórios básicos

