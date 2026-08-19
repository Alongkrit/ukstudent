'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, ShieldCheck, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface PaypalCheckoutProps {
  requestId: string;
  amount?: number;
  currency?: string;
  onSuccess?: (paymentDetails: any) => void;
  onCancel?: () => void;
}

export default function PaypalCheckout({
  requestId,
  amount = 45.0,
  currency = 'GBP',
  onSuccess,
  onCancel,
}: PaypalCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    const initButtons = () => {
      if (!(window as any).paypal || !containerRef.current || renderedRef.current) return false;

      renderedRef.current = true;

      (window as any).paypal
        .Buttons({
          createOrder: async () => {
            setError(null);
            const res = await apiFetch('/payments/create-order', {
              method: 'POST',
              body: JSON.stringify({ requestId, amount, currency }),
            });

            if (!res.ok) {
              const errData = await res.json().catch(() => ({ message: 'Failed to create PayPal order.' }));
              setError(errData.message || 'Failed to create PayPal order.');
              throw new Error(errData.message || 'Failed to create PayPal order.');
            }

            const data = await res.json();
            return data.orderId;
          },
          onApprove: async (data: { orderID: string }) => {
            setLoading(true);
            setError(null);

            try {
              const res = await apiFetch('/payments/capture-order', {
                method: 'POST',
                body: JSON.stringify({ orderId: data.orderID, requestId }),
              });

              if (!res.ok) {
                const errData = await res.json().catch(() => ({ message: 'Payment could not be confirmed.' }));
                setError(errData.message || 'Payment could not be confirmed.');
                return;
              }

              const result = await res.json();

              if (result.status !== 'paid') {
                setError('PayPal did not confirm this payment as completed.');
                return;
              }

              setPaymentResult(result);
              setCompleted(true);
              if (onSuccess) onSuccess(result);
            } catch (err: any) {
              setError(err?.message || 'Failed to confirm PayPal payment.');
            } finally {
              setLoading(false);
            }
          },
          onCancel: () => {
            if (onCancel) onCancel();
          },
          onError: (err: any) => {
            console.error('PayPal Buttons error:', err);
            setError('PayPal encountered an error. Please try again.');
          },
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
          },
        })
        .render(containerRef.current);

      return true;
    };

    if (initButtons()) return;

    const interval = setInterval(() => {
      if (initButtons()) clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, [requestId, amount, currency]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4 max-w-md w-full">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-xs tracking-tighter shadow-sm">
            PayPal
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">PayPal Express Checkout</h3>
            <span className="text-[10px] text-slate-500">Fast, Safe & Encrypted</span>
          </div>
        </div>
        <span className="text-xs font-black text-primary-navy">
          £{amount.toFixed(2)} {currency}
        </span>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {completed ? (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h4 className="text-xs font-bold text-emerald-900">Payment Successful via PayPal</h4>
          <p className="text-[11px] text-emerald-700">Order ID: {paymentResult?.paymentId}</p>
          <span className="text-[10px] text-slate-400 block pt-1">Official Scholza Receipt Sent</span>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Pay securely using your PayPal account balance, debit/credit card, or Pay in 3 installments.
          </p>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Confirming payment...</span>
            </div>
          )}

          <div ref={containerRef} className="min-h-[45px]" />

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              PayPal Buyer Protection
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              256-bit Encryption
            </span>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Cancel Payment
            </button>
          )}
        </div>
      )}
    </div>
  );
}