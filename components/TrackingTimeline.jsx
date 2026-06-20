'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function TrackingTimeline({ trackingNumber }) {
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState(null);

  useEffect(() => {
    async function fetchLiveTracking() {
      if (!trackingNumber) return;
      try {
        const response = await fetch(`/api/track/${trackingNumber}`);
        const data = await response.json();
        
        if (data.success) {
          setTrackingData(data);
        } else {
          console.error("Courier system out of sync:", data.error);
        }
      } catch (err) {
        console.error("Network connection anomaly tracing logistics:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveTracking();
  }, [trackingNumber]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 animate-pulse shadow-sm">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-100 rounded w-full"></div>
        <div className="space-y-2 pt-2">
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Fallback layout if TCS servers have no data registered yet
  if (!trackingData || trackingData.history.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-5 flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 className="font-bold text-sm">Tracking Data Generating</h4>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Your package airway bill has been generated successfully. Logistics timeline details will become visible here once the TCS dispatch rider picks up your package from our warehouse hub.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Current Shipment Overview Bar */}
      <div className="bg-gray-900 text-white p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block">Current Delivery Status</span>
          <span className="text-lg font-black tracking-tight text-emerald-400 mt-0.5 block uppercase">
            {trackingData.status}
          </span>
        </div>
        <div className="sm:text-right">
          <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block">Current Sorting Hub Location</span>
          <span className="text-sm font-semibold text-gray-100 mt-0.5 block">
            {trackingData.currentLocation || "In Transit"}
          </span>
        </div>
      </div>

      {/* Vertical Interactive Timeline Grid */}
      <div className="p-6">
        <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-6">Shipment Journey History Logs</h4>
        <div className="relative border-l-2 border-gray-200 ml-4 pl-6 space-y-6">
          {trackingData.history.map((checkpoint, index) => {
            const isLatest = index === 0;
            return (
              <div key={index} className="relative group">
                {/* Visual Timeline Node Dot Anchor Element */}
                <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  isLatest 
                    ? 'bg-emerald-500 border-white ring-4 ring-emerald-100' 
                    : 'bg-white border-gray-300 group-hover:border-gray-400'
                }`} />

                {/* Tracking Data Text Wrapper */}
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                  <span className="text-xs font-mono font-bold text-gray-400 shrink-0 sm:w-28">
                    {checkpoint.date} {checkpoint.time}
                  </span>
                  <div className="space-y-0.5">
                    <span className={`text-sm font-bold block ${isLatest ? 'text-gray-900' : 'text-gray-700'}`}>
                      {checkpoint.remarks}
                    </span>
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Hub Station: {checkpoint.location}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
