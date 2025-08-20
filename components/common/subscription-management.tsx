"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Crown } from 'lucide-react';
import { SubscriptionCard, SubscriptionPlan } from './subscription-card';

interface SubscriptionManagementProps {
  membershipType: string;
  membershipExpiry: Date | null;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    name: 'Basic',
    price: { monthly: 5, yearly: 50 },
    features: [
      '800 points monthly',
      'Points roll over within membership period'
    ],
    color: 'gray'
  },
  {
    name: 'Standard',
    price: { monthly: 10, yearly: 100 },
    features: [
      '2,000 points monthly',
      'Points roll over within membership period'
    ],
    color: 'blue'
  },
  {
    name: 'Premium',
    price: { monthly: 30, yearly: 300 },
    features: [
      '10,000 points monthly',
      'Points roll over within membership period'
    ],
    color: 'purple',
    recommended: true
  },
  {
    name: 'Add-on Pack',
    price: { monthly: 10, yearly: 10 },
    oneTime: true,
    oneTimePrice: 10,
    features: [
      '2,000 points one-time',
      'Purchasable only during active subscription'
    ],
    color: 'yellow'
  }
];

export function SubscriptionManagement({ membershipType, membershipExpiry }: SubscriptionManagementProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isSubscriptionCardOpen, setIsSubscriptionCardOpen] = useState(false);

  const isFree = membershipType === 'free';
  const isStandard = membershipType === 'standard';
  const isPremium = membershipType === 'premium';

  const currentPlan = isFree ? 'Free' : isStandard ? 'Standard' : 'Premium';
  const expiryDate = membershipExpiry ? new Date(membershipExpiry).toLocaleDateString() : 'None';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
          <Crown className="h-5 w-5 mr-2 text-yellow-500" />
          Subscription
        </h3>
      </div>

      {!isFree && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-blue-700 dark:text-blue-300">
                Current Plan: {currentPlan}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Expires: {expiryDate}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
              <Crown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subscriptionPlans.map((plan) => (
          <div key={plan.name} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
            <h4 className={`text-lg font-semibold mb-2 text-${plan.color}-600 dark:text-${plan.color}-400`}>{plan.name}</h4>
            <div className="mb-3">
              {plan.oneTime ? (
                <>
                  <div className="flex items-end space-x-1.5">
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white">${plan.oneTimePrice}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">/one-time</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 invisible" aria-hidden="true">
                    <span className="inline-flex items-center space-x-1">
                      <span className="text-base font-bold text-gray-900 dark:text-white">$300</span>
                      <span className="text-gray-500 dark:text-gray-400">/year</span>
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-end space-x-1.5">
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white">${plan.price.monthly}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">/month</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center space-x-1">
                      <span className="text-base font-bold text-gray-900 dark:text-white">${plan.price.yearly}</span>
                      <span className="text-gray-500 dark:text-gray-400">/year</span>
                    </span>
                  </p>
                </>
              )}
            </div>
            {/* 简化版：个人中心小卡片不展示功能列表 */}
            <div className="flex-1" />
            <Button size="sm" className={`mt-2 w-full ${plan.color === 'gray' ? 'bg-gray-500 hover:bg-gray-600' : plan.color === 'purple' ? 'bg-purple-500 hover:bg-purple-600' : plan.color === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              onClick={() => { setSelectedPlan(plan); setIsSubscriptionCardOpen(true); }}>
              <CreditCard className="h-3.5 w-3.5 mr-2" />Subscribe
            </Button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <SubscriptionCard
          plan={selectedPlan}
          isOpen={isSubscriptionCardOpen}
          onClose={() => setIsSubscriptionCardOpen(false)}
        />
      )}
    </div>
  );
}