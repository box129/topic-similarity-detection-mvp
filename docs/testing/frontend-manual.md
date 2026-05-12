# Frontend Manual Testing Guide

## Prerequisites

Before testing, ensure:
- [ ] npm install completed successfully
- [ ] node_modules directory exists
- [ ] Backend API is running on http://localhost:3000
- [ ] SBERT service is running on http://localhost:8000 (optional)

## Starting the Development Server

```bash
cd topic-similarity-mvp/frontend
npm run dev
```

Expected output:
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

Open browser to: **http://localhost:5173**

---

## Test Suite 1: Form Validation

### Test 1.1: Empty Input
**Steps:**
1. Load the page
2. Observe the topic textarea

**Expected:**
- [ ] Border is gray (border-gray-300)
- [ ] No error message shown
- [ ] Submit button is disabled (gray, cursor-not-allowed)
- [ ] Word count shows "0 / 7-24 words"

### Test 1.2: Too Few Words (< 7)
**Steps:**
1. Type: "Machine Learning"
2. Observe changes

**Expected:**
- [ ] Border turns red (border-red-500)
- [ ] Message shows: "Too short: 2 words (minimum 7)"
- [ ] Word count shows "2 / 7-24 words" in red
- [ ] Submit button remains disabled

### Test 1.3: Valid Input (7-24 words)
**Steps:**
1. Type: "Machine Learning Applications in Healthcare Diagnosis Using Neural Networks"
2. Observe changes

**Expected:**
- [ ] Border turns green (border-green-500)
- [ ] Message shows: "Valid topic length"
- [ ] Word count shows "9 / 7-24 words" in green
- [ ] Submit button becomes enabled (blue, clickable)

### Test 1.4: Too Many Words (> 24)
**Steps:**
1. Type a topic with 25+ words
2. Observe changes

**Expected:**
- [ ] Border turns red (border-red-500)
- [ ] Message shows: "Too long: XX words (maximum 24)"
- [ ] Word count shows "XX / 7-24 words" in red
- [ ] Submit button becomes disabled

### Test 1.5: Character Count Guideline
**Steps:**
1. Type: "AI ML DL" (6 chars, 3 words - too short)
2. Observe character count

**Expected:**
- [ ] Character count shows "6 chars" in yellow
- [ ] Warning message about character count guideline
- [ ] Border is red (due to word count)

**Steps:**
1. Type a valid 10-word topic with 50-180 characters
2. Observe character count

**Expected:**
- [ ] Character count shows in gray (normal)
- [ ] No character count warning
- [ ] Border is green (valid word count)

---

## Test Suite 2: Visual Feedback

### Test 2.1: Border Color Transitions
**Steps:**
1. Start typing from empty
2. Type 1-6 words (watch border)
3. Type 7-24 words (watch border)
4. Type 25+ words (watch border)

**Expected:**
- [ ] Gray → Red (1-6 words)
- [ ] Red → Green (7-24 words)
- [ ] Green → Red (25+ words)
- [ ] Transitions are smooth (200ms duration)

### Test 2.2: Real-time Updates
**Steps:**
1. Type slowly, one word at a time
2. Watch word count update

**Expected:**
- [ ] Word count updates on every space
- [ ] Character count updates on every keystroke
- [ ] Border color updates immediately
- [ ] No lag or delay

### Test 2.3: Error Message Display
**Steps:**
1. Type 5 words
2. Read error message
3. Type 2 more words (total 7)
4. Observe error message

**Expected:**
- [ ] Error message appears for < 7 words
- [ ] Error message is clear and helpful
- [ ] Error message disappears when valid
- [ ] Success message appears when valid

---

## Test Suite 3: Submit Button States

### Test 3.1: Disabled State
**Steps:**
1. Leave topic empty
2. Try to click submit button

**Expected:**
- [ ] Button is gray (bg-gray-400)
- [ ] Cursor shows "not-allowed"
- [ ] Button does not respond to clicks
- [ ] Opacity is reduced (50%)

### Test 3.2: Enabled State
**Steps:**
1. Type valid topic (7-24 words)
2. Observe submit button

**Expected:**
- [ ] Button is blue (bg-blue-600)
- [ ] Cursor shows pointer
- [ ] Button has hover effect (bg-blue-700)
- [ ] Button has shadow

### Test 3.3: Loading State
**Steps:**
1. Type valid topic
2. Click submit button
3. Observe button during API call

**Expected:**
- [ ] Button shows spinner animation
- [ ] Text changes to "Checking Similarity..."
- [ ] Button is disabled during loading
- [ ] Spinner rotates smoothly

---

## Test Suite 4: Form Submission

### Test 4.1: Successful Submission (Requires Backend)
**Steps:**
1. Ensure backend is running
2. Type: "Machine Learning Applications in Healthcare Diagnosis"
3. Click "Check Similarity"

**Expected:**
- [ ] Loading state appears
- [ ] API call is made to /api/similarity/check
- [ ] Results appear below form
- [ ] Risk level is displayed (HIGH/MEDIUM/LOW)
- [ ] Form clears after success

### Test 4.2: Submission with Keywords
**Steps:**
1. Type topic: "Natural Language Processing Research"
2. Type keywords: "BERT, transformers, sentiment analysis"
3. Click submit

**Expected:**
- [ ] Both topic and keywords are sent to API
- [ ] Results include keyword-enhanced matching
- [ ] Keywords field is optional (works without it)

### Test 4.3: Error Handling - Network Error
**Steps:**
1. Stop the backend server
2. Type valid topic
3. Click submit

**Expected:**
- [ ] Loading state appears
- [ ] Error message appears after timeout
- [ ] Error message is user-friendly
- [ ] Error message has red background
- [ ] Form remains filled (not cleared)

### Test 4.4: Error Handling - API Error
**Steps:**
1. Backend running but returns error
2. Submit valid topic

**Expected:**
- [ ] Error message displays API error
- [ ] Error is user-friendly
- [ ] Form can be resubmitted

---

## Test Suite 5: User Experience

### Test 5.1: Keywords Field (Optional)
**Steps:**
1. Submit form without keywords
2. Submit form with keywords

**Expected:**
- [ ] Form works without keywords
- [ ] Keywords enhance results when provided
- [ ] Keywords field has placeholder text
- [ ] Keywords field is clearly marked optional

### Test 5.2: Help Text
**Steps:**
1. Scroll to help section
2. Read tips

**Expected:**
- [ ] Help section is visible
- [ ] Tips are clear and helpful
- [ ] Blue background (bg-blue-50)
- [ ] Bullet points are readable

### Test 5.3: Form Reset
**Steps:**
1. Fill form completely
2. Submit successfully
3. Observe form state

**Expected:**
- [ ] Topic field clears
- [ ] Keywords field clears
- [ ] Border returns to gray
- [ ] Submit button disabled
- [ ] Ready for new input

---

## Test Suite 6: Responsive Design

### Test 6.1: Mobile View (< 640px)
**Steps:**
1. Resize browser to 375px width
2. Test all features

**Expected:**
- [ ] Form fits screen width
- [ ] Text is readable
- [ ] Buttons are touch-friendly (min 44px)
- [ ] No horizontal scroll
- [ ] Padding is appropriate

### Test 6.2: Tablet View (640-1024px)
**Steps:**
1. Resize browser to 768px width
2. Test all features

**Expected:**
- [ ] Form uses available space
- [ ] Layout is balanced
- [ ] All features work

### Test 6.3: Desktop View (> 1024px)
**Steps:**
1. Resize browser to 1920px width
2. Test all features

**Expected:**
- [ ] Form has max-width (2xl: 672px)
- [ ] Form is centered
- [ ] Plenty of whitespace
- [ ] Professional appearance

---

## Test Suite 7: Accessibility

### Test 7.1: Keyboard Navigation
**Steps:**
1. Use Tab key to navigate
2. Use Enter to submit

**Expected:**
- [ ] Tab moves through fields logically
- [ ] Focus indicators are visible
- [ ] Enter submits form when valid
- [ ] Escape clears focus

### Test 7.2: Screen Reader Support
**Steps:**
1. Use screen reader (NVDA/JAWS)
2. Navigate form

**Expected:**
- [ ] Labels are announced
- [ ] Error messages are announced
- [ ] Button states are announced
- [ ] Form structure is clear

### Test 7.3: Color Contrast
**Steps:**
1. Check text contrast ratios
2. Use browser dev tools

**Expected:**
- [ ] All text meets WCAG AA (4.5:1)
- [ ] Error text is readable
- [ ] Success text is readable
- [ ] Disabled states are clear

---

## Test Suite 8: Integration Testing

### Test 8.1: Full Flow - Valid Topic
**Steps:**
1. Open app
2. Type: "Deep Learning for Medical Image Analysis and Diagnosis"
3. Add keywords: "CNN, ResNet, medical imaging"
4. Click submit
5. Wait for results

**Expected:**
- [ ] Validation passes (green border)
- [ ] Submit button enabled
- [ ] Loading state appears
- [ ] Results display correctly
- [ ] Risk level shown
- [ ] Similar topics listed
- [ ] Form clears

### Test 8.2: Full Flow - Invalid to Valid
**Steps:**
1. Type: "AI ML" (too short)
2. Observe error
3. Add more words to make valid
4. Submit

**Expected:**
- [ ] Error shown for invalid
- [ ] Error clears when valid
- [ ] Submit enables when valid
- [ ] Submission works

### Test 8.3: Multiple Submissions
**Steps:**
1. Submit first topic
2. Wait for results
3. Submit second topic
4. Wait for results

**Expected:**
- [ ] First results display
- [ ] Form clears after first
- [ ] Second submission works
- [ ] Second results replace first
- [ ] No memory leaks

---

## Test Suite 9: Edge Cases

### Test 9.1: Special Characters
**Steps:**
1. Type: "AI/ML & Deep-Learning (2024)"
2. Submit

**Expected:**
- [ ] Special characters accepted
- [ ] Word count correct
- [ ] Submission works
- [ ] No errors

### Test 9.2: Very Long Topic (Max Length)
**Steps:**
1. Type exactly 24 words
2. Observe validation

**Expected:**
- [ ] Border is green
- [ ] Submit enabled
- [ ] Word count shows "24 / 7-24 words"

### Test 9.3: Rapid Typing
**Steps:**
1. Type very quickly
2. Observe updates

**Expected:**
- [ ] Validation keeps up
- [ ] No lag
- [ ] Correct final state

### Test 9.4: Copy-Paste
**Steps:**
1. Copy long text
2. Paste into topic field

**Expected:**
- [ ] Validation runs immediately
- [ ] Correct word count
- [ ] Correct border color

---

## Test Suite 10: Browser Compatibility

### Test 10.1: Chrome
- [ ] All features work
- [ ] Styling correct
- [ ] No console errors

### Test 10.2: Firefox
- [ ] All features work
- [ ] Styling correct
- [ ] No console errors

### Test 10.3: Safari
- [ ] All features work
- [ ] Styling correct
- [ ] No console errors

### Test 10.4: Edge
- [ ] All features work
- [ ] Styling correct
- [ ] No console errors

---

## Results Display Testing

### Test 11.1: Risk Level - HIGH
**Expected:**
- [ ] Red background (bg-red-100)
- [ ] Red border (border-red-500)
- [ ] Text shows "HIGH" in red

### Test 11.2: Risk Level - MEDIUM
**Expected:**
- [ ] Yellow background (bg-yellow-100)
- [ ] Yellow border (border-yellow-500)
- [ ] Text shows "MEDIUM" in yellow

### Test 11.3: Risk Level - LOW
**Expected:**
- [ ] Green background (bg-green-100)
- [ ] Green border (border-green-500)
- [ ] Text shows "LOW" in green

### Test 11.4: Similar Topics List
**Expected:**
- [ ] Topics displayed in list
- [ ] Similarity scores shown
- [ ] Percentages formatted correctly
- [ ] Readable layout

---

## Performance Testing

### Test 12.1: Initial Load
**Expected:**
- [ ] Page loads in < 2 seconds
- [ ] No flash of unstyled content
- [ ] Smooth rendering

### Test 12.2: Validation Performance
**Expected:**
- [ ] Real-time validation < 50ms
- [ ] No lag during typing
- [ ] Smooth transitions

### Test 12.3: API Call Performance
**Expected:**
- [ ] Loading state appears immediately
- [ ] Results display quickly
- [ ] No UI freezing

---

## Bug Reporting Template

If you find any issues, report them using this template:

```markdown
## Bug Report

**Test:** [Test number and name]
**Browser:** [Chrome/Firefox/Safari/Edge + version]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots:**
[If applicable]

**Console Errors:**
[Any errors in browser console]

**Severity:** [Critical/High/Medium/Low]
```

---

## Testing Checklist Summary

- [ ] All validation tests passed (1.1-1.5)
- [ ] All visual feedback tests passed (2.1-2.3)
- [ ] All button state tests passed (3.1-3.3)
- [ ] All submission tests passed (4.1-4.4)
- [ ] All UX tests passed (5.1-5.3)
- [ ] All responsive tests passed (6.1-6.3)
- [ ] All accessibility tests passed (7.1-7.3)
- [ ] All integration tests passed (8.1-8.3)
- [ ] All edge case tests passed (9.1-9.4)
- [ ] All browser tests passed (10.1-10.4)
- [ ] All results display tests passed (11.1-11.4)
- [ ] All performance tests passed (12.1-12.3)

---

**Total Tests:** 50+  
**Estimated Testing Time:** 2-3 hours for complete coverage  
**Quick Test Time:** 30 minutes for critical path only

---

**Last Updated:** December 2024  
**Version:** 1.0
