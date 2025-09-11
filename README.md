# Mind Map Web Application

A comprehensive mind mapping web application built with Express.js, TypeScript, and Tailwind CSS, designed for deployment on Vercel.

## Features

- **Interactive Mind Maps**: Create, edit, and delete nodes with drag-and-drop functionality
- **Visual Connections**: Draw connections between nodes with customizable styles
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Collaboration Ready**: Backend API ready for future collaborative features
- **Data Persistence**: Save and load mind maps with MongoDB Atlas integration
- **Export/Import**: Export mind maps as JSON files
- **Auto-save**: Automatic saving every 30 seconds

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mindmap-app
```

2. Install dependencies:
```bash
npm install
```

3. Build assets:
```bash
npm run build:css
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:3000`

### Environment Setup

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mindmap-app
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Usage

### Creating Nodes
- Click anywhere on the canvas to create a new node
- Double-click nodes to edit text
- Right-click nodes for context menu options

### Moving Nodes
- Drag nodes to reposition them
- Use mouse wheel or pinch gestures to zoom
- Pan by dragging empty areas

### Creating Connections
- Right-click a node and select "Connect"
- Click on another node to create a connection

### Saving and Loading
- Click "Save" to save to the database
- Click "Load" to browse and load saved mind maps
- Click "Export" to download as JSON

## Deployment on Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## API Endpoints

- `GET /api/mindmaps` - Get all mind maps
- `POST /api/mindmaps` - Create new mind map
- `GET /api/mindmaps/:id` - Get specific mind map
- `PUT /api/mindmaps/:id` - Update mind map
- `DELETE /api/mindmaps/:id` - Delete mind map

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
