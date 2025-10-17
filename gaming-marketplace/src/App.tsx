import { BrowserRouter as Router } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { NotificationProvider } from './contexts/NotificationContext';
import { NotificationContainer } from './components/notifications/NotificationContainer';
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
            <NotificationContainer />
          </AppProvider>
        </NotificationProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
