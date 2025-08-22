# Monitoring & Observability

<div class="reading-time">📖 8 min read</div>

Complete guide to monitoring your Zipli application, including free alternatives to expensive services.

---

## Monitoring Stack Overview

<div class="grid-cards">
  <div class="card">
    <h3>📊 Metrics</h3>
    <p>Performance, usage, and business KPIs</p>
    <a href="#metrics">Configure metrics →</a>
  </div>
  
  <div class="card">
    <h3>🐛 Error Tracking</h3>
    <p>Catch and fix errors before users report them</p>
    <a href="#error-tracking">Set up tracking →</a>
  </div>
  
  <div class="card">
    <h3>📈 Analytics</h3>
    <p>User behavior and feature usage</p>
    <a href="#analytics">Add analytics →</a>
  </div>
  
  <div class="card">
    <h3>🔔 Alerts</h3>
    <p>Get notified when things go wrong</p>
    <a href="#alerts">Configure alerts →</a>
  </div>
</div>

---

## Free Monitoring Solutions

### Error Tracking Alternatives to Sentry

<div class="tabs">
  <div class="tab-buttons">
    <button class="active">Rollbar (Recommended)</button>
    <button>Bugsnag</button>
    <button>GlitchTip</button>
    <button>Built-in Solution</button>
  </div>
  
  <div class="tab-content active">
    
### Rollbar - Free Tier

**Free Tier:** 5,000 events/month, 30-day retention

<div class="code-example">
  <div class="filename">Setup Rollbar</div>

```bash
# Install
npm install rollbar

# Configure in your app
```

```typescript
// lib/rollbar.ts
import Rollbar from 'rollbar';

const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  environment: process.env.NODE_ENV,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

export default rollbar;

// Use in your app
rollbar.error('Something went wrong', error);
```

</div>

**Pros:**

- Generous free tier
- Great error grouping
- Source map support
- User tracking

**Cons:**

- Limited team features in free tier
- 30-day retention only

  </div>

  <div class="tab-content">


### Bugsnag - Free Tier

**Free Tier:** 7,500 errors/month, 1 user

<div class="code-example">
  <div class="filename">Setup Bugsnag</div>

```bash
npm install @bugsnag/js @bugsnag/plugin-react
```

```typescript
// lib/bugsnag.ts
import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';

Bugsnag.start({
  apiKey: process.env.BUGSNAG_API_KEY,
  plugins: [new BugsnagPluginReact()],
  releaseStage: process.env.NODE_ENV,
});

export default Bugsnag;
```

</div>

**Pros:**

- Excellent React integration
- Session tracking
- Breadcrumbs
- Release tracking

**Cons:**

- Only 1 user in free tier
- Limited integrations

  </div>

  <div class="tab-content">


### GlitchTip - Self-Hosted (Free Forever)

**Cost:** Free (self-hosted)

<div class="code-example">
  <div class="filename">Deploy GlitchTip</div>

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: glitchtip
      POSTGRES_USER: glitchtip
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:6

  glitchtip:
    image: glitchtip/glitchtip
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://glitchtip:secret@postgres/glitchtip
      REDIS_URL: redis://redis:6379
      SECRET_KEY: your-secret-key
      EMAIL_URL: smtp://email-server
      GLITCHTIP_DOMAIN: https://your-domain.com
    ports:
      - '8000:8000'

volumes:
  postgres-data:
```

</div>

**Pros:**

- 100% free and open source
- Sentry-compatible SDK
- No event limits
- Full control over data

**Cons:**

- Requires self-hosting
- Maintenance overhead
- No built-in alerting

  </div>

  <div class="tab-content">


### Built-in Monitoring Solution

**Cost:** Free (already implemented)

<div class="code-example">
  <div class="filename">Your existing monitoring.ts</div>

```typescript
// lib/monitoring.ts
import { monitoring } from '@/lib/monitoring';

// Track errors
monitoring.trackError(error, 'high', {
  userId: user.id,
  action: 'donation_create',
});

// Track performance
monitoring.trackPerformance('api_call', duration);

// Get stats
const stats = monitoring.getErrorStats();
// { total: 12, critical: 1, high: 3, medium: 8 }
```

</div>

<div class="callout tip">
  <strong>Tip:</strong> The built-in solution is production-ready for up to 1,000 users. Add external service when you need team features.
</div>

**Enhance the built-in solution:**

```typescript
// Add persistence
class EnhancedMonitoring extends SimpleMonitoring {
  async persistErrors() {
    // Send to your database
    await supabase.from('error_logs').insert(this.errors);
  }

  async loadDashboard() {
    // Create monitoring dashboard
    const { data } = await supabase
      .from('error_logs')
      .select('*')
      .gte('created_at', '24 hours ago');

    return this.generateReport(data);
  }
}
```

  </div>
</div>

---

## Performance Monitoring

### Free APM Solutions

<table>
  <thead>
    <tr>
      <th>Service</th>
      <th>Free Tier</th>
      <th>Best For</th>
      <th>Setup Effort</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Vercel Analytics</strong></td>
      <td>Included with Vercel</td>
      <td>Next.js apps</td>
      <td>Zero config</td>
    </tr>
    <tr>
      <td><strong>Google Analytics</strong></td>
      <td>10M hits/month</td>
      <td>User behavior</td>
      <td>Easy</td>
    </tr>
    <tr>
      <td><strong>PostHog</strong></td>
      <td>1M events/month</td>
      <td>Product analytics</td>
      <td>Medium</td>
    </tr>
    <tr>
      <td><strong>Plausible</strong></td>
      <td>30-day trial</td>
      <td>Privacy-focused</td>
      <td>Easy</td>
    </tr>
    <tr>
      <td><strong>Grafana Cloud</strong></td>
      <td>10K series</td>
      <td>Custom metrics</td>
      <td>Complex</td>
    </tr>
  </tbody>
</table>

### Setting Up Vercel Analytics (Recommended)

<div class="code-example">
  <div class="filename">Enable Vercel Analytics</div>

```bash
# Install
npm install @vercel/analytics

# Add to your app
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

</div>

<div class="metrics">
  <div class="metric">
    <span class="value">Free</span>
    <span class="label">With Vercel hosting</span>
  </div>
  <div class="metric">
    <span class="value">Zero</span>
    <span class="label">Configuration needed</span>
  </div>
  <div class="metric">
    <span class="value">Real-time</span>
    <span class="label">Core Web Vitals</span>
  </div>
</div>

---

## Database Monitoring

### Supabase Built-in Monitoring

<div class="monitoring-checklist">
  ✓ Query Performance (Dashboard → Database → Query Performance)<br/>
  ✓ Connection Pool Status (Dashboard → Database → Connection Pooling)<br/>
  ✓ Slow Query Logs (Dashboard → Logs → Postgres)<br/>
  ✓ Database Size (Dashboard → Database → Statistics)<br/>
  ✓ Real-time Subscriptions (Dashboard → Realtime → Inspector)
</div>

### Custom Database Monitoring

<div class="code-example">
  <div class="filename">Database Health Check</div>

```sql
-- Create monitoring views
CREATE VIEW monitoring_stats AS
SELECT
  (SELECT count(*) FROM donations) as total_donations,
  (SELECT count(*) FROM requests) as total_requests,
  (SELECT count(*) FROM profiles) as total_users,
  (SELECT pg_database_size(current_database())) as db_size,
  (SELECT count(*) FROM pg_stat_activity) as active_connections;

-- Query performance
CREATE VIEW slow_queries AS
SELECT
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;
```

</div>

---

## Setting Up Alerts

### Free Alerting Options

<div class="grid-cards">
  <div class="card">
    <h3>📧 Email Alerts</h3>
    <p>Using Supabase Edge Functions</p>
    <code>Free with Supabase</code>
  </div>
  
  <div class="card">
    <h3>📱 Discord/Slack</h3>
    <p>Webhook integrations</p>
    <code>Free webhooks</code>
  </div>
  
  <div class="card">
    <h3>📊 Uptime Robot</h3>
    <p>50 monitors free</p>
    <code>5-minute checks</code>
  </div>
  
  <div class="card">
    <h3>🔔 Better Uptime</h3>
    <p>10 monitors free</p>
    <code>3-minute checks</code>
  </div>
</div>

### Implement Discord Alerts

<div class="code-example">
  <div class="filename">Discord Alert System</div>

```typescript
// lib/alerts.ts
class AlertSystem {
  private webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  async sendAlert(
    level: 'info' | 'warning' | 'critical',
    message: string,
    details?: any
  ) {
    const color = {
      info: 0x3498db, // Blue
      warning: 0xf39c12, // Orange
      critical: 0xe74c3c, // Red
    };

    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: `🚨 ${level.toUpperCase()} Alert`,
            description: message,
            color: color[level],
            fields: details
              ? Object.entries(details).map(([key, value]) => ({
                  name: key,
                  value: String(value),
                  inline: true,
                }))
              : [],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  }

  // Automated checks
  async checkHealth() {
    const response = await fetch('/api/health');
    const data = await response.json();

    if (data.status !== 'healthy') {
      await this.sendAlert('critical', 'Health check failed', data.checks);
    }
  }
}

// Set up cron job (using Vercel Cron or GitHub Actions)
export async function runHealthCheck() {
  const alerts = new AlertSystem();
  await alerts.checkHealth();
}
```

</div>

---

## Dashboard Creation

### Build Your Own Monitoring Dashboard

<div class="code-example">
  <div class="filename">app/admin/monitoring/page.tsx</div>

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { monitoring } from '@/lib/monitoring';

export default function MonitoringDashboard() {
  const [stats, setStats] = useState({
    errors: { total: 0, critical: 0 },
    performance: { avgDuration: 0, slowOps: 0 },
    health: { status: 'unknown' },
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      // Fetch monitoring data
      const errorStats = monitoring.getErrorStats();
      const perfStats = monitoring.getPerformanceStats();

      // Health check
      const health = await fetch('/api/health').then((r) => r.json());

      setStats({
        errors: errorStats,
        performance: perfStats,
        health,
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">System Health</h3>
        <div
          className={`text-3xl font-bold ${
            stats.health.status === 'healthy'
              ? 'text-green-600'
              : 'text-red-600'
          }`}
        >
          {stats.health.status === 'healthy' ? '✓' : '✗'}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Errors (24h)</h3>
        <div className="text-3xl font-bold">{stats.errors.total}</div>
        <p className="text-sm text-red-600">{stats.errors.critical} critical</p>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Avg Response</h3>
        <div className="text-3xl font-bold">
          {stats.performance.avgDuration}ms
        </div>
        <p className="text-sm text-gray-600">
          {stats.performance.slowOps} slow ops
        </p>
      </Card>
    </div>
  );
}
```

</div>

---

## Monitoring Checklist

### Initial Setup (Day 1)

<div class="checklist">
  ✓ Enable Vercel Analytics<br/>
  ✓ Set up health endpoint monitoring<br/>
  ✓ Configure Discord/Slack webhooks<br/>
  ✓ Add Uptime Robot for availability<br/>
  ✓ Test alert notifications
</div>

### First Week

<div class="checklist">
  ✓ Choose error tracking service (Rollbar recommended)<br/>
  ✓ Set up error alerting thresholds<br/>
  ✓ Create monitoring dashboard<br/>
  ✓ Document runbook for common issues<br/>
  ✓ Set up daily health report
</div>

### First Month

<div class="checklist">
  ✓ Analyze performance patterns<br/>
  ✓ Optimize slow queries<br/>
  ✓ Set up user analytics (PostHog)<br/>
  ✓ Create SLA targets<br/>
  ✓ Implement automated testing
</div>

---

## Cost Comparison

<table>
  <thead>
    <tr>
      <th>Setup</th>
      <th>Monthly Cost</th>
      <th>Capabilities</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Free Tier Stack</strong></td>
      <td>$0</td>
      <td>
        • Vercel Analytics<br/>
        • Rollbar (5K events)<br/>
        • Uptime Robot<br/>
        • Built-in monitoring
      </td>
    </tr>
    <tr>
      <td><strong>Starter Stack</strong></td>
      <td>$26</td>
      <td>
        • Everything above +<br/>
        • Sentry Pro<br/>
        • Better Uptime Pro
      </td>
    </tr>
    <tr>
      <td><strong>Professional Stack</strong></td>
      <td>$150+</td>
      <td>
        • DataDog or New Relic<br/>
        • LogRocket<br/>
        • Full APM suite
      </td>
    </tr>
  </tbody>
</table>

---

## Next Steps

<div class="next-steps-grid">
  <a href="./troubleshooting.md" class="next-card">
    <span class="icon">🔧</span>
    <h4>Troubleshooting</h4>
    <p>Common issues and fixes</p>
  </a>
  
  <a href="./production-checklist.md" class="next-card">
    <span class="icon">✅</span>
    <h4>Production Checklist</h4>
    <p>Pre-launch verification</p>
  </a>
  
  <a href="../06-decisions/performance-fixes.md" class="next-card">
    <span class="icon">⚡</span>
    <h4>Performance</h4>
    <p>Optimization techniques</p>
  </a>
</div>

---

<div class="feedback">
  <h4>Need help with monitoring?</h4>
  <a href="https://github.com/your-org/zipli/discussions" class="button primary">
    Ask the community →
  </a>
</div>
