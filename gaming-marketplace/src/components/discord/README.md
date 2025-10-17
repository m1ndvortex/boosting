# Discord Theme System

A comprehensive Discord-themed UI component library built with React and TypeScript.

## Components

### Core Components

#### Button
Discord-styled button component with multiple variants and states.

```tsx
import { Button } from '@/components/discord';

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean
- `loading`: boolean

#### Input
Form input component with Discord styling and validation support.

```tsx
import { Input } from '@/components/discord';

<Input
  label="Username"
  placeholder="Enter username"
  error="Username is required"
  leftIcon="👤"
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `fullWidth`: boolean

#### Card
Container component for grouping related content.

```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@/components/discord';

<Card hover>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardBody>
    Card content goes here
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Props:**
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `hover`: boolean
- `clickable`: boolean

#### Modal
Overlay component for dialogs and popups.

```tsx
import { Modal, ModalBody, ModalFooter } from '@/components/discord';

<Modal isOpen={isOpen} onClose={handleClose} title="Modal Title">
  <ModalBody>
    Modal content
  </ModalBody>
  <ModalFooter>
    <Button onClick={handleClose}>Close</Button>
  </ModalFooter>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `closeOnOverlayClick`: boolean
- `closeOnEscape`: boolean

#### Badge
Small status indicator component.

```tsx
import { Badge } from '@/components/discord';

<Badge variant="success" size="sm">Online</Badge>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
- `size`: 'sm' | 'md' | 'lg'

#### Avatar
User profile picture component with status indicator.

```tsx
import { Avatar } from '@/components/discord';

<Avatar
  src="/avatar.jpg"
  alt="User Avatar"
  size="md"
  status="online"
  fallback="JD"
/>
```

**Props:**
- `src`: string
- `alt`: string
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `status`: 'online' | 'idle' | 'dnd' | 'offline'
- `fallback`: string

#### Spinner
Loading indicator component.

```tsx
import { Spinner } from '@/components/discord';

<Spinner size="md" />
```

**Props:**
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `color`: string

## Layout Components

#### Sidebar
Navigation sidebar with collapsible support.

```tsx
import { Sidebar } from '@/components/layout';

const items = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    active: true
  },
  {
    id: 'services',
    label: 'Services',
    icon: '🎮',
    badge: '3',
    children: [
      { id: 'active', label: 'Active Services' },
      { id: 'pending', label: 'Pending' }
    ]
  }
];

<Sidebar items={items} collapsible />
```

#### Header
Page header with breadcrumbs and actions.

```tsx
import { Header } from '@/components/layout';

<Header
  title="Page Title"
  subtitle="Page description"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Current Page' }
  ]}
  actions={<Button>Action</Button>}
/>
```

#### Layout
Main layout container components.

```tsx
import { Layout, MainContent, ContentArea } from '@/components/layout';

<Layout>
  <MainContent>
    <ContentArea maxWidth="1200px">
      Content goes here
    </ContentArea>
  </MainContent>
</Layout>
```

## Theme System

### Color Palette

The theme uses Discord's official color palette:

```css
/* Primary Colors */
--discord-bg-primary: #2f3136;
--discord-bg-secondary: #36393f;
--discord-bg-tertiary: #202225;

/* Accent Colors */
--discord-accent: #7289da;
--discord-success: #43b581;
--discord-warning: #faa61a;
--discord-danger: #f04747;

/* Text Colors */
--discord-text-primary: #ffffff;
--discord-text-secondary: #b9bbbe;
--discord-text-muted: #72767d;
```

### Typography

Discord-inspired typography system with proper font weights and sizes:

```css
/* Font weights */
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Animations

Smooth animations and transitions following Discord's design principles:

```css
/* Transition speeds */
--transition-fast: 0.17s ease;
--transition-normal: 0.25s ease;
--transition-slow: 0.35s ease;
```

### Utility Classes

#### Spacing
- `.p-sm`, `.p-md`, `.p-lg` - Padding
- `.m-sm`, `.m-md`, `.m-lg` - Margin
- `.gap-sm`, `.gap-md`, `.gap-lg` - Gap

#### Layout
- `.flex`, `.flex-col` - Flexbox
- `.items-center`, `.justify-center` - Alignment
- `.discord-grid`, `.discord-grid--2` - Grid layouts

#### Colors
- `.text-primary`, `.text-secondary`, `.text-muted` - Text colors
- `.bg-primary`, `.bg-secondary`, `.bg-tertiary` - Background colors

#### Typography
- `.text-xs`, `.text-sm`, `.text-base`, `.text-lg` - Font sizes
- `.font-light`, `.font-normal`, `.font-medium` - Font weights

#### Animations
- `.animate-fade-in`, `.animate-slide-up` - Entrance animations
- `.transition-all`, `.duration-fast` - Transitions
- `.hover-lift`, `.hover-glow` - Hover effects

## Best Practices

1. **Consistent Spacing**: Use the predefined spacing variables (`--spacing-xs` to `--spacing-xl`)
2. **Color Usage**: Stick to the Discord color palette for consistency
3. **Typography**: Use the typography scale for consistent text sizing
4. **Animations**: Keep animations subtle and fast (0.17s for most interactions)
5. **Accessibility**: All components include proper focus states and ARIA attributes
6. **Responsive**: Components are designed to work on all screen sizes

## Accessibility

All components follow accessibility best practices:

- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- High contrast support
- Reduced motion support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- CSS-in-JS avoided for better performance
- Minimal bundle size impact
- Hardware-accelerated animations
- Optimized for tree-shaking