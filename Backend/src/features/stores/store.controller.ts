import { Request, Response } from 'express';
import Boom from '@hapi/boom';
import { getStoresService, getStoreByUserIdService, toggleStoreService } from './store.service';
import { UpdateStoreDTO } from './store.types';
import { getParam } from '../../utils/params';

export const getStoresController = async (_req: Request, res: Response) => {
  const stores = await getStoresService();
  return res.json(stores);
};

export const getMyStoreController = async (req: Request, res: Response) => {
  const userId = getParam(req.params.userId);
  const store = await getStoreByUserIdService(userId);
  return res.json(store);
};

export const toggleStoreController = async (req: Request, res: Response) => {
  const id = getParam(req.params.id);
  const { isOpen }: UpdateStoreDTO = req.body;
  if (isOpen === undefined) throw Boom.badRequest('isOpen is required');
  const store = await toggleStoreService(id, isOpen);
  return res.json(store);
};