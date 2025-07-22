
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
        var roots = Array.from(this.nodes.values()).filter(function (node) {
            return !Array.from(_this.nodes.values()).some(function (p) { return p.children.includes(node); });
        });
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
function renderTree() {
    treeContainer.querySelectorAll('.task-node').forEach(function (el) { return el.remove(); });
    svgConnectors.innerHTML = '';
    var roots = Array.from(tree.nodes.values()).filter(function (node) {
        return !Array.from(tree.nodes.values()).some(function (p) { return p.children.includes(node); });
    });
    var containerWidth = treeContainer.offsetWidth;
    var initialX = containerWidth / (roots.length + 1);
    roots.forEach(function (root, index) {
        positionNode(root, (index + 1) * initialX, 60, containerWidth / (roots.length + 1));
    });
    tree.nodes.forEach(function (node) {
        var nodeEl = document.createElement('div');
        nodeEl.className = 'task-node';
        nodeEl.textContent = node.name;
        nodeEl.id = node.id;
        nodeEl.style.left = "".concat(node.x, "px");
        nodeEl.style.top = "".concat(node.y, "px");
        node.element = nodeEl;
        treeContainer.appendChild(nodeEl);
    });
    drawConnectors();
}
function positionNode(node, x, y, horizontalSpread) {
    node.x = x;
    node.y = y;
    var totalChildren = node.children.length;
    var childSpread = horizontalSpread * 0.8;
    var startX = x - (totalChildren - 1) * childSpread / 2;
    node.children.forEach(function (child, index) {
        var childX = startX + index * childSpread;
        var childY = y + 100;
        positionNode(child, childX, childY, childSpread / totalChildren);
    });
}
function drawConnectors() {
    tree.nodes.forEach(function (parent) {
        if (!parent.element)
            return;
        var startX = parent.x;
        var startY = parent.y + parent.element.offsetHeight / 2 - 15;
        parent.children.forEach(function (child) {
            if (!child.element)
                return;
            var endX = child.x;
            var endY = child.y - child.element.offsetHeight / 2;
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
// Event Listener para exibir a lista em Pós-Ordem
postOrderBtn.addEventListener('click', function () {
    // 1. Executa o percurso em Pós-Ordem para obter a lista de nós.
    var postOrderResult = tree.postOrderTraversal();
    // 2. Mapeia a lista de nós para uma lista de apenas os nomes.
    var resultNames = postOrderResult.map(function (node) { return node.name; });
    // 3. Junta os nomes em uma única string, separados por setas.
    var displayText = resultNames.join(' → ');
    // 4. Exibe o resultado final na tela.
    resultOutput.textContent = displayText || "Nenhuma tarefa para exibir.";
});
window.addEventListener('resize', renderTree);
renderTree();
