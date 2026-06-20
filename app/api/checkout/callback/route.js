import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Order from '@/models/order';
import { generateSecureHash } from '@/lib/jazzcash';

export async function POST(request) {
  // Dynamic fallback domain determination using incoming request header context
  const origin = request.headers.get("origin") || request.nextUrl?.origin || "http://localhost:3000";
  const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || origin;

  try {
    await connectDB();

    const formData = await request.formData();
    const incomingData = {};
    
    formData.forEach((value, key) => {
      incomingData[key] = value;
    });

    const receivedHash = incomingData.pp_SecureHash;
    delete incomingData.pp_SecureHash;

    const localHash = generateSecureHash(incomingData, process.env.JAZZCASH_INTEGRITY_SALT);

    const orderId = incomingData.pp_BillReference;
    const responseCode = incomingData.pp_ResponseCode;
    const responseMessage = incomingData.pp_ResponseMessage;
    const transactionId = incomingData.pp_TxnRefNo;

    // Security Check Failure
    if (receivedHash !== localHash) {
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'failed',
          paymentError: 'Cryptographic security verification signature mismatch.'
        });
      }
      return NextResponse.redirect(`${baseUrl}/payment-failed?reason=SecuritySignatureMismatch`, 303);
    }

    // Payment Successful
    if (responseCode === '000') {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'completed',
        status: 'Order Placed',
        paymentTxnId: transactionId,
        paymentError: null
      });

      return NextResponse.redirect(`${baseUrl}/payment-success?orderId=${orderId}`, 303);
    } else {
      // Payment Failed
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed',
        paymentError: `Gateway Error: ${responseMessage}`
      });

      return NextResponse.redirect(`${baseUrl}/payment-failed?reason=${encodeURIComponent(responseMessage)}`, 303);
    }
  } catch (error) {
    console.error("CRITICAL EXCEPTION IN CALLBACK LOGS:", error.message);
    // Bypasses any undefined environment variable failure properties
    return NextResponse.redirect(`${baseUrl}/payment-failed?reason=InternalServerError`, 303);
  }
}