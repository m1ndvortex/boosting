# Gaming Marketplace Prototype

A Discord-themed gaming services marketplace web application prototype built with React, TypeScript, and Vite.

## Features

- **Discord Theme**: Modern dark theme with Discord-inspired colors and styling
- **TypeScript**: Full type safety with strict mode enabled
- **React Router**: Client-side routing for SPA navigation
- **Styled Components**: CSS-in-JS styling solution
- **ESLint & Prettier**: Code linting and formatting
- **Vite**: Fast development and build tooling

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (buttons, inputs, etc.)
│   ├── layout/          # Layout components (sidebar, header, etc.)
│   └── discord/         # Discord-themed components
├── pages/               # Main page components
│   ├── auth/           # Authentication pages
│   ├── admin/          # Admin dashboard pages
│   ├── dashboard/      # Service provider dashboard pages
│   ├── marketplace/    # Client marketplace pages
│   ├── shop/           # Shop pages (available to all users)
│   └── wallet/         # Wallet pages (available to all users)
├── contexts/           # React contexts for state management
├── hooks/              # Custom React hooks
├── services/           # Data services and mock APIs
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles and theme
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Navigate to the project directory:

   ```bash
   cd gaming-marketplace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building

Build for production:

```bash
npm run build
```

### Code Quality

Run ESLint:

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

Run Prettier:

```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

## Technology Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Styled Components** - CSS-in-JS styling
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Discord Theme

The application uses a Discord-inspired theme with:

- Dark color palette matching Discord's interface
- Custom CSS variables for consistent theming
- Discord-style animations and transitions
- Typography using Discord's font stack
- Component styling that mimics Discord's UI patterns

## Development Guidelines

- Use TypeScript strict mode for all code
- Follow the established folder structure
- Use the provided utility functions and type definitions
- Maintain Discord theme consistency
- Write clean, readable code with proper formatting

## Next Steps

This foundation is ready for implementing the gaming marketplace features:

1. Authentication system with Discord OAuth simulation
2. Admin and Service Provider dashboards
3. Marketplace for browsing and purchasing services
4. Multi-currency wallet system
5. Team workspace functionality
6. Order management and evidence system
7. Shop for game time products

## License

This is a prototype project for demonstration purposes.
