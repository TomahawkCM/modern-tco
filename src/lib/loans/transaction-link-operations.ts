/**
 * Transaction-Loan Link Operations
 * Helper functions for linking bank transactions to loan payments
 */

import { db } from "@/lib/budget-db";
import type { Loan, LoanPayment, Transaction } from "@/types/budget";
import { getLoan, getLoanPayments, getActiveLoans } from "./loan-db";

/**
 * Calculate principal/interest split based on loan terms
 * Uses standard amortization calculation based on current balance
 */
export interface PaymentSplit {
  principal: number;
  interest: number;
  extra: number;
}

export function calculatePaymentSplit(
  loan: Loan,
  paymentAmount: number,
  _paymentDate: Date
): PaymentSplit {
  // Calculate monthly interest on current balance
  const monthlyRate = loan.interestRate / 100 / 12;
  const interestAmount = loan.currentBalance * monthlyRate;

  // Regular payment minus interest goes to principal
  const regularPrincipal = Math.min(loan.monthlyPayment - interestAmount, loan.currentBalance);

  // Anything above monthly payment is extra principal
  const extraPrincipal = Math.max(0, paymentAmount - loan.monthlyPayment);

  // If payment is less than monthly payment, adjust principal
  const actualPrincipal =
    paymentAmount <= loan.monthlyPayment
      ? Math.max(0, paymentAmount - interestAmount)
      : regularPrincipal;

  // Adjust interest if payment is less than interest due
  const actualInterest = paymentAmount <= interestAmount ? paymentAmount : interestAmount;

  return {
    principal: Math.round(actualPrincipal * 100) / 100,
    interest: Math.round(actualInterest * 100) / 100,
    extra: Math.round(extraPrincipal * 100) / 100,
  };
}

/**
 * Check if a transaction is already linked to any loan payment
 */
export async function isTransactionLinked(transactionId: string): Promise<boolean> {
  try {
    const payment = await db.loanPayments.where("transactionId").equals(transactionId).first();

    return !!payment;
  } catch (error) {
    console.error("Error checking transaction link:", error);
    return false;
  }
}

/**
 * Get loan info for a linked transaction
 * Returns null if transaction is not linked to any loan
 */
export interface LinkedLoanInfo {
  loan: Loan;
  payment: LoanPayment;
}

export async function getLinkedLoanForTransaction(
  transactionId: string
): Promise<LinkedLoanInfo | null> {
  try {
    const payment = await db.loanPayments.where("transactionId").equals(transactionId).first();

    if (!payment) {
      return null;
    }

    const loan = await getLoan(payment.loanId);

    if (!loan) {
      return null;
    }

    return { loan, payment };
  } catch (error) {
    console.error("Error getting linked loan:", error);
    return null;
  }
}

/**
 * Get all active loans that a transaction could be linked to
 * Filters to only show loans where the payment amount is reasonable
 */
export async function getSuggestedLoansForTransaction(transaction: Transaction): Promise<Loan[]> {
  try {
    // Only suggest loans for expenses
    if (transaction.amount >= 0) {
      return [];
    }

    const activeLoans = await getActiveLoans();
    const txAmount = Math.abs(transaction.amount);

    // Filter to loans where the payment amount is within reasonable range
    // Payment should be between 50% and 150% of monthly payment (to allow for extra payments)
    return activeLoans.filter((loan) => {
      const minAmount = loan.monthlyPayment * 0.5;
      const maxAmount = loan.monthlyPayment * 1.5;
      return txAmount >= minAmount && txAmount <= maxAmount;
    });
  } catch (error) {
    console.error("Error getting suggested loans:", error);
    return [];
  }
}

/**
 * Get all transactions that are linked to a specific loan
 */
export async function getLinkedTransactionsForLoan(loanId: string): Promise<Transaction[]> {
  try {
    const payments = await getLoanPayments(loanId);
    const linkedTransactionIds = payments
      .filter((p) => p.transactionId)
      .map((p) => p.transactionId as string);

    if (linkedTransactionIds.length === 0) {
      return [];
    }

    const transactions = await db.transactions.where("id").anyOf(linkedTransactionIds).toArray();

    return transactions;
  } catch (error) {
    console.error("Error getting linked transactions:", error);
    return [];
  }
}

/**
 * Check if a transaction matches a specific loan (for auto-detection)
 * Returns a confidence score 0-1
 */
export function getTransactionLoanMatchScore(transaction: Transaction, loan: Loan): number {
  let score = 0;
  const txAmount = Math.abs(transaction.amount);
  const description = (transaction.description || "").toLowerCase();
  const lender = loan.lender.toLowerCase();
  const loanName = loan.name.toLowerCase();

  // Amount match (0-0.4)
  const amountDiff = Math.abs(txAmount - loan.monthlyPayment);
  const amountDiffPercent = (amountDiff / loan.monthlyPayment) * 100;

  if (amountDiffPercent < 1) {
    score += 0.4; // Exact match
  } else if (amountDiffPercent < 5) {
    score += 0.3; // Very close
  } else if (amountDiffPercent < 10) {
    score += 0.2; // Close
  } else if (amountDiffPercent < 20) {
    score += 0.1; // Somewhat close
  }

  // Description match (0-0.35)
  if (description.includes(lender)) {
    score += 0.35; // Lender name match
  } else if (description.includes(loanName)) {
    score += 0.25; // Loan name match
  }

  // Keyword match (0-0.15)
  const loanKeywords = [
    "loan",
    "mortgage",
    "auto pay",
    "payment",
    "financing",
    "principal",
    "interest",
  ];
  const hasKeyword = loanKeywords.some((kw) => description.includes(kw));
  if (hasKeyword) {
    score += 0.15;
  }

  // Date proximity to next payment date (0-0.1)
  const txDate = new Date(transaction.date);
  const nextPayment = new Date(loan.nextPaymentDate);
  const daysDiff = Math.abs((txDate.getTime() - nextPayment.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 2) {
    score += 0.1;
  } else if (daysDiff <= 7) {
    score += 0.05;
  }

  return Math.min(1, score);
}

/**
 * Get confidence level based on match score
 */
export function getConfidenceLevel(score: number): "high" | "medium" | "low" {
  if (score >= 0.7) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}
