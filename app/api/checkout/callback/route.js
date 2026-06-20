import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Order from '@/models/order';
import User from '@/models/user'; // To fetch the customer's name and profile details
import { generateSecureHash } from '@/lib/jazzcash';
import courierService from '@/lib/courier-services'; // Import courier engine

export async function POST(request) {
  const origin = request.headers.get("origin") || request.nextUrl?.origin || "http://localhost:3000";
  const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || origin;

  try {
    await connectDB();

    const formData = await request.formData();
    const incomingData = {};
    formData.forEach((value, key) => { incomingData[key] = value; });

    const receivedHash = incomingData.pp_SecureHash;
    delete incomingData.pp_SecureHash;

    const localHash = generateSecureHash(incomingData, process.env.JAZZCASH_INTEGRITY_SALT);

    const orderId = incomingData.pp_BillReference;
    const responseCode = incomingData.pp_ResponseCode;
    const transactionId = incomingData.pp_TxnRefNo;

    if (receivedHash !== localHash) {
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed', paymentError: 'Signature Mismatch' });
      }
      return NextResponse.redirect(`${baseUrl}/payment-failed?reason=SecuritySignatureMismatch`, 303);
    }

    if (responseCode === '000') {
      // 1. Fetch complete contextual profiles from MongoDB
      const order = await Order.findById(orderId);
      const customer = await User.findById(order.userId);

      // 2. Automate courier payload calculations
      const courierPayload = {
        customerName: customer?.name || "Valued Customer",
        shippingAddress: order.address,
        city: order.address.split(',').pop().trim() || "Lahore", // Extract trailing city string safely
        phone: "03001234567", // Fallback to test number or customer metadata profile properties
        totalAmount: 0, // Set to 0 because payment was successfully cleared via JazzCash (Prepaid)
        itemSummary: `Order Ref: ${orderId}`,
        weight: 1
      };

      // 3. Dispatch booking requests using TCS as your default premium courier choice
      const courierResult = await courierService.bookTCSShipment(courierPayload);

      // 4. Update the MongoDB Order Document with successful payment AND tracking details
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'completed',
        status: 'Order Placed',
        paymentTxnId: transactionId,
        courierName: 'tcs',
        courierTrackingNumber: courierResult.trackingNumber,
        courierStatus: 'Booked',
        courierMeta: courierResult.courierResponse || {}
      });

      return NextResponse.redirect(`${baseUrl}/payment-success?orderId=${orderId}`, 303);
    } else {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
      return NextResponse.redirect(`${baseUrl}/payment-failed?reason=${encodeURIComponent(incomingData.pp_ResponseMessage)}`, 303);
    }
  } catch (error) {
    console.error("CALLBACK ERROR:", error);
    return NextResponse.redirect(`${baseUrl}/payment-failed?reason=InternalServerError`, 303);
  }
}
