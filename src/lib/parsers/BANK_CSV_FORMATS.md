# Bank CSV Format Reference Guide

## Overview
This document provides detailed specifications for CSV export formats from 15+ major Canadian and American banks. Use this as a reference when configuring the CSV parser or troubleshooting import issues.

---

## Canadian Banks

### 1. BMO (Bank of Montreal) ✅ IMPLEMENTED
**Status**: Fully implemented and tested

| Field | Value |
|-------|-------|
| Date Column | `Date Posted` |
| Description Column | `Description` |
| Amount Column | `Transaction Amount` |
| Date Format | `yyyyMMdd` (e.g., 20250106) |
| Amount Sign | Negative for expenses, positive for income |
| Header Rows | 3 rows before column headers |
| Quirks | BMO prefixes transactions with `[PR]`, `[OP]` codes |

**Sample Headers**:
```
Date Posted,Description,Transaction Amount,Transaction Type
```

---

### 2. Home Trust ✅ IMPLEMENTED
**Status**: Fully implemented and tested

| Field | Value |
|-------|-------|
| Date Column | `Date` |
| Description Column | `Details` |
| Amount Column | `Debit/Credit` |
| Date Format | `yyyy-MM-dd` (e.g., 2025-01-06) |
| Amount Sign | Single column with sign |
| Header Rows | 0 |
| Quirks | Simple format, clean descriptions |

**Sample Headers**:
```
Date,Details,Debit/Credit
```

---

### 3. TD Canada Trust 🔄 NEEDS VERIFICATION
**Status**: Format identified from bank2ynab project

| Field | Value |
|-------|-------|
| Date Column | `Date` |
| Description Column | `Payee` or `Description` |
| Amount Columns | `Outflow` and `Inflow` (separate columns) |
| Date Format | `MM/dd/yyyy` (e.g., 01/06/2025) |
| Amount Sign | Positive in respective columns |
| Header Rows | 0-1 |
| Filename Pattern | `accountactivity*.csv` |
| Quirks | Uses separate inflow/outflow columns |

**Sample Headers**:
```
Date,Payee,Outflow,Inflow
```

---

### 4. RBC (Royal Bank of Canada) 🔄 NEEDS VERIFICATION
**Status**: Research complete, format estimated

| Field | Value |
|-------|-------|
| Date Column | `Transaction Date` or `Date` |
| Description Column | `Description` or `Description 1` |
| Amount Columns | `Debit` and `Credit` (separate) OR single `Amount` |
| Date Format | `MM/dd/yyyy` or `yyyy-MM-dd` |
| Amount Sign | Varies by account type |
| Header Rows | 0-2 |
| Export Limit | 90-180 days from online banking |
| Quirks | May include `Description 2` for additional details |

**Sample Headers** (Variant 1):
```
Transaction Date,Description 1,Description 2,Debit,Credit
```

**Sample Headers** (Variant 2):
```
Date,Description,Amount
```

---

### 5. Scotiabank 🔄 NEEDS VERIFICATION
**Status**: Export functionality documented, format details TBD

| Field | Value |
|-------|-------|
| Date Column | `Date` or `Transaction Date` |
| Description Column | `Description` or `Details` |
| Amount Column | `Amount` or separate `Debit`/`Credit` |
| Date Format | `MM/dd/yyyy` or `yyyy-MM-dd` |
| Amount Sign | Configurable in export template |
| Header Rows | 0-1 (optional, user-configured) |
| Export Options | CSV, Tab-separated, Fixed-width, Excel |
| Quirks | **Highly customizable** - users can define column order, field formats, filters |

**Notes**:
- Scotiabank has the most flexible export system via ScotiaConnect
- Supports custom export templates with user-defined column orders
- Can filter by transaction type (All, Debit, Credit, Cheques, Deposits, etc.)
- Supports Canada, USA, and Global (SWIFT) account types

**Sample Headers** (Default):
```
Date,Description,Debit,Credit,Balance
```

---

### 6. CIBC (Canadian Imperial Bank of Commerce) 🔄 NEEDS VERIFICATION
**Status**: CSV support confirmed, format details pending

| Field | Value |
|-------|-------|
| Date Column | `Date` or `Transaction Date` |
| Description Column | `Description` |
| Amount Column | `Amount` or separate `Withdrawals`/`Deposits` |
| Date Format | Likely `MM/dd/yyyy` or `yyyy-MM-dd` |
| Amount Sign | TBD |
| Header Rows | 0-1 |
| Quirks | TBD - needs sample CSV |

**Sample Headers** (Estimated):
```
Date,Description,Withdrawals,Deposits,Balance
```

---

### 7. Tangerine 🔄 NEEDS VERIFICATION
**Status**: Export formats confirmed (CSV, QFX, Excel)

| Field | Value |
|-------|-------|
| Date Column | `Date` or `Transaction Date` |
| Description Column | `Name` or `Description` |
| Amount Column | `Amount` |
| Date Format | Likely `yyyy-MM-dd` |
| Amount Sign | Negative for expenses, positive for income |
| Header Rows | 0-1 |
| Export Formats | QFX (Quicken), Microsoft Money, Excel CSV |
| Access | Transactions > Download Transactions |
| Quirks | Modern interface, clean format |

**Sample Headers** (Estimated):
```
Date,Name,Amount,Balance
```

---

### 8. Simplii Financial 🔄 NEEDS VERIFICATION
**Status**: CSV export confirmed, format details pending

| Field | Value |
|-------|-------|
| Date Column | `Date` or `Transaction Date` |
| Description Column | `Description` |
| Amount Column | `Amount` or `Debit`/`Credit` |
| Date Format | Likely `yyyy-MM-dd` or `MM/dd/yyyy` |
| Amount Sign | TBD |
| Header Rows | 0-1 |
| Export Formats | CSV, Quicken (QFX) |
| Access | Website only (not mobile app) |
| Quirks | CIBC subsidiary - may use similar format |

**Sample Headers** (Estimated):
```
Date,Description,Amount,Balance
```

---

## American Banks

### 9. Bank of America 🔄 NEEDS VERIFICATION
**Status**: Format identified from bank2ynab project

| Field | Value |
|-------|-------|
| Date Column | `Date` or `Posted Date` |
| Description Column | `Description` or `Payee` |
| Amount Column | `Amount` (single column with sign) |
| Date Format | `MM/dd/yyyy` (e.g., 01/06/2025) |
| Amount Sign | Negative for expenses, positive for income |
| Header Rows | 7 rows before column headers |
| Filename Pattern | `stmt*.csv` or `stmt-<number>.csv` |
| Quirks | Many header rows with account info |

**Sample Headers**:
```
Posted Date,Reference Number,Payee,Address,Amount
```

---

### 10. Chase Bank 🔄 NEEDS VERIFICATION
**Status**: CSV export confirmed (commercial banking)

| Field | Value |
|-------|-------|
| Date Column | `Posting Date` or `Transaction Date` |
| Description Column | `Description` or `Details` |
| Amount Column | `Amount` (single column) |
| Date Format | `MM/dd/yyyy` |
| Amount Sign | Negative for debits, positive for credits |
| Header Rows | 0-1 |
| Export Formats | CSV, QuickBooks, Quicken |
| Access | Chase Commercial Online for business |
| Quirks | Personal banking may have limited CSV access |

**Sample Headers** (Credit Card - 2017):
```
Transaction Date,Post Date,Description,Category,Type,Amount
```

**Sample Headers** (Checking):
```
Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #
```

---

### 11. Wells Fargo ❌ NO DATA
**Status**: Research incomplete

| Field | Value |
|-------|-------|
| Date Column | Unknown - likely `Date` or `Transaction Date` |
| Description Column | Unknown - likely `Description` |
| Amount Column | Unknown |
| Date Format | Likely `MM/dd/yyyy` |
| Amount Sign | TBD |
| Header Rows | Unknown |
| Quirks | **Needs research** - not in bank2ynab config |

**Notes**: Wells Fargo likely supports CSV export via online banking, but specific format requires verification.

---

### 12. Citibank ❌ NO DATA
**Status**: Research incomplete

| Field | Value |
|-------|-------|
| Date Column | Unknown - likely `Date` |
| Description Column | Unknown - likely `Description` |
| Amount Column | Unknown |
| Date Format | Likely `MM/dd/yyyy` |
| Amount Sign | TBD |
| Header Rows | Unknown |
| Quirks | **Needs research** - not found in searches |

---

### 13. Capital One 🔄 NEEDS VERIFICATION
**Status**: Format details identified

| Field | Value |
|-------|-------|
| Date Column | `Transaction Date` |
| Description Column | `Description` |
| Amount Column | `Amount` (single column for all transactions) |
| Additional Columns | `Account Number`, `Balance`, `Transaction Type` |
| Date Format | Likely `MM/dd/yyyy` |
| Amount Sign | Single column - both debits and credits |
| Header Rows | 0-1 |
| Export Limit | 90 days |
| Access | Website only (not mobile) |
| Export Formats | CSV, QFX (Quicken), QuickBooks, BAI (business) |
| Quirks | Single amount column (not split debit/credit) |

**Sample Headers**:
```
Transaction Date,Posted Date,Card No.,Description,Category,Debit,Credit
```

**Alternative Format**:
```
Transaction Date,Description,Amount,Balance
```

---

### 14. US Bank ❌ NO DATA
**Status**: Research incomplete

| Field | Value |
|-------|-------|
| Date Column | Unknown - likely `Date` or `Trans Date` |
| Description Column | Unknown - likely `Description` |
| Amount Column | Unknown |
| Date Format | Likely `MM/dd/yyyy` |
| Amount Sign | TBD |
| Header Rows | Unknown |
| Quirks | **Needs research** - not documented |

---

## Common Patterns Across Banks

### Date Formats
| Format | Example | Banks Using |
|--------|---------|-------------|
| `yyyyMMdd` | 20250106 | BMO |
| `yyyy-MM-dd` | 2025-01-06 | Home Trust, Tangerine (likely) |
| `MM/dd/yyyy` | 01/06/2025 | TD, BofA, Chase, Capital One |
| `dd/MM/yyyy` | 06/01/2025 | Some international banks |

### Amount Column Styles
1. **Single Column with Sign**: BMO, Home Trust, Tangerine, BofA, Capital One
   - Negative = Expense
   - Positive = Income

2. **Separate Inflow/Outflow**: TD Canada Trust
   - `Outflow` column for expenses
   - `Inflow` column for income

3. **Separate Debit/Credit**: RBC, Scotiabank, CIBC (likely)
   - `Debit` or `Withdrawals` for expenses
   - `Credit` or `Deposits` for income

### Header Row Patterns
- **0-1 rows**: Most Canadian banks, Chase, Capital One
- **3 rows**: BMO (account info before headers)
- **7 rows**: Bank of America (extensive account details)

---

## Auto-Detection Strategy

### Priority 1: Unique Patterns
- **BMO**: Look for `Date Posted`, `Transaction Amount`
- **BofA**: 7+ header rows
- **TD**: `Outflow` and `Inflow` columns
- **Chase**: `Posting Date` + `Details`

### Priority 2: Column Name Matching
```typescript
// Example detection logic
if (headers.includes('Date Posted') && headers.includes('Transaction Amount')) {
  return 'bmo';
}
if (headers.includes('Outflow') && headers.includes('Inflow')) {
  return 'td';
}
if (headers.includes('Debit/Credit')) {
  return 'homeTrust';
}
```

### Priority 3: Filename Patterns
- `accountactivity*.csv` → TD
- `stmt*.csv` → Bank of America
- `bk_download*.csv` → USAA

---

## Implementation Checklist

### Phase 1: Core Banks (Completed)
- [x] BMO
- [x] Home Trust

### Phase 2: High Priority (Next Sprint)
- [ ] TD Canada Trust (format known)
- [ ] Bank of America (format known)
- [ ] Chase (research complete)
- [ ] Capital One (format known)

### Phase 3: Medium Priority
- [ ] RBC (format estimated)
- [ ] Scotiabank (flexible format)
- [ ] Tangerine (format estimated)
- [ ] Simplii (format estimated)

### Phase 4: Needs Research
- [ ] CIBC (basic info only)
- [ ] Wells Fargo (no data)
- [ ] Citibank (no data)
- [ ] US Bank (no data)

---

## Testing Strategy

### Required Test Cases per Bank
1. **Sample CSV Files**: Obtain real or realistic samples
2. **Date Parsing**: Test all date format variants
3. **Amount Parsing**: Test negative, positive, and currency symbols
4. **Duplicate Detection**: Test with overlapping imports
5. **Edge Cases**:
   - Empty rows
   - Special characters in descriptions
   - Very large/small amounts
   - Transactions on same day

### Verification Checklist
- [ ] Dates parse correctly
- [ ] Amounts have correct sign (income vs expense)
- [ ] Descriptions are clean (no extra whitespace, codes removed)
- [ ] Duplicate detection works
- [ ] Merchant name extraction accurate
- [ ] No transactions skipped
- [ ] Balance calculations correct (if applicable)

---

## Resources

### Research Sources
1. **bank2ynab Project**: https://github.com/bank2ynab/bank2ynab
2. **YNAB CSV Format**: Date, Payee, Memo, Amount
3. **Mint CSV Format**: Date, Description, Original Description, Amount, Transaction Type, Category
4. **ScotiaConnect Documentation**: Custom export templates
5. **Capital One Support**: 90-day export limit
6. **Tangerine FAQ**: Download in QFX, Money, CSV formats

### Useful Tools
- **PapaParse**: CSV parsing library (already in use)
- **date-fns**: Date parsing (already in use)
- **bank2ynab**: Python reference implementation

---

## Notes

### Security & Privacy
- **Never** log or store full CSV contents
- **Never** transmit raw CSV data to external APIs
- Process files **client-side only** in browser
- Clear file input after processing

### Performance
- Use streaming for large CSV files (>1000 rows)
- Consider Web Workers for heavy parsing
- Cache auto-detection results per session

### Future Enhancements
1. **OFX/QFX Support** (Phase 2)
2. **QuickBooks QBO Format** (Phase 2)
3. **AI-Powered Format Detection** (Phase 3)
4. **Natural Language Import** "Import my TD checking CSV" (Phase 3)

---

**Last Updated**: 2025-01-06
**Status**: Phase 1 Complete (2/15 banks), Phase 2 Ready
