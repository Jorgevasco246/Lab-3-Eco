import { Router } from "express";
import { AuthController } from "./auth.controller";

export class AuthRouter {
  public router: Router;
  private authController: AuthController;

  constructor(authController: AuthController) {
    this.router = Router();
    this.authController = authController;

    this.router.get("/stores", this.storeController.getStores);
this.router.post("/stores", this.storeController.createStore);
this.router.patch("/stores/:id/open", this.storeController.openStore);
  }
}