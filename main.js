// main.ts (Versão Corrigida)
var TaskNode = /** @class */ (function () {
    function TaskNode(name) {
        this.children = [];
        this.element = null;
        this.x = 0;
        this.y = 0;
        this.id = "task-".concat(Date.now(), "-").concat(Math.random());
        this.name = name;
    }
    TaskNode.prototype.addChild = function (node) {
        this.children.push(node);
    };
    return TaskNode;
}());
var DependencyTree = /** @class */ (function () {
    function DependencyTree() {
        this.nodes = new Map();
    }
    DependencyTree.prototype.addTask = function (name, parentId) {
        var newNode = new TaskNode(name);
        this.nodes.set(newNode.id, newNode);
        if (parentId && this.nodes.has(parentId)) {
            var parentNode = this.nodes.get(parentId);
            parentNode.addChild(newNode);
        }
        return newNode;
    };
    DependencyTree.prototype.postOrderTraversal = function () {
        var _this = this;
        var result = [];
        var visited = new Set();
        var traverse = function (node) {
            visited.add(node.id);
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var child = _a[_i];
                if (!visited.has(child.id)) {
                    traverse(child);
                }
            }
            result.push(node);
        };
        // Encontra todos os nós que não são filhos de ninguém (as raízes)
        var roots = Array.from(this.nodes.values()).filter(function (node) {
            return !Array.from(_this.nodes.values()).some(function (p) { return p.children.includes(node); });
        });
        // Inicia o percurso a partir de cada raiz
        roots.forEach(function (root) {
            if (!visited.has(root.id)) {
                traverse(root);
            }
        });
        return result;
    };
    return DependencyTree;
}());
// --- Lógica da Aplicação ---
var tree = new DependencyTree();
var form = document.getElementById('task-form');
var taskNameInput = document.getElementById('task-name');
var dependencySelect = document.getElementById('task-dependency');
var treeContainer = document.getElementById('tree-container');
var svgConnectors = document.getElementById('connector-svg');
var postOrderBtn = document.getElementById('post-order-btn');
var resultOutput = document.getElementById('result-output');
// CORREÇÃO 1: Lógica de renderização e posicionamento robusta
// Esta função irá limpar e redesenhar TUDO a cada chamada, garantindo que a árvore esteja sempre correta.
function renderTree() {
    // 1. Limpa a visualização atual
    treeContainer.querySelectorAll('.task-node').forEach(function (el) { return el.remove(); });
    svgConnectors.innerHTML = '';
    // 2. Encontra todos os nós raiz atuais (aqueles sem pai)
    var roots = Array.from(tree.nodes.values()).filter(function (node) {
        return !Array.from(tree.nodes.values()).some(function (p) { return p.children.includes(node); });
    });
    // 3. Calcula as posições de todos os nós, começando pelas raízes
    var containerWidth = treeContainer.offsetWidth;
    var initialX = containerWidth / (roots.length + 1);
    roots.forEach(function (root, index) {
        // Espalha as árvores raiz horizontalmente
        positionNode(root, (index + 1) * initialX, 60, containerWidth / (roots.length + 1));
    });
    // 4. Cria os elementos DOM para todos os nós e os posiciona
    tree.nodes.forEach(function (node) {
        var nodeEl = document.createElement('div');
        nodeEl.className = 'task-node';
        nodeEl.textContent = node.name;
        nodeEl.id = node.id;
        nodeEl.style.left = "".concat(node.x, "px");
        nodeEl.style.top = "".concat(node.y, "px");
        node.element = nodeEl; // Salva a referência ao elemento
        treeContainer.appendChild(nodeEl);
    });
    // 5. Desenha os conectores entre os nós já posicionados
    drawConnectors();
}
// Função auxiliar recursiva para definir as coordenadas (x, y) de cada nó
function positionNode(node, x, y, horizontalSpread) {
    node.x = x;
    node.y = y;
    var totalChildren = node.children.length;
    // O spread para os filhos diretos deste nó
    var childSpread = horizontalSpread * 0.8;
    // O ponto de partida para o primeiro filho
    var startX = x - (totalChildren - 1) * childSpread / 2;
    node.children.forEach(function (child, index) {
        var childX = startX + index * childSpread;
        var childY = y + 100; // Espaçamento vertical fixo
        positionNode(child, childX, childY, childSpread / totalChildren);
    });
}
function drawConnectors() {
    tree.nodes.forEach(function (parent) {
        if (!parent.element)
            return;
        var startX = parent.x;
        var startY = parent.y + parent.element.offsetHeight / 2 - 15; // Ajuste para sair do meio do nó
        parent.children.forEach(function (child) {
            if (!child.element)
                return;
            var endX = child.x;
            var endY = child.y - child.element.offsetHeight / 2; // Ajuste para chegar no topo do nó
            var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
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
    tree.nodes.forEach(function (node) {
        var option = document.createElement('option');
        option.value = node.id;
        option.textContent = node.name;
        dependencySelect.appendChild(option);
    });
}
form.addEventListener('submit', function (e) {
    e.preventDefault();
    var taskName = taskNameInput.value.trim();
    var dependencyId = dependencySelect.value || null;
    if (taskName) {
        tree.addTask(taskName, dependencyId);
        taskNameInput.value = '';
        updateDependencyOptions();
        renderTree();
    }
});
// NOVO CÓDIGO - SUBSTITUA A SEÇÃO ACIMA POR ESTA
// Função auxiliar recursiva para gerar a string com indentação
function generateHierarchyText(node, level) {
    // Adiciona o nó atual com a indentação correta
    var output = " ".repeat(level * 2) + "- " + node.name + "\n";
    // Chama a função recursivamente para cada filho, aumentando o nível de indentação
    for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
        var child = _a[_i];
        output += generateHierarchyText(child, level + 1);
    }
    return output;
}
// Event Listener atualizado para o botão
postOrderBtn.addEventListener('click', function () {
    var fullHierarchyText = "";
    // Encontra os nós raiz (início das árvores)
    var roots = Array.from(tree.nodes.values()).filter(function (node) {
        return !Array.from(tree.nodes.values()).some(function (p) { return p.children.includes(node); });
    });
    if (roots.length === 0) {
        resultOutput.textContent = "Nenhuma tarefa para exibir.";
        return;
    }
    // Gera o texto hierárquico para cada árvore/ramificação
    roots.forEach(function (root) {
        fullHierarchyText += generateHierarchyText(root, 0);
    });
    // Para manter a aparência de "bloco de código", usamos a tag <pre>
    resultOutput.innerHTML = "<pre>".concat(fullHierarchyText, "</pre>");
});
window.addEventListener('resize', renderTree);
renderTree();
