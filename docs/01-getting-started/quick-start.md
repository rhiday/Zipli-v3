# Quick Start Guide

<div class="reading-time">📖 5 min read</div>

Learn how to build your first feature on Zipli. By the end of this guide, you'll have created a new component and integrated it with our store.

---

## What You'll Build

You'll create a simple donation counter component that:

- Displays total donations
- Updates in real-time
- Follows our design patterns

<div class="demo-preview">
  <img src="/docs/assets/donation-counter-preview.png" alt="Donation Counter Component" />
</div>

---

## Step 1: Understand the Architecture

<div class="architecture-diagram">
  <div class="flow">
    Component → useDatabase Hook → Supabase Store → PostgreSQL Database
  </div>
</div>

**Key Concepts:**

- **Components**: UI building blocks (React + TypeScript)
- **Store**: State management (Zustand + Supabase)
- **Real-time**: Live updates via WebSocket subscriptions

---

## Step 2: Create Your Component

<div class="code-example">
  <div class="filename">src/components/DonationCounter.tsx</div>

```tsx
import { useDatabase } from '@/store';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DonationCounter() {
  const { donations, loading } = useDatabase();

  if (loading) {
    return <Skeleton className="h-24 w-48" />;
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold">Total Donations</h3>
      <p className="text-3xl font-bold text-primary">{donations.length}</p>
    </Card>
  );
}
```

</div>

<div class="callout tip">
  <strong>Best Practice:</strong> Always handle loading states with Skeleton components
</div>

---

## Step 3: Follow Component Patterns

Our components follow these patterns:

<div class="pattern-grid">
  <div class="pattern">
    <h4>🎨 Styling</h4>
    <p>Use Tailwind classes and design tokens</p>
    <code>className="text-primary bg-surface"</code>
  </div>
  
  <div class="pattern">
    <h4>📦 State</h4>
    <p>Access data via useDatabase hook</p>
    <code>const { data } = useDatabase()</code>
  </div>
  
  <div class="pattern">
    <h4>🔄 Loading</h4>
    <p>Show skeletons during data fetch</p>
    <code>if (loading) return &lt;Skeleton /&gt;</code>
  </div>
  
  <div class="pattern">
    <h4>❌ Errors</h4>
    <p>Handle errors gracefully</p>
    <code>if (error) return &lt;ErrorMessage /&gt;</code>
  </div>
</div>

---

## Step 4: Add Real-time Updates

<div class="code-example">
  <div class="filename">Enhanced with real-time</div>

```tsx
import { useEffect } from 'react';
import { useDatabase } from '@/store';

export function DonationCounter() {
  const { donations, loading, setupRealtimeSubscriptions } = useDatabase();

  useEffect(() => {
    // Enable real-time updates
    setupRealtimeSubscriptions();

    return () => {
      // Cleanup on unmount
      cleanupSubscriptions();
    };
  }, []);

  // ... rest of component
}
```

</div>

---

## Step 5: Test Your Component

<div class="test-steps">
  <div class="step">
    <span class="step-number">1</span>
    <div class="step-content">
      <h4>Run Type Check</h4>
      <code>npm run type-check</code>
    </div>
  </div>
  
  <div class="step">
    <span class="step-number">2</span>
    <div class="step-content">
      <h4>Run Tests</h4>
      <code>npm test</code>
    </div>
  </div>
  
  <div class="step">
    <span class="step-number">3</span>
    <div class="step-content">
      <h4>Check in Browser</h4>
      <code>npm run dev</code>
    </div>
  </div>
</div>

---

## Complete Example

Here's a production-ready donation counter with all best practices:

<div class="code-example">
  <div class="filename">Production Component</div>

```tsx
'use client';

import { useEffect } from 'react';
import { useDatabase } from '@/store';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { monitoring } from '@/lib/monitoring';

interface DonationCounterProps {
  className?: string;
  showTrend?: boolean;
}

export function DonationCounter({
  className = '',
  showTrend = false,
}: DonationCounterProps) {
  const {
    donations,
    loading,
    error,
    setupRealtimeSubscriptions,
    cleanupSubscriptions,
  } = useDatabase();

  useEffect(() => {
    try {
      setupRealtimeSubscriptions();
    } catch (err) {
      monitoring.trackError(err as Error, 'medium');
    }

    return () => cleanupSubscriptions();
  }, []);

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-10 w-20" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-4 border-red-200 ${className}`}>
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>Failed to load donations</span>
        </div>
      </Card>
    );
  }

  const activeDonations = donations.filter((d) => d.status === 'available');
  const trend = showTrend ? calculateTrend(donations) : null;

  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="text-sm font-medium text-muted-foreground">
        Active Donations
      </h3>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-primary">
          {activeDonations.length}
        </p>
        {trend && (
          <span
            className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {donations.length} total donations
      </p>
    </Card>
  );
}

function calculateTrend(donations: Donation[]): number {
  // Calculate week-over-week trend
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeek = donations.filter(
    (d) => new Date(d.created_at) > weekAgo
  ).length;

  const lastWeek = donations.filter(
    (d) =>
      new Date(d.created_at) > twoWeeksAgo && new Date(d.created_at) <= weekAgo
  ).length;

  if (lastWeek === 0) return 0;
  return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
}
```

</div>

---

## Try It Yourself

<div class="interactive-section">
  <h3>🎮 Interactive Playground</h3>
  <p>Experiment with the component in our playground:</p>
  <a href="/docs/playground?component=DonationCounter" class="button primary">
    Open in Playground →
  </a>
</div>

---

## Next Steps

Now that you've built your first component:

<div class="next-steps-grid">
  <a href="../02-architecture/component-architecture.md" class="next-card">
    <span class="icon">🏗️</span>
    <h4>Component Architecture</h4>
    <p>Deep dive into our component system</p>
  </a>
  
  <a href="../03-development/component-patterns.md" class="next-card">
    <span class="icon">📐</span>
    <h4>Advanced Patterns</h4>
    <p>Learn advanced component patterns</p>
  </a>
  
  <a href="../03-development/testing-guide.md" class="next-card">
    <span class="icon">🧪</span>
    <h4>Testing</h4>
    <p>Write tests for your components</p>
  </a>
</div>

---

## Additional Resources

- 📚 [Complete Component Reference](../05-api-reference/components.md)
- 🎨 [Design System Guide](../03-development/design-system.md)
- 🔧 [Troubleshooting](../04-deployment/troubleshooting.md)
- 💬 [Get Help](https://github.com/your-org/zipli/discussions)

---

<div class="feedback">
  <h4>Was this helpful?</h4>
  <div class="feedback-buttons">
    <button>👍 Yes</button>
    <button>👎 No</button>
  </div>
</div>
