# Allergen Text Input Testing Guide

## Overview

This guide provides comprehensive testing instructions to verify that the allergen text input functionality works correctly with Supabase database integration.

> **📋 Note**: This follows our new [Component Testing Protocol](./TESTING_PROTOCOL.md) - after any component changes, we provide step-by-step testing instructions with clear success criteria.

## 🔧 Prerequisites

- Development server running (`npm run dev`)
- Browser with DevTools open
- Access to Supabase dashboard
- Console logging enabled

## 🧪 Test Scenarios

### Phase 1: Basic Functionality Tests

#### Test 1.1: One-Time Request with Text Allergens

1. Navigate to `/request/one-time-form`
2. Fill out the form:
   - **Description**: "Need food for shelter"
   - **Quantity**: "10"
   - **Allergens**: "Gluten-free, Lactose-free, Contains nuts"
3. Click "Continue"
4. Add a pickup slot and continue to summary
5. Fill in address and submit
6. **Expected Results**:
   - Console shows: `🥜 Allergens (raw): ["Gluten-free", "Lactose-free", "Contains nuts"]`
   - Console shows: `✅ Saved allergens: ["Gluten-free", "Lactose-free", "Contains nuts"]`
   - No errors in submission

#### Test 1.2: Recurring Request with Text Allergens

1. Navigate to `/request/recurring-form`
2. Fill out the form:
   - **Description**: "Weekly food collection"
   - **Quantity**: "25"
   - **Allergens**: "Vegetarian\nNo dairy\nNut allergies"
3. Continue through the flow
4. **Expected Results**:
   - Text with newlines converts to array: `["Vegetarian", "No dairy", "Nut allergies"]`

#### Test 1.3: Empty Allergen Field

1. Create a request leaving allergen field empty
2. **Expected Results**:
   - Console shows: `🥜 Allergens (raw): []`
   - No errors during submission
   - Database stores empty array

### Phase 2: Data Conversion Tests

#### Test 2.1: Various Text Input Formats

Test these allergen text inputs:

| Input                                  | Expected Array Output             |
| -------------------------------------- | --------------------------------- |
| `"Gluten-free"`                        | `["Gluten-free"]`                 |
| `"Gluten-free, Lactose-free"`          | `["Gluten-free", "Lactose-free"]` |
| `"Gluten-free,Lactose-free"`           | `["Gluten-free", "Lactose-free"]` |
| `"Gluten-free\nLactose-free"`          | `["Gluten-free", "Lactose-free"]` |
| `"   Gluten-free  ,  Lactose-free   "` | `["Gluten-free", "Lactose-free"]` |
| `""`                                   | `[]`                              |

#### Test 2.2: Edit Mode Data Preservation

1. Create a request with allergens: `"Dairy-free, Soy-free"`
2. Edit the request
3. **Expected Results**:
   - Form shows: `"Dairy-free, Soy-free"` (converted back to text)
   - Can modify and save changes
   - Data persists correctly

### Phase 3: Database Verification

#### Test 3.1: Direct Database Inspection

1. After submitting requests, check Supabase dashboard:
   - Go to `Table Editor` > `requests`
   - Verify `allergens` column contains proper JSON array
   - Example: `["Gluten-free", "Lactose-free"]`

#### Test 3.2: SQL Query Verification

Run this SQL query in Supabase SQL Editor:

```sql
SELECT
  id,
  description,
  allergens,
  created_at
FROM requests
ORDER BY created_at DESC
LIMIT 5;
```

### Phase 4: Error Handling Tests

#### Test 4.1: Large Text Input

1. Enter very long allergen text (>1000 characters)
2. **Expected Results**:
   - Should handle gracefully
   - No database errors

#### Test 4.2: Special Characters

1. Test with: `"Allergic to: dairy, nuts & eggs (severe)"`
2. **Expected Results**:
   - Special characters preserved in database

## 🔍 Debugging Tools

### Console Logs to Monitor

Look for these specific log messages:

```javascript
// Form submission
🚀 Starting request submission...
📦 Request data: {...}
🥜 Allergens (raw): ["Gluten-free", "Lactose-free"]
🥜 Allergens (length): 2

// Database payload
Submitting request with payload: {allergens: [...], ...}

// Success response
✅ Request created successfully: uuid-here
✅ Saved allergens: ["Gluten-free", "Lactose-free"]
```

### Network Tab Inspection

1. Open DevTools > Network
2. Look for POST request to `/api/requests` or similar
3. Check request payload includes allergens array
4. Verify response includes saved allergen data

### React DevTools

1. Install React DevTools browser extension
2. Inspect `useRequestStore` state
3. Verify allergen data flows correctly through state

## 🐛 Common Issues & Solutions

### Issue 1: Allergens Not Saving

- **Symptom**: Console shows `🥜 Allergens (length): 0` even with text input
- **Check**: Verify conversion functions are called correctly
- **Fix**: Check `arrayFromAllergenText()` implementation

### Issue 2: Database Type Errors

- **Symptom**: Supabase error about array types
- **Check**: Verify database column is `TEXT[]` type
- **Fix**: Run migration to add/update allergens column

### Issue 3: Display Issues

- **Symptom**: Allergens don't display correctly in summary
- **Check**: Verify array-to-text conversion for display
- **Fix**: Check `allergenTextFromArray()` implementation

## ✅ Success Criteria

### All tests should demonstrate:

1. ✅ Text input converts to array properly
2. ✅ Array saves to Supabase database
3. ✅ Data retrieves correctly from database
4. ✅ Edit mode converts array back to text
5. ✅ Empty input handled gracefully
6. ✅ Special characters preserved
7. ✅ No console errors during flow
8. ✅ Database contains correct JSON array format

## 📊 Test Results Template

Use this template to document your test results:

```markdown
## Test Results - [Date]

### Test 1.1: One-Time Request

- ✅ Text input: "Gluten-free, Lactose-free"
- ✅ Array conversion: ["Gluten-free", "Lactose-free"]
- ✅ Database save: Success
- ✅ No errors: Confirmed

### Test 1.2: Recurring Request

- ✅ Text input with newlines handled
- ✅ Array conversion correct
- ✅ Database save: Success

[Continue for all tests...]
```

## 🚀 Quick Test Commands

For rapid testing, use these browser console commands:

```javascript
// Check current request store state
useRequestStore.getState().requestData.allergens;

// Test conversion functions
const { arrayFromAllergenText, allergenTextFromArray } =
  useRequestStore.getState();
arrayFromAllergenText('Gluten-free, Lactose-free');
allergenTextFromArray(['Gluten-free', 'Lactose-free']);
```
