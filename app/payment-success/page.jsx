import connectDB from "@/config/db";
import Order from "@/models/order";
import Link from "next/link";
import ClearCartHandler from "@/components/ClearCartHandler";
import TrackingTimeline from "@/components/TrackingTimeline";

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
    <div className="max-w-2xl mx-auto my-12 px-4 space-y-6">
      {/* Clears user cart state securely via AppContext */}
      <ClearCartHandler paymentStatus={order.paymentStatus} />

      {/* Main Invoice Card Wrapper */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Banner Hero Message Header */}
        <div className="bg-emerald-50 p-8 text-center border-b border-emerald-100">
          <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900">JazzCash Payment Received!</h1>
          <p className="text-emerald-700 text-sm font-medium mt-1">Transaction verified successfully.</p>
        </div>

        {/* Invoice Grid Details */}
        <div className="p-6 sm:p-8 space-y-5 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-100 pb-5 text-gray-600">
            <div>
              <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider">Our Order ID</p>
              <p className="font-mono text-gray-900 text-base mt-1">{order._id.toString()}</p>
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider">JazzCash Transaction ID</p>
              <p className="font-mono text-gray-900 text-base mt-1">{order.paymentTxnId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider">Courier Partner</p>
              <p className="text-gray-900 text-base font-bold uppercase mt-1">{order.courierName || 'Pending Assignment'}</p>
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider">Airway Bill Tracking # (AWB)</p>
              {order.courierTrackingNumber ? (
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold text-base">
                    {order.courierTrackingNumber}
                  </span>
                  <span className="text-gray-400 text-xs italic">(TCS Express Courier)</span>
                </div>
              ) : (
                <p className="text-gray-500 mt-1 italic">Generating tracking slip...</p>
              )}
            </div>
          </div>

          {/* Purchased Basket Line Items */}
          <div>
            <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider mb-2">Order Items Summary</span>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <div key={index} className="py-2.5 flex justify-between">
                  <div className="flex flex-col">
                    <span className="text-gray-800 font-semibold">Product Reference ID</span>
                    <span className="text-xs font-mono text-gray-400 mt-0.5">{item.product}</span>
                  </div>
                  <span className="text-gray-500 font-medium self-center">Quantity: {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Destination Delivery Address */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider mb-1">Shipping Destination Address</span>
            <p className="text-gray-700 font-medium leading-relaxed">{order.address}</p>
          </div>

          {/* Grand Billing Breakdown Total */}
          <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-base font-bold text-gray-800">Total Amount Paid:</span>
            <span className="text-xl font-black text-red-600">PKR {order.amount.toLocaleString()}</span>
          </div>

          {/* Bottom Action Form Navigation Links */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link href="/my-orders" className="flex-1 text-center bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-all">
              Track My Orders
            </Link>
            <Link href="/" className="flex-1 text-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic Live Courier Timeline Box Component */}
      {order.courierTrackingNumber && (
        <TrackingTimeline trackingNumber={order.courierTrackingNumber} />
      )}
    </div>
  );
}
