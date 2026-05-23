import type { Request, Response } from 'express';
import prisma from '../config/db.js';

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Bills', 'Health', 'Shopping', 'Travel', 'Leisure', 'Other'];

// List
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { isDefault: true },
          { userId: userId }
        ]
      }
    });

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server category fetch error' });
  }
};

// Create
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }

    if (DEFAULT_CATEGORIES.map(c => c.toLowerCase()).includes(name.trim().toLowerCase())) {
      res.status(400).json({ error: 'A system default category with this name already exists' });
      return;
    }

    const existingCustom = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        userId: userId
      }
    });

    if (existingCustom) {
      res.status(400).json({ error: 'You have already created a category with this name' });
      return;
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        isDefault: false,
        userId: userId
      }
    });

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Internal server category creation error' });
  }
};

// Update
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Valid category identification is required' });
      return;
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Valid category name is required' });
      return;
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    if (category.isDefault) {
      res.status(403).json({ error: 'System default categories cannot be updated' });
      return;
    }
    if (category.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized data operation' });
      return;
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name: name.trim() }
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server category update error' });
  }
};

// Delete
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Valid category identification is required' });
      return;
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    if (category.isDefault) {
      res.status(403).json({ error: 'System default categories cannot be deleted' });
      return;
    }
    if (category.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized data operation' });
      return;
    }

    await prisma.category.delete({ where: { id } });
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server category deletion error' });
  }
};