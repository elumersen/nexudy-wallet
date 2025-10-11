"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TransactionHistory from "../components/TransactionHistory";
import { getUser } from "@/lib/auth";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push("/signin");
      return;
    }

    setUser(currentUser);

    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          `/api/transactions?email=${encodeURIComponent(currentUser.email)}`
        );
        const data = await response.json();
        setTransactions(data.transactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-full lg:max-w-7xl mx-auto space-y-6">
          <div className="space-y-2">
            <div className="h-9 w-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-lg animate-shimmer bg-[length:200%_100%]"></div>
            <div className="h-5 w-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded animate-shimmer bg-[length:200%_100%]"></div>
          </div>

          <div className="border-2 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-900">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-full animate-shimmer bg-[length:200%_100%]"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded animate-shimmer bg-[length:200%_100%]"></div>
                      <div className="h-3 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded animate-shimmer bg-[length:200%_100%]"></div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-5 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded animate-shimmer bg-[length:200%_100%] ml-auto"></div>
                    <div className="h-4 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-full animate-shimmer bg-[length:200%_100%] ml-auto"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-full lg:max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Transaction History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all your wallet transactions
          </p>
        </div>

        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  );
}
