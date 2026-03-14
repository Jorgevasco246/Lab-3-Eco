import { Request, Response } from 'express';
import Boom from '@hapi/boom';
import { createProductService, getProductsByStoreService } from './product.service';
import { CreateProductDTO } from './product.types';
import { getParam } from '../../utils/params';

export const createProductController = async (req: Request, res: Response) => {
  const { name, price, storeId }: CreateProductDTO = req.body;
  if (!name) throw Boom.badRequest('name is required');
  if (!price) throw Boom.badRequest('price is required');
  if (!storeId) throw Boom.badRequest('storeId is required');
  const product = await createProductService({ name, price, storeId });
  return res.status(201).json(product);
};

export const getProductsByStoreController = async (req: Request, res: Response) => {
  const storeId = getParam(req.params.storeId);
  const products = await getProductsByStoreService(storeId);
  return res.json(products);
};