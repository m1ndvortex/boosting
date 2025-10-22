import { BrowserRouter as Router } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { NotificationProvider } from './components/notifications/NotificationSystem';
import { AppProvider } from './contexts/AppProvider';
import { AppRouter } from './components/routing/AppRouter';
import './styles/global.css';
import './styles/theme.css';
import './styles/animations.css';
import './styles/responsive.css';
import './components/common/Loading.css';

function App() {
  return (
    <ErrorBoundary level="page">
      <Router>
        <NotificationProvider>
          <AppProvider>
            <AppRouter />
          </AppProvider>
        </NotificationProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
