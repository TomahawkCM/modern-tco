/**
 * LoanForm Component
 * Multi-step form for adding or editing loans
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Home,
  Car,
  User,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { Loan, LoanType, PaymentFrequency } from "@/types/budget";
import { createLoan, updateLoan } from "@/lib/loans/loan-db";
import { calculateMonthlyPayment } from "@/lib/loans/calculations";
import { db } from "@/lib/budget-db";
import { useLocale, useTranslations } from "next-intl";
import type { SupportedLocale } from "@/i18n/config";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";

interface LoanFormProps {
  loan?: Loan; // If editing existing loan
  onClose?: () => void;
}

export function LoanForm({ loan, onClose }: LoanFormProps) {
  const router = useRouter();
  const t = useTranslations("loanForm");
  const currency = useDefaultCurrency();
  const locale = useLocale() as SupportedLocale;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);

  // Form state
  const [loanType, setLoanType] = useState<LoanType>(loan?.type || "personal");
  const [name, setName] = useState(loan?.name || "");
  const [lender, setLender] = useState(loan?.lender || "");
  const [originalPrincipal, setOriginalPrincipal] = useState(loan?.originalPrincipal || 0);
  const [interestRate, setInterestRate] = useState(loan?.interestRate || 0);
  const [termMonths, setTermMonths] = useState(loan?.termMonths || 360);
  const [startDate, setStartDate] = useState(
    loan?.startDate
      ? new Date(loan.startDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [currentBalance, setCurrentBalance] = useState(loan?.currentBalance || 0);
  const [monthlyPayment, setMonthlyPayment] = useState(loan?.monthlyPayment || 0);
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>(
    loan?.paymentFrequency || "monthly"
  );
  const [nextPaymentDate, setNextPaymentDate] = useState(
    loan?.nextPaymentDate
      ? new Date(loan.nextPaymentDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [accountId, setAccountId] = useState(loan?.accountId || "");
  const [notes, setNotes] = useState(loan?.notes || "");

  // Mortgage-specific
  const [propertyTax, setPropertyTax] = useState(loan?.propertyTax || 0);
  const [homeInsurance, setHomeInsurance] = useState(loan?.homeInsurance || 0);
  const [pmi, setPmi] = useState(loan?.pmi || 0);

  // Auto-specific
  const [vehicleMake, setVehicleMake] = useState(loan?.vehicleMake || "");
  const [vehicleModel, setVehicleModel] = useState(loan?.vehicleModel || "");
  const [vehicleYear, setVehicleYear] = useState(loan?.vehicleYear || new Date().getFullYear());

  // Student-specific
  const [defermentEndDate, setDefermentEndDate] = useState(
    loan?.defermentEndDate ? new Date(loan.defermentEndDate).toISOString().split("T")[0] : ""
  );
  const [subsidized, setSubsidized] = useState(loan?.subsidized || false);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    // Auto-calculate monthly payment when principal, rate, or term changes
    if (originalPrincipal > 0 && interestRate > 0 && termMonths > 0 && !loan) {
      const calculatedPayment = calculateMonthlyPayment(
        originalPrincipal,
        interestRate,
        termMonths
      );
      setMonthlyPayment(calculatedPayment);
      setCurrentBalance(originalPrincipal); // Default current balance to original principal
    }
  }, [originalPrincipal, interestRate, termMonths, loan]);

  async function loadAccounts() {
    const allAccounts = await db.accounts.toArray();
    setAccounts(allAccounts.map((acc) => ({ id: acc.id, name: acc.name })));
  }

  const loanTypes = [
    {
      type: "mortgage" as LoanType,
      label: t("types.mortgage"),
      icon: Home,
      description: t("types.mortgageDescription"),
      color: "bg-white border-gray-200 hover:bg-gray-50",
      iconColor: "text-gray-700",
    },
    {
      type: "auto" as LoanType,
      label: t("types.autoLoan"),
      icon: Car,
      description: t("types.autoLoanDescription"),
      color: "bg-white border-gray-200 hover:bg-gray-50",
      iconColor: "text-gray-700",
    },
    {
      type: "personal" as LoanType,
      label: t("types.personalLoan"),
      icon: User,
      description: t("types.personalLoanDescription"),
      color: "bg-white border-gray-200 hover:bg-gray-50",
      iconColor: "text-gray-700",
    },
    {
      type: "student" as LoanType,
      label: t("types.studentLoan"),
      icon: GraduationCap,
      description: t("types.studentLoanDescription"),
      color: "bg-white border-gray-200 hover:bg-gray-50",
      iconColor: "text-gray-700",
    },
  ];

  function validateStep(stepNumber: number): boolean {
    switch (stepNumber) {
      case 1:
        return !!loanType;
      case 2:
        return (
          name.trim() !== "" &&
          lender.trim() !== "" &&
          originalPrincipal > 0 &&
          interestRate > 0 &&
          termMonths > 0
        );
      case 3:
        return currentBalance >= 0 && monthlyPayment > 0;
      default:
        return true;
    }
  }

  async function handleSubmit() {
    try {
      setLoading(true);

      const loanData: Omit<Loan, "id" | "createdAt" | "updatedAt"> = {
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
        status: "active",
        totalPaid: loan?.totalPaid || 0,
        totalInterestPaid: loan?.totalInterestPaid || 0,
        extraPayments: loan?.extraPayments || 0,
        accountId: accountId || undefined,
        notes: notes || undefined,
        // Mortgage-specific
        propertyTax: loanType === "mortgage" && propertyTax > 0 ? propertyTax : undefined,
        homeInsurance: loanType === "mortgage" && homeInsurance > 0 ? homeInsurance : undefined,
        pmi: loanType === "mortgage" && pmi > 0 ? pmi : undefined,
        // Auto-specific
        vehicleMake: loanType === "auto" && vehicleMake ? vehicleMake : undefined,
        vehicleModel: loanType === "auto" && vehicleModel ? vehicleModel : undefined,
        vehicleYear: loanType === "auto" && vehicleYear ? vehicleYear : undefined,
        // Student-specific
        defermentEndDate:
          loanType === "student" && defermentEndDate ? new Date(defermentEndDate) : undefined,
        subsidized: loanType === "student" ? subsidized : undefined,
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
      console.error("Error saving loan:", error);
      alert(t("failedToSave"));
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
              <h3 className="mb-2 text-lg font-semibold">{t("selectLoanType")}</h3>
              <p className="mb-4 text-sm text-gray-600">{t("selectLoanTypeDescription")}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {loanTypes.map((type) => {
                const isSelected = loanType === type.type;
                return (
                  <Card
                    key={type.type}
                    className={`relative cursor-pointer transition-all ${
                      isSelected
                        ? "border-teal-600 bg-teal-50 ring-4 ring-teal-600"
                        : `${type.color} hover:shadow-md`
                    }`}
                    onClick={() => setLoanType(type.type)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-lg bg-gray-100 p-3 ${type.iconColor}`}>
                          <type.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="mb-1 font-semibold text-gray-900">{type.label}</h4>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                        {isSelected && (
                          <div className="pointer-events-none absolute end-3 top-3">
                            <CheckCircle2 className="h-6 w-6 fill-teal-100 text-teal-600" />
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
              <h3 className="mb-2 text-lg font-semibold">{t("loanDetails")}</h3>
              <p className="mb-4 text-sm text-gray-600">{t("loanDetailsDescription")}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="name">{t("loanName")} *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Primary Mortgage, Car Loan"
                  required
                />
              </div>

              <div>
                <Label htmlFor="lender">{t("lender")} *</Label>
                <Input
                  id="lender"
                  value={lender}
                  onChange={(e) => setLender(e.target.value)}
                  placeholder="e.g., Wells Fargo, TD Bank"
                  required
                />
              </div>

              <div>
                <Label htmlFor="originalPrincipal">{t("originalLoanAmount")} *</Label>
                <Input
                  id="originalPrincipal"
                  type="number"
                  value={originalPrincipal || ""}
                  onChange={(e) => setOriginalPrincipal(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label htmlFor="interestRate">{t("interestRate")} *</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={interestRate || ""}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  placeholder="3.5"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label htmlFor="termMonths">{t("loanTerm")} *</Label>
                <Input
                  id="termMonths"
                  type="number"
                  value={termMonths || ""}
                  onChange={(e) => setTermMonths(parseInt(e.target.value) || 0)}
                  placeholder="360 (30 years)"
                  min="1"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {termMonths > 0 ? `${(termMonths / 12).toFixed(1)} years` : ""}
                </p>
              </div>

              <div>
                <Label htmlFor="startDate">{t("loanStartDate")} *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              {/* Type-specific fields */}
              {loanType === "auto" && (
                <>
                  <div>
                    <Label htmlFor="vehicleMake">{t("vehicleMake")}</Label>
                    <Input
                      id="vehicleMake"
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      placeholder="e.g., Honda, Toyota"
                    />
                  </div>

                  <div>
                    <Label htmlFor="vehicleModel">{t("vehicleModel")}</Label>
                    <Input
                      id="vehicleModel"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g., Civic, Camry"
                    />
                  </div>

                  <div>
                    <Label htmlFor="vehicleYear">{t("vehicleYear")}</Label>
                    <Input
                      id="vehicleYear"
                      type="number"
                      value={vehicleYear || ""}
                      onChange={(e) =>
                        setVehicleYear(parseInt(e.target.value) || new Date().getFullYear())
                      }
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
              <h3 className="mb-2 text-lg font-semibold">{t("paymentInformation")}</h3>
              <p className="mb-4 text-sm text-gray-600">{t("paymentInformationDescription")}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="currentBalance">{t("currentBalance")} *</Label>
                <Input
                  id="currentBalance"
                  type="number"
                  value={currentBalance || ""}
                  onChange={(e) => setCurrentBalance(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Original: {formatCurrency(originalPrincipal, currency, locale)}
                </p>
              </div>

              <div>
                <Label htmlFor="paymentFrequency">{t("paymentFrequency")} *</Label>
                <Select
                  value={paymentFrequency}
                  onValueChange={(value) => setPaymentFrequency(value as PaymentFrequency)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectPaymentFrequency")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">{t("weekly")}</SelectItem>
                    <SelectItem value="bi-weekly">{t("biWeekly")}</SelectItem>
                    <SelectItem value="monthly">{t("monthly")}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-gray-500">{t("frequencyHint")}</p>
              </div>

              <div>
                <Label htmlFor="monthlyPayment">{t("paymentAmount")} *</Label>
                <Input
                  id="monthlyPayment"
                  type="number"
                  value={monthlyPayment || ""}
                  onChange={(e) => setMonthlyPayment(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {paymentFrequency === "weekly" && t("weeklyPaymentHint")}
                  {paymentFrequency === "bi-weekly" && t("biWeeklyPaymentHint")}
                  {paymentFrequency === "monthly" && t("monthlyPaymentHint")}
                  {monthlyPayment > 0 &&
                    ` • Auto-calculated: ${formatCurrency(monthlyPayment, currency, locale)}`}
                </p>
              </div>

              <div>
                <Label htmlFor="nextPaymentDate">{t("nextPaymentDate")} *</Label>
                <Input
                  id="nextPaymentDate"
                  type="date"
                  value={nextPaymentDate}
                  onChange={(e) => setNextPaymentDate(e.target.value)}
                  required
                />
              </div>

              {/* Mortgage-specific */}
              {loanType === "mortgage" && (
                <>
                  <div>
                    <Label htmlFor="propertyTax">{t("monthlyPropertyTax")}</Label>
                    <Input
                      id="propertyTax"
                      type="number"
                      value={propertyTax || ""}
                      onChange={(e) => setPropertyTax(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="homeInsurance">{t("monthlyHomeInsurance")}</Label>
                    <Input
                      id="homeInsurance"
                      type="number"
                      value={homeInsurance || ""}
                      onChange={(e) => setHomeInsurance(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pmi">{t("monthlyPMI")}</Label>
                    <Input
                      id="pmi"
                      type="number"
                      value={pmi || ""}
                      onChange={(e) => setPmi(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </>
              )}

              {/* Student loan-specific */}
              {loanType === "student" && (
                <>
                  <div>
                    <Label htmlFor="defermentEndDate">{t("defermentEndDate")}</Label>
                    <Input
                      id="defermentEndDate"
                      type="date"
                      value={defermentEndDate}
                      onChange={(e) => setDefermentEndDate(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="subsidized"
                      checked={subsidized}
                      onChange={(e) => setSubsidized(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="subsidized" className="cursor-pointer">
                      {t("subsidizedLoan")}
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
              <h3 className="mb-2 text-lg font-semibold">{t("optionalSettings")}</h3>
              <p className="mb-4 text-sm text-gray-600">{t("optionalSettingsDescription")}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="accountId">{t("linkToAccount")}</Label>
                <Select
                  value={accountId || "none"}
                  onValueChange={(value) => setAccountId(value === "none" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectAccountOptional")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("noAccountLinked")}</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">{t("notes")}</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
              <div key={index} className="flex flex-1 items-center">
                <div
                  className={`h-2 flex-1 rounded-full ${
                    index < step
                      ? "bg-teal-600"
                      : index === step - 1
                        ? "bg-teal-400"
                        : "bg-gray-200"
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500">{t("stepOf", { step, totalSteps })}</p>
        </div>
      </div>

      {/* Form Content */}
      <div className="min-h-[400px]">{renderStep()}</div>

      {/* Validation Feedback */}
      {!canGoNext && step < totalSteps && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-800">
            {step === 1 && t("validation.selectType")}
            {step === 2 && t("validation.fillRequired")}
            {step === 3 && t("validation.verifyPayment")}
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
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
          <ChevronLeft className="me-2 h-4 w-4" />
          {step === 1 ? t("cancel") : t("back")}
        </Button>

        {step < totalSteps ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canGoNext || loading}>
            {t("next")}
            <ChevronRight className="ms-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canGoNext || loading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {loading ? t("saving") : loan ? t("updateLoan") : t("createLoan")}
          </Button>
        )}
      </div>
    </div>
  );
}
