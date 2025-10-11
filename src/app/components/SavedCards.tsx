"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Trash2, Check, Plus, Star, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import Toast from "./Toast";
import AddCardModal from "./AddCardModal";
import CardBrandLogo from "./CardBrandLogo";

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface SavedCardsProps {
  userEmail: string;
}

export default function SavedCards({ userEmail }: SavedCardsProps) {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);

  const fetchCards = async () => {
    try {
      const response = await fetch(`/api/saved-cards?email=${userEmail}`);
      const data = await response.json();
      setCards(data.savedCards || []);
    } catch (error) {
      console.error("Error fetching cards:", error);
      setToast({ message: "Failed to load cards", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchCards();
    }
  }, [userEmail]);

  const handleDelete = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this card?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/saved-cards?cardId=${cardId}&email=${userEmail}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setToast({ message: "Card deleted successfully", type: "success" });
        fetchCards();
      } else {
        throw new Error("Failed to delete card");
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      setToast({ message: "Failed to delete card", type: "error" });
    }
  };

  const handleSetDefault = async (cardId: string) => {
    try {
      const response = await fetch("/api/set-default-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, cardId }),
      });

      if (response.ok) {
        setToast({ message: "Default card updated", type: "success" });
        fetchCards();
      } else {
        throw new Error("Failed to set default card");
      }
    } catch (error) {
      console.error("Error setting default card:", error);
      setToast({ message: "Failed to set default card", type: "error" });
    }
  };

  const getBrandColor = (brand: string) => {
    const colors: Record<string, { gradient: string; overlay: string }> = {
      visa: {
        gradient: "from-slate-400/90 via-slate-300/80 to-slate-400/90",
        overlay:
          "bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20",
      },
      mastercard: {
        gradient: "from-slate-700/90 via-slate-600/80 to-slate-700/90",
        overlay:
          "bg-gradient-to-br from-red-500/20 via-transparent to-orange-500/20",
      },
      amex: {
        gradient: "from-slate-500/90 via-slate-400/80 to-slate-500/90",
        overlay:
          "bg-gradient-to-br from-blue-600/20 via-transparent to-indigo-600/20",
      },
      discover: {
        gradient: "from-slate-600/90 via-slate-500/80 to-slate-600/90",
        overlay:
          "bg-gradient-to-br from-orange-500/20 via-transparent to-amber-500/20",
      },
      default: {
        gradient: "from-slate-600/90 via-slate-500/80 to-slate-600/90",
        overlay:
          "bg-gradient-to-br from-gray-500/20 via-transparent to-gray-600/20",
      },
    };
    return colors[brand.toLowerCase()] || colors.default;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-lg animate-shimmer bg-[length:200%_100%]"></div>
            <div className="h-4 w-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded animate-shimmer bg-[length:200%_100%]"></div>
          </div>
          <div className="h-10 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-lg animate-shimmer bg-[length:200%_100%]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="relative aspect-[1.586/1] rounded-3xl overflow-hidden backdrop-blur-2xl border border-white/20 shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-400/50 via-slate-300/40 to-slate-400/50 dark:from-slate-700/50 dark:via-slate-600/40 dark:to-slate-700/50 animate-shimmer bg-[length:200%_100%]"></div>
            </div>
          ))}
        </div>
      </div>
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

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Payment Methods
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your saved cards for faster checkout
            </p>
          </div>
          <Button
            onClick={() => setShowAddCard(true)}
            className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </div>

        {cards.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <CreditCard className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No payment methods yet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
                Add a card to make payments faster and easier. Your card details
                are securely stored.
              </p>
              <Button
                onClick={() => setShowAddCard(true)}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Card
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => {
              const brandColors = getBrandColor(card.brand);
              return (
                <div key={card.id} className="relative group">
                  <div
                    className={cn(
                      "relative aspect-[1.586/1] rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]",
                      "backdrop-blur-2xl border border-white/20",
                      "p-7 text-white cursor-pointer"
                    )}
                    style={{
                      background: `linear-gradient(135deg, rgba(148, 163, 184, 0.9) 0%, rgba(100, 116, 139, 0.8) 50%, rgba(148, 163, 184, 0.9) 100%)`,
                    }}
                  >
                    <div
                      className={cn("absolute inset-0", brandColors.overlay)}
                    ></div>

                    <div className="absolute inset-0 backdrop-blur-sm bg-white/5"></div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <CardBrandLogo brand={card.brand} className="h-12" />
                        </div>
                        {card.isDefault && (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md border border-white/30">
                            <Star className="w-3 h-3 fill-white" />
                            DEFAULT
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-2xl md:text-[26px] font-light tracking-[0.25em] text-white/95">
                          •••• •••• •••• {card.last4}
                        </p>
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-white/60 mb-1">
                            Expires
                          </p>
                          <p className="text-sm font-medium text-white/90">
                            {card.expMonth.toString().padStart(2, "0")}/
                            {card.expYear.toString().slice(-2)}
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          <div className="w-9 h-7 rounded bg-gradient-to-br from-yellow-200/90 to-amber-300/90 shadow-sm flex items-center justify-center">
                            <div className="grid grid-cols-2 gap-[2px]">
                              <div className="w-1 h-1 rounded-full bg-yellow-700/30"></div>
                              <div className="w-1 h-1 rounded-full bg-yellow-700/30"></div>
                              <div className="w-1 h-1 rounded-full bg-yellow-700/30"></div>
                              <div className="w-1 h-1 rounded-full bg-yellow-700/30"></div>
                            </div>
                          </div>
                          <div className="w-7 h-7 flex items-center justify-center">
                            <Wifi className="w-4 h-4 rotate-90 text-white/80" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white blur-3xl"></div>
                      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white blur-3xl"></div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {!card.isDefault && (
                      <Button
                        onClick={() => handleSetDefault(card.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(card.id)}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950",
                        !card.isDefault ? "flex-1" : "w-full"
                      )}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddCard && (
        <AddCardModal
          userEmail={userEmail}
          onClose={() => setShowAddCard(false)}
          onSuccess={() => {
            setShowAddCard(false);
            fetchCards();
            setToast({ message: "Card added successfully", type: "success" });
          }}
        />
      )}
    </>
  );
}
