"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp } from "lucide-react";

interface BalanceCardProps {
  balance: number;
}

export default function BalanceCard({ balance }: BalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount / 100);
  };

  return (
    <Card className="border-2 overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Available Balance
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                {formatCurrency(balance)}
              </span>
              <span className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                USD
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-green-700 dark:text-green-300">
          <TrendingUp className="w-4 h-4" />
          <span className="font-medium">Ready to use</span>
        </div>
      </CardContent>
    </Card>
  );
}
