import styles from './App.module.scss';
import MainFrame from './components/MainFrame';
import { WalletConnection } from './components/Wallet';
import { WalletProvider } from './contexts/WalletContext';

const App = (): React.JSX.Element => {
  return (
    <section className={styles.wrapper}>
      <WalletProvider>
        <WalletConnection />
        <MainFrame />
      </WalletProvider>
    </section>
  )
}

export default App;