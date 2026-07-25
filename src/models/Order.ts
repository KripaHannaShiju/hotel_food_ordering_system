import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
    menuItem: mongoose.Types.ObjectId;
    quantity: number;
    name: string; // Store name in case menu item is deleted/changed
    price: number; // Store price at time of order
}

export interface IOrder extends Document {
    tableNumber: string;
    items: IOrderItem[];
    totalAmount: number;
    status: 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
    paymentStatus: 'Pending' | 'Paid' | 'Failed';
    paymentMethod?: 'razorpay' | 'cod';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    customerNote?: string;
    customerName?: string;
    sessionId?: string;
    estimatedPrepTime: number; // in minutes
    preparationStartedAt?: Date; // NEW
    isDelayedCompensationApplied?: boolean;
    compensationNote?: string;
    createdAt: Date;
    updatedAt: Date;
    billId?: mongoose.Types.ObjectId; // NEW: Reference to the Bill
}

const OrderSchema: Schema = new Schema(
    {
        tableNumber: { type: String, required: true },
        items: [
            {
                menuItem: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true, min: 1 },
            },
        ],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Paid', 'Failed'],
            default: 'Pending',
        },
        paymentMethod: { type: String, enum: ['razorpay', 'cod'] },
        razorpayOrderId: { type: String },
        razorpayPaymentId: { type: String },
        razorpaySignature: { type: String },
        customerNote: { type: String },
        customerName: { type: String },
        sessionId: { type: String, index: true },
        estimatedPrepTime: { type: Number, default: 15 }, // Store total prep time calculated at order creation
        preparationStartedAt: { type: Date }, // NEW: Track when the timer actually starts
        isDelayedCompensationApplied: { type: Boolean, default: false },
        compensationNote: { type: String },
        billId: { type: Schema.Types.ObjectId, ref: 'Bill' },
    },
    { timestamps: true }
);

// Use cached model to prevent recompilation on hot reloads
export default (mongoose.models.Order as mongoose.Model<IOrder>) || mongoose.model<IOrder>('Order', OrderSchema);
