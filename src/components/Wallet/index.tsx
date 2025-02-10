import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { gsap } from 'gsap';
import styles from './styles.module.scss';

export const WalletConnection = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState('');
  
    useEffect(() => {
      checkExistingConnection();
    }, []);
  
    const checkExistingConnection = async () => {
      if (window.ethereum?.selectedAddress) {
        setIsConnected(true);
        setWalletAddress(window.ethereum.selectedAddress);
      }
    };
  
    const handleConnect = async () => {
      setIsConnecting(true);
      setError('');
      
      try {
        if (!window.ethereum) {
          throw new Error('Please install a valid wallet!');
        }
  
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        
        if (accounts.length > 0) {
          setIsConnected(true);
          setWalletAddress(accounts[0]);
          gsap.from(`.${styles.walletButton}`, {
            scale: 1.2,
            duration: 0.5
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Connection failed');
      } finally {
        setIsConnecting(false);
      }
    };
  
    const handleDisconnect = () => {
      setIsConnected(false);
      setWalletAddress('');
      gsap.to(`.${styles.walletButton}`, {
        scale: 1,
        duration: 0.3
      });
    };
  
    const truncateAddress = (address: string) => {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };
  
    return (
      <div className={styles.walletContainer}>
        {error && <div className={styles.errorMessage}>An error occurred</div>}
        
        <button
          className={styles.walletButton}
          onClick={isConnected ? handleDisconnect : handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            'Connecting...'
          ) : isConnected ? (
            <>
              <span className={styles.connectedIndicator}></span>
              {truncateAddress(walletAddress)}
            </>
          ) : (
            'Connect Wallet'
          )}
        </button>
      </div>
    );
  };