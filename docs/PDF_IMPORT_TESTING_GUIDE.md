# PDF Bank Statement Import - Testing Guide

**Project**: PDF Import Feature
**Created**: 2025-11-15
**Status**: Manual Testing Required

---

## 🎯 Overview

This guide provides a comprehensive testing checklist for PDF bank statement imports. Since we cannot include actual bank statements in the repository for privacy reasons, this document serves as a manual testing guide for users with their own PDFs.

**Automated Test Coverage**: 23 unit tests passing (bank-statement-ocr + pdf-bank-parser)

---

## ✅ Pre-Testing Checklist

- [ ] Application running locally (`npm run dev`)
- [ ] Navigate to `/budget-app/import`
- [ ] Have PDF bank statement(s) ready for testing
- [ ] Browser DevTools console open (to monitor logs)
- [ ] Clear browser cache if testing repeat uploads

---

## 🧪 Test Scenarios

### **Scenario 1: Single-Page Statement (1-5 Transactions)**

**Purpose**: Verify basic PDF upload and extraction works correctly

**Steps**:
1. Upload a single-page PDF bank statement
2. Verify format detection shows "PDF (Bank Statement)"
3. Observe progress indicator ("Processing page 1/1...")
4. Check page count badge shows "1 page"
5. Review extracted transactions in preview table

**Expected Results**:
- ✅ All transactions extracted (count matches PDF)
- ✅ Dates parsed correctly
- ✅ Amounts accurate (negative for debits, positive for credits)
- ✅ Descriptions readable and complete
- ✅ OCR confidence >90% for text-based PDFs
- ✅ Processing time <5 seconds

**Known Issues**:
- Multi-line descriptions may be concatenated (this is expected)

---

### **Scenario 2: Multi-Page Statement (5-10 Pages)**

**Purpose**: Verify multi-page processing and performance

**Steps**:
1. Upload a 5-10 page PDF statement
2. Watch real-time progress ("Processing page 3/8...")
3. Verify progress bar updates smoothly
4. Check page count badge (e.g., "8 pages")
5. Review all transactions from all pages

**Expected Results**:
- ✅ All pages processed sequentially
- ✅ Transaction count matches total across all pages
- ✅ No missing transactions from middle pages
- ✅ 5-page PDF processes in <30 seconds
- ✅ 10-page PDF processes in <60 seconds
- ✅ No browser crashes or memory errors

**Performance Monitoring**:
```
Chrome DevTools → Performance tab
- Check memory usage stays <500MB
- CPU usage spikes during OCR but recovers
```

---

### **Scenario 3: Text-Based PDF (High Quality)**

**Purpose**: Verify high OCR accuracy for digital PDFs

**Steps**:
1. Upload a text-based PDF (not scanned)
2. Check OCR confidence badge (should be green, >90%)
3. Review transaction accuracy
4. Verify no "⚠️ Review" flags on transactions

**Expected Results**:
- ✅ OCR confidence 95-99%
- ✅ 100% extraction accuracy
- ✅ All dates, amounts, descriptions perfect
- ✅ No low-confidence warnings

**How to Identify Text-Based PDF**:
- Open PDF in viewer → can select and copy text
- File size usually smaller than scanned equivalents

---

### **Scenario 4: Scanned PDF (Low Quality)**

**Purpose**: Verify graceful degradation for scanned images

**Steps**:
1. Upload a scanned/image-based PDF
2. Check for low OCR confidence warning (orange badge <70%)
3. Verify warning message appears: "This may be a scanned/image-based PDF"
4. Review transactions with "⚠️ Review" flags
5. Manually verify flagged transactions against PDF

**Expected Results**:
- ✅ OCR confidence 70-90%
- ✅ Warning displayed proactively
- ✅ Low-confidence transactions flagged (orange badge)
- ✅ No crashes despite poor quality
- ✅ Users prompted to review carefully

**Known Limitations**:
- Handwritten text: <50% accuracy (unsupported)
- Very blurry scans: May fail entirely
- Recommend requesting CSV from bank instead

---

### **Scenario 5: Home Trust Bank Format (Debit/Credit Columns)**

**Purpose**: Verify intelligent column detection for Home Trust format

**Steps**:
1. Upload Home Trust Bank PDF statement
2. Verify format detected (check console logs)
3. Check preview table for correct amounts
4. Verify debits are negative, credits are positive

**Expected Results**:
- ✅ Console log shows: `bankFormat: 'home-trust'`
- ✅ Debit transactions show as negative (e.g., -$50.00)
- ✅ Credit transactions show as positive (e.g., +$1000.00)
- ✅ Column detection confidence >70%

**Home Trust Format Example**:
```
Date       | Description    | Debit  | Credit | Balance
01/15/2025 | STARBUCKS      | 12.45  | 0.00   | 1500.00
01/16/2025 | PAYROLL DEPOSIT| 0.00   | 2000.00| 3500.00
```

**Console Log to Verify**:
```
[parseTableRows] Column detection: {
  bankFormat: 'home-trust',
  confidence: 0.95,
  method: 'keyword',
  warnings: []
}
```

---

### **Scenario 6: Large PDF Warning (>10 Pages)**

**Purpose**: Verify warnings for large files

**Steps**:
1. Upload a PDF with >10 pages
2. Check for orange warning banner
3. Verify warning suggests CSV export alternative
4. Monitor browser performance during processing

**Expected Results**:
- ✅ Warning appears: "Large PDF detected (15 pages)"
- ✅ Suggests CSV export for faster processing
- ✅ Processing still works (may be slow)
- ✅ No crashes even on 20-page PDFs

**Warning Message**:
```
⚠️ Large PDF detected (15 pages). Processing may take longer and use significant memory.
💡 For very large statements, consider requesting a CSV export from your bank for faster processing.
```

---

### **Scenario 7: Duplicate Detection**

**Purpose**: Verify PDF transactions integrate with duplicate detection

**Steps**:
1. Import a PDF statement
2. Immediately re-import the same PDF
3. Check for duplicate warnings in preview table
4. Verify "DUPLICATE" badges on transactions

**Expected Results**:
- ✅ Second import shows all transactions as duplicates
- ✅ Yellow "DUPLICATE" badges visible
- ✅ Summary shows: "X duplicates will be skipped"
- ✅ No false positives (<5% error rate)

**Known Behavior**:
- PDFs don't have FITID like OFX, so fuzzy matching is used
- Minor OCR variations may cause false negatives

---

### **Scenario 8: Edge Cases**

**Purpose**: Verify error handling and edge cases

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **Non-PDF file** | Upload .jpg image | Error: "File must be a PDF" |
| **Corrupted PDF** | Upload broken PDF | Error: "Failed to read file" |
| **Empty PDF** | Upload PDF with no transactions | Warning: "No transactions found" |
| **Mixed formats** | PDF with tables + text | Best-effort extraction |
| **Special characters** | Transactions with é, ñ, etc. | Characters preserved |
| **Large amounts** | $1,000,000.00 | Commas handled correctly |

---

## 📊 Performance Benchmarks

| PDF Type | Pages | Transactions | Expected Time | Memory Usage |
|----------|-------|--------------|---------------|--------------|
| Small    | 1-2   | 5-10         | <5s           | <100MB       |
| Medium   | 3-5   | 20-50        | 10-30s        | 200-300MB    |
| Large    | 6-10  | 50-100       | 30-60s        | 300-500MB    |
| Very Large| 10+  | 100+         | 60-120s       | 400-600MB    |

**Testing Performance**:
```
Chrome DevTools → Performance Monitor
1. Start monitoring
2. Upload PDF
3. Observe CPU/Memory during processing
4. Check for memory leaks after completion
```

---

## 🔍 Validation Checklist

After each test scenario, verify:

### **Data Accuracy**
- [ ] Transaction count matches PDF
- [ ] All dates within valid range (not future, <10 years old)
- [ ] Amounts match PDF exactly (±$0.01 tolerance)
- [ ] Descriptions are readable
- [ ] No phantom transactions (not in PDF)

### **UI/UX**
- [ ] Format detection badge displays correctly
- [ ] Page count badge shows accurate number
- [ ] OCR confidence badge color-coded (green/yellow/orange)
- [ ] Progress bar updates smoothly
- [ ] Warnings appear when appropriate
- [ ] Confidence column visible (PDF imports only)
- [ ] Low-confidence rows flagged with "⚠️ Review"

### **Error Handling**
- [ ] Invalid files rejected gracefully
- [ ] Error messages are clear and actionable
- [ ] No console errors (except expected warnings)
- [ ] Can reset and try again after error

### **Performance**
- [ ] Processing completes within expected time
- [ ] Browser remains responsive during OCR
- [ ] Memory released after completion
- [ ] No crashes on large files

---

## 🐛 Known Issues & Workarounds

### **Issue 1: Multi-line Descriptions Concatenated**
**Symptom**: Long merchant addresses become single line
**Example**: "STARBUCKS COFFEE 123 MAIN ST NEW YORK NY"
**Workaround**: This is expected behavior (groupMultiLineTransactions)
**Fix**: None needed - descriptions are still readable

### **Issue 2: OCR Errors on Scanned PDFs**
**Symptom**: Confidence <70%, some characters misread
**Example**: "O" read as "0", "l" read as "1"
**Workaround**: Manual review of flagged transactions
**Fix**: Request text-based PDF or CSV from bank

### **Issue 3: Date Format Ambiguity**
**Symptom**: 01/05/2025 could be Jan 5 or May 1
**Example**: Depends on bank format (US vs international)
**Workaround**: Verify first transaction date against PDF
**Fix**: Bank-specific date format detection (future enhancement)

### **Issue 4: Balance Column Confusion**
**Symptom**: Final balance extracted as transaction amount
**Example**: Rare cases where balance column has no header
**Workaround**: Check amounts against PDF
**Fix**: Enhanced column detection fallback (Task 6)

---

## 📝 Test Report Template

After completing testing, document results:

```markdown
## PDF Import Test Report

**Date**: 2025-11-15
**Tester**: [Your Name]
**PDF Source**: Home Trust Bank
**PDF Characteristics**: 8 pages, text-based, 65 transactions

### Test Results

| Scenario | Status | Notes |
|----------|--------|-------|
| Scenario 1 | ✅ PASS | All 5 transactions extracted |
| Scenario 2 | ✅ PASS | 8 pages in 42 seconds |
| Scenario 3 | ✅ PASS | 96% OCR confidence |
| Scenario 4 | N/A | No scanned PDF available |
| Scenario 5 | ✅ PASS | Debit/Credit detected correctly |
| Scenario 6 | N/A | <10 pages |
| Scenario 7 | ✅ PASS | Duplicates flagged correctly |
| Scenario 8 | ⚠️ PARTIAL | Empty PDF shows no error |

### Issues Found
1. Empty PDF shows "0 transactions" but no warning message
2. Performance slower than expected (8 pages took 55s)

### Recommendations
- Add warning for empty PDFs
- Optimize OCR for multi-page processing
```

---

## 🚀 Future Enhancements (Not in Scope)

- [ ] Synthetic PDF test data generation
- [ ] Automated E2E tests with sample PDFs
- [ ] Performance regression testing
- [ ] OCR accuracy benchmarking suite
- [ ] Bank-specific format detection tests
- [ ] Multi-language PDF support testing

---

## 📚 Related Documentation

- **Implementation Guide**: `PDF_IMPORT_PROJECT_GUIDE.md`
- **Unit Tests**: `tests/bank-statement-ocr.test.ts`, `tests/pdf-bank-parser.test.ts`
- **User Documentation**: (To be created in Task 6)

---

**Last Updated**: 2025-11-15
**Status**: Ready for manual testing with real PDFs
