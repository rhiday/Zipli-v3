# UI Scaffolding Guide - Fixed Layout System

## 🎯 Core Principle: Simple, Consistent, Predictable

The Zipli app uses a **fixed header-scrollable content-fixed footer** pattern across ALL pages.

## ✅ The Only Layout Pattern You Need

```jsx
<PageContainer
  header={<SecondaryNavbar />} // Fixed at top
  contentClassName="p-4 space-y-6" // Scrollable content
  footer={<BottomActionBar />} // Fixed at bottom - ALWAYS VISIBLE
  className="bg-white"
>
  {/* Your page content - can be any height */}
</PageContainer>
```

## 🏗️ How PageContainer Works (Simple!)

```jsx
<div className="flex h-dvh flex-col">
  {header} // Shrink-0: Fixed height
  <main className="flex-1 overflow-y-auto">
    {' '}
    // Flex-1: Takes remaining space
    {children} // Scrolls if needed
  </main>
  {footer} // Shrink-0: Fixed height
</div>
```

**Key Points:**

- `h-dvh` = Full viewport height
- `flex flex-col` = Vertical stack
- Header/Footer = `shrink-0` (fixed size)
- Main = `flex-1 overflow-y-auto` (fills space, scrolls)

## ❌ Never Do This

```jsx
// ❌ DON'T put footer inside scrollable area
<main className="overflow-y-auto">
  {content}
  <div className="sticky bottom-0">{footer}</div>  // WRONG!
</main>

// ❌ DON'T use complex positioning
<div className="sticky bottom-[76px]">{footer}</div>  // WRONG!

// ❌ DON'T make users scroll to see buttons
contentClassName="p-4 space-y-6 pb-24"  // WRONG - adds unnecessary padding
```

## ✅ Always Do This

```jsx
// ✅ Footer outside scrollable area
<div className="flex h-dvh flex-col">
  <main className="flex-1 overflow-y-auto">{content}</main>
  {footer}  // Outside main, always visible
</div>

// ✅ Simple, predictable spacing
contentClassName="p-4 space-y-6"  // No pb-24 needed!

// ✅ Button always visible
<BottomActionBar>
  <Button>Continue</Button>  // User never scrolls to find this
</BottomActionBar>
```

## 📱 Mobile-First Rules

1. **Buttons ALWAYS visible** - No scrolling required for primary actions
2. **Content scrolls, chrome doesn't** - Header/footer stay fixed
3. **Consistent spacing** - Same padding across all pages
4. **No clever tricks** - Simple flex layout only

## 🚀 Standard Page Template

```jsx
export default function MyPage() {
  return (
    <PageContainer
      header={
        <>
          <SecondaryNavbar title="Page Title" />
          <Progress value={50} />
        </>
      }
      contentClassName="p-4 space-y-6"
      footer={
        <BottomActionBar>
          <Button onClick={handleContinue}>Continue</Button>
        </BottomActionBar>
      }
      className="bg-white"
    >
      {/* Your content here - any height, will scroll if needed */}
      <div>Section 1</div>
      <div>Section 2</div>
      <div>Section 3</div>
      {/* Footer button is ALWAYS visible, no scrolling needed */}
    </PageContainer>
  );
}
```

## 🎯 Testing Checklist

- [ ] Can you see the Continue button without scrolling?
- [ ] Does the header stay fixed when scrolling?
- [ ] Does the footer stay fixed at bottom?
- [ ] Is there proper spacing between content and footer?
- [ ] Does it work on different screen sizes?

## 💡 Remember

**Simplicity wins.** If you're writing complex positioning logic, you're doing it wrong. The PageContainer handles everything - just pass header, content, and footer.
