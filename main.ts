// main.ts (Completo e Modificado para Pós-Ordem Linear)

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

        const roots = Array.from(this.nodes.values()).filter(node => {
            return !Array.from(this.nodes.values()).some(p => p.children.includes(node));
        });

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

function renderTree() {
    treeContainer.querySelectorAll('.task-node').forEach(el => el.remove());
    svgConnectors.innerHTML = '';

    const roots = Array.from(tree.nodes.values()).filter(node => {
        return !Array.from(tree.nodes.values()).some(p => p.children.includes(node));
    });

    const containerWidth = treeContainer.offsetWidth;
    const initialX = containerWidth / (roots.length + 1);
    roots.forEach((root, index) => {
        positionNode(root, (index + 1) * initialX, 60, containerWidth / (roots.length + 1));
    });
    
    tree.nodes.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'task-node';
        nodeEl.textContent = node.name;
        nodeEl.id = node.id;
        nodeEl.style.left = `${node.x}px`;
        nodeEl.style.top = `${node.y}px`;
        
        node.element = nodeEl;
        treeContainer.appendChild(nodeEl);
    });

    drawConnectors();
}

function positionNode(node: TaskNode, x: number, y: number, horizontalSpread: number) {
    node.x = x;
    node.y = y;
    
    const totalChildren = node.children.length;
    const childSpread = horizontalSpread * 0.8;
    const startX = x - (totalChildren - 1) * childSpread / 2;

    node.children.forEach((child, index) => {
        const childX = startX + index * childSpread;
        const childY = y + 100;
        positionNode(child, childX, childY, childSpread / totalChildren);
    });
}

function drawConnectors() {
    tree.nodes.forEach(parent => {
        if (!parent.element) return;
        
        const startX = parent.x;
        const startY = parent.y + parent.element.offsetHeight / 2 - 15;

        parent.children.forEach(child => {
            if (!child.element) return;
            const endX = child.x;
            const endY = child.y - child.element.offsetHeight / 2;

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

// Event Listener para exibir a lista em Pós-Ordem
postOrderBtn.addEventListener('click', () => {
    // 1. Executa o percurso em Pós-Ordem para obter a lista de nós.
    const postOrderResult = tree.postOrderTraversal();
    
    // 2. Mapeia a lista de nós para uma lista de apenas os nomes.
    const resultNames = postOrderResult.map(node => node.name);
    
    // 3. Junta os nomes em uma única string, separados por setas.
    const displayText = resultNames.join(' → ');
    
    // 4. Exibe o resultado final na tela.
    resultOutput.textContent = displayText || "Nenhuma tarefa para exibir.";
});

window.addEventListener('resize', renderTree);
renderTree();

export{}