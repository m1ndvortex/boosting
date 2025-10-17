import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { AppRouter } from './components/routing/AppRouter';
import './components/common/Loading.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <WorkspaceProvider>
          <AppRouter />
        </WorkspaceProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
