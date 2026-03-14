import { Request, Response } from 'express';
import Boom from '@hapi/boom';
import { authenticateUserService, createUserService } from './auth.service';
import { UserRole } from './auth.types';

export const registerController = async (req: Request, res: Response) => {
  const { email, password, role, name, storeName } = req.body;

  if (!email) throw Boom.badRequest('Email is required');
  if (!password) throw Boom.badRequest('Password is required');
  if (!name) throw Boom.badRequest('Name is required');
  if (!Object.values(UserRole).includes(role))
    throw Boom.badRequest(`Role must be: ${Object.values(UserRole).join(', ')}`);
  if (role === 'store' && !storeName)
    throw Boom.badRequest('Store name is required for store role');

  const user = await createUserService({ email, password, role, name, storeName });
  return res.status(201).json(user);
};

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) throw Boom.badRequest('Email is required');
  if (!password) throw Boom.badRequest('Password is required');

  const user = await authenticateUserService({ email, password });
  return res.json(user);
};