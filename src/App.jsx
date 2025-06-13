import { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import Tabs from './components/Tabs';
import { HeadlessProvider } from './contexts/HeadlessContext';
import './App.css'; // Import the custom CSS

function App() {
  const [account, setAccount] = useState(null);

  return (
    <HeadlessProvider>
      <div className="min-h-screen bg-background text-white">
        <header className="app-header p-4 flex justify-between items-center bg-gray-900 shadow-lg border-b-4 border-border">
          <div className="flex items-center space-x-2">
            <img src="/src/assets/logo.png" alt="Pulse Strategy Logo" className="app-logo h-12" />
            <h1 className="text-2xl font-bold text-primary text-shadow">Pulse Strategy</h1>
          </div>
          <WalletConnect account={account} setAccount={setAccount} />
        </header>
        <main className="app-main container mx-auto p-4">
          {account ? (
            <Tabs account={account} />
          ) : (
            <p className="text-center text-gray-400">Connect your wallet to interact with the contracts.</p>
          )}
        </main>
      </div>
    </HeadlessProvider>
  );
}

export default App;