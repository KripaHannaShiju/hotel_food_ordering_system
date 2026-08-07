const mongoose = require('mongoose');

async function test() {
    await mongoose.connect('mongodb+srv://kripahannashiju:KBP8sPqPJnHrYGxv@cluster0.t4m0z6s.mongodb.net/hotel_food_ordering?retryWrites=true&w=majority&appName=Cluster0');
    const bills = await mongoose.connection.collection('bills').find().toArray();
    console.log('Bills in DB:', bills.length);
    if (bills.length > 0) {
        console.log(JSON.stringify(bills[0], null, 2));
    }
    const orders = await mongoose.connection.collection('orders').find({ paymentStatus: 'Paid' }).toArray();
    console.log('Paid orders in DB:', orders.length);
    process.exit(0);
}

test();
