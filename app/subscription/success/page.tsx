"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/use-auth';
import { AuthGuard } from '@/components/common/auth-guard';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { makeApiRequest } from '@/lib/utils';
import Link from 'next/link';

interface PaymentResult {
  success: boolean;
  message: string;
  membership?: {
    type: string;
    expiryDate: string;
  };
  pointsAdded?: number;
}

function PaymentSuccessContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const processPayment = async () => {
      try {
        setLoading(true);
        setError(null);

        // 获取URL参数
        const paymentId = searchParams.get('paymentId');
        const token = searchParams.get('token');
        const PayerID = searchParams.get('PayerID');
        const product = searchParams.get('product');

        console.log('Payment success params:', {
          paymentId,
          token,
          PayerID,
          product
        });

        // 调用支付成功处理API
        const result = await makeApiRequest<PaymentResult>('/api/subscription/payment-success', {
          method: 'POST',
          body: JSON.stringify({
            paymentId,
            token,
            PayerID,
            product
          })
        });

        if (result.success) {
          setPaymentResult(result.data || result as PaymentResult);
        } else {
          setError(result.message || 'Payment processing failed');
        }
      } catch (err) {
        console.error('Payment processing error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [isLoaded, user, searchParams]);

  const retry = () => {
    setError(null);
    setLoading(true);
    // 重新执行支付处理逻辑
    window.location.reload();
  };

  if (!isLoaded) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Processing Your Payment
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we confirm your subscription...
            </p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Payment Processing Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <Button onClick={retry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Link href="/subscription">
                <Button variant="outline" className="w-full">
                  Back to Subscription
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (paymentResult?.success) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Successful!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {paymentResult.message}
            </p>
            
            {paymentResult.membership && (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Membership Status
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Plan: <span className="font-medium text-green-600 dark:text-green-400 capitalize">
                    {paymentResult.membership.type}
                  </span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Expires: <span className="font-medium">
                    {new Date(paymentResult.membership.expiryDate).toLocaleDateString()}
                  </span>
                </p>
              </div>
            )}

            {paymentResult.pointsAdded && paymentResult.pointsAdded > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Points Added
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-lg font-bold">
                  +{paymentResult.pointsAdded} points
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Link href="/dashboard">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/subscription">
                <Button variant="outline" className="w-full">
                  View Subscription
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Payment Status Unknown
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't determine the status of your payment. Please contact support if you were charged.
          </p>
          <Link href="/subscription">
            <Button className="w-full">
              Back to Subscription
            </Button>
          </Link>
        </div>
      </div>
    </AuthGuard>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading payment status...</p>
          </div>
        </div>
      </AuthGuard>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}