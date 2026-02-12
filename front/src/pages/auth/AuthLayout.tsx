import type { ReactNode } from "react";
import styles from "./AuthLayout.module.scss";

type Props = {
  children: ReactNode;
};

export const AuthLayout = ({ children }: Props) => {
  return (
    <div className={styles.layout}>
      <div className={styles.layoutInner}>
        <div className={styles.phonesWrap}>
          <img className={styles.phonesImage} src="/Login.png" alt="Login preview" />
        </div>

        <div className={styles.formColumn}>{children}</div>
      </div>
    </div>
  );
};
