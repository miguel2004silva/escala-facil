# Escala Fácil

Aplicativo de gestão de escalas ministeriais construído com Expo (React Native), seguindo os princípios de Clean Architecture e padrão MVVM.

## 🚀 Tecnologias Utilizadas

- **React Native** & **Expo**
- **TypeScript**
- **React Navigation**
- **Async Storage**

## 🏗 Documentação Técnica da Arquitetura e Padrões de Projeto

O projeto utiliza uma arquitetura baseada na junção de **Clean Architecture** e **MVVM** (Model-View-ViewModel), com o objetivo principal de isolar completamente as regras de negócio da camada de apresentação e da infraestrutura.

Os principais padrões de projeto utilizados incluem:
- **Clean Architecture & MVVM:** Divisão de responsabilidades entre Apresentação, Domínio e Dados.
- **Repository Pattern:** Abstrai a persistência e busca de dados, permitindo a fácil troca de fontes de dados.
- **Use Case Pattern:** Encapsula regras de negócio individuais, garantindo o Princípio da Responsabilidade Única (SOLID).
- **Dependency Injection (Factories):** Cumpre o Princípio da Inversão de Dependência, configurando a injeção manualmente na camada principal.

### 🔄 Evolução Arquitetural e Integração de Dados

Graças à aplicação rigorosa do **Repository Pattern**, a arquitetura está totalmente preparada para evolução e integração com APIs externas (ex: APIs REST, Firebase, etc). Como os Casos de Uso dependem apenas de contratos (Interfaces) e não de implementações concretas, a transição do armazenamento atual (dados em memória e offline-first via AsyncStorage) para consumo em serviços remotos na nuvem acontece **sem a necessidade de alterar uma única linha de código nas camadas de UI ou de Domínio**.

### 🛡️ Resiliência e Tratamento de Erros

A resiliência é um dos focos centrais da aplicação:
- **Tratamento Global de Erros:** Exceções controladas através da classe padronizada `AppError`.
- **Prevenção de Crashes na UI:** Os `ViewModels` envelopam e gerenciam as comunicações com o domínio através de blocos `try/catch`. 
- **Recuperação e Fallbacks:** Em caso de falha na integração ou perda de rede, a interface do usuário exibe um estado de erro reativo e fornece mecanismos de recuperação (ex: botões de "Tentar Novamente"), mantendo a estabilidade geral da aplicação.

Para a documentação mais aprofundada sobre as camadas e o fluxo de dados, consulte o documento anexo: [Arquitetura e Padrões Completos](./docs/arquitetura.md).

## 📂 Estrutura de Pastas

A estrutura de diretórios foi organizada de forma "Feature-First":

```text
src/
  core/           # Configurações globais e utilidades transversais
  theme/          # Design System (Cores, Fontes, Espaçamentos)
  features/       # Funcionalidades da aplicação (auth, escala, etc.)
    [feature]/
      domain/     # Entidades e UseCases
      data/       # Implementação dos Repositórios
      presentation/# ViewModels
      ui/         # Telas e Componentes
  main/           # Entry point lógico e injeção de dependências
```

## ⚙️ Como Executar o Projeto

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento do Expo:
   ```bash
   npm start
   ```

3. Abra o aplicativo:
   - Pressione `a` para abrir no emulador Android
   - Pressione `i` para abrir no simulador iOS
   - Ou escaneie o código QR com o aplicativo Expo Go no seu dispositivo físico.
