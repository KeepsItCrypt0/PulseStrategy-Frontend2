import { useEffect } from 'react';
import { ethers } from 'ethers';

function WalletConnect({ account, setAccount }) {
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        setAccount(accounts[0]);

        // Switch to PulseChain (Chain ID: 369)
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x171' }],
        });

        window.ethereum.on('accountsChanged', (newAccounts) => {
          setAccount(newAccounts[0] || null);
        });
      } catch (error) {
        console.error('Wallet connection failed:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <button
      onClick={connectWallet}
      className="bg-primary hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition"
    >
      {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
    </button>
  );
}

export default WalletConnect;