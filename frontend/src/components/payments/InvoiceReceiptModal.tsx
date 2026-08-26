import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { IPayment } from '@shared/types';
import { DiyaIcon } from '../layout/IndianMotifs';

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: IPayment | null;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({ isOpen, onClose, payment }) => {
  if (!isOpen || !payment) return null;

  const base = Math.round(payment.amount / 1.18);
  const cgst = Math.round((payment.amount - base) / 2);
  const sgst = payment.amount - base - cgst;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white text-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-utsav-gold/60 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Control Bar */}
        <div className="p-4 bg-utsav-maroon-950 text-utsav-ivory flex items-center justify-between border-b border-utsav-gold/40">
          <div className="flex items-center space-x-2">
            <DiyaIcon className="w-5 h-5" />
            <span className="font-heading text-sm font-bold text-utsav-gold">Tax Invoice & Receipt</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-utsav-gold/20 text-utsav-gold text-xs font-bold hover:bg-utsav-gold/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div>
              <h2 className="font-heading text-xl font-bold text-utsav-maroon-800">UTSAVMITRA</h2>
              <p className="text-xs text-gray-500 font-medium">UtsavMitra Technologies Pvt. Ltd.</p>
              <p className="text-[11px] text-gray-500">GSTIN: 08AAACU1234F1Z8</p>
              <p className="text-[11px] text-gray-500">MI Road, Jaipur, Rajasthan - 302001</p>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                PAID IN FULL
              </span>
              <p className="font-mono text-xs font-bold">INV-{payment.transactionId?.slice(-8) || '2026-001'}</p>
              <p className="text-xs text-gray-500">Date: {new Date(payment.createdAt || Date.now()).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Payment & Transaction Info */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border text-xs">
            <div>
              <span className="text-gray-500 block font-semibold">Payment Method:</span>
              <span className="font-bold text-gray-800">{payment.paymentMethod} (Razorpay)</span>
            </div>
            <div>
              <span className="text-gray-500 block font-semibold">Transaction Reference:</span>
              <span className="font-mono font-bold text-gray-800 truncate block">{payment.transactionId}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs font-bold text-gray-600 uppercase">
                <th className="py-2">Description</th>
                <th className="py-2 text-right">SAC Code</th>
                <th className="py-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              <tr>
                <td className="py-3">
                  <p className="font-bold text-gray-800">{payment.purpose || 'Event Service Booking'}</p>
                  <p className="text-[11px] text-gray-500">Auspicious Celebration Planning & Escrow</p>
                </td>
                <td className="py-3 text-right font-mono">998596</td>
                <td className="py-3 text-right font-semibold">₹{base.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          {/* Taxes & Total */}
          <div className="space-y-1.5 pt-4 border-t text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>₹{base.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>CGST (9%):</span>
              <span>₹{cgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>SGST (9%):</span>
              <span>₹{sgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-utsav-maroon-800 pt-2 border-t">
              <span>Total Paid (INR):</span>
              <span>₹{payment.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Footer Shloka & Note */}
          <div className="pt-6 border-t text-center space-y-1 text-[11px] text-gray-500">
            <p className="italic font-serif text-utsav-gold">"सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके"</p>
            <p>This is a computer-generated tax invoice and requires no physical signature.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
