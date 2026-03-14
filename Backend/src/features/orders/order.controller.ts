export const acceptOrderController = async (req: Request, res: Response) => {
  const { orderId, deliveryId } = req.body;

  const { data, error } = await supabase
    .from('orders')
    .update({ 
      deliveryId: deliveryId,
      status: 'ACCEPTED' // Estado propuesto 
    })
    .eq('id', orderId)
    .select();

  if (error) throw Boom.badRequest(error.message);
  return res.json(data);
};