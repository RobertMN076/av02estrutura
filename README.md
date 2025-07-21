# Visualizador de Árvore de Dependências de Projeto

Este é um projeto simples de front-end que permite ao usuário criar e visualizar uma árvore de dependências entre tarefas. A aplicação também calcula a ordem correta de execução dessas tarefas, garantindo que uma tarefa só seja executada após todas as suas dependências terem sido concluídas.

## Funcionalidades

- **Adicionar Tarefas:** Crie novas tarefas fornecendo um nome.
- **Definir Dependências:** Ao criar uma tarefa, você pode opcionalmente selecionar uma tarefa existente como sua dependência (pai). Se nenhuma dependência for selecionada, a tarefa se torna uma "raiz".
- **Visualização Dinâmica:** A árvore de dependências é desenhada e atualizada em tempo real na tela. Os nós (tarefas) e os conectores (dependências) são reposicionados automaticamente para uma melhor visualização.
- **Calcular Ordem de Execução:** Com um clique de botão, a aplicação calcula a ordem de execução correta das tarefas. Isso é feito através de um percurso em pós-ordem (post-order traversal) na árvore, que é um método clássico para ordenação topológica.
- **Design Responsivo (Básico):** A visualização da árvore se ajusta ao redimensionar a janela do navegador.

## Utilidade

Esta ferramenta é útil para o gerenciamento de projetos simples, onde é crucial entender a sequência em que as tarefas devem ser realizadas. Exemplos de uso incluem:

- Planejamento de sprints de desenvolvimento de software.
- Organização de etapas em um processo de construção.
- Definição de pré-requisitos em um plano de estudos.

## Como Rodar a Aplicação

O projeto é construído com HTML, CSS e TypeScript (compilado para JavaScript). Para executá-lo, você não precisa de um servidor web ou de ferramentas de compilação complexas.

1.  Certifique-se de que você tem os três arquivos principais no mesmo diretório:
    - `index.html`
    - `style.css` (necessário para a formatação visual)
    - `main.js` (a versão compilada do `main.ts`)
2.  Abra o arquivo `index.html` diretamente em qualquer navegador web moderno (como Chrome, Firefox, Edge, etc.).

A aplicação será carregada e estará pronta para uso.