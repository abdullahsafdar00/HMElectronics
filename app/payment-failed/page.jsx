import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PaymentFailedPage({ searchParams }) {
  const params = await searchParams;
  const failureReason = params?.reason || 'The mobile wallet authorization was declined or timed out.';

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-rose-50 p-8 text-center border-b border-rose-100">
          <div className="w-14 h-14 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900">Payment Canceled</h1>
          <p className="text-rose-700 text-sm font-medium mt-1">JazzCash transaction failed to complete.</p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <span className="text-xs uppercase font-bold text-gray-400 tracking-wider block text-center mb-1">Gateway Error Context</span>
            <p className="text-gray-700 font-medium text-center text-sm leading-relaxed">
              {decodeURIComponent(failureReason)}
            </p>
          </div>

          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Your e-commerce shopping cart items are perfectly safe and unchanged. Please verify your wallet account status, ensure you have active funds, and try again.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <Link href="/cart" className="w-full text-center bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-all">
              Return to Cart & Retry
            </Link>
            <Link href="/" className="w-full text-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all">
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
