import type { Request, Response } from 'express';
import prisma from '../config/db.js';

// Overview
export const getOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { startDate, endDate } = req.query;
    const whereClause: any = { userId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate && !isNaN(Date.parse(String(startDate)))) {
        whereClause.date.gte = new Date(String(startDate));
      }
      if (endDate && !isNaN(Date.parse(String(endDate)))) {
        whereClause.date.lte = new Date(String(endDate));
      }
    }

    const transactions = await prisma.transaction.findMany({ where: whereClause });

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(t => {
      const amt = Number(t.amount);
      if (t.type === 'INCOME') totalIncome += amt;
      if (t.type === 'EXPENSE') totalExpenses += amt;
    });

    res.status(200).json({
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server overview calculation error' });
  }
};

// Breakdown
export const getCategoryBreakdown = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { startDate, endDate } = req.query;
    const whereClause: any = { userId, type: 'EXPENSE' };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate && !isNaN(Date.parse(String(startDate)))) {
        whereClause.date.gte = new Date(String(startDate));
      }
      if (endDate && !isNaN(Date.parse(String(endDate)))) {
        whereClause.date.lte = new Date(String(endDate));
      }
    }

    const aggregates = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: whereClause,
      _sum: { amount: true }
    });

    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { isDefault: true },
          { userId: userId }
        ]
      }
    });

    const totalExpenseSum = aggregates.reduce((acc, curr) => {
      const amt = curr._sum?.amount ? Number(curr._sum.amount) : 0;
      return acc + amt;
    }, 0);

    const breakdown = aggregates.map(item => {
      const cat = categories.find(c => c.id === item.categoryId);
      const amount = item._sum?.amount ? Number(item._sum.amount) : 0;
      return {
        categoryId: item.categoryId,
        categoryName: cat ? cat.name : 'Unknown',
        amount,
        percentage: totalExpenseSum > 0 ? parseFloat(((amount / totalExpenseSum) * 100).toFixed(2)) : 0
      };
    });

    res.status(200).json({
      totalExpenses: totalExpenseSum,
      breakdown
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server breakdown calculation error' });
  }
};

// Trend
export const getMonthOverMonth = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const monthsParam = parseInt(String(req.query['months'] || '6')) || 6;
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsParam);
    cutoffDate.setDate(1);
    cutoffDate.setHours(0, 0, 0, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: cutoffDate }
      },
      orderBy: { date: 'asc' }
    });

    const trendsMap = new Map<string, { month: string; income: number; expense: number }>();

    for (let i = 0; i < monthsParam; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      trendsMap.set(key, { month: key, income: 0, expense: 0 });
    }

    transactions.forEach(t => {
      const dateObj = new Date(t.date);
      const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      
      if (trendsMap.has(key)) {
        const bucket = trendsMap.get(key)!;
        const amt = Number(t.amount);
        if (t.type === 'INCOME') bucket.income += amt;
        if (t.type === 'EXPENSE') bucket.expense += amt;
      }
    });

    const trend = Array.from(trendsMap.values()).sort((a, b) => a.month.localeCompare(b.month));

    res.status(200).json(trend);
  } catch (error) {
    res.status(500).json({ error: 'Internal server trend calculation error' });
  }
};