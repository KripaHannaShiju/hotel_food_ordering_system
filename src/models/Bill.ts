import mongoose, { Schema, Document } from 'mongoose';

export interface ISplitPayment {
    method: 'Cash' | 'UPI' | 'Card' | 'Wallet';
    amount: number;
    transactionId?: string;
    date: Date;
}

export interface IBill extends Document {
    tableNumber: string;
    orders: mongoose.Types.ObjectId[];
    subtotal: number;
    gstAmount: number;
    serviceChargeAmount: number;
    discountAmount: number;
    couponCode?: string;
    totalAmount: number;
    paymentStatus: 'Pending' | 'Partially Paid' | 'Paid' | 'Failed' | 'Refunded';
    splitPayments: ISplitPayment[];
    customerName?: string;
    customerPhone?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SplitPaymentSchema: Schema = new Schema({
    method: { type: String, enum: ['Cash', 'UPI', 'Card', 'Wallet'], required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String },
    date: { type: Date, default: Date.now }
});

const BillSchema: Schema = new Schema(
    {
        tableNumber: { type: String, required: true },
        orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
        subtotal: { type: Number, required: true },
        gstAmount: { type: Number, required: true },
        serviceChargeAmount: { type: Number, required: true },
        discountAmount: { type: Number, default: 0 },
        couponCode: { type: String },
        totalAmount: { type: Number, required: true },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Partially Paid', 'Paid', 'Failed', 'Refunded'],
            default: 'Pending',
        },
        splitPayments: [SplitPaymentSchema],
        customerName: { type: String },
        customerPhone: { type: String },
    },
    { timestamps: true }
);

export default (mongoose.models.Bill as mongoose.Model<IBill>) || mongoose.model<IBill>('Bill', BillSchema);
