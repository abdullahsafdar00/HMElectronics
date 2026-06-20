import connectDB from "@/config/db";
import Order from "@/models/order";
import Link from "next/link";
import ClearCartHandler from "@/components/ClearCartHandler";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({ searchParams }) {
  const params = await searchParams;
  const orderId = params?.orderId;

  if (!orderId) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 text-center bg-white rounded-xl shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Missing Order Session</h1>
        <p className="text-gray-600 mb-6">No unique checkout identifier was found in your request link.</p>
        <Link href="/" className="bg-gray-900 text-white font-medium px-6 py-2.5 rounded-lg">
          Back to Shop
        </Link>
      </div>
    );
  }

  await connectDB();
  const order = await Order.findById(orderId).lean();

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 text-center bg-white rounded-xl shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Tracked</h1>
        <p className="text-gray-600 mb-6">We could not find a database entry for this order reference.</p>
        <Link href="/" className="bg-gray-900 text-white font-medium px-6 py-2.5 rounded-lg">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-12 px-4">
      {/* Clears user cart state securely via AppContext */}
      <ClearCartHandler paymentStatus={order.paymentStatus} />

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-emerald-50 p-8 text-center border-b border-emerald-100">
          <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900">JazzCash Payment Received!</h1>
          <p className="text-emerald-700 text-sm font-medium mt-1">Transaction verified successfully.</p>
        </div>

        <div className="p-6 sm:p-8 space-y-5 text-sm">
          <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-5 text-gray-600">
            <div>
              <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Our Order ID</span>
              <span className="font-mono text-gray-900">{order._id.toString()}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">JazzCash Transaction ID</span>
              <span className="font-mono text-gray-900">{order.paymentTxnId || 'N/A'}</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider mb-2">Order Items</span>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <div key={index} className="py-2 flex justify-between">
                  <span className="text-gray-800 font-medium">Product ID: {item.product}</span>
                  <span className="text-gray-500">Qty: {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider mb-1">Shipping Address</span>
            <p className="text-gray-700 font-medium">{order.address}</p>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-base font-bold text-gray-800">Total Amount Paid:</span>
            <span className="text-xl font-black text-red-600">PKR {order.amount.toLocaleString()}</span>
          </div>

          <div className="pt-4 flex gap-3">
            <Link href="/my-orders" className="flex-1 text-center bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-all">
              View My Orders
            </Link>
            <Link href="/" className="flex-1 text-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
