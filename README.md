# Escala Fácil

Aplicativo de gestão de escalas ministeriais construído com Expo (React Native), seguindo os princípios de Clean Architecture e padrão MVVM, totalmente integrado com o Supabase.

## 🚀 Tecnologias Utilizadas

- **React Native** & **Expo**
- **TypeScript**
- **React Navigation**
- **Supabase** (Autenticação, Banco de Dados Relacional e Tempo Real)
- **Linear Gradient** & **Vector Icons**

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

O projeto está totalmente integrado com uma instância em nuvem do **Supabase (PostgreSQL)** em tempo real. A configuração de conexão está localizada em `src/main/config/supabase.ts`.

As seguintes tabelas e estruturas são utilizadas para a persistência e relacionamento dos dados:

- **`profiles`**: Armazena os perfis dos usuários cadastrados na plataforma. É utilizada para autenticação, controle de permissões (`role`: `admin` ou `user`) e para listar membros reais cadastrados no seletor de escalas.
- **`escalas`**: Armazena os dados dos eventos criados, incluindo `id` (UUID), `grupo` (nome do ministério), `data` (timestamp com fuso-horário) e `publicada` (booleano que indica se o rascunho já está visível para a equipe).
- **`membros_escala`**: Tabela associativa que vincula membros a cada escala (`escala_id`). Contém o `id` do usuário vinculado, `nome`, `funcao` (instrumento ou papel desempenhado), `status` (*Pendente*, *Confirmado* ou *Ausente*) e a `justificativa` textual (preenchida caso o membro marque que não pode comparecer).
- **`grupos`**: Lista de ministérios e grupos cadastrados dinamicamente (ex: Som, Mídia, Vocal, Recepção).

---

## ⚙️ Funcionalidades Implementadas e Operantes

### 🔑 Autenticação e Perfis (Auth Feature)
- **Login Reativo:** Autenticação conectada diretamente com a base do Supabase Auth.
- **Divisão de Perfis:** Distinção entre usuários comuns (`user`) e administradores (`admin`), com redirecionamento de tela automático e controle de acesso a ações administrativas.

### 📅 Gestão de Escalas (Escalas Feature - Admin)
- **Criação e Edição:** Formulário completo para criar novas escalas ou editar as existentes no Supabase.
- **Seletor de Membros da Plataforma:** Substituição da inserção textual manual por um seletor suspenso (dropdown) moderno com busca em tempo real que puxa os usuários reais registrados na tabela `profiles`.
- **Chips de Funções Rápidas:** Tags interativas no formulário para definir funções comuns (Vocal, Violão, Bateria, Som, etc.) com apenas um toque.
- **Modo Rascunho / Publicada:** Controle para salvar escalas de forma privada (Rascunho) ou torná-las visíveis para a equipe escalada (Publicada).
- **Gerenciamento de Grupos:** Aba dedicada a adicionar ou remover ministérios/grupos (ex: Som, Mídia, Vocal) dinamicamente.

### 🙋 Confirmação de Presença (Presença Feature - Usuários)
- **Filtros Inteligentes:** Abas dedicadas a separar escalas em "Pendentes", "Confirmadas" e "Todas".
- **Respostas Rápidas:** Botões para o membro confirmar a presença ("Confirmar") ou recusar ("Não posso ir") diretamente no card da escala.
- **Justificativa de Ausência:** Modal para preencher o motivo da recusa, persistindo a justificativa no banco de dados e exibindo-a no card da escala correspondente para visualização imediata do Admin.

### 🎨 Visual e Interface Premium
- **Estética Moderna:** Paleta de cores moderna inspirada no Tailwind CSS (Indigo, Slate, Emerald, Amber, Red).
- **Cards de Status Reativos:** Cards com barra lateral colorida indicadora de presença (Verde = Confirmada, Vermelho = Ausente com justificativa exibida, Laranja = Pendente).
- **Layout Confortável:** Modais com fundos escuros translúcidos (`rgba(17, 24, 39, 0.65)`), cantos arredondados orgânicos (de 20px a 28px) e elevações/sombras de profundidade sutis.

---

## 🏗 Documentação Técnica da Arquitetura e Padrões de Projeto

O projeto utiliza uma arquitetura baseada na junção de **Clean Architecture** e **MVVM** (Model-View-ViewModel):
- **Repository Pattern:** Abstrai a persistência e busca de dados (localizado em `src/features/[feature]/data/repositories`), facilitando a transição de APIs e bancos.
- **Use Case Pattern:** Cada regra de negócio individual (ex: `ConfirmarPresencaUseCase`, `GetUsersUseCase`) encapsula uma ação singular.
- **Dependency Injection (Factories):** Configura a injeção manualmente na camada `src/main/factories` cumprindo a Inversão de Dependências do SOLID.

Para mais detalhes sobre as camadas e o fluxo de dados, consulte: [Arquitetura e Padrões Completos](./docs/arquitetura.md).

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
   - Pressione **`w`** no terminal para rodar a versão web do Expo no navegador.
   - Pressione **`a`** para abrir no emulador Android instalado.
   - Pressione **`i`** para abrir no simulador iOS.
   - Ou escaneie o código QR com o aplicativo **Expo Go** em seu celular (iOS/Android).

---

## 🧪 Como Testar os Fluxos da Aplicação

Utilize as seguintes credenciais configuradas na base de dados para validação:

| Perfil | E-mail de Teste | Senha de Teste |
| :--- | :--- | :--- |
| **Administrador** | `admin@escala.com` | `123456` |
| **Membro (Usuário)** | `user@escala.com` | `123456` |

### Roteiro de Teste Recomendado:

#### Passo 1: Criando uma Escala (Perfil Admin)
1. Faça login utilizando as credenciais de **Administrador**.
2. Clique no botão **Grupos** na barra superior para ver os ministérios cadastrados ou adicionar um novo (ex: "Banda").
3. Clique em **Nova Escala**:
   - Selecione um dos grupos clicando na tag.
   - Insira a data e hora desejadas (use o formato padrão sugerido: `DD/MM/AAAA HH:MM`).
   - Ative o seletor **Membro Cadastrado**.
   - Digite no campo de busca do seletor (ex: "Membro") para encontrar o usuário cadastrado correspondente a `user@escala.com` ("Membro Comum").
   - Selecione o membro, defina sua função (clicando no chip rápido "Violão" ou digitando no campo) e clique em **Inserir na Lista**.
   - Mantenha o switch **Publicada (Visível)** ativo.
   - Clique em **Salvar Escala**.

#### Passo 2: Respondendo à Presença (Perfil Membro/User)
1. Faça logout no botão **Sair** no canto superior direito.
2. Faça login com as credenciais de **Membro (Usuário)**.
3. A nova escala aparecerá na listagem sob a aba **Pendentes** e trará a opção de responder.
4. Teste as ações de presença:
   - **Caso Confirme:** Clique em **Confirmar**. A barra lateral do card ficará verde imediatamente e o status mudará para "Confirmado".
   - **Caso Recuse:** Clique em **Não posso ir**. Um modal de justificativa aparecerá. Insira um motivo (ex: "Compromisso familiar") e confirme. A barra lateral do card ficará vermelha e a justificativa será exibida abaixo do nome do membro.
