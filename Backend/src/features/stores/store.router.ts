import { Router } from 'express';
import {
  getStoresController,
  getMyStoreController,
  toggleStoreController,
} from './store.controller';

export const router = Router();

router.get('/', getStoresController);
router.get('/my-store/:userId', getMyStoreController);
router.patch('/:id/toggle', toggleStoreController);