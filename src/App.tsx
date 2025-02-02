import styles from './App.module.scss';
import MainFrame from './components/MainFrame';

const App = (): React.JSX.Element => {
  return (
    <section className={styles.wrapper}>
      <MainFrame />
    </section>
  )
}

export default App;