import AppRouter from "./app/router/routes";
import styles from "./App.module.scss";

const App = () => {
  return (
    <div className={styles.root}>
      <AppRouter />
    </div>
  );
};

export default App;
