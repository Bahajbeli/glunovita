import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import AuditLog from '../models/AuditLog.model.js';

export const createOrder = async (userId, orderData) => {
  // Verify all products exist and have sufficient stock
  for (const item of orderData.items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
  }

  const order = new Order({
    userId,
    ...orderData
  });

  await order.save();

  // Update product stock
  for (const item of orderData.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity }
    });
  }

  await order.populate('userId', 'firstName lastName email');
  await order.populate('items.productId', 'name image brand');

  await AuditLog.create({
    userId,
    action: 'ORDER_CREATE',
    resourceType: 'ORDER',
    resourceId: order._id,
    status: 'SUCCESS',
    details: { totalAmount: order.totalAmount }
  });

  return order;
};

export const getUserOrders = async (userId) => {
  return await Order.find({ userId })
    .populate('items.productId', 'name image brand')
    .sort({ createdAt: -1 });
};

export const getAllOrders = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.userId) {
    query.userId = filters.userId;
  }

  const orders = await Order.find(query)
    .populate('userId', 'firstName lastName email')
    .populate('items.productId', 'name image brand')
    .sort({ createdAt: -1 })
    .limit(filters.limit || 100)
    .skip(filters.skip || 0);

  const total = await Order.countDocuments(query);

  return { orders, total };
};

export const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate('userId', 'firstName lastName email')
    .populate('items.productId', 'name image brand');

  if (!order) {
    throw new Error('Order not found');
  }

  return order;
};

export const updateOrderStatus = async (orderId, status, adminId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  order.status = status;
  await order.save();

  await AuditLog.create({
    userId: adminId,
    action: 'ORDER_UPDATE',
    resourceType: 'ORDER',
    resourceId: order._id,
    status: 'SUCCESS',
    details: { newStatus: status }
  });

  return order;
};
