import { supabase } from '../../config/supabase';

export const createProductService = async (data: { name: string; price: number; storeId: string }) => {
  const { data: product, error } = await supabase
    .from('products')
    .insert([data])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return product;
};

export const getProductsByStoreService = async (storeId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('storeId', storeId);
  if (error) throw new Error(error.message);
  return data;
};