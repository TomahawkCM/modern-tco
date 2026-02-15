/**
 * Loan Database Operations
 * CRUD and query operations for loans and loan payments
 */

import { db } from "@/lib/budget-db";
import type { Loan, LoanPayment, LoanType, LoanStatus } from "@/types/budget";
import { calculateMonthlyPayment } from "./calculations";

// ========================================
// LOAN CRUD OPERATIONS
// ========================================

/**
 * Create a new loan
 */
export async function createLoan(
  loan: Omit<Loan, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const loanId = `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    // Calculate monthly payment if not provided
    const monthlyPayment =
      loan.monthlyPayment ||
      calculateMonthlyPayment(loan.originalPrincipal, loan.interestRate, loan.termMonths);

    const newLoan: Loan = {
      ...loan,
      id: loanId,
      monthlyPayment,
      currentBalance: loan.currentBalance || loan.originalPrincipal,
      totalPaid: loan.totalPaid || 0,
      totalInterestPaid: loan.totalInterestPaid || 0,
      extraPayments: loan.extraPayments || 0,
      status: loan.status || "active",
      createdAt: now,
      updatedAt: now,
    };

    await db.loans.add(newLoan);
    return loanId;
  } catch (error) {
    console.error("Error creating loan:", error);
    throw error;
  }
}

/**
 * Get all loans
 */
export async function getAllLoans(): Promise<Loan[]> {
  try {
    return await db.loans.toArray();
  } catch (error) {
    console.error("Error fetching loans:", error);
    return [];
  }
}

/**
 * Get a single loan by ID
 */
export async function getLoan(loanId: string): Promise<Loan | undefined> {
  try {
    return await db.loans.get(loanId);
  } catch (error) {
    console.error("Error fetching loan:", error);
    return undefined;
  }
}

/**
 * Get active loans only
 */
export async function getActiveLoans(): Promise<Loan[]> {
  try {
    return await db.loans.where("status").equals("active").toArray();
  } catch (error) {
    console.error("Error fetching active loans:", error);
    return [];
  }
}

/**
 * Get loans by type
 */
export async function getLoansByType(type: LoanType): Promise<Loan[]> {
  try {
    return await db.loans.where("type").equals(type).toArray();
  } catch (error) {
    console.error("Error fetching loans by type:", error);
    return [];
  }
}

/**
 * Get loans by status
 */
export async function getLoansByStatus(status: LoanStatus): Promise<Loan[]> {
  try {
    return await db.loans.where("status").equals(status).toArray();
  } catch (error) {
    console.error("Error fetching loans by status:", error);
    return [];
  }
}

/**
 * Update a loan
 */
export async function updateLoan(
  loanId: string,
  updates: Partial<Omit<Loan, "id" | "createdAt">>
): Promise<void> {
  try {
    await db.loans.update(loanId, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating loan:", error);
    throw error;
  }
}

/**
 * Delete a loan and all its payments
 */
export async function deleteLoan(loanId: string): Promise<void> {
  try {
    // Delete all payments for this loan
    await db.loanPayments.where("loanId").equals(loanId).delete();
    // Delete the loan
    await db.loans.delete(loanId);
  } catch (error) {
    console.error("Error deleting loan:", error);
    throw error;
  }
}

// ========================================
// LOAN PAYMENT OPERATIONS
// ========================================

/**
 * Record a loan payment
 */
export async function recordPayment(
  payment: Omit<LoanPayment, "id" | "createdAt">
): Promise<string> {
  try {
    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const newPayment: LoanPayment = {
      ...payment,
      id: paymentId,
      createdAt: now,
    };

    await db.loanPayments.add(newPayment);

    // Update loan with new balance and totals
    const loan = await db.loans.get(payment.loanId);
    if (loan) {
      await updateLoan(payment.loanId, {
        currentBalance: payment.balanceAfter,
        totalPaid: loan.totalPaid + payment.amount,
        totalInterestPaid: loan.totalInterestPaid + payment.interestAmount,
        extraPayments: loan.extraPayments + payment.extraPrincipal,
        nextPaymentDate: calculateNextPaymentDate(payment.date),
      });
    }

    return paymentId;
  } catch (error) {
    console.error("Error recording payment:", error);
    throw error;
  }
}

/**
 * Get all payments for a loan
 */
export async function getLoanPayments(loanId: string): Promise<LoanPayment[]> {
  try {
    return await db.loanPayments.where("loanId").equals(loanId).sortBy("date");
  } catch (error) {
    console.error("Error fetching loan payments:", error);
    return [];
  }
}

/**
 * Get a single payment by ID
 */
export async function getPayment(paymentId: string): Promise<LoanPayment | undefined> {
  try {
    return await db.loanPayments.get(paymentId);
  } catch (error) {
    console.error("Error fetching payment:", error);
    return undefined;
  }
}

/**
 * Update a payment
 */
export async function updatePayment(
  paymentId: string,
  updates: Partial<Omit<LoanPayment, "id" | "loanId" | "createdAt">>
): Promise<void> {
  try {
    await db.loanPayments.update(paymentId, updates);
  } catch (error) {
    console.error("Error updating payment:", error);
    throw error;
  }
}

/**
 * Delete a payment
 */
export async function deletePayment(paymentId: string): Promise<void> {
  try {
    await db.loanPayments.delete(paymentId);
  } catch (error) {
    console.error("Error deleting payment:", error);
    throw error;
  }
}

// ========================================
// ANALYTICS & CALCULATIONS
// ========================================

/**
 * Calculate total debt across all active loans
 */
export async function calculateTotalDebt(): Promise<number> {
  try {
    const activeLoans = await getActiveLoans();
    return activeLoans.reduce((sum, loan) => sum + loan.currentBalance, 0);
  } catch (error) {
    console.error("Error calculating total debt:", error);
    return 0;
  }
}

/**
 * Calculate total monthly obligations
 */
export async function calculateMonthlyObligations(): Promise<number> {
  try {
    const activeLoans = await getActiveLoans();
    return activeLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  } catch (error) {
    console.error("Error calculating monthly obligations:", error);
    return 0;
  }
}

/**
 * Get debt breakdown by loan type
 */
export interface DebtBreakdown {
  type: LoanType;
  totalBalance: number;
  monthlyPayment: number;
  count: number;
  avgInterestRate: number;
}

export async function getDebtBreakdown(): Promise<DebtBreakdown[]> {
  try {
    const activeLoans = await getActiveLoans();
    const types: LoanType[] = ["mortgage", "auto", "personal", "student"];

    return types
      .map((type) => {
        const loansOfType = activeLoans.filter((loan) => loan.type === type);

        if (loansOfType.length === 0) {
          return {
            type,
            totalBalance: 0,
            monthlyPayment: 0,
            count: 0,
            avgInterestRate: 0,
          };
        }

        const totalBalance = loansOfType.reduce((sum, loan) => sum + loan.currentBalance, 0);
        const monthlyPayment = loansOfType.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
        const avgInterestRate =
          loansOfType.reduce((sum, loan) => sum + loan.interestRate, 0) / loansOfType.length;

        return {
          type,
          totalBalance: Math.round(totalBalance * 100) / 100,
          monthlyPayment: Math.round(monthlyPayment * 100) / 100,
          count: loansOfType.length,
          avgInterestRate: Math.round(avgInterestRate * 100) / 100,
        };
      })
      .filter((breakdown) => breakdown.count > 0);
  } catch (error) {
    console.error("Error getting debt breakdown:", error);
    return [];
  }
}

/**
 * Get upcoming payments for the next N months
 */
export interface UpcomingPayment {
  loanId: string;
  loanName: string;
  date: Date;
  amount: number;
  type: LoanType;
}

export async function getUpcomingPayments(months: number = 3): Promise<UpcomingPayment[]> {
  try {
    const activeLoans = await getActiveLoans();
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + months);

    return activeLoans
      .filter((loan) => loan.nextPaymentDate >= today && loan.nextPaymentDate <= futureDate)
      .map((loan) => ({
        loanId: loan.id,
        loanName: loan.name,
        date: loan.nextPaymentDate,
        amount: loan.monthlyPayment,
        type: loan.type,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (error) {
    console.error("Error getting upcoming payments:", error);
    return [];
  }
}

/**
 * Calculate weighted average interest rate across all loans
 */
export async function getWeightedAverageRate(): Promise<number> {
  try {
    const activeLoans = await getActiveLoans();

    if (activeLoans.length === 0) return 0;

    const totalDebt = activeLoans.reduce((sum, loan) => sum + loan.currentBalance, 0);

    if (totalDebt === 0) return 0;

    const weightedSum = activeLoans.reduce((sum, loan) => {
      const weight = loan.currentBalance / totalDebt;
      return sum + loan.interestRate * weight;
    }, 0);

    return Math.round(weightedSum * 100) / 100;
  } catch (error) {
    console.error("Error calculating weighted average rate:", error);
    return 0;
  }
}

/**
 * Estimate debt-free date assuming regular payments
 */
export async function estimateDebtFreeDate(): Promise<Date | null> {
  try {
    const activeLoans = await getActiveLoans();

    if (activeLoans.length === 0) return null;

    // Find the loan with the latest payoff date
    const payoffDates = activeLoans.map((loan) => {
      const paymentsRemaining = Math.ceil(loan.currentBalance / loan.monthlyPayment);
      const payoffDate = new Date(loan.nextPaymentDate);
      payoffDate.setMonth(payoffDate.getMonth() + paymentsRemaining);
      return payoffDate;
    });

    return new Date(Math.max(...payoffDates.map((d) => d.getTime())));
  } catch (error) {
    console.error("Error estimating debt-free date:", error);
    return null;
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Calculate next payment date (1 month from given date)
 */
function calculateNextPaymentDate(currentDate: Date): Date {
  const nextDate = new Date(currentDate);
  nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate;
}

/**
 * Link a transaction to a loan payment
 */
export async function linkTransactionToPayment(
  paymentId: string,
  transactionId: string
): Promise<void> {
  try {
    await updatePayment(paymentId, { transactionId });
  } catch (error) {
    console.error("Error linking transaction to payment:", error);
    throw error;
  }
}

/**
 * Unlink a transaction from a loan payment
 */
export async function unlinkTransactionFromPayment(paymentId: string): Promise<void> {
  try {
    await updatePayment(paymentId, { transactionId: undefined });
  } catch (error) {
    console.error("Error unlinking transaction from payment:", error);
    throw error;
  }
}

// ========================================
// TRANSACTION LINKING OPERATIONS
// ========================================

/**
 * Get payment by transaction ID
 */
export async function getPaymentByTransactionId(
  transactionId: string
): Promise<LoanPayment | undefined> {
  try {
    return await db.loanPayments.where("transactionId").equals(transactionId).first();
  } catch (error) {
    console.error("Error getting payment by transaction ID:", error);
    return undefined;
  }
}

/**
 * Create a loan payment from a transaction
 * Auto-calculates principal/interest split based on loan terms
 */
export interface CreatePaymentFromTransactionOptions {
  extraPrincipal?: number;
  notes?: string;
  updateTransactionCategory?: boolean;
}

export async function createPaymentFromTransaction(
  loan: Loan,
  transaction: { id: string; amount: number; date: Date; description: string },
  options: CreatePaymentFromTransactionOptions = {}
): Promise<string> {
  try {
    const paymentAmount = Math.abs(transaction.amount);
    const { extraPrincipal = 0, notes, updateTransactionCategory = true } = options;

    // Calculate principal/interest split
    const monthlyRate = loan.interestRate / 100 / 12;
    const interestAmount = loan.currentBalance * monthlyRate;

    // Determine extra principal from payment exceeding monthly payment
    const paymentExtraPrincipal = Math.max(0, paymentAmount - loan.monthlyPayment);
    const totalExtraPrincipal = paymentExtraPrincipal + extraPrincipal;

    // Principal is payment minus interest (capped at remaining balance)
    const basePrincipal = Math.max(
      0,
      Math.min(paymentAmount - interestAmount - totalExtraPrincipal, loan.currentBalance)
    );

    const totalPrincipal = basePrincipal + totalExtraPrincipal;
    const newBalance = Math.max(0, loan.currentBalance - totalPrincipal);

    // Create the payment
    const paymentId = await recordPayment({
      loanId: loan.id,
      date: new Date(transaction.date),
      amount: paymentAmount,
      principalAmount: Math.round(basePrincipal * 100) / 100,
      interestAmount: Math.round(interestAmount * 100) / 100,
      extraPrincipal: Math.round(totalExtraPrincipal * 100) / 100,
      balanceAfter: Math.round(newBalance * 100) / 100,
      transactionId: transaction.id,
      notes: notes || `Linked from transaction: ${transaction.description}`,
      isScheduled: false,
    });

    // Optionally update transaction category
    if (updateTransactionCategory) {
      await db.transactions.update(transaction.id, {
        category: `Loan Payment - ${loan.name}`,
        updatedAt: new Date(),
      });
    }

    return paymentId;
  } catch (error) {
    console.error("Error creating payment from transaction:", error);
    throw error;
  }
}

/**
 * Unlink a payment from a transaction
 * Options for soft unlink (keep payment) or hard delete (remove payment)
 */
export interface UnlinkPaymentOptions {
  deletePayment?: boolean;
  resetTransactionCategory?: boolean;
}

export async function unlinkPayment(
  paymentId: string,
  options: UnlinkPaymentOptions = {}
): Promise<void> {
  try {
    const { deletePayment: shouldDelete = false, resetTransactionCategory = true } = options;

    const payment = await getPayment(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    // Reset transaction category if requested
    if (resetTransactionCategory && payment.transactionId) {
      await db.transactions.update(payment.transactionId, {
        category: null,
        updatedAt: new Date(),
      });
    }

    if (shouldDelete) {
      // Hard delete - remove payment entirely
      await deletePayment(paymentId);

      // Recalculate loan balance
      const loan = await getLoan(payment.loanId);
      if (loan) {
        const totalPrincipalRemoved = payment.principalAmount + payment.extraPrincipal;
        await updateLoan(payment.loanId, {
          currentBalance: loan.currentBalance + totalPrincipalRemoved,
          totalPaid: Math.max(0, loan.totalPaid - payment.amount),
          totalInterestPaid: Math.max(0, loan.totalInterestPaid - payment.interestAmount),
          extraPayments: Math.max(0, loan.extraPayments - payment.extraPrincipal),
        });
      }
    } else {
      // Soft unlink - just remove transaction reference
      await updatePayment(paymentId, { transactionId: undefined });
    }
  } catch (error) {
    console.error("Error unlinking payment:", error);
    throw error;
  }
}

/**
 * Get all payments with linked transactions for a loan
 */
export async function getLinkedPayments(loanId: string): Promise<LoanPayment[]> {
  try {
    const payments = await getLoanPayments(loanId);
    return payments.filter((p) => p.transactionId);
  } catch (error) {
    console.error("Error getting linked payments:", error);
    return [];
  }
}
