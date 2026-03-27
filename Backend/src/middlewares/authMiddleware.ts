import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';
import { supabase } from '../config/supabase';
import { AuthUser } from '@supabase/supabase-js';

// Extendemos la interfaz Request para que TypeScript no se queje al usar req.user
interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const getUserFromRequest = (req: AuthenticatedRequest): AuthUser => {
  if (req.user) {
    return req.user;
  }
  throw Boom.unauthorized('User not authenticated');
};

// 1. MIDDLEWARE DE AUTENTICACIÓN 
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    throw Boom.unauthorized('Authorization header is missing');
  }

  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    throw Boom.unauthorized('Token is missing');
  }

  const userResponse = await supabase.auth.getUser(token);

  if (userResponse.error) {
    throw Boom.unauthorized(userResponse.error.message);
  }

  req.user = userResponse.data.user;
  next();
};

// Este revisa el rol que está guardado en los 'user_metadata' de Supabase
export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = getUserFromRequest(req);
    
    // Supabase guarda el rol en user_metadata 
    const userRole = user.user_metadata?.role; 

    if (!allowedRoles.includes(userRole)) {
      throw Boom.forbidden(`Access denied for role: ${userRole}`);
    }

    next();
  };
};