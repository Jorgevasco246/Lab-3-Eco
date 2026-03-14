import { Router } from "express";
import { authMiddleware, checkRole } from "../../middlewares/authMiddleware";
// ... otras importaciones

// Solo las tiendas pueden crear productos
this.router.post(
  "/products", 
  authMiddleware,           // ¿Está logueado?
  checkRole(['store']),     // ¿Es una tienda? [cite: 14]
  this.productController.createProduct
);

// Los consumidores pueden ver productos
this.router.get(
  "/stores/:id/products", 
  authMiddleware, 
  checkRole(['consumer']),  // [cite: 13]
  this.productController.getProducts
);