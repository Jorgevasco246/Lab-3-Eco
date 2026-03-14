export const updateStoreStatusController = async (req: Request, res: Response) => {
  const { id } = req.params; // ID de la tienda
  const { isOpen } = req.body; // true o false

  const { data, error } = await supabase
    .from('stores')
    .update({ isOpen })
    .eq('id', id)
    .select();

  if (error) throw Boom.badRequest(error.message);
  return res.json(data);
};