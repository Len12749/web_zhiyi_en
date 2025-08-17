"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface SubscriptionPlan {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
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
  
  const [isYearlyBilling, setIsYearlyBilling] = React.useState(yearlyBilling);
  
  const price = isYearlyBilling ? plan.price.yearly : plan.price.monthly;
  const period = isYearlyBilling ? '年' : '月';

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
            {plan.name}订阅
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            选择适合您的付款周期
          </p>
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          <button 
            onClick={() => setIsYearlyBilling(false)}
            className={`px-4 py-2 rounded-lg ${!isYearlyBilling ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            月付
          </button>
          <button 
            onClick={() => setIsYearlyBilling(true)}
            className={`px-4 py-2 rounded-lg ${isYearlyBilling ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            年付
            <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
              省16.7%
            </span>
          </button>
        </div>

        <div className="mb-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${price}<span className="text-lg text-gray-500 dark:text-gray-400">/{period}</span>
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">包含内容：</h4>
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
          className={`w-full bg-${plan.color}-500 hover:bg-${plan.color}-600 text-white py-3 px-4 rounded-lg transition-colors font-medium`}
        >
          确认订阅
        </Button>
      </div>
    </div>
  );
}