"use client";

import { useState, FormEvent } from "react";
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import Toast from "./Toast";

interface AddCardModalProps {
  userEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCardModal({
  userEmail,
  onClose,
  onSuccess,
}: AddCardModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setToast(null);

    try {
      // Create setup intent
      const setupResponse = await fetch("/api/setup-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const { clientSecret, error: setupError } = await setupResponse.json();

      if (setupError) {
        setToast({ message: setupError, type: "error" });
        setProcessing(false);
        return;
      }

      // Confirm setup intent
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) {
        setToast({ message: "Card element not found", type: "error" });
        setProcessing(false);
        return;
      }

      const { error: confirmError, setupIntent } =
        await stripe.confirmCardSetup(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (confirmError) {
        setToast({
          message: confirmError.message || "Failed to add card",
          type: "error",
        });
        setProcessing(false);
        return;
      }

      if (setupIntent?.payment_method) {
        // Save card to database
        const saveResponse = await fetch("/api/saved-cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            paymentMethodId: setupIntent.payment_method,
          }),
        });

        if (saveResponse.ok) {
          onSuccess();
        } else {
          throw new Error("Failed to save card");
        }
      }
    } catch (error) {
      console.error("Error adding card:", error);
      setToast({
        message: "An error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <Card className="w-full max-w-lg border-2 shadow-2xl">
        <CardHeader className="border-b border-gray-100 dark:border-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Add Payment Method</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Securely add a new card to your wallet
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={processing}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card Number */}
            <div className="space-y-1.5">
              <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Card number
              </Label>
              <div className="rounded-md border border-gray-300 dark:border-gray-700 p-3 bg-white dark:bg-gray-950 focus-within:border-gray-900 dark:focus-within:border-gray-300 transition-colors">
                <CardNumberElement
                  options={{
                    style: {
                      base: {
                        fontSize: "15px",
                        color: "#111827",
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        "::placeholder": {
                          color: "#9CA3AF",
                        },
                      },
                      invalid: {
                        color: "#DC2626",
                      },
                    },
                    showIcon: true,
                  }}
                />
              </div>
            </div>

            {/* Expiry and CVC */}
            <div className="grid grid-cols-2 gap-3">
              {/* Expiry Date */}
              <div className="space-y-1.5">
                <Label htmlFor="cardExpiry" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Expiry
                </Label>
                <div className="rounded-md border border-gray-300 dark:border-gray-700 p-3 bg-white dark:bg-gray-950 focus-within:border-gray-900 dark:focus-within:border-gray-300 transition-colors">
                  <CardExpiryElement
                    options={{
                      style: {
                        base: {
                          fontSize: "15px",
                          color: "#111827",
                          fontFamily: "system-ui, -apple-system, sans-serif",
                          "::placeholder": {
                            color: "#9CA3AF",
                          },
                        },
                        invalid: {
                          color: "#DC2626",
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* CVC */}
              <div className="space-y-1.5">
                <Label htmlFor="cardCvc" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  CVC
                </Label>
                <div className="rounded-md border border-gray-300 dark:border-gray-700 p-3 bg-white dark:bg-gray-950 focus-within:border-gray-900 dark:focus-within:border-gray-300 transition-colors">
                  <CardCvcElement
                    options={{
                      style: {
                        base: {
                          fontSize: "15px",
                          color: "#111827",
                          fontFamily: "system-ui, -apple-system, sans-serif",
                          "::placeholder": {
                            color: "#9CA3AF",
                          },
                        },
                        invalid: {
                          color: "#DC2626",
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!stripe || processing}
                className="flex-1 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding...
                  </>
                ) : (
                  "Add card"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

