import Boom from '@hapi/boom';

export const getParam = (param: string | string[]): string => {
  if (Array.isArray(param)) throw Boom.badRequest('Invalid parameter');
  return param;
};