import { createContext, useContext, useState } from 'react';

const HeadlessContext = createContext();

export function HeadlessProvider({ children }) {
  const [contractType, setContractType] = useState('xBond');

  return (
    <HeadlessContext.Provider value={{ contractType, setContractType }}>
      {children}
    </HeadlessContext.Provider>
  );
}

export function useHeadless() {
  return useContext(HeadlessContext);
}
