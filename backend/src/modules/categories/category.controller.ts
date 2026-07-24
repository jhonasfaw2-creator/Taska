import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import * as categoryService from './category.service';

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.getCategories();
  res.status(200).json(categories);
});
