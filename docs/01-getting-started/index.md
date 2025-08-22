# Getting Started

Build your first feature on Zipli in under 5 minutes.

<div class="grid-cards">
  <div class="card">
    <h3>🚀 Quick Start</h3>
    <p>Get up and running with Zipli in minutes</p>
    <a href="./quick-start.md">Start building →</a>
  </div>
  
  <div class="card">
    <h3>📦 Installation</h3>
    <p>Set up your development environment</p>
    <a href="./installation.md">Install Zipli →</a>
  </div>
  
  <div class="card">
    <h3>🔧 Configuration</h3>
    <p>Configure Supabase and environment variables</p>
    <a href="./environment-setup.md">Configure →</a>
  </div>
  
  <div class="card">
    <h3>🎯 First Deployment</h3>
    <p>Deploy your first version to production</p>
    <a href="./first-deployment.md">Deploy now →</a>
  </div>
</div>

---

## Prerequisites

Before you begin, make sure you have:

<div class="checklist">
  ✓ Node.js 18+ installed<br/>
  ✓ Git for version control<br/>
  ✓ A Supabase account (free tier works)<br/>
  ✓ A Vercel account for deployment<br/>
  ✓ Basic knowledge of React and TypeScript
</div>

---

## Choose Your Path

<div class="tabs">
  <div class="tab-buttons">
    <button class="active">I'm new to Zipli</button>
    <button>I'm setting up locally</button>
    <button>I'm deploying to production</button>
  </div>
  
  <div class="tab-content active">
    
### Welcome to Zipli! 👋

Follow these steps to get started:

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/zipli.git
   cd zipli
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

🎉 **Congratulations!** You're now running Zipli locally.

**Next steps:**

- [Understand the architecture](../02-architecture/system-design.md)
- [Learn component patterns](../03-development/component-patterns.md)
- [Set up your database](./environment-setup.md)

  </div>

  <div class="tab-content">


### Local Development Setup

<div class="step-indicator">
  <span class="step active">1</span>
  <span class="step">2</span>
  <span class="step">3</span>
  <span class="step">4</span>
</div>

#### Step 1: Database Setup

Create a Supabase project and run migrations:

```sql
-- Run in Supabase SQL Editor
-- Files in: supabase/migrations/
```

<details>
<summary>View migration files</summary>

1. `20250813_create_core_tables.sql`
2. `20250813_setup_rls_policies.sql`
3. `20250813_auth_triggers.sql`
4. `20250821_performance_indexes.sql`

</details>

#### Step 2: Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

<div class="callout info">
  <strong>Tip:</strong> Never commit .env.local to version control
</div>

#### Step 3: Install & Run

```bash
npm install
npm run dev
```

#### Step 4: Verify Installation

Check these endpoints:

- App: `http://localhost:3000`
- Health: `http://localhost:3000/api/health`

  </div>

  <div class="tab-content">


### Production Deployment

Deploy Zipli to handle 500+ concurrent users.

<div class="deployment-flow">
  <div class="flow-step">
    <span class="number">1</span>
    <h4>Supabase Setup</h4>
    <p>Configure production database</p>
  </div>
  <div class="flow-arrow">→</div>
  <div class="flow-step">
    <span class="number">2</span>
    <h4>Vercel Config</h4>
    <p>Set environment variables</p>
  </div>
  <div class="flow-arrow">→</div>
  <div class="flow-step">
    <span class="number">3</span>
    <h4>Deploy</h4>
    <p>Push to production</p>
  </div>
</div>

**Quick Deploy:**

```bash
vercel --prod
```

Or use the deploy button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/zipli)

<div class="callout warning">
  <strong>Important:</strong> Enable connection pooling in Supabase for production
</div>

[Full deployment guide →](./first-deployment.md)

  </div>
</div>

---

## Common Issues

<details>
<summary><strong>Build fails with "Missing environment variable"</strong></summary>

Ensure all required environment variables are set:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

</details>

<details>
<summary><strong>Database connection errors</strong></summary>

1. Check Supabase project is running
2. Verify connection pooling is enabled
3. Confirm environment variables are correct
</details>

<details>
<summary><strong>TypeScript errors</strong></summary>

Run type checking:

```bash
npm run type-check
```

</details>

---

## Get Help

<div class="help-cards">
  <a href="../04-deployment/troubleshooting.md" class="help-card">
    <span class="icon">🔧</span>
    <h4>Troubleshooting</h4>
    <p>Common issues and solutions</p>
  </a>
  
  <a href="https://github.com/your-org/zipli/issues" class="help-card">
    <span class="icon">🐛</span>
    <h4>Report Issue</h4>
    <p>Found a bug? Let us know</p>
  </a>
  
  <a href="#" class="help-card">
    <span class="icon">💬</span>
    <h4>Community</h4>
    <p>Join our Discord server</p>
  </a>
</div>

---

**Ready to build?** Continue to the [Quick Start Guide](./quick-start.md) →
