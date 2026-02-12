import { RouterProvider } from "react-router-dom";
import { router } from "./app/router/routes";
import styles from "./App.module.scss";

function App() {
  return (
    <div className={styles.root}>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
