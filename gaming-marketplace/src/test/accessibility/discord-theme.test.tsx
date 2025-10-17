import { describe, it, expect } from 'vitest';
import { render } from '@/test/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@components/discord/Button';
import { Modal } from '@components/discord/Modal';
import { WalletBalance } from '@components/wallet/WalletBalance';
import { ServiceCard } from '@components/marketplace/ServiceCard';
import { createMockService } from '@/test/utils/test-utils';

expect.extend(toHaveNoViolations);

describe('Discord Theme Accessibility', () => {
  it('should have no accessibility violations in Button component', async () => {
    const { container } = render(
      <div>
        <Button>Default Button</Button>
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button disabled>Disabled Button</Button>
        <Button loading>Loading Button</Button>
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper color contrast in Discord theme', async () => {
    const { container } = render(
      <div style={{ 
        backgroundColor: 'var(--discord-bg-primary)', 
        color: 'var(--discord-text-primary)',
        padding: '20px'
      }}>
        <h1>Discord Theme Heading</h1>
        <p>This is body text in the Discord theme.</p>
        <Button variant="primary">Action Button</Button>
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible Modal component', async () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content with proper accessibility attributes.</p>
        <Button>Close</Button>
      </Modal>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible WalletBalance component', async () => {
    const mockWallet = {
      userId: 'user-1',
      balances: { gold: 100000, usd: 500, toman: 20000000 },
      updatedAt: new Date(),
    };

    const { container } = render(<WalletBalance wallet={mockWallet} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible ServiceCard component', async () => {
    const mockService = createMockService();

    const { container } = render(
      <ServiceCard 
        service={mockService} 
        onSelect={() => {}} 
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper focus management', async () => {
    const { container } = render(
      <div>
        <Button>First Button</Button>
        <Button>Second Button</Button>
        <input type="text" placeholder="Text Input" aria-label="Text Input" />
        <label htmlFor="test-select">Test Select</label>
        <select id="test-select">
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </select>
      </div>
    );

    const results = await axe(container, {
      rules: {
        'focus-order-semantics': { enabled: true },
        'tabindex': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels and roles', async () => {
    const { container } = render(
      <div>
        <nav aria-label="Main navigation">
          <ul>
            <li><a href="/marketplace">Marketplace</a></li>
            <li><a href="/shop">Shop</a></li>
            <li><a href="/wallet">Wallet</a></li>
          </ul>
        </nav>
        <main>
          <h1>Page Title</h1>
          <section aria-labelledby="section-title">
            <h2 id="section-title">Section Title</h2>
            <p>Section content</p>
          </section>
        </main>
      </div>
    );

    const results = await axe(container, {
      rules: {
        'aria-valid-attr': { enabled: true },
        'aria-valid-attr-value': { enabled: true },
        'landmark-one-main': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });

  it('should have accessible form elements', async () => {
    const { container } = render(
      <form>
        <div>
          <label htmlFor="username">Username</label>
          <input id="username" type="text" required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required />
        </div>
        <div>
          <label htmlFor="currency">Currency</label>
          <select id="currency" required>
            <option value="">Select currency</option>
            <option value="usd">USD</option>
            <option value="gold">Gold</option>
          </select>
        </div>
        <Button type="submit">Submit</Button>
      </form>
    );

    const results = await axe(container, {
      rules: {
        'label': { enabled: true },
        'label-title-only': { enabled: true },
        'form-field-multiple-labels': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading hierarchy', async () => {
    const { container } = render(
      <div>
        <h1>Main Page Title</h1>
        <section>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
          <p>Content</p>
        </section>
        <section>
          <h2>Another Section</h2>
          <h3>Another Subsection</h3>
          <p>More content</p>
        </section>
      </div>
    );

    const results = await axe(container, {
      rules: {
        'heading-order': { enabled: true },
        'page-has-heading-one': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });
});