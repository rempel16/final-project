import React from "react";
import { OverlayPanel } from "../../shared/ui/OverlayPanel/OverlayPanel";
import styles from "./NotificationsDrawer.module.scss";

export interface NotificationItem {
  id: string;
  avatar: React.ReactNode;
  username: string;
  content: React.ReactNode;
  time: string;
  postPreview?: React.ReactNode;
  onClick?: () => void;
}

export interface NotificationsDrawerSection {
  label: string;
  items: NotificationItem[];
}

export interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  sections?: NotificationsDrawerSection[];
  emptyText?: string;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  open,
  onClose,
  title = "Уведомления",
  sections = [],
  emptyText = "Нет новых уведомлений",
}) => {
  const isEmpty =
    sections.length === 0 || sections.every((s) => s.items.length === 0);

  return (
    <OverlayPanel
      open={open}
      onClose={onClose}
      ariaLabel={title}
      panelClassName={styles.drawer}
    >
      <div className={styles.title}>{title}</div>

      {isEmpty ? (
        <div className={styles.empty}>{emptyText}</div>
      ) : (
        <div className={styles.list}>
          {sections.map((section, i) => (
            <React.Fragment key={section.label || String(i)}>
              {section.label ? (
                <div className={styles.section}>{section.label}</div>
              ) : null}

              {section.items.map((item) => (
                <button
                  key={item.id}
                  className={styles.item}
                  type="button"
                  onClick={item.onClick}
                >
                  <span className={styles.avatar}>{item.avatar}</span>

                  <span className={styles.content}>
                    <span className={styles.username}>{item.username}</span>
                    {item.content}
                    <span className={styles.time}>{item.time}</span>
                  </span>

                  {item.postPreview ? (
                    <span className={styles.postPreview}>
                      {item.postPreview}
                    </span>
                  ) : null}
                </button>
              ))}
            </React.Fragment>
          ))}
        </div>
      )}
    </OverlayPanel>
  );
};

export default NotificationsDrawer;
