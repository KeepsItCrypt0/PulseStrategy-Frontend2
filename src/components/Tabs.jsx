import { useHeadless } from '../contexts/HeadlessContext';
import ContractInterface from './ContractInterface';

function Tabs({ account }) {
  const { contractType, setContractType } = useHeadless();

  return (
    <div>
      <div className="flex space-x-2 mb-4 border-b-2 border-border">
        {['xBond', 'iBond', 'PLSTR'].map((type) => (
          <button
            key={type}
            onClick={() => setContractType(type)}
            className={`py-2 px-4 font-semibold rounded-t-lg transition ${
              contractType === type
                ? 'bg-primary text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
      <ContractInterface account={account} contractType={contractType} />
    </div>
  );
}

export default Tabs;
