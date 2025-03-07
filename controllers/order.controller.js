import mongoose from "mongoose";
import Order from "../DB/models/order.model.js"
import { validateBooks } from "../validation/BookStockValidation.js";
import StatusCodes from "http-status-codes";
import { getIO } from '../index.router.js';
import { ErrorClass } from "../middlewares/ErrorClass.js";
import logger from "../middlewares/logger.js";
import userModel from "../DB/models/user.model.js";
import { notificationController } from "./notification.controller.js";

export const placeOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        console.log("Request body:", req.body); // Log the request body for debugging
        if (!req.user || !req.user.id) {
            throw new ErrorClass("Unauthorized: Please log in to place an order.", StatusCodes.UNAUTHORIZED);
        }
        logger.info(`Placing order for user ${req.user.id}`);
        const { books } = req.body;

        const totalPrice = await validateBooks(books, session);
        logger.info(`Total price calculated: ${totalPrice}`);

        const order = new Order({ user: req.user.id, books, totalPrice });
        await order.save({ session });

        await session.commitTransaction();
        session.endSession();
        logger.info(`Order ${order._id} placed successfully for user ${req.user.id}`);

        // Emit socket event for new order
        const io = getIO();
        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'name email')
            .populate('books.book', 'title author price');

        io.emit('newOrder', {
            orderId: order._id,
            user: populatedOrder.user,
            totalPrice: order.totalPrice,
            books: populatedOrder.books
        });
        
        // Create notification for the user who placed the order
        await notificationController.createNotification(
            req.user.id,
            'order_status',
            'Order Placed Successfully',
            `Your order #${order._id} has been placed successfully. Total: $${order.totalPrice.toFixed(2)}`,
            order._id,
            'Order'
        );
        
        // Create a single notification for all admin users about the new order
        const adminUsers = await userModel.find({ role: 'Admin' });
        if (adminUsers && adminUsers.length > 0) {
            const adminIds = adminUsers.map(admin => admin._id);
            await notificationController.createMultiRecipientNotification(
                adminIds,
                'order_status',
                'New Order Received',
                `A new order #${order._id} has been placed by ${populatedOrder.user.name || 'a user'}. Total: $${order.totalPrice.toFixed(2)}`,
                order._id,
                'Order'
            );
            logger.info(`Notification sent to ${adminUsers.length} admin users about new order`);
        }

        return res
            .status(StatusCodes.CREATED)
            .json({ message: "Order created successfully", order });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        logger.error(`Error placing order for user ${req.user.id}: ${error.message}`);
        console.error(error);
        return res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR)
                   .json({ msgError: error.message, status: StatusCodes.BAD_REQUEST });
    }
};

export const getOrderHistory = async (req, res) => {
    try {
        logger.info(`Fetching order history for user ${req.user.id}`);
        
        const orders = await Order.find({ user: req.user.id })
        .populate('books.book', 'title author price')
        .sort({ createdAt: -1 });  
        res.status(StatusCodes.OK).json({ message: "Order history retrieved successfully", orders });

    } catch (error) {
        logger.error(`Error fetching order history for user ${req.user.id}: ${error.message}`);
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: `Server error: ${error.message}` });

    }
};

export const updateOrderStatus = async (req, res, next) => {
    const { orderId } = req.params;
    const { status } = req.body;

    try {
        // Validate the status
        const validStatuses = ['pending', 'completed', 'canceled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status.' });
        }

        // Find the order by ID
        const order = await Order.findById(orderId).populate('user', 'name email _id');
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        
        // Store old status for comparison
        const oldStatus = order.status;
        
        // Update the order's status
        order.status = status;
        await order.save();  // Save the updated order
        
        // Only send notification if status actually changed
        if (oldStatus !== status) {
            // Create notification for the order owner
            let statusMessage = '';
            if (status === 'completed') {
                statusMessage = 'has been completed and is ready for delivery';
            } else if (status === 'canceled') {
                statusMessage = 'has been canceled';
            } else {
                statusMessage = `status has been updated to ${status}`;
            }
            
            await notificationController.createNotification(
                order.user._id,
                'order_status',
                `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                `Your order #${order._id} ${statusMessage}.`,
                order._id,
                'Order'
            );
            
            logger.info(`Order status notification sent to user ${order.user._id}`);
        }

        return res.status(200).json({
            message: 'Order status updated successfully',
            order,  
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({
            message: 'Error updating order status',
            error: error.message,  
        });
    }
};