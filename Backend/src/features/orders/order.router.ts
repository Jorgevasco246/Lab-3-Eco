import { Router } from 'express';
import {
  createOrderController,
  getOrdersByConsumerController,
  getOrdersByStoreController,
  getAvailableOrdersController,
  getAcceptedOrdersByDeliveryController,
  updateOrderStatusController,
} from './order.controller';

export const router = Router();

router.post('/', createOrderController);
router.get('/available', getAvailableOrdersController);
router.get('/consumer/:consumerId', getOrdersByConsumerController);
router.get('/store/:storeId', getOrdersByStoreController);
router.get('/delivery/:deliveryId', getAcceptedOrdersByDeliveryController);
router.patch('/:id/status', updateOrderStatusController);