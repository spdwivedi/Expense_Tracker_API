import type { Request, Response } from 'express';
import prisma from '../config/db.js';

// Create
export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, type, categoryId, date, note } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      res.status(400).json({ error: 'Valid transaction amount is required' });
      return;
    }
    if (!type || (type !== 'INCOME' && type !== 'EXPENSE')) {
      res.status(400).json({ error: 'Type must be INCOME or EXPENSE' });
      return;
    }
    if (!categoryId || typeof categoryId !== 'string') {
      res.status(400).json({ error: 'Valid category identification is required' });
      return;
    }
    if (!date || isNaN(Date.parse(String(date)))) {
      res.status(400).json({ error: 'Valid transaction date is required' });
      return;
    }

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [
          { isDefault: true },
          { userId: userId }
        ]
      }
    });

    if (!category) {
      res.status(404).json({ error: 'Target transaction category not found' });
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(amount),
        type,
        categoryId,
        date: new Date(date),
        note: note ? String(note).trim() : null,
        userId
      }
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Internal server transaction creation error' });
  }
};

// List
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const page = parseInt(String(req.query['page'] || '1')) || 1;
    const limit = parseInt(String(req.query['limit'] || '10')) || 10;
    const skip = (page - 1) * limit;

    const queryType = req.query['type'];
    const queryCategory = req.query['categoryId'];
    const queryStart = req.query['startDate'];
    const queryEnd = req.query['endDate'];
    const querySort = req.query['sortBy'];
    const queryOrder = req.query['order'];
    
    const whereClause: any = { userId };

    if (queryType === 'INCOME' || queryType === 'EXPENSE') {
      whereClause.type = queryType;
    }
    if (queryCategory && typeof queryCategory === 'string') {
      whereClause.categoryId = queryCategory;
    }
    if (queryStart || queryEnd) {
      whereClause.date = {};
      if (queryStart && !isNaN(Date.parse(String(queryStart)))) {
        whereClause.date.gte = new Date(String(queryStart));
      }
      if (queryEnd && !isNaN(Date.parse(String(queryEnd)))) {
        whereClause.date.lte = new Date(String(queryEnd));
      }
    }

    const sortField = querySort === 'amount' ? 'amount' : 'date';
    const sortOrder = queryOrder === 'asc' ? 'asc' : 'desc';

    const [transactions, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
        include: { category: { select: { name: true, isDefault: true } } }
      }),
      prisma.transaction.count({ where: whereClause })
    ]);

    res.status(200).json({
      transactions,
      meta: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server ledger listings lookup error' });
  }
};

// View
export const getTransactionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Valid transaction identification is required' });
      return;
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { category: { select: { name: true, isDefault: true } } }
    });

    if (!transaction || transaction.userId !== userId) {
      res.status(404).json({ error: 'Transaction record not found' });
      return;
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Internal server isolated record lookup error' });
  }
};

// Update
export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { amount, type, categoryId, date, note } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Valid transaction identification is required' });
      return;
    }

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction || transaction.userId !== userId) {
      res.status(404).json({ error: 'Transaction record not found' });
      return;
    }

    const updateData: any = {};

    if (amount !== undefined) {
      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        res.status(400).json({ error: 'Valid transaction amount scale is required' });
        return;
      }
      updateData.amount = Number(amount);
    }
    if (type !== undefined) {
      if (type !== 'INCOME' && type !== 'EXPENSE') {
        res.status(400).json({ error: 'Type must be INCOME or EXPENSE' });
        return;
      }
      updateData.type = type;
    }
    if (categoryId !== undefined) {
      const category = await prisma.category.findFirst({
        where: {
          id: String(categoryId),
          OR: [{ isDefault: true }, { userId }]
        }
      });
      if (!category) {
        res.status(404).json({ error: 'Target category relation not found' });
        return;
      }
      updateData.categoryId = categoryId;
    }
    if (date !== undefined) {
      if (isNaN(Date.parse(String(date)))) {
        res.status(400).json({ error: 'Valid update timeframe calculation is required' });
        return;
      }
      updateData.date = new Date(date);
    }
    if (note !== undefined) {
      updateData.note = note ? String(note).trim() : null;
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: updateData
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server transaction adjustment execution error' });
  }
};

// Delete
export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Valid transaction identification is required' });
      return;
    }

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction || transaction.userId !== userId) {
      res.status(404).json({ error: 'Transaction record not found' });
      return;
    }

    await prisma.transaction.delete({ where: { id } });
    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server transaction deletion execution error' });
  }
};