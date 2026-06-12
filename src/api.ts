import { Item } from './types';

export const api = {
  async getItems(): Promise<Item[]> {
    const res = await fetch('/api/items');
    if (!res.ok) throw new Error('Failed to fetch items');
    return res.json();
  },

  async createItem(item: Partial<Item>): Promise<Item> {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to create item');
    return res.json();
  },

  async updateItem(id: string, updates: Partial<Item>): Promise<Item> {
    const res = await fetch(`/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update item');
    return res.json();
  },

  async deleteItem(id: string): Promise<void> {
    const res = await fetch(`/api/items/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete item');
  }
};
