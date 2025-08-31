# 🧪 Comprehensive Testing Guide for Zipli

## 🚀 Quick Start

**Server is running at**: http://localhost:3000  
**Test with real Supabase data** - All changes persist!

---

## 📋 Test Accounts

| Role              | Email               | Password | Purpose                             |
| ----------------- | ------------------- | -------- | ----------------------------------- |
| **Food Donor**    | hasan@zipli.test    | password | Restaurant owner donating food      |
| **Food Donor**    | alice@zipli.test    | password | Another restaurant donor            |
| **Food Receiver** | maria@zipli.test    | password | Red Cross representative            |
| **Food Receiver** | kirkko@zipli.test   | password | Church food assistance              |
| **City Admin**    | city@zipli.test     | password | City official with analytics access |
| **Terminal**      | terminal@zipli.test | password | Airport terminal operator           |

---

## ✅ Testing Checklist

### 1. 🔐 Authentication Testing

**Open http://localhost:3000 in your browser**

#### Test Invalid Login

1. Click "Login" button
2. Enter: `wrong@email.com` / `wrongpassword`
3. **Expected**: Error message "Invalid credentials"
4. ✅ Check: Error handled gracefully

#### Test Valid Login (Food Donor)

1. Click "Login"
2. Enter: `hasan@zipli.test` / `password`
3. **Expected**: Redirected to donor dashboard
4. ✅ Check: User name displayed in header
5. ✅ Check: Correct role-based UI shown

#### Test Quick Role Switching (Development Feature)

1. Look for **Dev User Switcher** in bottom-right corner
2. Click different users to switch roles instantly
3. **Expected**: UI updates based on role
4. ✅ Check: No need to re-enter passwords

#### Test Logout

1. Click user menu → "Logout"
2. **Expected**: Return to landing page
3. ✅ Check: Protected pages redirect to login

---

### 2. 🍕 Food Donor Testing

**Login as**: `hasan@zipli.test` / `password`

#### View Existing Donations

1. Navigate to "My Donations" or Dashboard
2. **Expected**: See list of your active donations
3. ✅ Check: Donation cards show food items, quantities, pickup times

#### Create New Donation

1. Click "Donate Food" or "+" button
2. **Choose Method**:
   - **Voice Input**: Click microphone, describe items
   - **Photo Upload**: Upload food photo
   - **Manual Entry**: Type details directly
3. Fill in:
   - Food item: Select or create new
   - Quantity: Enter amount (e.g., "5 kg")
   - Pickup slots: Set available times
   - Location: Confirm pickup address
4. Click "Submit Donation"
5. **Expected**: New donation appears in list
6. ✅ Check: Real-time update (no refresh needed)

#### Manage Donations

1. Find an active donation
2. Try these actions:
   - **Edit**: Update quantity or times
   - **Mark as Collected**: When picked up
   - **Cancel**: Remove donation
3. ✅ Check: Status updates immediately
4. ✅ Check: Changes persist after refresh

---

### 3. 🤝 Food Receiver Testing

**Login as**: `maria@zipli.test` / `password`

#### Browse Available Donations

1. Navigate to "Available Food" or marketplace
2. **Expected**: See all available donations
3. ✅ Check: Can filter by:
   - Location (distance)
   - Food type
   - Allergens
   - Pickup time

#### Claim a Donation

1. Click on a donation card
2. View details:
   - Food description
   - Allergens listed
   - Pickup location
   - Available time slots
3. Click "Claim This Donation"
4. Select preferred pickup time
5. Add message (optional)
6. Confirm claim
7. **Expected**: Donation marked as "Claimed"
8. ✅ Check: Appears in "My Claims"

#### QR Code for Pickup

1. Go to "My Claims"
2. Find claimed donation
3. Click "Show QR Code"
4. **Expected**: QR code displayed
5. ✅ Check: QR contains pickup info

---

### 4. ⚡ Real-time Updates Testing

**Open two browser windows side by side**

#### Test Live Updates

1. **Window 1**: Login as `hasan@zipli.test`
2. **Window 2**: Login as `maria@zipli.test`
3. **In Window 1**: Create new donation
4. **Expected in Window 2**: Donation appears immediately
5. ✅ Check: No page refresh needed

#### Test Claim Notifications

1. **Window 2**: Claim a donation from Window 1's user
2. **Expected in Window 1**: Notification of claim
3. ✅ Check: Donor sees who claimed

---

### 5. 📊 City Dashboard Testing

**Login as**: `city@zipli.test` / `password`

#### View Analytics

1. Navigate to City Dashboard
2. **Check these sections**:
   - Total donations this month
   - Active vs completed donations
   - Total food distributed (kg)
   - Active partner organizations
   - Request fulfillment rate
3. ✅ Check: Charts and graphs load
4. ✅ Check: Data is accurate

#### Partner Organizations

1. Click "Partner Organizations"
2. **Expected**: List of all donors/receivers
3. ✅ Check: Shows activity metrics
4. ✅ Check: Can export reports

---

### 6. 📱 Mobile Responsiveness Testing

#### Test on Mobile (or Browser Mobile View)

1. **Chrome**: Press F12 → Click mobile icon
2. **Test these views**:
   - iPhone SE (375px)
   - iPhone 12 (390px)
   - iPad (768px)
3. **Check each page**:
   - ✅ Navigation menu works (hamburger menu)
   - ✅ Forms are usable
   - ✅ Cards stack properly
   - ✅ Buttons are tappable
   - ✅ Text is readable

#### Test Touch Interactions

1. Voice input on mobile
2. Photo upload from camera
3. Swipe gestures (if any)
4. ✅ Check: All work smoothly

---

### 7. 🔴 Error Handling Testing

#### Network Errors

1. Open DevTools (F12) → Network tab
2. Set to "Offline"
3. Try to:
   - Create donation
   - Claim food
   - Load new page
4. **Expected**: Friendly error messages
5. ✅ Check: App doesn't crash
6. Set back to "Online"

#### Invalid Data

1. Try submitting forms with:
   - Empty required fields
   - Invalid email format
   - Negative quantities
   - Past dates for pickup
2. **Expected**: Clear validation messages
3. ✅ Check: Form highlights errors

#### Session Timeout

1. Login to app
2. Wait 10+ minutes idle
3. Try an action
4. **Expected**: Redirect to login
5. ✅ Check: Graceful re-authentication

---

### 8. 🎯 Performance Testing

#### Page Load Times

1. Open DevTools → Network tab
2. Enable "Slow 3G" throttling
3. Navigate between pages
4. **Target**: Pages load < 3 seconds
5. ✅ Check: Loading indicators shown

#### Search Performance

1. Go to food marketplace
2. Search for items
3. Apply multiple filters
4. **Expected**: Results update quickly
5. ✅ Check: No UI freezing

---

### 9. 🛡️ Security Testing

#### Cross-User Access

1. Login as `hasan@zipli.test`
2. Note a donation ID from URL
3. Logout and login as `maria@zipli.test`
4. Try to access donor's donation directly via URL
5. **Expected**: Access denied or redirected
6. ✅ Check: Can't edit others' data

#### SQL Injection (Basic Test)

1. In any search field, try:
   - `'; DROP TABLE users; --`
   - `<script>alert('XSS')</script>`
2. **Expected**: Treated as normal text
3. ✅ Check: No security breach

---

## 🐛 Common Issues & Solutions

| Issue                     | Solution                                      |
| ------------------------- | --------------------------------------------- |
| **Login fails**           | Check internet connection, verify credentials |
| **No Dev Switcher**       | Only shows in development mode                |
| **Real-time not working** | Check WebSocket connection in Network tab     |
| **Images not loading**    | Check Supabase storage configuration          |
| **Slow performance**      | Clear browser cache, check network speed      |

---

## 📝 Bug Reporting Template

When you find an issue, document it like this:

```markdown
### Bug: [Brief description]

**Steps to reproduce:**

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected behavior:**
[What should happen]

**Actual behavior:**
[What actually happened]

**Screenshots:**
[If applicable]

**Browser/Device:**
[Chrome/Firefox/Safari, Desktop/Mobile]
```

---

## 🚦 Testing Status Indicators

Use these to track your testing progress:

- 🔴 **Not Tested** - Haven't checked yet
- 🟡 **In Progress** - Currently testing
- 🟢 **Passed** - Working as expected
- 🔴 **Failed** - Found issues
- ⚠️ **Partial** - Some issues but usable

---

## 🎯 Quick Smoke Test (5 minutes)

If you're short on time, test these critical paths:

1. ✅ Can login as donor
2. ✅ Can create a donation
3. ✅ Can login as receiver
4. ✅ Can view available donations
5. ✅ Can claim a donation
6. ✅ Real-time updates work
7. ✅ Mobile view renders correctly

---

## 💡 Testing Tips

1. **Use Incognito/Private windows** for testing different users simultaneously
2. **Keep DevTools open** to catch console errors
3. **Test both happy path and edge cases**
4. **Document everything** - screenshots help!
5. **Test on real devices** if possible, not just browser emulation
6. **Check data in Supabase dashboard** to verify backend changes

---

## 🔧 Advanced Testing (Optional)

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast passes WCAG
- [ ] Focus indicators visible

### Load Testing

- [ ] Create 50+ donations
- [ ] Have 10+ users online
- [ ] Monitor performance

---

## ✅ Final Checklist Before Production

- [ ] All user roles tested
- [ ] Core functionality verified
- [ ] Mobile responsiveness confirmed
- [ ] Error handling validated
- [ ] Performance acceptable
- [ ] Security checks passed
- [ ] Real-time features working
- [ ] Data persistence verified

---

**Ready to test?** Open http://localhost:3000 and start with the authentication tests!

Remember: This is testing with **real Supabase data**, so all changes persist. The test accounts are specifically for testing purposes.
