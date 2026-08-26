import { Request, Response } from 'express';
import { Decoration } from '../models/Decoration';
import { Catering } from '../models/Catering';
import { Entertainment } from '../models/Entertainment';

// ==================== DECORATIONS ====================
export const getDecorations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, culturalStyle, maxPrice, search } = req.query;
    const filter: any = { isAvailable: true };

    if (category) filter.category = category;
    if (culturalStyle) filter.culturalStyle = culturalStyle;
    if (maxPrice) filter.price = { $lte: Number(maxPrice) };
    if (search) {
      filter.$or = [
        { name: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') },
        { category: new RegExp(search as string, 'i') },
      ];
    }

    const decorations = await Decoration.find(filter).sort({ rating: -1, price: 1 });
    res.json({ success: true, count: decorations.length, decorations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDecoration = async (req: Request, res: Response): Promise<void> => {
  try {
    const decoration = await Decoration.create(req.body);
    res.status(201).json({ success: true, decoration });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CATERING ====================
export const getCateringPackages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, maxPricePerPlate, search } = req.query;
    const filter: any = { isAvailable: true };

    if (category) filter.category = category;
    if (maxPricePerPlate) filter.pricePerPlate = { $lte: Number(maxPricePerPlate) };
    if (search) {
      filter.$or = [
        { name: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') },
        { category: new RegExp(search as string, 'i') },
      ];
    }

    const packages = await Catering.find(filter).sort({ rating: -1, pricePerPlate: 1 });
    res.json({ success: true, count: packages.length, packages, catering: packages, caterings: packages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCateringPackage = async (req: Request, res: Response): Promise<void> => {
  try {
    const catering = await Catering.create(req.body);
    res.status(201).json({ success: true, catering });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ENTERTAINMENT ====================
export const getEntertainment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, maxPrice, search } = req.query;
    const filter: any = { isAvailable: true };

    if (category) filter.category = category;
    if (maxPrice) filter.price = { $lte: Number(maxPrice) };
    if (search) {
      filter.$or = [
        { name: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') },
        { category: new RegExp(search as string, 'i') },
      ];
    }

    const items = await Entertainment.find(filter).sort({ rating: -1, price: 1 });
    res.json({ success: true, count: items.length, items, entertainment: items, entertainments: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEntertainment = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Entertainment.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
