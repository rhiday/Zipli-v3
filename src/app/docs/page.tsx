'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Search,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Book,
  Code,
  Rocket,
  Settings,
  Database,
  Shield,
  FileText,
  Home,
} from 'lucide-react';

// Documentation structure
const docStructure = {
  'getting-started': {
    icon: Rocket,
    title: 'Getting Started',
    items: [
      { path: '01-getting-started/index.md', title: 'Overview' },
      { path: '01-getting-started/quick-start.md', title: 'Quick Start' },
      { path: '01-getting-started/installation.md', title: 'Installation' },
      {
        path: '01-getting-started/environment-setup.md',
        title: 'Environment Setup',
      },
      {
        path: '01-getting-started/first-deployment.md',
        title: 'First Deployment',
      },
    ],
  },
  architecture: {
    icon: Database,
    title: 'Architecture',
    items: [
      { path: '02-architecture/index.md', title: 'Overview' },
      { path: '02-architecture/system-design.md', title: 'System Design' },
      { path: '02-architecture/database-schema.md', title: 'Database Schema' },
      {
        path: '02-architecture/component-architecture.md',
        title: 'Component Architecture',
      },
      {
        path: '02-architecture/performance-optimizations.md',
        title: 'Performance',
      },
    ],
  },
  development: {
    icon: Code,
    title: 'Development',
    items: [
      { path: '03-development/index.md', title: 'Overview' },
      {
        path: '03-development/component-patterns.md',
        title: 'Component Patterns',
      },
      {
        path: '03-development/store-integration.md',
        title: 'Store Integration',
      },
      { path: '03-development/testing-guide.md', title: 'Testing' },
      { path: '03-development/code-standards.md', title: 'Code Standards' },
    ],
  },
  deployment: {
    icon: Settings,
    title: 'Deployment',
    items: [
      { path: '04-deployment/index.md', title: 'Overview' },
      { path: '04-deployment/vercel-setup.md', title: 'Vercel Setup' },
      { path: '04-deployment/supabase-config.md', title: 'Supabase Config' },
      { path: '04-deployment/monitoring.md', title: 'Monitoring' },
      { path: '04-deployment/troubleshooting.md', title: 'Troubleshooting' },
    ],
  },
  'api-reference': {
    icon: FileText,
    title: 'API Reference',
    items: [
      { path: '05-api-reference/index.md', title: 'Overview' },
      { path: '05-api-reference/rest-endpoints.md', title: 'REST Endpoints' },
      { path: '05-api-reference/database-types.md', title: 'Database Types' },
      { path: '05-api-reference/store-methods.md', title: 'Store Methods' },
    ],
  },
  decisions: {
    icon: Shield,
    title: 'Decisions',
    items: [
      { path: '06-decisions/index.md', title: 'Overview' },
      { path: '06-decisions/performance-fixes.md', title: 'Performance Fixes' },
      { path: '06-decisions/why-supabase.md', title: 'Why Supabase' },
      {
        path: '06-decisions/architecture-choices.md',
        title: 'Architecture Choices',
      },
    ],
  },
};

function DocsContent() {
  const searchParams = useSearchParams();
  const [selectedDoc, setSelectedDoc] = useState('index.md');
  const [content, setContent] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'getting-started',
  ]);

  // Load document content
  useEffect(() => {
    const docPath = searchParams.get('path') || 'index.md';
    setSelectedDoc(docPath);
    loadDocument(docPath);
  }, [searchParams]);

  const loadDocument = async (path: string) => {
    try {
      // In production, this would fetch from your docs folder
      // For now, we'll use placeholder content
      const response = await fetch(`/docs/${path}`);
      if (response.ok) {
        const text = await response.text();
        setContent(text);
      } else {
        // Fallback content for demo
        setContent(getPlaceholderContent(path));
      }
    } catch (error) {
      setContent(getPlaceholderContent(path));
    }
  };

  const getPlaceholderContent = (path: string) => {
    if (path === 'index.md') {
      return `# Zipli Developer Documentation

Welcome to the comprehensive developer documentation for Zipli.

## Quick Links
- [Getting Started](/docs?path=01-getting-started/quick-start.md)
- [Architecture Overview](/docs?path=02-architecture/system-design.md)
- [API Reference](/docs?path=05-api-reference/rest-endpoints.md)

## Recent Updates
- Performance optimizations for 500+ users
- Security hardening
- Documentation consolidation`;
    }
    return `# ${path}

This documentation is being loaded. Please check back soon.`;
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const filteredDocs = Object.entries(docStructure).reduce(
    (acc, [key, section]) => {
      if (!searchQuery) return docStructure;

      const filteredItems = section.items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (filteredItems.length > 0) {
        acc[key as keyof typeof docStructure] = {
          ...section,
          items: filteredItems,
        };
      }

      return acc;
    },
    {} as typeof docStructure
  );

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md lg:hidden hover:bg-gray-100"
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
              <div className="flex items-center ml-4 lg:ml-0">
                <Book className="h-6 w-6 text-primary mr-2" />
                <h1 className="text-xl font-semibold">Zipli Docs</h1>
              </div>
            </div>

            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        >
          <nav className="h-full overflow-y-auto py-6 px-4">
            <a
              href="/docs"
              className="flex items-center px-3 py-2 mb-4 text-sm font-medium rounded-lg hover:bg-gray-100"
            >
              <Home className="h-4 w-4 mr-2" />
              Documentation Home
            </a>

            {Object.entries(filteredDocs).map(([key, section]) => {
              const Icon = section.icon;
              const isExpanded = expandedSections.includes(key);

              return (
                <div key={key} className="mb-6">
                  <button
                    onClick={() => toggleSection(key)}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <Icon className="h-4 w-4 mr-2" />
                      {section.title}
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 ml-6">
                      {section.items.map((item) => (
                        <a
                          key={item.path}
                          href={`/docs?path=${item.path}`}
                          className={`
                            block px-3 py-2 text-sm rounded-lg transition-colors
                            ${
                              selectedDoc === item.path
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            }
                          `}
                        >
                          {item.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="mb-8 text-sm">
              <ol className="flex items-center space-x-2">
                <li>
                  <a href="/docs" className="text-gray-500 hover:text-gray-700">
                    Docs
                  </a>
                </li>
                <li>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </li>
                <li className="text-gray-900 font-medium">
                  {selectedDoc.split('/').pop()?.replace('.md', '')}
                </li>
              </ol>
            </nav>

            {/* Markdown Content */}
            <article className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className="bg-gray-100 px-1 py-0.5 rounded text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  // Custom components for special elements
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-primary hover:text-primary/80 underline"
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic text-gray-700">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        {children}
                      </table>
                    </div>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </article>

            {/* Navigation */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex justify-between">
                <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                  <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                  Previous
                </button>
                <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <Suspense fallback={<div>Loading documentation...</div>}>
      <DocsContent />
    </Suspense>
  );
}
