/**
 * Mind Map Application
 * A comprehensive mind mapping web application with drag-and-drop functionality
 */

class MindMapApp {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.nodes = new Map();
        this.connections = new Map();
        this.selectedNode = null;
        this.isDragging = false;
        this.isConnecting = false;
        this.dragOffset = { x: 0, y: 0 };
        this.panOffset = { x: 0, y: 0 };
        this.scale = 1;
        this.lastPanPoint = { x: 0, y: 0 };
        this.isPanning = false;
        this.connectionStart = null;
        this.autoSaveInterval = null;
        this.currentMindMapId = null;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupUI();
        this.startAutoSave();
        this.hideLoadingScreen();
        
        // Create initial node
        this.createNode('Central Idea', 400, 300);
    }

    setupCanvas() {
        this.canvas = document.getElementById('mindmap-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = document.getElementById('canvas-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.render();
    }

    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // UI events
        this.setupUIEventListeners();
    }

    setupUIEventListeners() {
        // Desktop buttons
        document.getElementById('new-mindmap-btn').addEventListener('click', () => this.showNewMindMapModal());
        document.getElementById('save-btn').addEventListener('click', () => this.saveMindMap());
        document.getElementById('load-btn').addEventListener('click', () => this.showLoadMindMapModal());
        document.getElementById('export-btn').addEventListener('click', () => this.exportMindMap());
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
        
        // Mobile buttons
        document.getElementById('mobile-menu-btn').addEventListener('click', () => this.toggleMobileMenu());
        document.getElementById('mobile-new-btn').addEventListener('click', () => this.showNewMindMapModal());
        document.getElementById('mobile-save-btn').addEventListener('click', () => this.saveMindMap());
        document.getElementById('mobile-load-btn').addEventListener('click', () => this.showLoadMindMapModal());
        document.getElementById('mobile-export-btn').addEventListener('click', () => this.exportMindMap());
        
        // Modal events
        document.getElementById('cancel-new-mindmap').addEventListener('click', () => this.hideNewMindMapModal());
        document.getElementById('create-mindmap').addEventListener('click', () => this.createNewMindMap());
        document.getElementById('cancel-load-mindmap').addEventListener('click', () => this.hideLoadMindMapModal());
        
        // Context menu events
        document.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleContextMenuAction(e));
        });
        
        // Properties panel events
        document.getElementById('node-text-input').addEventListener('input', (e) => this.updateNodeText(e.target.value));
        document.getElementById('node-bg-color').addEventListener('change', (e) => this.updateNodeStyle('backgroundColor', e.target.value));
        document.getElementById('node-text-color').addEventListener('change', (e) => this.updateNodeStyle('textColor', e.target.value));
        document.getElementById('node-shape').addEventListener('change', (e) => this.updateNodeStyle('shape', e.target.value));
        
        // Click outside to close context menu
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#context-menu')) {
                this.hideContextMenu();
            }
        });
    }

    setupUI() {
        this.updateStats();
        this.updateUserInfo();
    }

    updateUserInfo() {
        const user = window.authService.getCurrentUser();
        if (user) {
            document.getElementById('user-name').textContent = `Welcome, ${user.name}!`;
        }
    }

    logout() {
        window.authService.logout();
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panOffset.x) / this.scale;
        const y = (e.clientY - rect.top - this.panOffset.y) / this.scale;
        
        const clickedNode = this.getNodeAt(x, y);
        
        if (e.button === 0) { // Left click
            if (clickedNode) {
                this.selectNode(clickedNode);
                this.isDragging = true;
                this.dragOffset = {
                    x: x - clickedNode.x,
                    y: y - clickedNode.y
                };
            } else {
                this.deselectAll();
                if (this.isConnecting && this.connectionStart) {
                    this.createConnection(this.connectionStart, clickedNode);
                    this.isConnecting = false;
                    this.connectionStart = null;
                } else {
                    this.isPanning = true;
                    this.lastPanPoint = { x: e.clientX, y: e.clientY };
                }
            }
        } else if (e.button === 2) { // Right click
            e.preventDefault();
            if (clickedNode) {
                this.selectNode(clickedNode);
                this.showContextMenu(e.clientX, e.clientY);
            } else {
                this.deselectAll();
            }
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panOffset.x) / this.scale;
        const y = (e.clientY - rect.top - this.panOffset.y) / this.scale;
        
        if (this.isDragging && this.selectedNode) {
            this.selectedNode.x = x - this.dragOffset.x;
            this.selectedNode.y = y - this.dragOffset.y;
            this.render();
        } else if (this.isPanning) {
            const deltaX = e.clientX - this.lastPanPoint.x;
            const deltaY = e.clientY - this.lastPanPoint.y;
            this.panOffset.x += deltaX;
            this.panOffset.y += deltaY;
            this.lastPanPoint = { x: e.clientX, y: e.clientY };
            this.render();
        }
    }

    handleMouseUp(e) {
        this.isDragging = false;
        this.isPanning = false;
    }

    handleWheel(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.1, Math.min(3, this.scale * zoomFactor));
        
        // Zoom towards mouse position
        this.panOffset.x = mouseX - (mouseX - this.panOffset.x) * (newScale / this.scale);
        this.panOffset.y = mouseY - (mouseY - this.panOffset.y) * (newScale / this.scale);
        this.scale = newScale;
        
        this.render();
    }

    handleContextMenu(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panOffset.x) / this.scale;
        const y = (e.clientY - rect.top - this.panOffset.y) / this.scale;
        
        const clickedNode = this.getNodeAt(x, y);
        if (clickedNode) {
            this.selectNode(clickedNode);
            this.showContextMenu(e.clientX, e.clientY);
        } else {
            this.deselectAll();
        }
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                button: 0
            });
            this.handleMouseDown(mouseEvent);
        } else if (e.touches.length === 2) {
            // Two finger touch - start pinch zoom
            this.lastTouchDistance = this.getTouchDistance(e.touches);
            this.lastTouchCenter = this.getTouchCenter(e.touches);
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.handleMouseMove(mouseEvent);
        } else if (e.touches.length === 2) {
            // Two finger touch - pinch zoom
            const currentDistance = this.getTouchDistance(e.touches);
            const currentCenter = this.getTouchCenter(e.touches);
            
            if (this.lastTouchDistance && this.lastTouchCenter) {
                const scale = currentDistance / this.lastTouchDistance;
                const newScale = Math.max(0.1, Math.min(3, this.scale * scale));
                
                // Zoom towards touch center
                const rect = this.canvas.getBoundingClientRect();
                const centerX = currentCenter.x - rect.left;
                const centerY = currentCenter.y - rect.top;
                
                this.panOffset.x = centerX - (centerX - this.panOffset.x) * (newScale / this.scale);
                this.panOffset.y = centerY - (centerY - this.panOffset.y) * (newScale / this.scale);
                this.scale = newScale;
                
                this.render();
            }
            
            this.lastTouchDistance = currentDistance;
            this.lastTouchCenter = currentCenter;
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        if (e.touches.length === 0) {
            const mouseEvent = new MouseEvent('mouseup', {});
            this.handleMouseUp(mouseEvent);
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Delete' && this.selectedNode) {
            this.deleteNode(this.selectedNode);
        } else if (e.key === 'Escape') {
            this.deselectAll();
            this.hideContextMenu();
        } else if (e.key === 'Enter' && this.selectedNode) {
            this.editNode(this.selectedNode);
        }
    }

    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getTouchCenter(touches) {
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
        };
    }

    createNode(text, x, y, parentId = null) {
        const id = this.generateId();
        const node = {
            id,
            text,
            x,
            y,
            parentId,
            style: {
                backgroundColor: '#3b82f6',
                textColor: '#ffffff',
                borderColor: '#1d4ed8',
                borderWidth: 2,
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 'normal',
                shape: 'rectangle'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        this.nodes.set(id, node);
        this.render();
        this.updateStats();
        return node;
    }

    deleteNode(node) {
        // Remove connections involving this node
        for (const [connectionId, connection] of this.connections) {
            if (connection.fromNodeId === node.id || connection.toNodeId === node.id) {
                this.connections.delete(connectionId);
            }
        }
        
        // Remove child nodes
        for (const [nodeId, n] of this.nodes) {
            if (n.parentId === node.id) {
                this.deleteNode(n);
            }
        }
        
        this.nodes.delete(node.id);
        this.selectedNode = null;
        this.render();
        this.updateStats();
    }

    selectNode(node) {
        this.selectedNode = node;
        this.updatePropertiesPanel();
        this.render();
    }

    deselectAll() {
        this.selectedNode = null;
        this.hidePropertiesPanel();
        this.render();
    }

    editNode(node) {
        const newText = prompt('Edit node text:', node.text);
        if (newText !== null && newText.trim() !== '') {
            node.text = newText.trim();
            node.updatedAt = new Date();
            this.render();
        }
    }

    updateNodeText(text) {
        if (this.selectedNode) {
            this.selectedNode.text = text;
            this.selectedNode.updatedAt = new Date();
            this.render();
        }
    }

    updateNodeStyle(property, value) {
        if (this.selectedNode) {
            this.selectedNode.style[property] = value;
            this.selectedNode.updatedAt = new Date();
            this.render();
        }
    }

    createConnection(fromNode, toNode) {
        if (fromNode && toNode && fromNode.id !== toNode.id) {
            const id = this.generateId();
            const connection = {
                id,
                fromNodeId: fromNode.id,
                toNodeId: toNode.id,
                style: {
                    color: '#64748b',
                    width: 2,
                    style: 'solid'
                }
            };
            this.connections.set(id, connection);
            this.render();
            this.updateStats();
        }
    }

    getNodeAt(x, y) {
        for (const node of this.nodes.values()) {
            const nodeRect = this.getNodeRect(node);
            if (x >= nodeRect.x && x <= nodeRect.x + nodeRect.width &&
                y >= nodeRect.y && y <= nodeRect.y + nodeRect.height) {
                return node;
            }
        }
        return null;
    }

    getNodeRect(node) {
        this.ctx.font = `${node.style.fontWeight} ${node.style.fontSize}px Inter, sans-serif`;
        const textMetrics = this.ctx.measureText(node.text);
        const padding = 12;
        const width = Math.max(textMetrics.width + padding * 2, 80);
        const height = node.style.fontSize + padding * 2;
        
        return {
            x: node.x - width / 2,
            y: node.y - height / 2,
            width,
            height
        };
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context
        this.ctx.save();
        
        // Apply pan and zoom
        this.ctx.translate(this.panOffset.x, this.panOffset.y);
        this.ctx.scale(this.scale, this.scale);
        
        // Render connections
        this.renderConnections();
        
        // Render nodes
        this.renderNodes();
        
        // Restore context
        this.ctx.restore();
    }

    renderConnections() {
        for (const connection of this.connections.values()) {
            const fromNode = this.nodes.get(connection.fromNodeId);
            const toNode = this.nodes.get(connection.toNodeId);
            
            if (fromNode && toNode) {
                this.ctx.strokeStyle = connection.style.color;
                this.ctx.lineWidth = connection.style.width;
                this.ctx.setLineDash(connection.style.style === 'dashed' ? [5, 5] : []);
                
                this.ctx.beginPath();
                this.ctx.moveTo(fromNode.x, fromNode.y);
                this.ctx.lineTo(toNode.x, toNode.y);
                this.ctx.stroke();
            }
        }
    }

    renderNodes() {
        for (const node of this.nodes.values()) {
            this.renderNode(node);
        }
    }

    renderNode(node) {
        const rect = this.getNodeRect(node);
        const isSelected = this.selectedNode === node;
        
        // Set font
        this.ctx.font = `${node.style.fontWeight} ${node.style.fontSize}px Inter, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Draw node background
        this.ctx.fillStyle = node.style.backgroundColor;
        this.ctx.strokeStyle = node.style.borderColor;
        this.ctx.lineWidth = node.style.borderWidth;
        
        if (node.style.shape === 'circle') {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, Math.max(rect.width, rect.height) / 2, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
        } else if (node.style.shape === 'diamond') {
            this.ctx.beginPath();
            this.ctx.moveTo(node.x, node.y - rect.height / 2);
            this.ctx.lineTo(node.x + rect.width / 2, node.y);
            this.ctx.lineTo(node.x, node.y + rect.height / 2);
            this.ctx.lineTo(node.x - rect.width / 2, node.y);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        } else { // rectangle
            this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        }
        
        // Draw selection ring
        if (isSelected) {
            this.ctx.strokeStyle = '#3b82f6';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeRect(rect.x - 5, rect.y - 5, rect.width + 10, rect.height + 10);
            this.ctx.setLineDash([]);
        }
        
        // Draw text
        this.ctx.fillStyle = node.style.textColor;
        this.ctx.fillText(node.text, node.x, node.y);
    }

    showContextMenu(x, y) {
        const contextMenu = document.getElementById('context-menu');
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.classList.remove('hidden');
    }

    hideContextMenu() {
        document.getElementById('context-menu').classList.add('hidden');
    }

    handleContextMenuAction(e) {
        const action = e.target.dataset.action;
        this.hideContextMenu();
        
        switch (action) {
            case 'edit':
                this.editNode(this.selectedNode);
                break;
            case 'delete':
                this.deleteNode(this.selectedNode);
                break;
            case 'connect':
                this.isConnecting = true;
                this.connectionStart = this.selectedNode;
                this.canvas.style.cursor = 'crosshair';
                break;
        }
    }

    updatePropertiesPanel() {
        if (this.selectedNode) {
            document.getElementById('node-text-input').value = this.selectedNode.text;
            document.getElementById('node-bg-color').value = this.selectedNode.style.backgroundColor;
            document.getElementById('node-text-color').value = this.selectedNode.style.textColor;
            document.getElementById('node-shape').value = this.selectedNode.style.shape;
            document.getElementById('properties-panel').classList.remove('hidden');
        }
    }

    hidePropertiesPanel() {
        document.getElementById('properties-panel').classList.add('hidden');
    }

    updateStats() {
        document.getElementById('node-count').textContent = `${this.nodes.size} nodes`;
        document.getElementById('connection-count').textContent = `${this.connections.size} connections`;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Modal functions
    showNewMindMapModal() {
        document.getElementById('new-mindmap-modal').classList.remove('hidden');
        document.getElementById('new-mindmap-title').focus();
    }

    hideNewMindMapModal() {
        document.getElementById('new-mindmap-modal').classList.add('hidden');
        document.getElementById('new-mindmap-title').value = '';
        document.getElementById('new-mindmap-description').value = '';
    }

    createNewMindMap() {
        const title = document.getElementById('new-mindmap-title').value.trim();
        const description = document.getElementById('new-mindmap-description').value.trim();
        
        if (!title) {
            this.showToast('Please enter a title', 'error');
            return;
        }
        
        // Clear current mind map
        this.nodes.clear();
        this.connections.clear();
        this.selectedNode = null;
        this.currentMindMapId = null;
        
        // Create new central node
        this.createNode(title, 400, 300);
        
        this.hideNewMindMapModal();
        this.showToast('New mind map created', 'success');
    }

    showLoadMindMapModal() {
        this.loadMindMapsList();
        document.getElementById('load-mindmap-modal').classList.remove('hidden');
    }

    hideLoadMindMapModal() {
        document.getElementById('load-mindmap-modal').classList.add('hidden');
    }

    async loadMindMapsList() {
        try {
            const headers = window.authService.getAuthHeaders();
            const response = await fetch('/api/mindmaps', { headers });
            const data = await response.json();
            
            const listContainer = document.getElementById('mindmap-list');
            listContainer.innerHTML = '';
            
            if (data.success && data.data.length > 0) {
                data.data.forEach(mindmap => {
                    const item = document.createElement('div');
                    item.className = 'p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer';
                    item.innerHTML = `
                        <div class="font-medium text-secondary-900">${mindmap.title}</div>
                        <div class="text-sm text-secondary-600">${mindmap.description || 'No description'}</div>
                        <div class="text-xs text-secondary-500 mt-1">
                            ${new Date(mindmap.updatedAt).toLocaleDateString()}
                        </div>
                    `;
                    item.addEventListener('click', () => this.loadMindMap(mindmap));
                    listContainer.appendChild(item);
                });
            } else {
                listContainer.innerHTML = '<div class="text-center text-secondary-600 py-8">No mind maps found</div>';
            }
        } catch (error) {
            console.error('Error loading mind maps:', error);
            this.showToast('Error loading mind maps', 'error');
        }
    }

    async loadMindMap(mindmap) {
        try {
            this.nodes.clear();
            this.connections.clear();
            this.selectedNode = null;
            
            // Load nodes
            mindmap.nodes.forEach(nodeData => {
                this.nodes.set(nodeData.id, nodeData);
            });
            
            // Load connections
            mindmap.connections.forEach(connectionData => {
                this.connections.set(connectionData.id, connectionData);
            });
            
            this.currentMindMapId = mindmap.id;
            this.hideLoadMindMapModal();
            this.render();
            this.updateStats();
            this.showToast('Mind map loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading mind map:', error);
            this.showToast('Error loading mind map', 'error');
        }
    }

    async saveMindMap() {
        try {
            const mindmapData = {
                title: this.nodes.size > 0 ? this.nodes.values().next().value.text : 'Untitled',
                description: '',
                nodes: Array.from(this.nodes.values()),
                connections: Array.from(this.connections.values())
            };
            
            const headers = window.authService.getAuthHeaders();
            
            if (this.currentMindMapId) {
                // Update existing mind map
                const response = await fetch(`/api/mindmaps/${this.currentMindMapId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(mindmapData)
                });
                
                const data = await response.json();
                if (data.success) {
                    this.showToast('Mind map saved successfully', 'success');
                } else {
                    throw new Error(data.error);
                }
            } else {
                // Create new mind map
                const response = await fetch('/api/mindmaps', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(mindmapData)
                });
                
                const data = await response.json();
                if (data.success) {
                    this.currentMindMapId = data.data.id;
                    this.showToast('Mind map saved successfully', 'success');
                } else {
                    throw new Error(data.error);
                }
            }
        } catch (error) {
            console.error('Error saving mind map:', error);
            this.showToast('Error saving mind map', 'error');
        }
    }

    exportMindMap() {
        const mindmapData = {
            title: this.nodes.size > 0 ? this.nodes.values().next().value.text : 'Untitled',
            description: '',
            nodes: Array.from(this.nodes.values()),
            connections: Array.from(this.connections.values()),
            exportedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(mindmapData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `mindmap-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Mind map exported successfully', 'success');
    }

    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.nodes.size > 0) {
                this.saveMindMap();
            }
        }, 30000); // Auto-save every 30 seconds
    }

    toggleMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        menu.classList.toggle('hidden');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `px-4 py-3 rounded-lg shadow-lg text-white ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
        } animate-slide-up`;
        toast.textContent = message;
        
        const container = document.getElementById('toast-container');
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    hideLoadingScreen() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MindMapApp();
});
