import { supabase } from '../../config/supabase';

export const getStoresService = async () => {
  const { data, error } = await supabase
    .from('stores')
    .select('*, users(name, email)');
  if (error) throw new Error(error.message);
  return data;
};

export const getStoreByUserIdService = async (userId: string) => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('userId', userId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const toggleStoreService = async (storeId: string, isOpen: boolean) => {
  const { data, error } = await supabase
    .from('stores')
    .update({ isOpen })
    .eq('id', storeId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};