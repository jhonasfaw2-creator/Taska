import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as categoryService from '../services/category.service';

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.getActiveCategories();
  res.status(200).json(categories);
});
