import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import xBondABI from '../contracts/xBondABI.json';
import iBondABI from '../contracts/iBondABI.json';
import plstrABI from '../contracts/plstrABI.json';

const contractAddresses = {
  xBond: '0x887C5ABAAAC2161E9A742f600B16d5b00850b63b',
  iBond: '0xeD21E067dDBCd189AcB7c43302fB0Dc3b7bF59E0',
  PLSTR: '0xCc5EDB7c828fCe820f3b4571951a96029a45F663',
};

const tokenAddresses = {
  PLSX: '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab',
  INC: '0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d',
  vPLS: '0x79BB3A0Ee435f957ce4f54eE8c3CFADc7278da0C',
};

function ContractInterface({ account, contractType }) {
  const [contract, setContract] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const initContract = async () => {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const abi = contractType === 'xBond' ? xBondABI : contractType === 'iBond' ? iBondABI : plstrABI;
      const contractInstance = new ethers.Contract(
        contractAddresses[contractType],
        abi,
        signer
      );
      setContract(contractInstance);
      fetchMetrics(contractInstance);
    };

    const fetchMetrics = async (contract) => {
      try {
        if (contractType === 'PLSTR') {
          const [
            metrics,
            eligibility,
            weight,
            lastUpdate,
          ] = await Promise.all([
            contract.getContractMetrics(),
            contract.getClaimEligibility(account),
            contract.getCurrentWeight(),
            contract.getLastWeightUpdate(),
          ]);
          setMetrics({
            totalSupply: ethers.formatEther(metrics.contractTotalSupply),
            vPlsBalance: ethers.formatEther(metrics.vPlsBalance),
            totalMinted: ethers.formatEther(metrics.totalMinted),
            totalBurned: ethers.formatEther(metrics.totalBurned),
            totalDeposited: ethers.formatEther(metrics.totalDeposited),
            avgPlstrPerBond: ethers.formatEther(metrics.avgPlstrPerBond),
            claimablePLSTR: ethers.formatEther(eligibility.claimablePLSTR),
            xBondBalance: ethers.formatEther(eligibility.xBondBalance),
            iBondBalance: ethers.formatEther(eligibility.iBondBalance),
            weight: weight.toString(),
            lastUpdate: new Date(Number(lastUpdate) * 1000).toLocaleString(),
          });
        } else {
          const [metrics, issuance] = await Promise.all([
            contract.getContractMetrics(),
            contract.getIssuanceStatus(),
          ]);
          setMetrics({
            totalSupply: ethers.formatEther(metrics.contractTotalSupply),
            tokenBalance: ethers.formatEther(
              contractType === 'xBond' ? metrics.plsxBalance : metrics.incBalance
            ),
            totalMinted: ethers.formatEther(metrics.totalMinted),
            totalBurned: ethers.formatEther(metrics.totalBurned),
            backingRatio: ethers.formatEther(metrics.plsxBackingRatio || metrics.incBackingRatio),
            issuanceActive: issuance.isActive,
            timeRemaining: issuance.timeRemaining.toString(),
          });
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    initContract();
  }, [account, contractType]);

  const handleAction = async (action, params = []) => {
    if (!contract || !input) return;
    setLoading(true);
    setMessage('');
    try {
      const tx = await contract[action](...params, { gasLimit: 300000 });
      await tx.wait();
      setMessage(`Transaction successful: ${tx.hash}`);
      setInput('');
      // Refresh metrics
      if (contractType === 'PLSTR') {
        const metrics = await contract.getContractMetrics();
        const eligibility = await contract.getClaimEligibility(account);
        setMetrics({
          ...metrics,
          totalSupply: ethers.formatEther(metrics.contractTotalSupply),
          vPlsBalance: ethers.formatEther(metrics.vPlsBalance),
          totalMinted: ethers.formatEther(metrics.totalMinted),
          totalBurned: ethers.formatEther(metrics.totalBurned),
          totalDeposited: ethers.formatEther(metrics.totalDeposited),
          avgPlstrPerBond: ethers.formatEther(metrics.avgPlstrPerBond),
          claimablePLSTR: ethers.formatEther(eligibility.claimablePLSTR),
          xBondBalance: ethers.formatEther(eligibility.xBondBalance),
          iBondBalance: ethers.formatEther(eligibility.iBondBalance),
        });
      } else {
        const metrics = await contract.getContractMetrics();
        setMetrics({
          ...metrics,
          totalSupply: ethers.formatEther(metrics.contractTotalSupply),
          tokenBalance: ethers.formatEther(
            contractType === 'xBond' ? metrics.plsxBalance : metrics.incBalance
          ),
          totalMinted: ethers.formatEther(metrics.totalMinted),
          totalBurned: ethers.formatEther(metrics.totalBurned),
          backingRatio: ethers.formatEther(metrics.plsxBackingRatio || metrics.incBackingRatio),
        });
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const approveToken = async (tokenAddress, amount) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function approve(address spender, uint256 amount) public returns (bool)'],
      signer
    );
    const tx = await tokenContract.approve(
      contractAddresses[contractType],
      ethers.parseEther(amount)
    );
    await tx.wait();
    setMessage(`Approved ${amount} tokens`);
  };

  const renderActions = () => {
    if (contractType === 'xBond' || contractType === 'iBond') {
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-secondary">Issue Shares</h3>
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Amount (${contractType === 'xBond' ? 'PLSX' : 'INC'})`}
              className="w-full p-2 mt-1 bg-gray-800 text-gray-100 rounded-lg border border-border"
            />
            <button
              onClick={() =>
                approveToken(
                  contractType === 'xBond' ? tokenAddresses.PLSX : tokenAddresses.INC,
                  input
                )
              }
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >
              Approve
            </button>
            <button
              onClick={() => handleAction('issueShares', [ethers.parseEther(input)])}
              disabled={loading || !input}
              className="mt-2 w-full bg-accent hover:bg-red-600 text-white py-2 rounded-lg"
            >
              {loading ? 'Processing...' : 'Issue'}
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary">Redeem Shares</h3>
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Amount (xBond/iBond)"
              className="w-full p-2 mt-1 bg-gray-800 text-gray-100 rounded-lg border border-border"
            />
            <button
              onClick={() => handleAction('redeemShares', [ethers.parseEther(input)])}
              disabled={loading || !input}
              className="mt-2 w-full bg-accent hover:bg-red-600 text-white py-2 rounded-lg"
            >
              {loading ? 'Processing...' : 'Redeem'}
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary">Transfer</h3>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Recipient Address, Amount (comma-separated)"
              className="w-full p-2 mt-1 bg-gray-800 text-gray-100 rounded-lg border border-border"
            />
            <button
              onClick={() => {
                const [to, amount] = input.split(',').map((s) => s.trim());
                handleAction('transfer', [to, ethers.parseEther(amount)]);
              }}
              disabled={loading || !input}
              className="mt-2 w-full bg-accent hover:bg-red-600 text-white py-2 rounded-lg"
            >
              {loading ? 'Transferring...' : 'Transfer'}
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary">Burn Contract Tokens</h3>
            <button
              onClick={() =>
                handleAction(contractType === 'xBond' ? 'burnContractXBond' : 'burnContractIBond')
              }
              disabled={loading}
              className="mt-2 w-full bg-accent hover:bg-red-600 text-white py-2 rounded-lg"
            >
              {loading ? 'Processing...' : 'Burn'}
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-secondary">Deposit vPLS</h3>
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Amount (vPLS)"
              className="w-full p-2 mt-1 bg-gray-800 text-gray-100 rounded-lg border border-border"
            />
            <button
              onClick={() => approveToken(tokenAddresses.vPLS, input)}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >
              Approve
            </button>
            <button
              onClick={() => handleAction('depositTokens', [ethers.parseEther(input)])}
              disabled={loading || !input}
              className="mt-2 w-full bg-accent hover:bg-red-600 text-white py-2 rounded-lg"
            >
              {loading ? 'Processing...' : 'Deposit'}
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary">Claim PLSTR</h3>
            <button
              onClick={() => handleAction('claimPLSTR')}
              disabled={loading}
              className="mt-2 w-full bg-accent hover:bg-red-600 text-white py-2 rounded-lg"
            >
              {loading ? 'Processing...' : 'Claim'}
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary">Redeem PLSTR</h3>
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Amount (PLSTR)"
              className="w-full p-2 mt-1 bg-gray-800 text-gray-100 rounded-lg border border-border"
            />
            <button
              onClick={() => handleAction('redeemPLSTR', [ethers.parseEther(input)])}
              disabled={loading || !input}
              className="mt-2 w-full bg-accent hover:bg-red-600 text-white py-2 rounded-lg"
            >
              {loading ? 'Processing...' : 'Redeem'}
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary">Update Weight</h3>
            <button
              onClick={() => handleAction('updateWeight')}
              disabled={loading}
              className="mt-2 w-full bg-accent hover:bg-red-600 text-white py-2 rounded-lg"
            >
              {loading ? 'Processing...' : 'Update'}
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg border-2 border-border">
      <h2 className="text-2xl font-bold mb-4 text-primary">{contractType} Interface</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key}>
            <span className="font-semibold text-secondary">{key}:</span> {value}
          </div>
        ))}
      </div>
      {renderActions()}
      {message && <p className="mt-4 text-center text-sm text-gray-300">{message}</p>}
    </div>
  );
}

export default ContractInterface;