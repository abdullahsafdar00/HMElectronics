import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'; // Secure Clerk server protection
import connectDB from '@/config/db';
import Order from '@/models/order';
import { getJazzCashDateTimeString, generateSecureHash } from '@/lib/jazzcash';

export async function POST(request) {
  try {
    // 1. Authenticate the request via Clerk server side middleware session
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized profile login missing' }, { status: 401 });
    }

    await connectDB();
    
    // Parse address and ordered items array sent by checkout component
    const { items, amount, address, paymentMethod } = await request.json();

    if (paymentMethod !== 'jazzcash') {
      return NextResponse.json({ success: false, error: 'Invalid checkout payment method parameter routing option' }, { status: 400 });
    }

    // 2. Initialize the tracking document record inside MongoDB with a 'pending' state status
    const newOrder = await Order.create({
      userId, // Secure verified user identification code mapped directly from Clerk session token
      items,
      amount,
      address,
      paymentMethod: 'jazzcash',
      paymentStatus: 'pending',
      status: 'Order Placed'
    });

    const { txnDateTime, txnExpiryDateTime } = getJazzCashDateTimeString();
    const txnRefNo = `TXN${txnDateTime}`;

    // Anchor generated Reference ID value inside tracking database sheet instance entry
    newOrder.paymentTxnRef = txnRefNo;
    await newOrder.save();

    // 3. Compile transaction criteria definitions required by JazzCash API platform structures
    let payload = {
      pp_Version: '1.1',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID,
      pp_Password: process.env.JAZZCASH_PASSWORD,
      pp_TxnRefNo: txnRefNo,
      pp_Amount: (parseFloat(amount) * 100).toString(), // Convert entry numbers to absolute Paisas value format tracking units
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: newOrder._id.toString(), // Map native MongoDB model schema entry identifier string
      pp_Description: 'HMElectronics Order Checkout Payment Request',
      pp_TxnExpiryDateTime: txnExpiryDateTime,
      pp_ReturnURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/callback`,
      pp_BankID: 'TBANK',
      pp_ProductID: 'RETL'
    };

    // Append cryptographic SHA256 integrity security parameter validation signature string
    payload.pp_SecureHash = generateSecureHash(payload, process.env.JAZZCASH_INTEGRITY_SALT);

    return NextResponse.json({
      success: true,
      gatewayUrl: "https://jazzcash.com.pk",
      fields: payload
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
