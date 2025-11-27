"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export default function TransactionHistory({
  transactions,
}: TransactionHistoryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50";
      case "PENDING":
        return "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50";
      case "FAILED":
        return "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50";
      default:
        return "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/50";
    }
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-950/50">
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              No transactions yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-800 hover:bg-transparent">
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-3">
                    Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-3">
                    Type
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-3">
                    Amount
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-right py-3">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction, index) => (
                  <TableRow
                    key={transaction.id}
                    className={`border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors ${
                      index === transactions.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <TableCell className="text-gray-700 dark:text-gray-300 py-2.5">
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400 uppercase text-sm font-medium py-2.5">
                      {transaction.type}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-white font-semibold py-2.5">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right py-2.5">
                      <span
                        className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-md uppercase ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
