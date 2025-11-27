"use client";

import { useState } from "react";
import { User } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Mail, Wallet, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearUser } from "@/lib/auth";
import Toast from "./Toast";

interface ProfileModalProps {
  user: User;
  balance: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileModal({
  user,
  balance,
  open,
  onOpenChange,
}: ProfileModalProps) {
  const router = useRouter();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleLogout = () => {
    clearUser();
    onOpenChange(false);
    router.push("/signin");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    // Validation
    if (passwordData.newPassword.length < 6) {
      setToast({
        message: "New password must be at least 6 characters",
        type: "error",
      });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({
        message: "New passwords do not match",
        type: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setToast({
          message: data.error || "Failed to change password",
          type: "error",
        });
        setLoading(false);
        return;
      }

      setToast({
        message: "Password changed successfully!",
        type: "success",
      });

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowChangePassword(false);

      setTimeout(() => {
        setToast(null);
      }, 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      setToast({
        message: "An error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            <DialogTitle className="text-2xl">Profile</DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Manage your account settings and preferences
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6">
            {/* User Avatar and Info */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-green-100 dark:ring-green-900/30">
                {getInitials(user.fullname)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {user.fullname}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-100 dark:border-green-800/50 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-600 dark:bg-green-700 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Account Balance
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {formatCurrency(balance)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Email Address
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-800">
              {!showChangePassword ? (
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 hover:border-green-300 dark:hover:border-green-700 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Change Password
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Update your account password
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
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
                </button>
              ) : (
                <form
                  onSubmit={handlePasswordChange}
                  className="space-y-4 p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-2 border-gray-200 dark:border-gray-800 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-600 dark:bg-green-700 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">
                        Change Password
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowChangePassword(false);
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium px-3 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type={showPasswords.current ? "text" : "password"}
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder="Enter current password"
                        required
                        disabled={loading}
                        className="pl-10 pr-10 h-10 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type={showPasswords.new ? "text" : "password"}
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="Enter new password"
                        required
                        minLength={6}
                        disabled={loading}
                        className="pl-10 pr-10 h-10 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new,
                          })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type={showPasswords.confirm ? "text" : "password"}
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                        disabled={loading}
                        className="pl-10 pr-10 h-10 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm,
                          })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Changing...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-800 font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
