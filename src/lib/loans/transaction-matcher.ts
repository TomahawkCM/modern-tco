/**
 * Transaction Matcher for Loan Payments
 * Automatically detect and suggest transactions that may be loan payments
 */

import type { Transaction, Loan, LoanPayment } from '@/types/budget';
import { differenceInDays, isSameMonth } from 'date-fns';

export interface TransactionMatch {
  transaction: Transaction;
  loan: Loan;
  confidence: 'high' | 'medium' | 'low';
  matchReasons: string[];
  suggestedPrincipal: number;
  suggestedInterest: number;
  suggestedExtraPrincipal: number;
}

/**
 * Find transactions that potentially match loan payments
 */
export function findPotentialLoanPayments(
  transactions: Transaction[],
  loans: Loan[]
): TransactionMatch[] {
  const matches: TransactionMatch[] = [];
  const activeLoans = loans.filter(l => l.status === 'active');

  // Only consider expense transactions (negative amounts)
  const expenseTransactions = transactions.filter(
    tx => tx.amount < 0 && !tx.category?.startsWith('Loan Payment -') // Not already linked
  );

  for (const transaction of expenseTransactions) {
    for (const loan of activeLoans) {
      const match = scoreTransactionLoanMatch(transaction, loan);
      if (match) {
        matches.push(match);
      }
    }
  }

  // Sort by confidence and date
  return matches.sort((a, b) => {
    const confidenceScore = { high: 3, medium: 2, low: 1 };
    const scoreA = confidenceScore[a.confidence];
    const scoreB = confidenceScore[b.confidence];
    if (scoreA !== scoreB) return scoreB - scoreA;
    return new Date(b.transaction.date).getTime() - new Date(a.transaction.date).getTime();
  });
}

/**
 * Score how well a transaction matches a loan payment
 */
function scoreTransactionLoanMatch(
  transaction: Transaction,
  loan: Loan
): TransactionMatch | null {
  const matchReasons: string[] = [];
  let confidencePoints = 0;
  const txAmount = Math.abs(transaction.amount);
  const txDate = new Date(transaction.date);
  const nextPaymentDate = new Date(loan.nextPaymentDate);

  // 1. Check amount match (most important)
  const amountDiff = Math.abs(txAmount - loan.monthlyPayment);
  const amountDiffPercent = (amountDiff / loan.monthlyPayment) * 100;

  if (amountDiffPercent < 1) {
    // Exact match
    matchReasons.push('Exact amount match');
    confidencePoints += 40;
  } else if (amountDiffPercent < 5) {
    // Very close
    matchReasons.push('Very close amount match');
    confidencePoints += 30;
  } else if (amountDiffPercent < 10) {
    // Close (might include extra principal)
    matchReasons.push('Close amount match (possible extra payment)');
    confidencePoints += 20;
  } else if (txAmount < loan.monthlyPayment * 0.5) {
    // Too far off, likely not a match
    return null;
  }

  // 2. Check date proximity to next payment date
  const daysDiff = Math.abs(differenceInDays(txDate, nextPaymentDate));

  if (daysDiff <= 2) {
    matchReasons.push('Payment date matches');
    confidencePoints += 30;
  } else if (daysDiff <= 7) {
    matchReasons.push('Close to payment date');
    confidencePoints += 20;
  } else if (isSameMonth(txDate, nextPaymentDate)) {
    matchReasons.push('Same month as payment');
    confidencePoints += 10;
  }

  // 3. Check merchant/description match
  const description = (transaction.description || '').toLowerCase();
  const lenderLower = loan.lender.toLowerCase();
  const loanNameLower = loan.name.toLowerCase();

  if (description.includes(lenderLower)) {
    matchReasons.push(`Description contains "${loan.lender}"`);
    confidencePoints += 20;
  } else if (description.includes(loanNameLower)) {
    matchReasons.push(`Description contains "${loan.name}"`);
    confidencePoints += 15;
  }

  // Check for loan-related keywords
  const loanKeywords = ['loan', 'mortgage', 'auto pay', 'payment', 'financing'];
  const hasLoanKeyword = loanKeywords.some(keyword => description.includes(keyword));
  if (hasLoanKeyword) {
    matchReasons.push('Description contains loan keyword');
    confidencePoints += 10;
  }

  // 4. Minimum threshold to be considered a match
  if (confidencePoints < 30) {
    return null; // Not confident enough
  }

  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low';
  if (confidencePoints >= 70) {
    confidence = 'high';
  } else if (confidencePoints >= 50) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // Calculate suggested principal/interest split
  const extraPrincipal = Math.max(0, txAmount - loan.monthlyPayment);
  const monthlyRate = loan.interestRate / 100 / 12;
  const interestAmount = loan.currentBalance * monthlyRate;
  const principalAmount = loan.monthlyPayment - interestAmount;

  return {
    transaction,
    loan,
    confidence,
    matchReasons,
    suggestedPrincipal: Math.round(principalAmount * 100) / 100,
    suggestedInterest: Math.round(interestAmount * 100) / 100,
    suggestedExtraPrincipal: Math.round(extraPrincipal * 100) / 100,
  };
}

/**
 * Find unlinked transactions for a specific loan
 */
export function findUnlinkedTransactionsForLoan(
  transactions: Transaction[],
  loan: Loan
): TransactionMatch[] {
  const expenseTransactions = transactions.filter(
    tx => tx.amount < 0 && !tx.category?.startsWith('Loan Payment -')
  );

  const matches: TransactionMatch[] = [];
  for (const transaction of expenseTransactions) {
    const match = scoreTransactionLoanMatch(transaction, loan);
    if (match && match.confidence !== 'low') {
      matches.push(match);
    }
  }

  return matches.sort((a, b) =>
    new Date(b.transaction.date).getTime() - new Date(a.transaction.date).getTime()
  );
}
