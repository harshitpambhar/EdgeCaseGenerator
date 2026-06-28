import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { Download, Play, Copy } from 'lucide-react';
import { useState } from 'react';

const script = {
  name: 'checkout-flow.spec.ts',
  framework: 'Playwright',
  tests: 8,
  assertions: 24,
  code: `import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should complete checkout with valid card', async ({ page }) => {
    // Navigate to products
    await page.goto('/products');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();

    // Add to cart
    await page.locator('[data-testid="add-to-cart"]').first().click();
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');

    // Go to cart
    await page.goto('/cart');
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);

    // Proceed to checkout
    await page.locator('[data-testid="checkout-btn"]').click();
    await expect(page).toHaveURL('/checkout');

    // Fill shipping
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="address"]', '123 Main St');
    await page.fill('[name="city"]', 'New York');
    await page.fill('[name="zip"]', '10001');

    // Fill payment
    await page.fill('[data-testid="card-number"]', '4111111111111111');
    await page.fill('[data-testid="card-expiry"]', '12/26');
    await page.fill('[data-testid="card-cvv"]', '123');

    // Place order
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/orders') && resp.status() === 201),
      page.locator('[data-testid="place-order-btn"]').click(),
    ]);

    // Verify confirmation
    await expect(page).toHaveURL(/\\/order-confirmation/);
    await expect(page.locator('[data-testid="order-id"]')).toBeVisible();
  });

  test('should reject expired card', async ({ page }) => {
    await page.goto('/checkout');
    await page.fill('[data-testid="card-expiry"]', '01/20');
    await page.locator('[data-testid="place-order-btn"]').click();
    await expect(page.locator('[data-testid="card-error"]')).toContainText('expired');
  });
});`,
};

export default function ScriptViewerPage() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(script.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-white/30">
        <Link to="/automation" className="hover:text-white/60 transition-colors no-underline">Automation</Link>
        <span>/</span>
        <span className="text-white/60 font-mono">{script.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white font-mono">{script.name}</h2>
          <p className="text-sm text-white/40 mt-0.5">{script.framework} · {script.tests} tests · {script.assertions} assertions</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy}
            className="h-9 px-4 rounded-lg border border-white/[0.08] text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors cursor-pointer bg-transparent flex items-center gap-2">
            <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy'}
          </button>
          <button className="h-9 px-4 rounded-lg border border-white/[0.08] text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors cursor-pointer bg-transparent flex items-center gap-2">
            <Download className="w-4 h-4" /> Download
          </button>
          <Link to="/executions"
            className="h-9 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-sm text-white font-medium transition-colors no-underline flex items-center gap-2">
            <Play className="w-3.5 h-3.5" /> Run script
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Test cases', value: script.tests },
          { label: 'Assertions', value: script.assertions },
          { label: 'Framework', value: script.framework },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
            <p className="text-xl font-semibold text-white">{s.value}</p>
            <p className="text-xs text-white/30 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Code viewer */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/60" />
            <div className="w-3 h-3 rounded-full bg-amber-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-xs text-white/30 font-mono">{script.name}</span>
          <span className="text-xs text-white/20">TypeScript</span>
        </div>
        <div className="overflow-x-auto">
          <pre className="p-5 text-xs font-mono text-white/70 leading-relaxed whitespace-pre overflow-x-auto">
            <code>{script.code}</code>
          </pre>
        </div>
      </motion.div>
    </div>
  );
}
