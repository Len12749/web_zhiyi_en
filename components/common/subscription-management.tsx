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
    name: 'Standard',
    price: {
      monthly: 10,
      yearly: 100
    },
    features: [
      '2,000 points monthly',
      'Premium user badge'
    ],
    color: 'blue'
  },
  {
    name: 'Premium',
    price: {
      monthly: 30,
      yearly: 300
    },
    features: [
      '10,000 points monthly',
      'Premium user badge'
    ],
    color: 'purple',
    recommended: true
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
          <div 
            key={plan.name}
            className={`p-4 rounded-lg border ${
              (isStandard && plan.name === 'Standard') || (isPremium && plan.name === 'Premium')
                ? 'border-yellow-400 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className={`font-medium text-${plan.color}-600 dark:text-${plan.color}-400`}>
                {plan.name}
              </h4>
              {((isStandard && plan.name === 'Standard') || (isPremium && plan.name === 'Premium')) && (
                <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                  Current Plan
                </span>
              )}
            </div>
            <p className="text-lg font-bold mb-2">
              ${plan.price.monthly}<span className="text-sm text-gray-500 dark:text-gray-400">/month</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              or ${plan.price.yearly}/year
            </p>
            <Button
              variant={(isStandard && plan.name === 'Standard') || (isPremium && plan.name === 'Premium') ? "outline" : "default"}
              size="sm"
              className="w-full"
              onClick={() => {
                setSelectedPlan(plan);
                setIsSubscriptionCardOpen(true);
              }}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {((isStandard && plan.name === 'Standard') || (isPremium && plan.name === 'Premium')) 
                ? 'Renew Subscription' 
                : 'Subscribe'}
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