"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { makeApiRequest } from '@/lib/utils';
import { useUser } from '@/hooks/use-auth';

export interface SubscriptionPlan {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  // Add-on 一次性套餐支持（存在即视为一次性套餐，不展示月/年切换）
  oneTime?: boolean;
  oneTimePrice?: number;
  features: string[];
  color: string;
  recommended?: boolean;
}

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  isOpen: boolean;
  onClose: () => void;
  yearlyBilling?: boolean;
}

export function SubscriptionCard({ plan, isOpen, onClose, yearlyBilling = false }: SubscriptionCardProps) {
  if (!isOpen) return null;
  
  const { user } = useUser();
  const [isYearlyBilling, setIsYearlyBilling] = React.useState(yearlyBilling);
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const isOneTime = !!plan.oneTime;
  const price = isOneTime ? (plan.oneTimePrice || 0) : (isYearlyBilling ? plan.price.yearly : plan.price.monthly);
  const period = isOneTime ? 'one-time' : (isYearlyBilling ? 'year' : 'month');

  // 生成商品名称
  const generateProductName = (): string => {
    if (plan.name === 'Add-on Pack (Members Only)') {
      return 'Add-on Pack (Members Only)';
    }
    
    const suffix = isYearlyBilling ? '-year' : '-month';
    return plan.name + suffix;
  };

  // 处理购买
  const handlePurchase = async () => {
    if (!user) {
      alert('Please log in to purchase');
      return;
    }

    try {
      setIsProcessing(true);
      
      const productName = generateProductName();
      
      // 调用购买API
      const response = await makeApiRequest('/api/subscription/purchase', {
        method: 'POST',
        body: JSON.stringify({ productName })
      });

      if (response.success && (response.data as any)?.buyUrl) {
        // 跳转到Casdoor支付页面
        window.location.href = (response.data as any).buyUrl;
      } else {
        alert(response.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <h3 className={`text-2xl font-bold text-${plan.color}-600 dark:text-${plan.color}-400`}>
            {plan.name} Subscription
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Choose your preferred billing cycle
          </p>
        </div>

        {!isOneTime && (
          <div className="flex justify-center space-x-4 mb-6">
            <button 
              onClick={() => setIsYearlyBilling(false)}
              className={`px-4 py-2 rounded-lg ${!isYearlyBilling ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setIsYearlyBilling(true)}
              className={`px-4 py-2 rounded-lg ${isYearlyBilling ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                Save 16.7%
              </span>
            </button>
          </div>
        )}

        <div className="mb-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${price}<span className="text-lg text-gray-500 dark:text-gray-400">/{period}</span>
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Includes:</h4>
          <ul className="space-y-3">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                <div className={`w-5 h-5 rounded-full bg-${plan.color}-100 dark:bg-${plan.color}-900/20 flex items-center justify-center mr-3`}>
                  <svg className={`w-3 h-3 text-${plan.color}-500`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Button 
          className={`w-full bg-${plan.color}-500 hover:bg-${plan.color}-600 text-white py-3 px-4 rounded-lg transition-colors font-medium disabled:opacity-50`}
          disabled={isProcessing}
          onClick={handlePurchase}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
          ) : (
            isOneTime ? 'Confirm Purchase' : 'Confirm Subscription'
          )}
        </Button>
      </div>
    </div>
  );
}