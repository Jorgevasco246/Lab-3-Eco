import { supabase } from '../../config/supabase'; // Asumiendo que exportas tu cliente de DB aquí
import { CreateProductDTO } from './product.types';

export class ProductService {
  
  async createProduct(data: CreateProductDTO) {
    // Inserta en la tabla 'products' según tu modelo de datos
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert([
        { name: data.name, price: data.price, storeId: data.storeId }
      ])
      .select();

    if (error) throw new Error(error.message);
    return newProduct;
  }

  async getProductsByStore(storeId: string) {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('storeId', storeId);

    if (error) throw new Error(error.message);
    return products;
  }
}