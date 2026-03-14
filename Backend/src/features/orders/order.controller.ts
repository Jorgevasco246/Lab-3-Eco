import { Request, Response } from 'express';
import Boom from '@hapi/boom';
import {
  createOrderService,
  getAvailableOrdersService,
  getOrdersByConsumerService,
  getOrdersByStoreService,
  getAcceptedOrdersByDeliveryService,
  updateOrderStatusService,
} from './order.service';
import { CreateOrderDTO, UpdateOrderStatusDTO, OrderStatus } from './order.types';
import { getParam } from '../../utils/params';

export const createOrderController = async (req: Request, res: Response) => {
  const { consumerId, storeId, items }: CreateOrderDTO = req.body;
  if (!consumerId) throw Boom.badRequest('consumerId is required');
  if (!storeId) throw Boom.badRequest('storeId is required');
  if (!items || items.length === 0) throw Boom.badRequest('items are required');
  const order = await createOrderService({ consumerId, storeId, items });
  return res.status(201).json(order);
};

export const getOrdersByConsumerController = async (req: Request, res: Response) => {
  const consumerId = getParam(req.params.consumerId);
  const orders = await getOrdersByConsumerService(consumerId);
  return res.json(orders);
};

export const getOrdersByStoreController = async (req: Request, res: Response) => {
  const storeId = getParam(req.params.storeId);
  const orders = await getOrdersByStoreService(storeId);
  return res.json(orders);
};

export const getAvailableOrdersController = async (_req: Request, res: Response) => {
  const orders = await getAvailableOrdersService();
  return res.json(orders);
};

export const getAcceptedOrdersByDeliveryController = async (req: Request, res: Response) => {
  const deliveryId = getParam(req.params.deliveryId);
  const orders = await getAcceptedOrdersByDeliveryService(deliveryId);
  return res.json(orders);
};

export const updateOrderStatusController = async (req: Request, res: Response) => {
  const id = getParam(req.params.id);
  const { status, deliveryId }: UpdateOrderStatusDTO = req.body;
  if (!status) throw Boom.badRequest('status is required');
  if (!Object.values(OrderStatus).includes(status))
    throw Boom.badRequest(`status must be: ${Object.values(OrderStatus).join(', ')}`);
  const order = await updateOrderStatusService(id, status, deliveryId);
  return res.json(order);
};