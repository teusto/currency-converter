import { createContext, useContext, ReactNode, useState } from 'react';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  walletAddress: '',
});

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, ] = useState(false);
  const [walletAddress, ] = useState('');

  return (
    <WalletContext.Provider value={{ isConnected, walletAddress }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);