# 🔧 Details Pages & Edit Functionality Testing Guide

## Overview

This guide provides comprehensive testing instructions to verify that the details pages display data correctly and edit functionality works properly with database integration.

> **📋 Note**: This follows our [Component Testing Protocol](./TESTING_PROTOCOL.md) - after any component changes, we provide step-by-step testing instructions with clear success criteria.

## 🔧 Prerequisites

- Development server running (`pnpm dev`)
- Browser with DevTools open
- Access to Supabase dashboard
- Console logging enabled

## 🧪 Test Scenarios

### Phase 1: Allergen Display Testing

#### Test 1.1: Request Details - Allergen Array Display

1. **Create Test Request**:
   - Navigate to `/request/one-time-form`
   - Fill form with: `"Food needed for community center"`
   - Quantity: `"15"`
   - **Allergens**: `"Gluten-free, Dairy-free, Nut allergies"`
   - Complete the flow and submit

2. **Verify Request Details Page**:
   - Navigate to the request details page
   - **Expected Results**:
     - ✅ Allergens display as individual tags: `Gluten-free` `Dairy-free` `Nut allergies`
     - ✅ No string parsing errors in console
     - ✅ All other fields display correctly (quantity, date, instructions)

#### Test 1.2: Donation Details - Allergen Array Display

1. **Create Test Donation**:
   - Navigate to `/donate/manual`
   - Add food item with allergens: `"Vegetarian, Organic, Contains soy"`
   - Complete the donation flow

2. **Verify Donation Details Page**:
   - Navigate to the donation details page
   - **Expected Results**:
     - ✅ Allergens display as individual tags: `Vegetarian` `Organic` `Contains soy`
     - ✅ Clean array handling (no malformed strings)
     - ✅ All other fields display correctly

### Phase 2: Edit Functionality Testing

#### Test 2.1: Request Edit - Full Flow

1. **Create Base Request**:
   - Create one-time request with:
     - Description: `"Weekly food collection"`
     - Quantity: `"10"`
     - Allergens: `"Lactose-free, Gluten-free"`

2. **Test Edit Flow**:
   - Go to request details page
   - Click **"Edit Request"** button
   - **Expected Results**:
     - ✅ Form pre-populates with existing data
     - ✅ Allergen field shows: `"Lactose-free, Gluten-free"`
     - ✅ Title shows "Edit Request"
     - ✅ Button shows "Update Request"

3. **Modify and Save**:
   - Change description to: `"Updated weekly food collection"`
   - Change allergens to: `"Dairy-free, Vegan-friendly, No nuts"`
   - Submit form
   - **Expected Results**:
     - ✅ Returns to request details page
     - ✅ Shows updated description
     - ✅ Shows new allergen tags: `Dairy-free` `Vegan-friendly` `No nuts`

#### Test 2.2: Donation Edit - Verify Existing Flow

1. **Create Base Donation**:
   - Create donation with allergens: `"Contains dairy, Organic"`

2. **Test Edit Flow**:
   - Go to donation details page
   - Click **"Edit Listing"** button
   - **Expected Results**:
     - ✅ Edit flow works as before
     - ✅ Allergen data persists correctly
     - ✅ Updated allergens display properly as tags

### Phase 3: Database Verification

#### Test 3.1: Database Storage Verification

1. **After creating/editing requests**, check Supabase:
   - Go to `Table Editor` > `requests`
   - Verify `allergens` column contains proper JSON array
   - **Expected Format**: `["Dairy-free", "Vegan-friendly", "No nuts"]`

2. **SQL Query Test**:

```sql
SELECT
  id,
  description,
  allergens,
  people_count,
  created_at
FROM requests
WHERE allergens IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

#### Test 3.2: Edit Operation Database Updates

1. **Before and After Comparison**:
   - Note original allergen data in database
   - Perform edit operation
   - Verify database shows updated allergen array
   - **Expected**: Clean JSON array format maintained

### Phase 4: Error Handling & Edge Cases

#### Test 4.1: Empty Allergen Fields

1. **Test Empty Input**:
   - Create request/donation with no allergens
   - **Expected Results**:
     - ✅ No allergen tags displayed
     - ✅ No errors in console
     - ✅ Edit flow handles empty arrays correctly

#### Test 4.2: Special Characters in Allergens

1. **Test Complex Allergens**:
   - Input: `"Allergic to: dairy & eggs (severe), Contains nuts (trace amounts)"`
   - **Expected Results**:
     - ✅ Special characters preserved
     - ✅ Displays as individual tags correctly
     - ✅ Edit mode preserves formatting

## 🔍 Debugging Tools

### Console Logs to Monitor

Look for these specific log messages:

```javascript
// Edit flow logs
🔄 Edit mode: true Request ID: uuid-here
✅ Request updated successfully: uuid-here
✅ Saved allergens: ["Dairy-free", "Vegan-friendly"]

// Display logs
🥜 Allergens (raw): ["Gluten-free", "Dairy-free"]
🥜 Allergens (type): object
🥜 Allergens (isArray): true
```

### React DevTools Inspection

1. Inspect `useRequestStore` state
2. Verify `isEditMode` and `editingRequestId` values
3. Check allergen array conversion functions

## 🐛 Common Issues & Solutions

### Issue 1: Allergens Not Displaying as Tags

- **Symptom**: Raw array or string shown instead of individual tags
- **Check**: Console for array handling errors
- **Fix**: Verify `Array.isArray()` checks in display components

### Issue 2: Edit Form Not Pre-populating

- **Symptom**: Empty form when editing
- **Check**: `requestData` in store and `allergenTextFromArray()` function
- **Fix**: Ensure `setRequestData()` called before navigation

### Issue 3: Database Type Mismatches

- **Symptom**: Update operations failing
- **Check**: Supabase error logs
- **Fix**: Verify `RequestUpdate` type includes allergens field

## ✅ Success Criteria

### All tests should demonstrate:

1. ✅ Request details show allergens as individual tags
2. ✅ Donation details show allergens as individual tags
3. ✅ Edit Request button appears and works for owners
4. ✅ Request edit flow pre-populates all fields correctly
5. ✅ Allergen text ↔ array conversion works both ways
6. ✅ Database updates preserve clean JSON array format
7. ✅ Edit operations update database correctly
8. ✅ Empty allergen fields handled gracefully
9. ✅ Special characters in allergens preserved
10. ✅ No console errors throughout entire flow

## 📊 Test Results Template

```markdown
## Test Results - [Date]

### Phase 1: Allergen Display

- ✅ Request details tags: Working
- ✅ Donation details tags: Working
- ✅ Array handling: Clean

### Phase 2: Edit Functionality

- ✅ Edit Request button: Present and functional
- ✅ Form pre-population: Working
- ✅ Update operations: Successful
- ✅ Navigation flow: Correct

### Phase 3: Database Verification

- ✅ JSON array format: Correct
- ✅ Update operations: Successful
- ✅ Data persistence: Working

### Issues Found: None / [List any issues]
```

## 🚀 Quick Test Commands

```javascript
// Check request store state
useRequestStore.getState().isEditMode;
useRequestStore.getState().editingRequestId;
useRequestStore.getState().requestData.allergens;

// Test conversion functions
const { allergenTextFromArray, arrayFromAllergenText } =
  useRequestStore.getState();
allergenTextFromArray(['Gluten-free', 'Dairy-free']);
// Should return: "Gluten-free, Dairy-free"

arrayFromAllergenText('Gluten-free, Dairy-free');
// Should return: ["Gluten-free", "Dairy-free"]
```

---

**💡 Remember**: Test both request and donation flows thoroughly. The goal is to ensure consistent behavior across all detail pages and edit functionality!
