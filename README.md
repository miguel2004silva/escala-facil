# Escala Fácil

Aplicativo de gestão de escalas ministeriais construído com Expo (React Native), seguindo os princípios de Clean Architecture e padrão MVVM.

## 🚀 Tecnologias Utilizadas

- **React Native** & **Expo**
- **TypeScript**
- **React Navigation**
- **Async Storage**

## 🏗 Arquitetura

O projeto utiliza uma arquitetura baseada na junção de **Clean Architecture** e **MVVM** (Model-View-ViewModel), com o objetivo principal de isolar completamente as regras de negócio da camada de apresentação e da infraestrutura.

Para uma documentação detalhada sobre as camadas, fluxo de dados e decisões arquiteturais, consulte o documento completo: [Arquitetura e Padrões](./docs/arquitetura.md).

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
