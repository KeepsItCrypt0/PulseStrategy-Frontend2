import { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import Tabs from './components/Tabs';
import { HeadlessProvider } from './contexts/HeadlessContext';

function App() {
  const [account, setAccount] = useState(null);

  return (
    <HeadlessProvider>
      <div className="min-h-screen bg-background text-white">
        <header className="p-4 flex justify-between items-center bg-gray-900 shadow-lg border-b-4 border-border">
          <div className="flex items-center space-x-2">
            <img src="/src/assets/logo.png" alt="Pulse Strategy Logo" className="h-12" />
            <h1 className="text-2xl font-bold text-primary">Pulse Strategy</h1>
          </div>
          <WalletConnect account={account} setAccount={setAccount} />
        </header>
        <main className="container mx-auto p-4">
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