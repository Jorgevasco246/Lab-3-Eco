import { Router } from 'express';
import {
  createProductController,
  getProductsByStoreController,
} from './product.controller';

export const router = Router();

router.post('/', createProductController);
router.get('/store/:storeId', getProductsByStoreController);