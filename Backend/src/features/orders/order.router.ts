import { Router } from 'express';
import {
  createOrderController,
  getOrdersByConsumerController,
  getOrdersByStoreController,
  getAvailableOrdersController,
  getAcceptedOrdersByDeliveryController,
  updateOrderStatusController,
  acceptOrderController,
  updatePositionController,
  getOrderByIdController,
  checkArrivalController,
} from './order.controller';

export const router = Router();

router.post('/', createOrderController);
router.get('/available', getAvailableOrdersController);
router.get('/consumer/:consumerId', getOrdersByConsumerController);
router.get('/store/:storeId', getOrdersByStoreController);
router.get('/delivery/:deliveryId', getAcceptedOrdersByDeliveryController);
router.get('/:id', getOrderByIdController);
router.patch('/:id/status', updateOrderStatusController);
router.patch('/:id/accept', acceptOrderController);
router.patch('/:id/position', updatePositionController);
router.post('/:id/check-arrival', checkArrivalController);

