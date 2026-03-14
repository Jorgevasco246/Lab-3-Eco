import { Router } from "express";
import { AuthController } from "./auth.controller";

export class AuthRouter {
  public router: Router;
  private authController: AuthController;

  constructor(authController: AuthController) {
    this.router = Router();
    this.authController = authController;

    this.router.post("/orders", this.orderController.createOrder);
this.router.get("/orders/consumer", this.orderController.getConsumerOrders);
this.router.get("/orders/available", this.orderController.getAvailableOrders);
this.router.patch("/orders/:id/accept", this.orderController.acceptOrder);
  }
}