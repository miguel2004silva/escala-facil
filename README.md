# Escala Fácil - Documento Técnico e Manual do Sistema

Aplicativo de gestão de escalas ministeriais construído com Expo (React Native), seguindo os princípios de Clean Architecture e padrão MVVM, com persistência e comunicação em tempo real integradas ao Supabase.

---

## 🚀 Tecnologias Utilizadas

- **React Native** & **Expo** (Core do App)
- **TypeScript** (Tipagem Estática)
- **React Navigation** (Navegação Nativa)
- **Supabase** (Autenticação, Banco de Dados Relacional e Tempo Real)
- **Expo Notifications** (Serviço de Notificações Locais)
- **Jest** & **ts-jest** (Testes Automatizados de Regras de Negócio)

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

O projeto está integrado a uma base de dados relacional **PostgreSQL** no Supabase. O arquivo de configuração de conexão encontra-se em [supabase.ts](file:///c:/Users/migue/Downloads/escala-facil/src/main/config/supabase.ts).

### Tabelas do Sistema:

1. **`profiles`**: Perfis públicos dos usuários criados no Supabase Auth.
   - Colunas: `id` (UUID, PK), `email` (Text), `nome` (Text), `role` (`'admin'` | `'user'`), `created_at` (Timestamp).
2. **`escalas`**: Escalas de serviço dos ministérios.
   - Colunas: `id` (UUID, PK), `grupo` (Text), `data` (Timestamp com fuso-horário), `publicada` (Boolean).
3. **`membros_escala`**: Relacionamento N:N entre perfis e escalas.
   - Colunas: `id` (UUID, PK, referência para `profiles.id`), `escala_id` (UUID, FK, referência para `escalas.id`), `nome` (Text), `funcao` (Text), `status` (`'Pendente'` | `'Confirmado'` | `'Ausente'`), `justificativa` (Text, Nullable).
4. **`grupos`**: Lista de grupos/ministérios cadastrados.
   - Colunas: `name` (Text, PK).
5. **`cores_roupa`** [NOVO]: Definição de cores de vestimenta por grupo/culto.
   - Colunas: `id` (UUID, PK), `grupo` (Text), `data` (Timestamp com fuso-horário), `cor` (Text), `observacao` (Text, Nullable).

> [!IMPORTANT]
> **Script de Migração SQL:** Para criar a nova tabela e configurar o controle de segurança RLS (Row Level Security), execute o script SQL contido no arquivo [migration.sql](file:///c:/Users/migue/Downloads/escala-facil/migration.sql) diretamente no SQL Editor do painel do Supabase.

---

## ⚙️ Funcionalidades e Arquitetura de Negócio

### 1. Sistema de Notificações em Tempo Real (Realtime Push)
Quando um administrador adiciona um membro a uma escala publicada, ou altera uma escala existente de "Rascunho" para "Publicada", o membro escalado recebe uma notificação na barra de tarefas do celular instantaneamente.
- **Implementação Técnica**: Hook [useNotificationListener.ts](file:///c:/Users/migue/Downloads/escala-facil/src/core/hooks/useNotificationListener.ts) assinado via cliente Realtime Supabase nos canais `membros_escala` (INSERT) e `escalas` (UPDATE). Ao interceptar as mudanças no banco onde o ID do membro coincide com o usuário logado no aparelho, o app solicita permissão no sistema operacional e dispara a notificação local via `expo-notifications`.

### 2. Cadastro de Novos Usuários por Administradores (sem Rate Limits)
O administrador pode registrar novos membros no aplicativo (Nome, E-mail, Senha e Role/Perfil) a partir da aba "Membros".
- **Implementação Técnica**: Para contornar os limites de requisições de e-mail e cadastro padrão da API de autenticação do Supabase (evitando o erro `email rate limit exceeded`), implementamos uma função SQL no banco de dados (`public.criar_usuario_admin`) configurada com `SECURITY DEFINER` e protegida com validação de administrador. O [AuthRepository.ts](file:///c:/Users/migue/Downloads/escala-facil/src/features/auth/data/repositories/AuthRepository.ts) invoca esta função via `RPC` (`supabase.rpc`), inserindo as credenciais criptografadas em `auth.users`, a identidade correspondente em `auth.identities` e o registro de perfil em `profiles` de forma segura e transacional, com o e-mail marcado como confirmado instantaneamente.

### 3. Aba de Cores das Vestimentas ("Cores")
Evita desorganização no dia do culto, permitindo que a coordenação defina a cor da roupa que o grupo deve usar.
- **Implementação Técnica**: Aba integrada no aplicativo carregando dados de `cores_roupa`. Membros comuns visualizam as cores em formato de cartões visuais (com círculos coloridos dinâmicos mapeados a partir dos nomes das cores em português). O administrador tem acesso a um formulário (modal) para criar, editar ou excluir as cores das roupas do culto.

---

## 🔒 Regras de Negócio e Requisitos Técnicos

### 1. Tratamento de Exceções
Todos os repositórios e casos de uso encapsulam as operações de rede e persistência. Qualquer erro na conexão com o Supabase ou erro inesperado é capturado via blocos `try/catch` e propagado como um `AppError` controlado (evitando crashes inesperados do aplicativo). Na camada de visualização, a UI renderiza uma tela de *fallback* amigável ou exibe alertas claros para o usuário.

### 2. Validação de Dados
Todas as entradas de dados são rigorosamente validadas no domínio (Use Cases) e na UI antes de serem enviadas ao servidor:
- **Cadastro de Usuário**: Valida formato de e-mail por expressão regular, obrigatoriedade do nome e tamanho mínimo de senha de 6 caracteres.
- **Vestimenta**: Valida se o grupo foi selecionado, se o campo de cor não está em branco e se o formato inserido de data/hora é válido.
- **Escalas**: Impede criação de escalas sem membros ou data vazia.

### 3. Controle Mínimo de Acesso
A segurança e o controle de papéis são mantidos tanto no aplicativo (bloqueio de visualização de botões administrativos) quanto nas regras dos Use Cases de domínio. A tentativa de invocar métodos de inserção, edição ou exclusão de escalas/cores/usuários sem o perfil `admin` lança uma exceção de acesso negado (Erro 403), além de políticas de Row Level Security (RLS) configuradas nas tabelas do Supabase.

---

## 🧪 Testes Automatizados (Jest)

Implementamos testes automatizados de unidade utilizando o framework **Jest** e **ts-jest** para garantir que as regras de negócio de domínio (validações, acesso e fluxos de dados) permaneçam íntegras.

### Testes Implementados:
1. **`RegisterUserUseCase.test.ts`** ([Código](file:///c:/Users/migue/Downloads/escala-facil/src/__tests__/RegisterUserUseCase.test.ts)):
   - Garante que apenas administradores consigam registrar usuários (lança erro 403 para não-admins).
   - Valida obrigatoriedade de campos, formato de e-mail e restrição de comprimento de senha (erro 400).
   - Valida que o Use Case repassa os dados corretos para o repositório.
2. **`SaveCorUseCase.test.ts`** ([Código](file:///c:/Users/migue/Downloads/escala-facil/src/__tests__/SaveCorUseCase.test.ts)):
   - Garante a restrição de perfil admin para criação de vestimentas.
   - Valida a obrigatoriedade dos campos de grupo, cor e data.
   - Verifica se a data fornecida é válida no formato ISO.

### Como Executar os Testes:
Para rodar a suíte completa de testes automatizados, execute o comando abaixo no terminal da pasta raiz:
```bash
npm test
```

---

## ⚙️ Como Executar o Projeto Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento do Expo:**
   ```bash
   npm start
   ```

3. **Abra o aplicativo:**
   - Pressione **`w`** no terminal para abrir no navegador (Web).
   - Pressione **`a`** para abrir no emulador Android.
   - Pressione **`i`** para abrir no simulador iOS.
   - Ou escaneie o QR Code com o aplicativo **Expo Go** em seu celular.

---

## 🙋 Credenciais de Teste

| Perfil | E-mail de Teste | Senha de Teste |
| :--- | :--- | :--- |
| **Administrador** | `admin@escala.com` | `123456` |
| **Membro (Usuário)** | `user@escala.com` | `123456` |
