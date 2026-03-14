import { Request, Response } from 'express';
import { ProductService } from './product.service';

export class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  // Usamos arrow functions para no perder el contexto de 'this'
  createProduct = async (req: Request, res: Response) => {
    try {
      const productData = req.body;
      const newProduct = await this.productService.createProduct(productData);
      res.status(201).json(newProduct);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getProducts = async (req: Request, res: Response) => {
    try {
      const storeId = req.params.id; // viene de /stores/:id/products
      const products = await this.productService.getProductsByStore(storeId);
      res.status(200).json(products);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}