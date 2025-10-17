import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { WalletProvider } from './contexts/WalletContext';
import { AppRouter } from './components/routing/AppRouter';
import './components/common/Loading.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <WalletProvider>
          <WorkspaceProvider>
            <AppRouter />
          </WorkspaceProvider>
        </WalletProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
