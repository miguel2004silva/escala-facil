# Arquitetura e Padrões - Escala Fácil

## 1. Visão Geral da Arquitetura

O **Escala Fácil** utiliza uma arquitetura baseada na junção de **Clean Architecture** e **MVVM** (Model-View-ViewModel). O objetivo principal é isolar completamente as regras de negócio da camada de apresentação e da infraestrutura (APIs, banco de dados, sensores do aparelho), promovendo alta coesão e baixo acoplamento.

- **Clean Architecture**: Foca em camadas concêntricas onde a regra de negócio (Domain) reside no centro e não depende de nenhuma outra camada externa. As dependências sempre apontam para o centro.
- **MVVM**: O padrão MVVM foi escolhido como o design pattern de Presentation para facilitar a ligação reativa entre os estados e a Interface de Usuário no React Native, separando a lógica de apresentação da UI.

## 2. Descrição das Camadas

A aplicação está dividida nas seguintes camadas lógicas:

### 2.1. Domain (Regras de Negócio Puras)
A camada central. Não sabe nada sobre React, UI ou Banco de Dados.
- **Entities**: Objetos puros contendo as regras de negócio fundamentais da aplicação (ex: `User`, `Escala`).
- **Use Cases**: Contêm as lógicas de negócio específicas da aplicação, coordenando o fluxo de informações entre as entidades e repositórios.
- **Interfaces de Repositório**: Contratos que definem como os dados devem ser salvos/recuperados, que devem ser implementados pela camada de Data.

### 2.2. Data / Infra (Infraestrutura)
Camada responsável por lidar com o mundo exterior.
- **Repositories**: Implementação das interfaces de repositório definidas no Domain. Responsável por decidir de onde buscar a informação (API, AsyncStorage, SQLite).
- **API Clients / Services**: Serviços de terceiros e clientes HTTP para consumo de APIs externas.

### 2.3. Presentation (Lógica de Apresentação)
O intermédio entre as regras de negócio e a UI.
- **ViewModels**: Gerenciam o estado que será refletido na UI e expõem funções para responder a ações do usuário. Elas utilizam os Use Cases para executar ações complexas. No React, isso é usualmente implementado utilizando _Custom Hooks_.

### 2.4. UI (Interface de Usuário)
A camada mais externa da aplicação.
- **Screens e Components**: Puramente visuais (ex: `<Text>`, `<View>`, `<FlatList>`). Reagem às mudanças de estado dos ViewModels e delegam interações (ex: cliques de botões) de volta para o ViewModel.

## 3. Estrutura de Pastas

A estrutura de diretórios do projeto foi organizada de forma "Feature-First". Em vez de separar tudo por tipo de arquivo (tudo de UI em uma pasta, tudo de Domain em outra), separamos primeiramente pelas **Features** da aplicação, o que facilita escalar a equipe e manter o escopo coeso.

```
src/
  core/           # Configurações globais, utilidades transversais, tratamento de erros globais
  theme/          # Design System (Cores, Fontes, Espaçamentos)
  constants/      # Constantes do app
  features/
    auth/         # Feature de Autenticação
      domain/     # Entidades e UseCases do Auth
      data/       # Implementação dos Repositórios do Auth
      presentation/# ViewModels do Auth
      ui/         # Telas e Componentes exclusivos do Auth
    escala/       # Feature de Listagem de Escalas
      ...
    presenca/     # Feature de Confirmação de Presença
      ...
  main/           # Entry point lógico. Fábricas de Injeção de Dependência, Roteamento/Navegação
```

## 4. Fluxo de Dados

A comunicação segue um **Fluxo Unidirecional de Dados**:

1. A **UI** detecta uma ação do usuário (ex: Botão "Confirmar Presença").
2. A **UI** notifica o **ViewModel** chamando um método (ex: `confirmar()`).
3. O **ViewModel** processa as lógicas simples de apresentação (ex: estado de "loading") e aciona o **Use Case** correspondente no Domain.
4. O **Use Case** executa a regra de negócio (se aplicável) e usa o contrato do **Repository** (Domain).
5. O **Repository** (implementado na camada de Data) acessa a fonte de dados (ex: chamada de API ou SQLite) e retorna o resultado.
6. A resposta sobe a cadeia: Repository -> Use Case -> ViewModel.
7. O **ViewModel** atualiza seus estados reativos com o sucesso ou erro da operação.
8. A **UI** é automaticamente re-renderizada pelo React, refletindo os novos estados atualizados pelo ViewModel.

## 5. Integração de Dados e Evolução Arquitetural

Graças ao uso do **Repository Pattern**, a aplicação atende perfeitamente ao requisito de **Integração de Dados**. Atualmente os dados são simulados em memória e persistidos via `AsyncStorage` para funcionamento offline-first da prova de conceito, porém a integração com uma API RESTful externa pode ser feita criando uma nova classe `ApiEscalaRepository implements IEscalaRepository`. Como os Casos de Uso dependem de contratos (`Interfaces`) e não de implementações concretas, a transição para buscar dados do Firebase, PostgreSQL ou qualquer serviço em Nuvem acontecerá **sem alterar uma única linha de código** das camadas de Domain ou UI.

## 6. Resiliência e Tratamento de Erros

A resiliência é um pilar desta arquitetura. Implementamos as seguintes abordagens:
- **Tratamento Global de Erros**: Criação da classe `AppError` na camada `Core` para padronizar o lançamento de exceções controladas.
- **Tolerância a Falhas na UI**: Os `ViewModels` envelopam a comunicação com o domínio em blocos `try/catch`. Caso os dados não possam ser integrados ou a API venha a falhar, a UI é notificada reativamente (`error state`) e exibe uma interface de _fallback_ (ex: botões de "Tentar Novamente" implementados na listagem de escalas) garantindo que o app não sofra "crashes" inesperados.

## 7. Justificativa Técnica

- **Manutenibilidade**: Mudanças em uma biblioteca de terceiros afetam apenas a camada de `Data/Infra`. O resto do app não precisa ser alterado, reduzindo "breaking changes" não previstos.
- **Escalabilidade**: Adicionar novas features é apenas uma questão de criar um novo módulo sob `/features/nova-feature`. A separação por feature impede que arquivos monolíticos se formem.
- **Testabilidade**: Os Use Cases e as Entities são apenas funções e classes puros de TypeScript/JavaScript, o que significa que podem ser testados unitariamente de maneira extremamente rápida sem precisar de um ambiente Node simulado ou do framework React Native.

## 8. Padrões de Projeto Utilizados

- **Clean Architecture e MVVM**: Principais direcionadores da divisão.
- **Repository Pattern**: Abstrai a forma como os dados da aplicação são recuperados e armazenados.
- **Use Case Pattern**: Encapsula regras de negócio individuais, garantindo a responsabilidade única (Single Responsibility Principle do SOLID).
- **Dependency Injection Pattern / Factories**: Na pasta `main/factories`, configuramos as injeções manuais. O repositório é passado de fora para dentro, cumprindo o Dependency Inversion Principle (DIP).
- **Separation of Concerns (SoC)**: Divisão clara entre o que é a interface, a lógica que gerencia essa interface e as regras de negócio centrais.
