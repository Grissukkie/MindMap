const canvas = document.getElementById("mindmapCanvas");
const ctx = canvas.getContext("2d");
const mapNameInput = document.getElementById("mapName");
const savedMapsList = document.getElementById("savedMaps");

let nodes = [];
let connections = [];

let draggingNode = null;
let connectingNode = null;
let offsetX, offsetY;
let selectedNode = null;

const contextMenu = document.createElement("div");
contextMenu.className =
  "absolute hidden bg-white shadow-lg rounded border border-gray-300 z-50";
document.body.appendChild(contextMenu);

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  draw();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Conexiones
  ctx.strokeStyle = "#4ade80";
  ctx.lineWidth = 2;
  connections.forEach(c => {
    const from = nodes.find(n => n.id === c.from);
    const to = nodes.find(n => n.id === c.to);
    if (from && to) {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
  });

  // Nodos
  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 40, 0, Math.PI * 2);
    ctx.fillStyle = "#9333ea";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(n.text, n.x, n.y);
  });
}

document.getElementById("addNodeBtn").addEventListener("click", () => {
  const id = Date.now().toString();
  nodes.push({ id, x: 150, y: 150, text: `Node ${nodes.length + 1}` });
  draw();
});

document.getElementById("clearCanvasBtn").addEventListener("click", () => {
  nodes = [];
  connections = [];
  draw();
});

document.getElementById("saveMapBtn").addEventListener("click", async () => {
  const name = mapNameInput.value.trim();
  if (!name) {
    alert("Please enter a map name");
    return;
  }
  const res = await fetch("/api/mindmaps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, nodes, connections })
  });
  const data = await res.json();
  console.log("Saved:", data);
  loadSavedMaps();
});

// Eventos canvas
canvas.addEventListener("mousedown", (e) => {
  hideContextMenu();
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const clickedNode = nodes.find(n => Math.hypot(n.x - x, n.y - y) < 40);

  if (e.shiftKey && clickedNode) {
    // Crear conexión
    if (!connectingNode) {
      connectingNode = clickedNode;
    } else {
      if (connectingNode.id !== clickedNode.id) {
        connections.push({ from: connectingNode.id, to: clickedNode.id });
      }
      connectingNode = null;
      draw();
    }
  } else if (clickedNode) {
    draggingNode = clickedNode;
    offsetX = x - clickedNode.x;
    offsetY = y - clickedNode.y;
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (draggingNode) {
    const rect = canvas.getBoundingClientRect();
    draggingNode.x = e.clientX - rect.left - offsetX;
    draggingNode.y = e.clientY - rect.top - offsetY;
    draw();
  }
});

canvas.addEventListener("mouseup", () => {
  draggingNode = null;
});

// Menú contextual
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const clickedNode = nodes.find(n => Math.hypot(n.x - x, n.y - y) < 40);

  if (clickedNode) {
    selectedNode = clickedNode;
    showContextMenu(e.pageX, e.pageY);
  }
});

function showContextMenu(x, y) {
  contextMenu.innerHTML = `
    <button class="block px-4 py-2 hover:bg-gray-100 w-full text-left" id="editNodeBtn">✏️ Edit Node</button>
    <button class="block px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600" id="deleteNodeBtn">❌ Delete Node</button>
  `;
  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;
  contextMenu.classList.remove("hidden");

  document.getElementById("editNodeBtn").onclick = () => {
    const newText = prompt("Enter new text:", selectedNode.text);
    if (newText) selectedNode.text = newText;
    hideContextMenu();
    draw();
  };

  document.getElementById("deleteNodeBtn").onclick = () => {
    nodes = nodes.filter(n => n.id !== selectedNode.id);
    connections = connections.filter(c => c.from !== selectedNode.id && c.to !== selectedNode.id);
    hideContextMenu();
    draw();
  };
}

function hideContextMenu() {
  contextMenu.classList.add("hidden");
}

// Cargar mapas guardados
async function loadSavedMaps() {
  savedMapsList.innerHTML = "";
  const res = await fetch("/api/mindmaps");
  const maps = await res.json();

  if (maps.length === 0) {
    savedMapsList.innerHTML = `<li class="text-gray-500">No maps saved yet</li>`;
    return;
  }

  maps.forEach(map => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="p-2 bg-purple-100 rounded cursor-pointer hover:bg-purple-200 flex justify-between items-center">
        <span>${map.name}</span>
      </div>
    `;
    li.onclick = () => {
      nodes = map.nodes;
      connections = map.connections || [];
      mapNameInput.value = map.name;
      draw();
    };
    savedMapsList.appendChild(li);
  });
}

loadSavedMaps();
