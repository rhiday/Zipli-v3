/**
 * Lazy imports for heavy libraries to reduce initial bundle size
 * These libraries are loaded only when needed
 */

// PDF Generation - only loaded when user exports PDFs
export const loadJsPDF = async () => {
  const { jsPDF } = await import('jspdf');
  return jsPDF;
};

// Charts - only loaded on dashboard/analytics pages
export const loadRecharts = async () => {
  const recharts = await import('recharts');
  return recharts;
};

// QR Code - only loaded on QR login pages
export const loadQRCode = async () => {
  const QRCode = await import('react-qr-code');
  return QRCode.default;
};

// OpenAI - removed as per YC demo requirements
// AI features have been disabled for this version

// Syntax Highlighter - only loaded on docs page
export const loadSyntaxHighlighter = async () => {
  const { PrismLight } = await import('react-syntax-highlighter');
  const { vscDarkPlus } = await import(
    'react-syntax-highlighter/dist/esm/styles/prism'
  );
  return { PrismLight, vscDarkPlus };
};

// Markdown - only loaded on docs/content pages
export const loadMarkdown = async () => {
  const ReactMarkdown = await import('react-markdown');
  const remarkGfm = await import('remark-gfm');
  return {
    ReactMarkdown: ReactMarkdown.default,
    remarkGfm: remarkGfm.default,
  };
};
