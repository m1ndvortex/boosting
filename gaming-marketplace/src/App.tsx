import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="h-full bg-primary">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-primary text-4xl font-bold mb-4">
              Gaming Marketplace
            </h1>
            <p className="text-secondary text-lg">
              Discord-themed gaming services marketplace prototype
            </p>
            <p className="text-muted text-sm mt-4">
              Project foundation setup complete ✅
            </p>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
