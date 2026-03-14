import { supabase } from '../../config/supabase';
import { CreateUserDTO } from './auth.types';

export const createUserService = async (data: CreateUserDTO) => {
  // 1. Crear el usuario en la tabla 'users'
  const { data: newUser, error: userError } = await supabase
    .from('users')
    .insert([{ 
      name: data.name, 
      email: data.email, 
      password: data.password, // En un proyecto real, ¡encripta esto!
      role: data.role 
    }])
    .select()
    .single();

  if (userError) throw new Error(userError.message);

  // 2. Si el rol es 'store', crear la tienda automáticamente 
  if (data.role === 'store') {
    const { error: storeError } = await supabase
      .from('stores')
      .insert([{ 
        name: data.storeName, // Este campo debe venir del req.body
        userId: newUser.id,
        isOpen: false // Por defecto cerrada [cite: 14, 45]
      }]);

    if (storeError) throw new Error(storeError.message);
  }

  return newUser;
};