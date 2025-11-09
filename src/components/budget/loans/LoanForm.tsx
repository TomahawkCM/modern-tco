/**
 * LoanForm Component
 * Multi-step form for adding or editing loans
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronRight, ChevronLeft, Home, Car, User, GraduationCap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { Loan, LoanType, PaymentFrequency } from '@/types/budget';
import { createLoan, updateLoan } from '@/lib/loans/loan-db';
import { calculateMonthlyPayment } from '@/lib/loans/calculations';
import { db } from '@/lib/budget-db';

interface LoanFormProps {
  loan?: Loan; // If editing existing loan
  onClose?: () => void;
}

export function LoanForm({ loan, onClose }: LoanFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);

  // Form state
  const [loanType, setLoanType] = useState<LoanType>(loan?.type || 'personal');
  const [name, setName] = useState(loan?.name || '');
  const [lender, setLender] = useState(loan?.lender || '');
  const [originalPrincipal, setOriginalPrincipal] = useState(loan?.originalPrincipal || 0);
  const [interestRate, setInterestRate] = useState(loan?.interestRate || 0);
  const [termMonths, setTermMonths] = useState(loan?.termMonths || 360);
  const [startDate, setStartDate] = useState(
    loan?.startDate ? new Date(loan.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [currentBalance, setCurrentBalance] = useState(loan?.currentBalance || 0);
  const [monthlyPayment, setMonthlyPayment] = useState(loan?.monthlyPayment || 0);
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>(loan?.paymentFrequency || 'monthly');
  const [nextPaymentDate, setNextPaymentDate] = useState(
    loan?.nextPaymentDate ? new Date(loan.nextPaymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [accountId, setAccountId] = useState(loan?.accountId || '');
  const [notes, setNotes] = useState(loan?.notes || '');

  // Mortgage-specific
  const [propertyTax, setPropertyTax] = useState(loan?.propertyTax || 0);
  const [homeInsurance, setHomeInsurance] = useState(loan?.homeInsurance || 0);
  const [pmi, setPmi] = useState(loan?.pmi || 0);

  // Auto-specific
  const [vehicleMake, setVehicleMake] = useState(loan?.vehicleMake || '');
  const [vehicleModel, setVehicleModel] = useState(loan?.vehicleModel || '');
  const [vehicleYear, setVehicleYear] = useState(loan?.vehicleYear || new Date().getFullYear());

  // Student-specific
  const [defermentEndDate, setDefermentEndDate] = useState(
    loan?.defermentEndDate ? new Date(loan.defermentEndDate).toISOString().split('T')[0] : ''
  );
  const [subsidized, setSubsidized] = useState(loan?.subsidized || false);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    // Auto-calculate monthly payment when principal, rate, or term changes
    if (originalPrincipal > 0 && interestRate > 0 && termMonths > 0 && !loan) {
      const calculatedPayment = calculateMonthlyPayment(originalPrincipal, interestRate, termMonths);
      setMonthlyPayment(calculatedPayment);
      setCurrentBalance(originalPrincipal); // Default current balance to original principal
    }
  }, [originalPrincipal, interestRate, termMonths, loan]);

  async function loadAccounts() {
    const allAccounts = await db.accounts.toArray();
    setAccounts(allAccounts.map(acc => ({ id: acc.id, name: acc.name })));
  }

  const loanTypes = [
    {
      type: 'mortgage' as LoanType,
      label: 'Mortgage',
      icon: Home,
      description: 'Home loans with principal and interest',
      color: 'bg-white border-gray-200 hover:bg-gray-50',
      iconColor: 'text-gray-700',
    },
    {
      type: 'auto' as LoanType,
      label: 'Auto Loan',
      icon: Car,
      description: 'Vehicle financing',
      color: 'bg-white border-gray-200 hover:bg-gray-50',
      iconColor: 'text-gray-700',
    },
    {
      type: 'personal' as LoanType,
      label: 'Personal Loan',
      icon: User,
      description: 'Unsecured personal loans',
      color: 'bg-white border-gray-200 hover:bg-gray-50',
      iconColor: 'text-gray-700',
    },
    {
      type: 'student' as LoanType,
      label: 'Student Loan',
      icon: GraduationCap,
      description: 'Education loans',
      color: 'bg-white border-gray-200 hover:bg-gray-50',
      iconColor: 'text-gray-700',
    },
  ];

  function validateStep(stepNumber: number): boolean {
    switch (stepNumber) {
      case 1:
        return !!loanType;
      case 2:
        return name.trim() !== '' && lender.trim() !== '' && originalPrincipal > 0 && interestRate > 0 && termMonths > 0;
      case 3:
        return currentBalance >= 0 && monthlyPayment > 0;
      default:
        return true;
    }
  }

  async function handleSubmit() {
    try {
      setLoading(true);

      const loanData: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        type: loanType,
        lender,
        originalPrincipal,
        interestRate,
        termMonths,
        startDate: new Date(startDate),
        currentBalance,
        monthlyPayment,
        paymentFrequency,
        nextPaymentDate: new Date(nextPaymentDate),
        status: 'active',
        totalPaid: loan?.totalPaid || 0,
        totalInterestPaid: loan?.totalInterestPaid || 0,
        extraPayments: loan?.extraPayments || 0,
        accountId: accountId || undefined,
        notes: notes || undefined,
        // Mortgage-specific
        propertyTax: loanType === 'mortgage' && propertyTax > 0 ? propertyTax : undefined,
        homeInsurance: loanType === 'mortgage' && homeInsurance > 0 ? homeInsurance : undefined,
        pmi: loanType === 'mortgage' && pmi > 0 ? pmi : undefined,
        // Auto-specific
        vehicleMake: loanType === 'auto' && vehicleMake ? vehicleMake : undefined,
        vehicleModel: loanType === 'auto' && vehicleModel ? vehicleModel : undefined,
        vehicleYear: loanType === 'auto' && vehicleYear ? vehicleYear : undefined,
        // Student-specific
        defermentEndDate: loanType === 'student' && defermentEndDate ? new Date(defermentEndDate) : undefined,
        subsidized: loanType === 'student' ? subsidized : undefined,
      };

      if (loan) {
        // Update existing loan
        await updateLoan(loan.id, loanData);
        router.push(`/budget-app/loans/${loan.id}`);
      } else {
        // Create new loan
        const loanId = await createLoan(loanData);
        router.push(`/budget-app/loans/${loanId}`);
      }

      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving loan:', error);
      alert('Failed to save loan. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Loan Type</h3>
              <p className="text-sm text-gray-600 mb-4">Choose the type of loan you want to track</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loanTypes.map(type => {
                const isSelected = loanType === type.type;
                return (
                  <Card
                    key={type.type}
                    className={`cursor-pointer transition-all relative ${
                      isSelected
                        ? 'ring-4 ring-teal-600 bg-teal-50 border-teal-600'
                        : `${type.color} hover:shadow-md`
                    }`}
                    onClick={() => setLoanType(type.type)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-gray-100 ${type.iconColor}`}>
                          <type.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{type.label}</h4>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 pointer-events-none">
                            <CheckCircle2 className="w-6 h-6 text-teal-600 fill-teal-100" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Loan Details</h3>
              <p className="text-sm text-gray-600 mb-4">Enter the basic information about your loan</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Loan Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Primary Mortgage, Car Loan"
                  required
                />
              </div>

              <div>
                <Label htmlFor="lender">Lender *</Label>
                <Input
                  id="lender"
                  value={lender}
                  onChange={e => setLender(e.target.value)}
                  placeholder="e.g., Wells Fargo, TD Bank"
                  required
                />
              </div>

              <div>
                <Label htmlFor="originalPrincipal">Original Loan Amount *</Label>
                <Input
                  id="originalPrincipal"
                  type="number"
                  value={originalPrincipal || ''}
                  onChange={e => setOriginalPrincipal(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label htmlFor="interestRate">Interest Rate (%) *</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={interestRate || ''}
                  onChange={e => setInterestRate(parseFloat(e.target.value) || 0)}
                  placeholder="3.5"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label htmlFor="termMonths">Loan Term (months) *</Label>
                <Input
                  id="termMonths"
                  type="number"
                  value={termMonths || ''}
                  onChange={e => setTermMonths(parseInt(e.target.value) || 0)}
                  placeholder="360 (30 years)"
                  min="1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {termMonths > 0 ? `${(termMonths / 12).toFixed(1)} years` : ''}
                </p>
              </div>

              <div>
                <Label htmlFor="startDate">Loan Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                />
              </div>

              {/* Type-specific fields */}
              {loanType === 'auto' && (
                <>
                  <div>
                    <Label htmlFor="vehicleMake">Vehicle Make</Label>
                    <Input
                      id="vehicleMake"
                      value={vehicleMake}
                      onChange={e => setVehicleMake(e.target.value)}
                      placeholder="e.g., Honda, Toyota"
                    />
                  </div>

                  <div>
                    <Label htmlFor="vehicleModel">Vehicle Model</Label>
                    <Input
                      id="vehicleModel"
                      value={vehicleModel}
                      onChange={e => setVehicleModel(e.target.value)}
                      placeholder="e.g., Civic, Camry"
                    />
                  </div>

                  <div>
                    <Label htmlFor="vehicleYear">Vehicle Year</Label>
                    <Input
                      id="vehicleYear"
                      type="number"
                      value={vehicleYear || ''}
                      onChange={e => setVehicleYear(parseInt(e.target.value) || new Date().getFullYear())}
                      placeholder={new Date().getFullYear().toString()}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
              <p className="text-sm text-gray-600 mb-4">Set up payment tracking</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentBalance">Current Balance *</Label>
                <Input
                  id="currentBalance"
                  type="number"
                  value={currentBalance || ''}
                  onChange={e => setCurrentBalance(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Original: ${originalPrincipal.toLocaleString()}
                </p>
              </div>

              <div>
                <Label htmlFor="paymentFrequency">Payment Frequency *</Label>
                <Select value={paymentFrequency} onValueChange={(value) => setPaymentFrequency(value as PaymentFrequency)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-Weekly (Every 2 weeks)</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  How often you make payments
                </p>
              </div>

              <div>
                <Label htmlFor="monthlyPayment">Payment Amount *</Label>
                <Input
                  id="monthlyPayment"
                  type="number"
                  value={monthlyPayment || ''}
                  onChange={e => setMonthlyPayment(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {paymentFrequency === 'weekly' && 'Weekly payment amount (P&I only)'}
                  {paymentFrequency === 'bi-weekly' && 'Bi-weekly payment amount (P&I only)'}
                  {paymentFrequency === 'monthly' && 'Monthly payment amount (P&I only)'}
                  {monthlyPayment > 0 && ` • Auto-calculated: $${monthlyPayment.toLocaleString()}`}
                </p>
              </div>

              <div>
                <Label htmlFor="nextPaymentDate">Next Payment Date *</Label>
                <Input
                  id="nextPaymentDate"
                  type="date"
                  value={nextPaymentDate}
                  onChange={e => setNextPaymentDate(e.target.value)}
                  required
                />
              </div>

              {/* Mortgage-specific */}
              {loanType === 'mortgage' && (
                <>
                  <div>
                    <Label htmlFor="propertyTax">Monthly Property Tax</Label>
                    <Input
                      id="propertyTax"
                      type="number"
                      value={propertyTax || ''}
                      onChange={e => setPropertyTax(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="homeInsurance">Monthly Home Insurance</Label>
                    <Input
                      id="homeInsurance"
                      type="number"
                      value={homeInsurance || ''}
                      onChange={e => setHomeInsurance(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pmi">Monthly PMI</Label>
                    <Input
                      id="pmi"
                      type="number"
                      value={pmi || ''}
                      onChange={e => setPmi(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </>
              )}

              {/* Student loan-specific */}
              {loanType === 'student' && (
                <>
                  <div>
                    <Label htmlFor="defermentEndDate">Deferment End Date</Label>
                    <Input
                      id="defermentEndDate"
                      type="date"
                      value={defermentEndDate}
                      onChange={e => setDefermentEndDate(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="subsidized"
                      checked={subsidized}
                      onChange={e => setSubsidized(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="subsidized" className="cursor-pointer">
                      Subsidized Loan (gov't pays interest during deferment)
                    </Label>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Optional Settings</h3>
              <p className="text-sm text-gray-600 mb-4">Additional loan configuration</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="accountId">Link to Account (for auto-payment tracking)</Label>
                <Select value={accountId || "none"} onValueChange={(value) => setAccountId(value === "none" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an account (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No account linked</SelectItem>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add any additional notes about this loan..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  const totalSteps = 4;
  const canGoNext = validateStep(step);

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className="flex items-center flex-1">
                <div
                  className={`h-2 rounded-full flex-1 ${
                    index < step ? 'bg-teal-600' : index === step - 1 ? 'bg-teal-400' : 'bg-gray-200'
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Step {step} of {totalSteps}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="min-h-[400px]">{renderStep()}</div>

      {/* Validation Feedback */}
      {!canGoNext && step < totalSteps && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            {step === 1 && '⚠️ Please select a loan type to continue'}
            {step === 2 && '⚠️ Please fill in all required fields (marked with *) to continue'}
            {step === 3 && '⚠️ Please verify payment information to continue'}
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={() => {
            if (step === 1) {
              if (onClose) onClose();
              else router.back();
            } else {
              setStep(step - 1);
            }
          }}
          disabled={loading}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        {step < totalSteps ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canGoNext || loading}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canGoNext || loading} className="bg-teal-600 hover:bg-teal-700">
            {loading ? 'Saving...' : loan ? 'Update Loan' : 'Create Loan'}
          </Button>
        )}
      </div>
    </div>
  );
}
