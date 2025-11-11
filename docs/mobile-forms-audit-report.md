# Mobile Forms Optimization Audit Report

**Date**: November 9, 2025
**Archon Task**: `be0b416c-ec50-4fba-b045-5f4779dbf189`
**Objective**: Improve mobile forms with native input types and validation

---

## Executive Summary

**Total Forms Audited**: 9 files (4 modals + 5 pages)
**Issues Found**: 21 number inputs missing `inputMode` attribute
**Well-Optimized**: 4 files already using best practices
**Priority**: HIGH - Mobile keyboard optimization significantly improves UX

---

## ✅ Well-Optimized Forms (No Changes Needed)

### 1. TransactionModal.tsx
**Status**: ✅ **EXCELLENT** - Already follows all best practices

**Good Patterns Found**:
- Amount field: `type="number"` + `inputMode="decimal"` + `step="0.01"` (line 348-358)
- Date field: `type="date"` for native date picker (line 364-370)
- Account select: Native `<select>` element (line 507-517)

**Example**:
```typescript
<input
  type="number"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  step="0.01"
  min="0"
  inputMode="decimal"  // ✅ PERFECT - Shows decimal keyboard on mobile
  className="..."
  required
/>
```

### 2. InvestmentAccountModal.tsx
**Status**: ✅ **CORRECT** - All text fields use appropriate types

**Fields**:
- Account name: `type="text"` ✅ (line 87-95)
- Institution: `type="text"` ✅ (line 129-136)
- Account number: `type="text"` ✅ (line 144-151)
- Account type: Native `<select>` ✅ (line 103-115)

### 3. Import Page
**Status**: ✅ **CORRECT** - Only text input for natural language

**Fields**:
- Natural language input: `type="text"` ✅ (line 473-477)

### 4. Categories Page
**Status**: ✅ **CORRECT** - All text fields

**Fields**:
- Category name: `type="text"` ✅ (line 176-180)
- Subcategories: `type="text"` ✅ (line 221-225)

---

## ⚠️ Forms Needing Optimization (21 Inputs)

### 1. HoldingModal.tsx (2 inputs)

**Issues**:
- **Line 192-202**: Quantity field missing `inputMode="decimal"`
- **Line 212-222**: Purchase price field missing `inputMode="decimal"`

**Current Code**:
```typescript
// Quantity field (NEEDS FIX)
<input
  id="quantity"
  type="number"
  step="0.0001"
  min="0"
  value={quantity}
  onChange={(e) => setQuantity(e.target.value)}
  placeholder="100"
  className="..."
  required
/>
// ❌ MISSING: inputMode="decimal"

// Purchase price field (NEEDS FIX)
<input
  id="purchase-price"
  type="number"
  step="0.01"
  min="0"
  value={purchasePrice}
  onChange={(e) => setPurchasePrice(e.target.value)}
  placeholder="50.00"
  className="..."
  required
/>
// ❌ MISSING: inputMode="decimal"
```

**Recommended Fix**:
```typescript
// Add to both inputs:
inputMode="decimal"
```

**Already Good**: Date field uses `type="date"` ✅ (line 231-238)

---

### 2. SplitTransactionModal.tsx (1 input)

**Issue**:
- **Line 258-269**: Amount field missing `inputMode="decimal"`

**Current Code**:
```typescript
<input
  id={`split-amount-${split.id}`}
  type="number"
  step="0.01"
  min="0"
  max={originalAmount}
  value={split.amount || ''}
  onChange={(e) => updateSplit(split.id, 'amount', parseFloat(e.target.value) || 0)}
  className="..."
  required
/>
// ❌ MISSING: inputMode="decimal"
```

**Recommended Fix**:
```typescript
inputMode="decimal"
```

---

### 3. Planning Future Page (3 inputs)

**Issues**:
- **Line 486**: Target amount missing `inputMode="decimal"`
- **Line 505**: Current savings missing `inputMode="decimal"`
- **Line 525**: Monthly contribution missing `inputMode="decimal"`

**Current Code**:
```typescript
// Target amount (NEEDS FIX)
<input
  type="number"
  value={targetAmount}
  onChange={(e) => setTargetAmount(e.target.value)}
  step="0.01"
  min="0"
  placeholder="0.00"
  className="..."
  required
/>
// ❌ MISSING: inputMode="decimal"
```

**Recommended Fix**:
```typescript
inputMode="decimal"  // Add to all 3 currency inputs
```

**Already Good**:
- Name field: `type="text"` ✅ (line 456)
- Target date: `type="date"` ✅ (line 541)

---

### 4. Settings Page (1 input)

**Issue**:
- **Line 466**: Account balance missing `inputMode="decimal"`

**Current Code**:
```typescript
<input
  type="number"
  value={balance}
  onChange={(e) => setBalance(e.target.value)}
  step="0.01"
  placeholder="0.00"
  className="..."
/>
// ❌ MISSING: inputMode="decimal"
```

**Recommended Fix**:
```typescript
inputMode="decimal"
```

**Already Good**:
- Account name: `type="text"` ✅
- Institution: `type="text"` ✅
- Category name: `type="text"` ✅
- Subcategories: `type="text"` ✅

---

### 5. Planning Retirement Page (14 inputs) 🚨 HIGHEST PRIORITY

**Currency Inputs (8 fields)** - Need `inputMode="decimal"`:
- **Line 349**: Current savings
- **Line 366**: Monthly contribution
- **Line 416**: Desired monthly income
- **Line 461**: Estimated CPP monthly
- **Line 490**: Estimated OAS monthly
- **Line 518**: RRSP balance
- **Line 535**: TFSA balance
- **Line 552**: Non-registered balance
- **Line 577**: Company shares
- **Line 610**: Stock options
- **Line 635**: Employer pension monthly

**Age Inputs (3 fields)** - Need `inputMode="numeric"`:
- **Line 318**: Current age
- **Line 332**: Retirement age
- **Line 431**: Life expectancy

**Percentage Inputs (3 fields)** - Need `inputMode="decimal"`:
- **Line 382**: Expected return (%)
- **Line 397**: Inflation rate (%)
- **Line 592**: Company shares growth rate (%)

**Current Code Pattern**:
```typescript
// Currency fields (NEED FIX)
<input
  type="number"
  value={currentSavings}
  onChange={(e) => setCurrentSavings(e.target.value)}
  step="1000"
  placeholder="0"
  className="..."
/>
// ❌ MISSING: inputMode="decimal"

// Age fields (NEED FIX)
<input
  type="number"
  value={currentAge}
  onChange={(e) => setCurrentAge(e.target.value)}
  min="18"
  max="120"
  placeholder="30"
  className="..."
/>
// ❌ MISSING: inputMode="numeric"

// Percentage fields (NEED FIX)
<input
  type="number"
  value={expectedReturn}
  onChange={(e) => setExpectedReturn(e.target.value)}
  step="0.1"
  min="0"
  max="20"
  placeholder="7.0"
  className="..."
/>
// ❌ MISSING: inputMode="decimal"
```

**Recommended Fix**:
```typescript
// For currency and percentage inputs:
inputMode="decimal"

// For age inputs (whole numbers):
inputMode="numeric"
```

---

## 📊 Summary of Changes Needed

| File | Missing inputMode | Input Type | Priority |
|------|-------------------|------------|----------|
| **HoldingModal.tsx** | 2 | Currency (decimal) | HIGH |
| **SplitTransactionModal.tsx** | 1 | Currency (decimal) | HIGH |
| **Planning Future page** | 3 | Currency (decimal) | HIGH |
| **Settings page** | 1 | Currency (decimal) | MEDIUM |
| **Planning Retirement page** | 11 currency<br>3 age<br>3 percentage | decimal<br>numeric<br>decimal | **CRITICAL** |
| **TOTAL** | **21 inputs** | - | - |

---

## 🎯 Implementation Plan

### Phase 1: Modal Components (HIGH Priority)
**Estimated Time**: 15 minutes

1. ✅ **HoldingModal.tsx** (2 inputs)
   - Add `inputMode="decimal"` to quantity field (line 192-202)
   - Add `inputMode="decimal"` to purchase price field (line 212-222)

2. ✅ **SplitTransactionModal.tsx** (1 input)
   - Add `inputMode="decimal"` to amount field (line 258-269)

### Phase 2: Planning Pages (CRITICAL Priority)
**Estimated Time**: 30 minutes

3. ✅ **Planning Future page** (3 inputs)
   - Add `inputMode="decimal"` to:
     - Target amount (line 486)
     - Current savings (line 505)
     - Monthly contribution (line 525)

4. ✅ **Planning Retirement page** (14 inputs)
   - Add `inputMode="decimal"` to 11 currency inputs
   - Add `inputMode="numeric"` to 3 age inputs
   - Add `inputMode="decimal"` to 3 percentage inputs

### Phase 3: Settings Page (MEDIUM Priority)
**Estimated Time**: 5 minutes

5. ✅ **Settings page** (1 input)
   - Add `inputMode="decimal"` to balance field (line 466)

---

## 📱 Mobile Keyboard Reference

### `inputMode="decimal"`
**Use For**: Currency, percentages, decimal numbers
**Keyboard Shows**: Numeric keypad with decimal point (. or ,)
**Example**: $45.67, 7.5%, 100.25

### `inputMode="numeric"`
**Use For**: Whole numbers, ages, quantities (no decimals)
**Keyboard Shows**: Numeric keypad (0-9) without decimal
**Example**: Age 30, Quantity 5

### `inputMode="tel"`
**Use For**: Phone numbers
**Keyboard Shows**: Phone keypad layout
**Example**: (555) 123-4567

### `inputMode="email"`
**Use For**: Email addresses
**Keyboard Shows**: QWERTY with @ and .com shortcuts
**Example**: user@example.com

---

## ✨ Expected UX Improvement

**Before**:
- Mobile users get full QWERTY keyboard for number inputs
- Must manually switch to numeric keyboard
- Slower data entry, more errors

**After**:
- Mobile users get appropriate numeric keyboard immediately
- Decimal keyboard for currency (shows . or ,)
- Numeric keyboard for ages (no decimal point)
- Faster data entry, fewer errors
- Professional mobile experience

---

## 🧪 Testing Recommendations

### Manual Testing (Required):
- [ ] iOS Safari: Test all number inputs show decimal keyboard
- [ ] Android Chrome: Test all number inputs show decimal keyboard
- [ ] iPad Safari: Test landscape and portrait modes
- [ ] Test all forms still validate correctly
- [ ] Verify step values still work (0.01, 0.1, etc.)

### Automated Testing (Recommended):
```typescript
// Example Playwright test
test('HoldingModal shows decimal keyboard for quantity', async ({ page }) => {
  await page.goto('/budget-app/investments');
  await page.click('[data-testid="add-holding"]');

  const quantityInput = await page.locator('#quantity');
  await expect(quantityInput).toHaveAttribute('inputMode', 'decimal');
});
```

---

## 📚 Additional Improvements (Future Consideration)

### Input Masks for Currency
Consider adding currency formatting libraries:
- **react-currency-input-field**: Auto-formats as user types
- **cleave.js**: Lightweight formatting library
- Example: User types "1234" → Displays "$12.34"

### Real-Time Validation
Add helpful error messages:
```typescript
{errors.amount && (
  <p className="text-sm text-red-600 mt-1">
    {errors.amount}
  </p>
)}
```

### Form Validation Examples:
- Amount must be greater than $0
- Date must be in the future
- Age must be between 18-120
- Percentage must be 0-100

---

## ✅ Success Criteria

- [x] Audit all forms complete (9 files)
- [ ] All 21 inputs have appropriate `inputMode` attributes
- [ ] Mobile testing on iOS and Android complete
- [ ] No regression in form validation
- [ ] All number inputs still accept proper step values
- [ ] Archon task marked as "done"

---

**Total Implementation Time**: ~50 minutes
**Files to Modify**: 5 files
**Total Inputs to Fix**: 21 inputs
**Expected Impact**: Significant mobile UX improvement

---

_Audit completed: November 9, 2025_
_Next step: Implement Phase 1 (Modal Components)_
