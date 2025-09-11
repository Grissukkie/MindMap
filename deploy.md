# Deployment Guide

## Quick Deploy to Vercel

1. **Prepare your code:**
   ```bash
   npm run build
   ```

2. **Set up environment variables in Vercel:**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: Your domain (e.g., `https://your-app.vercel.app`)

3. **Deploy:**
   - Push to GitHub
   - Connect to Vercel
   - Deploy automatically

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build CSS:**
   ```bash
   npm run build:css
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

## Features Included ✅

- ✅ Interactive canvas with drag-and-drop nodes
- ✅ Node creation, editing, and deletion
- ✅ Visual connections between nodes
- ✅ Mobile-responsive design
- ✅ Touch gestures (pinch to zoom, drag)
- ✅ Context menus and keyboard shortcuts
- ✅ Properties panel for node customization
- ✅ Auto-save functionality (30-second intervals)
- ✅ Export/Import as JSON
- ✅ MongoDB Atlas integration ready
- ✅ RESTful API endpoints
- ✅ Error handling and validation
- ✅ Loading states and toast notifications
- ✅ Accessibility features (ARIA labels, keyboard navigation)

## Usage Instructions

### Creating Nodes
- Click anywhere on the canvas to create a new node
- Enter text for the node
- Drag nodes to reposition them

### Editing Nodes
- Double-click a node to edit its text
- Right-click for context menu options
- Use the properties panel when a node is selected

### Creating Connections
- Right-click a node and select "Connect"
- Click on another node to create a connection
- Connections are drawn automatically

### Navigation
- Use mouse wheel to zoom in/out
- Drag empty areas to pan around
- On mobile: pinch to zoom, two-finger pan

### Saving & Loading
- Click "Save" to save to database (if MongoDB is configured)
- Click "Load" to view and load saved mind maps
- Click "Export" to download as JSON file

### Keyboard Shortcuts
- `Delete`: Delete selected node
- `Enter`: Edit selected node
- `Escape`: Deselect all nodes

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/mindmaps` - List all mind maps
- `POST /api/mindmaps` - Create new mind map
- `GET /api/mindmaps/:id` - Get specific mind map
- `PUT /api/mindmaps/:id` - Update mind map
- `DELETE /api/mindmaps/:id` - Delete mind map

## Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Features

- Efficient canvas rendering with requestAnimationFrame
- Debounced auto-save to prevent excessive API calls
- Optimized touch handling for mobile devices
- Responsive design that adapts to screen size
- Lazy loading and efficient state management
