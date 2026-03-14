import { supabase } from '../../config/supabase';
import { AuthenticateUserDTO, CreateUserDTO } from './auth.types';

export const createUserService = async (data: CreateUserDTO) => {
  const { data: newUser, error: userError } = await supabase
    .from('users')
    .insert([{ 
      name: data.name, 
      email: data.email, 
      password: data.password,
      role: data.role 
    }])
    .select()
    .single();

  if (userError) throw new Error(userError.message);

  if (data.role === 'store' && data.storeName) {
    const { error: storeError } = await supabase
      .from('stores')
      .insert([{ 
        name: data.storeName,
        userId: newUser.id,
        isOpen: false
      }]);

    if (storeError) throw new Error(storeError.message);
  }

  // No devolver la contraseña
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const authenticateUserService = async (data: AuthenticateUserDTO) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', data.email)
    .eq('password', data.password)
    .single();

  if (error || !user) throw new Error('Invalid credentials');

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};