"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import BalanceCard from "./BalanceCard";
import TopupForm from "./TopupForm";
import TransactionHistory from "./TransactionHistory";
import { getUser, clearUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function WalletDashboard() {
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchBalance = async (userEmail: string) => {
    try {
      const response = await fetch(
        `/api/balance?email=${encodeURIComponent(userEmail)}`
      );
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchTransactions = async (userEmail: string) => {
    try {
      const response = await fetch(
        `/api/transactions?email=${encodeURIComponent(userEmail)}`
      );
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push("/signin");
      return;
    }

    setUser(currentUser);

    const loadData = async () => {
      await Promise.all([
        fetchBalance(currentUser.email),
        fetchTransactions(currentUser.email),
      ]);
      setLoading(false);
    };
    loadData();
  }, [router]);

  const handleTopupSuccess = () => {
    if (user) {
      fetchBalance(user.email);
      fetchTransactions(user.email);
    }
  };

  const handleLogout = () => {
    clearUser();
    router.push("/signin");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            Loading your wallet...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-full lg:max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Welcome back, {user.fullname}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's your wallet overview
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-2">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <BalanceCard balance={balance} />
          </div>

          <div className="lg:col-span-2">
            <Elements stripe={stripePromise}>
              <TopupForm onSuccess={handleTopupSuccess} />
            </Elements>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <a
              href="/transactions"
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium flex items-center gap-1"
            >
              View All
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
          <TransactionHistory transactions={transactions.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
}
