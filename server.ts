import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'data.json');

app.use(express.json());

// Helper to read data
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return [];
  }
}

// Helper to write data
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// REST API Routes
app.get('/api/items', async (req, res) => {
  const items = await readData();
  res.json(items);
});

app.post('/api/items', async (req, res) => {
  const items = await readData();
  const newItem = {
    id: crypto.randomUUID(),
    nome: req.body.nome || 'Novo Item',
    quantidade: typeof req.body.quantidade === 'number' ? req.body.quantidade : 0,
  };
  items.push(newItem);
  await writeData(items);
  res.json(newItem);
});

app.put('/api/items/:id', async (req, res) => {
  const items = await readData();
  const index = items.findIndex((item) => item.id === req.params.id);
  
  if (index !== -1) {
    items[index] = { ...items[index], ...req.body };
    await writeData(items);
    res.json(items[index]);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  let items = await readData();
  items = items.filter((item) => item.id !== req.params.id);
  await writeData(items);
  res.json({ success: true });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
