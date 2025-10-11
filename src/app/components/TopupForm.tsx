"use client";

import { useState, FormEvent, useEffect } from "react";
import { useStripe } from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import Toast from "./Toast";
import { getUser } from "@/lib/auth";

interface SavedCard {
  id: string;
  stripePaymentMethodId: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface TopupFormProps {
  onSuccess: () => void;
}

export default function TopupForm({ onSuccess }: TopupFormProps) {
  const stripe = useStripe();
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      const user = getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/saved-cards?email=${user.email}`);
        const data = await response.json();
        if (data.savedCards && data.savedCards.length > 0) {
          setSavedCards(data.savedCards);
          const defaultCard = data.savedCards.find(
            (c: SavedCard) => c.isDefault
          );
          if (defaultCard) {
            setSelectedCardId(defaultCard.id);
          } else {
            setSelectedCardId(data.savedCards[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching saved cards:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe) {
      return;
    }

    const amountInCents = Math.round(parseFloat(amount) * 100);

    if (isNaN(amountInCents) || amountInCents <= 0) {
      setToast({ message: "Please enter a valid amount", type: "error" });
      return;
    }

    if (!selectedCardId) {
      setToast({ message: "Please select a payment method", type: "error" });
      return;
    }

    setProcessing(true);
    setToast(null);

    try {
      const user = getUser();
      if (!user) {
        setToast({ message: "Please sign in to continue", type: "error" });
        setProcessing(false);
        return;
      }

      console.log("Creating payment intent for amount:", amountInCents);
      const response = await fetch("/api/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInCents, email: user.email }),
      });

      const { clientSecret, error } = await response.json();

      if (error) {
        console.error("Error from topup API:", error);
        setToast({ message: error, type: "error" });
        setProcessing(false);
        return;
      }

      console.log("Payment intent created, confirming payment...");

      const selectedCard = savedCards.find((c) => c.id === selectedCardId);
      if (!selectedCard) {
        setToast({ message: "Selected card not found", type: "error" });
        setProcessing(false);
        return;
      }

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: selectedCard.stripePaymentMethodId,
        });

      if (stripeError) {
        console.error("Stripe payment error:", stripeError);
        setToast({
          message: stripeError.message || "Payment failed",
          type: "error",
        });
      } else if (paymentIntent?.status === "succeeded") {
        console.log("Payment succeeded!", paymentIntent.id);
        const formattedAmount = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amountInCents / 100);
        setToast({
          message: `Success! ${formattedAmount} added to your wallet`,
          type: "success",
        });
        setAmount("");

        setTimeout(async () => {
          console.log("Auto-completing pending transactions...");
          try {
            await fetch("/api/auto-complete-pending", { method: "POST" });
          } catch (err) {
            console.log("Webhook will handle completion");
          }
          console.log("Refreshing balance and transactions...");
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      console.error("Unexpected error during payment:", error);
      setToast({
        message: "An error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getBrandColor = (brand: string) => {
    const colors: Record<string, string> = {
      visa: "from-blue-600 to-blue-800",
      mastercard: "from-red-600 to-orange-600",
      amex: "from-blue-700 to-blue-900",
      discover: "from-orange-500 to-orange-700",
      default: "from-gray-700 to-gray-900",
    };
    return colors[brand.toLowerCase()] || colors.default;
  };

  if (loading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <div className="h-7 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-lg animate-shimmer bg-[length:200%_100%]"></div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded animate-shimmer bg-[length:200%_100%]"></div>
            <div className="h-14 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-xl animate-shimmer bg-[length:200%_100%]"></div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-9 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-lg animate-shimmer bg-[length:200%_100%]"
                ></div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-4 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded animate-shimmer bg-[length:200%_100%]"></div>
            <div className="h-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-xl animate-shimmer bg-[length:200%_100%]"></div>
          </div>

          <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-xl animate-shimmer bg-[length:200%_100%]"></div>
        </CardContent>
      </Card>
    );
  }

  if (savedCards.length === 0) {
    return (
      <>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Payment Method Added
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Add a payment method to top up your wallet
            </p>
            <Link href="/cards">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </Link>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Top Up Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-base font-medium">
                Amount
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-gray-600 dark:text-gray-400">
                  $
                </span>
                <Input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  disabled={processing}
                  className="pl-10 text-2xl font-semibold h-14 border-2"
                />
              </div>
              <div className="flex gap-2 pt-2">
                {[10, 25, 50, 100].map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(amt.toString())}
                    disabled={processing}
                    className="flex-1 hover:border-green-600 hover:text-green-600"
                  >
                    ${amt}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Payment Method</Label>
                <Link href="/cards">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-green-600"
                  >
                    Manage Cards
                  </Button>
                </Link>
              </div>

              <div className="space-y-2">
                {savedCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setSelectedCardId(card.id)}
                    disabled={processing}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedCardId === card.id
                        ? "border-green-600 bg-green-50 dark:bg-green-950"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 ${getBrandColor(
                          card.brand
                        )}`}
                      >
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-white capitalize">
                            {card.brand}
                          </p>
                          {card.isDefault && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-lg font-mono text-gray-700 dark:text-gray-300">
                          •••• {card.last4}
                        </p>
                      </div>
                      {selectedCardId === card.id && (
                        <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={!stripe || processing || !amount || !selectedCardId}
              className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  Top Up ${amount || "0.00"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
