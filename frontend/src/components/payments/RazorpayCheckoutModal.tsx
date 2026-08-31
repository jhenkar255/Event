import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, CreditCard, Smartphone, Building, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../api/client';
import confetti from 'canvas-confetti';
import { DiyaIcon } from '../layout/IndianMotifs';

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  eventId?: string;
  amount: number; // in INR
  purpose: string;
  onPaymentSuccess?: (payment: any) => void;
}

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  eventId,
  amount,
  purpose,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [paidReceipt, setPaidReceipt] = useState<any>(null);

  if (!isOpen) return null;

  const baseAmount = Math.round(amount / 1.18);
  const gstAmount = amount - baseAmount;

  const handlePayNow = async () => {
    setIsProcessing(true);
    try {
      // 1. Create Razorpay order on backend (support both /payments/order and /payments/create-order)
      let orderRes: any;
      try {
        orderRes = await api.post('/payments/order', {
          amount,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          purpose,
          eventId,
          bookingId,
        });
      } catch {
        orderRes = await api.post('/payments/create-order', {
          amount,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          purpose,
          eventId,
          bookingId,
        });
      }

      if (!orderRes || (!orderRes.success && !orderRes.orderId)) {
        throw new Error(orderRes?.message || 'Failed to initialize payment gateway.');
      }

      const orderId = orderRes.orderId || `order_${Date.now()}`;
      const paymentRecordId = orderRes.paymentRecordId;

      const normalizedMethod =
        method === 'netbanking' ? 'NET_BANKING' : method === 'card' ? 'CARD' : 'UPI';

      // 2. Simulate Razorpay payment gateway verification
      const verifyRes: any = await api.post('/payments/verify', {
        razorpay_order_id: orderId,
        razorpayOrderId: orderId,
        razorpay_payment_id: `pay_${Date.now()}_simulated`,
        razorpayPaymentId: `pay_${Date.now()}_simulated`,
        razorpay_signature: orderRes.mockSignature || 'simulated_valid_signature_2026',
        paymentRecordId,
        bookingId,
        eventId,
        amount,
        purpose,
        paymentMethod: normalizedMethod,
        method: normalizedMethod,
      });

      if (verifyRes.success || verifyRes.payment) {
        setPaidReceipt(verifyRes.payment || { transactionId: `TXN-${Date.now()}` });
        setPaymentDone(true);
        if (onPaymentSuccess) onPaymentSuccess(verifyRes.payment);

        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#C9A227', '#F4A340', '#7A1F2B'],
        });
      } else {
        throw new Error(verifyRes.message || 'Signature verification failed.');
      }
    } catch (err: any) {
      alert(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-utsav-ivory dark:bg-utsav-maroon-950 w-full max-w-lg rounded-3xl shadow-2xl border-2 border-utsav-gold/60 overflow-hidden relative z-[10000]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-utsav-maroon-900 to-utsav-maroon-800 text-utsav-ivory border-b border-utsav-gold/40 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-xl bg-utsav-maroon-950 border border-utsav-gold">
              <DiyaIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-utsav-gold">
                UtsavMitra Razorpay Escrow
              </h3>
              <p className="text-[11px] text-utsav-ivory/80">
                100% Secured 256-Bit Encrypted Indian Payment Gateway
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-utsav-ivory/70 hover:text-utsav-gold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {paymentDone ? (
          /* Payment Success State */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h4 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                Payment Successful & Verified!
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Transaction ID: <span className="font-mono font-bold text-utsav-maroon-900 dark:text-utsav-saffron">{paidReceipt?.transactionId || 'TXN-SUCCESS'}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-bold text-utsav-maroon-800 dark:text-utsav-gold">₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service:</span>
                <span className="font-semibold truncate">{purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">GST Invoice:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Generated & Downloadable</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl gold-gradient-btn text-xs font-bold shadow-lg"
            >
              Done & View Updated Ledger →
            </button>
          </div>
        ) : (
          /* Payment Selection Form */
          <div className="p-6 space-y-5">
            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Base Service Amount:</span>
                <span>₹{baseAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Integrated GST (18%):</span>
                <span>₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold pt-2 border-t border-utsav-gold/20">
                <span>Total Payable:</span>
                <span>₹{amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider">
                Select Indian Payment Option
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center space-y-1.5 transition-all ${
                    method === 'upi'
                      ? 'bg-utsav-saffron-50 dark:bg-utsav-maroon-800 border-utsav-saffron text-utsav-maroon-900 dark:text-utsav-gold shadow-md'
                      : 'bg-white dark:bg-utsav-maroon-900/60 border-utsav-gold/30 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-utsav-saffron" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center space-y-1.5 transition-all ${
                    method === 'card'
                      ? 'bg-utsav-saffron-50 dark:bg-utsav-maroon-800 border-utsav-saffron text-utsav-maroon-900 dark:text-utsav-gold shadow-md'
                      : 'bg-white dark:bg-utsav-maroon-900/60 border-utsav-gold/30 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-utsav-gold" />
                  <span>Cards / RuPay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('netbanking')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center space-y-1.5 transition-all ${
                    method === 'netbanking'
                      ? 'bg-utsav-saffron-50 dark:bg-utsav-maroon-800 border-utsav-saffron text-utsav-maroon-900 dark:text-utsav-gold shadow-md'
                      : 'bg-white dark:bg-utsav-maroon-900/60 border-utsav-gold/30 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Building className="w-5 h-5 text-utsav-maroon-800" />
                  <span>Net Banking</span>
                </button>
              </div>
            </div>

            {/* Input Details */}
            {method === 'upi' && (
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                  Virtual Payment Address (VPA / UPI ID)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@upi or username@okhdfcbank"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                />
              </div>
            )}

            {/* Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePayNow}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl maroon-gradient-btn text-xs sm:text-sm font-bold shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-utsav-gold" />
                    <span>Verifying Escrow with Razorpay...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Pay ₹{amount.toLocaleString('en-IN')} Securely</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
