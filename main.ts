// main.ts (Versão Corrigida)

class TaskNode {
    id: string;
    name: string;
    children: TaskNode[] = [];
    element: HTMLElement | null = null;
    x: number = 0;
    y: number = 0;

    constructor(name: string) {
        this.id = `task-${Date.now()}-${Math.random()}`;
        this.name = name;
    }

    addChild(node: TaskNode) {
        this.children.push(node);
    }
}

class DependencyTree {
    nodes: Map<string, TaskNode> = new Map();

    addTask(name: string, parentId: string | null): TaskNode {
        const newNode = new TaskNode(name);
        this.nodes.set(newNode.id, newNode);

        if (parentId && this.nodes.has(parentId)) {
            const parentNode = this.nodes.get(parentId)!;
            parentNode.addChild(newNode);
        }
        
        return newNode;
    }
    
    postOrderTraversal(): TaskNode[] {
        const result: TaskNode[] = [];
        const visited = new Set<string>();

        const traverse = (node: TaskNode) => {
            visited.add(node.id);
            for (const child of node.children) {
                if (!visited.has(child.id)) {
                    traverse(child);
                }
            }
            result.push(node);
        };

        // Encontra todos os nós que não são filhos de ninguém (as raízes)
        const roots = Array.from(this.nodes.values()).filter(node => {
            return !Array.from(this.nodes.values()).some(p => p.children.includes(node));
        });

        // Inicia o percurso a partir de cada raiz
        roots.forEach(root => {
            if (!visited.has(root.id)) {
                traverse(root);
            }
        });

        return result;
    }
}

// --- Lógica da Aplicação ---
const tree = new DependencyTree();

const form = document.getElementById('task-form') as HTMLFormElement;
const taskNameInput = document.getElementById('task-name') as HTMLInputElement;
const dependencySelect = document.getElementById('task-dependency') as HTMLSelectElement;
const treeContainer = document.getElementById('tree-container') as HTMLDivElement;
const svgConnectors = document.getElementById('connector-svg') as unknown as SVGElement;
const postOrderBtn = document.getElementById('post-order-btn') as HTMLButtonElement;
const resultOutput = document.getElementById('result-output') as HTMLParagraphElement;

// CORREÇÃO 1: Lógica de renderização e posicionamento robusta
// Esta função irá limpar e redesenhar TUDO a cada chamada, garantindo que a árvore esteja sempre correta.
function renderTree() {
    // 1. Limpa a visualização atual
    treeContainer.querySelectorAll('.task-node').forEach(el => el.remove());
    svgConnectors.innerHTML = '';

    // 2. Encontra todos os nós raiz atuais (aqueles sem pai)
    const roots = Array.from(tree.nodes.values()).filter(node => {
        return !Array.from(tree.nodes.values()).some(p => p.children.includes(node));
    });

    // 3. Calcula as posições de todos os nós, começando pelas raízes
    const containerWidth = treeContainer.offsetWidth;
    const initialX = containerWidth / (roots.length + 1);
    roots.forEach((root, index) => {
        // Espalha as árvores raiz horizontalmente
        positionNode(root, (index + 1) * initialX, 60, containerWidth / (roots.length + 1));
    });
    
    // 4. Cria os elementos DOM para todos os nós e os posiciona
    tree.nodes.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'task-node';
        nodeEl.textContent = node.name;
        nodeEl.id = node.id;
        nodeEl.style.left = `${node.x}px`;
        nodeEl.style.top = `${node.y}px`;
        
        node.element = nodeEl; // Salva a referência ao elemento
        treeContainer.appendChild(nodeEl);
    });

    // 5. Desenha os conectores entre os nós já posicionados
    drawConnectors();
}

// Função auxiliar recursiva para definir as coordenadas (x, y) de cada nó
function positionNode(node: TaskNode, x: number, y: number, horizontalSpread: number) {
    node.x = x;
    node.y = y;
    
    const totalChildren = node.children.length;
    // O spread para os filhos diretos deste nó
    const childSpread = horizontalSpread * 0.8;
    // O ponto de partida para o primeiro filho
    const startX = x - (totalChildren - 1) * childSpread / 2;

    node.children.forEach((child, index) => {
        const childX = startX + index * childSpread;
        const childY = y + 100; // Espaçamento vertical fixo
        positionNode(child, childX, childY, childSpread / totalChildren);
    });
}

function drawConnectors() {
    tree.nodes.forEach(parent => {
        if (!parent.element) return;
        
        const startX = parent.x;
        const startY = parent.y + parent.element.offsetHeight / 2 - 15; // Ajuste para sair do meio do nó

        parent.children.forEach(child => {
            if (!child.element) return;
            const endX = child.x;
            const endY = child.y - child.element.offsetHeight / 2; // Ajuste para chegar no topo do nó

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', startX.toString());
            line.setAttribute('y1', startY.toString());
            line.setAttribute('x2', endX.toString());
            line.setAttribute('y2', endY.toString());
            line.setAttribute('class', 'connector');
            svgConnectors.appendChild(line);
        });
    });
}

function updateDependencyOptions() {
    dependencySelect.innerHTML = '<option value="">Sem dependência (raiz)</option>';
    tree.nodes.forEach(node => {
        const option = document.createElement('option');
        option.value = node.id;
        option.textContent = node.name;
        dependencySelect.appendChild(option);
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskName = taskNameInput.value.trim();
    const dependencyId = dependencySelect.value || null;

    if (taskName) {
        tree.addTask(taskName, dependencyId);
        taskNameInput.value = '';
        updateDependencyOptions();
        renderTree();
    }
});

// NOVO CÓDIGO - SUBSTITUA A SEÇÃO ACIMA POR ESTA

// Função auxiliar recursiva para gerar a string com indentação
function generateHierarchyText(node: TaskNode, level: number): string {
    // Adiciona o nó atual com a indentação correta
    let output = " ".repeat(level * 2) + "- " + node.name + "\n";
    
    // Chama a função recursivamente para cada filho, aumentando o nível de indentação
    for (const child of node.children) {
        output += generateHierarchyText(child, level + 1);
    }
    
    return output;
}

// Event Listener atualizado para o botão
postOrderBtn.addEventListener('click', () => {
    let fullHierarchyText = "";
    
    // Encontra os nós raiz (início das árvores)
    const roots = Array.from(tree.nodes.values()).filter(node => {
        return !Array.from(tree.nodes.values()).some(p => p.children.includes(node));
    });

    if (roots.length === 0) {
        resultOutput.textContent = "Nenhuma tarefa para exibir.";
        return;
    }

    // Gera o texto hierárquico para cada árvore/ramificação
    roots.forEach(root => {
        fullHierarchyText += generateHierarchyText(root, 0);
    });

    // Para manter a aparência de "bloco de código", usamos a tag <pre>
    resultOutput.innerHTML = `<pre>${fullHierarchyText}</pre>`;
});

window.addEventListener('resize', renderTree);
renderTree();

export{}