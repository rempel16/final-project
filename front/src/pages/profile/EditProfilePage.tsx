import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

import styles from "./EditProfilePage.module.scss";

const USERNAME = "skai_laba";
const AVATAR = "/avatars/me.jpg";
const BIO_MAX = 200;

export const EditProfilePage = () => {
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(AVATAR);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoClick = () => fileInputRef.current?.click();
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatar(url);
  };

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.title}>Edit profile</div>
        <div className={styles.avatarSection}>
          <div className={styles.avatarInfo}>
            <img className={styles.avatar} src={avatar} alt="avatar" />
            <div className={styles.username}>{USERNAME}</div>
          </div>
          <button className={styles.photoBtn} type="button" onClick={handlePhotoClick}>
            New photo
          </button>
          <input
            ref={fileInputRef}
            className={styles.visuallyHidden}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
        </div>
        <form className={styles.fields} autoComplete="off">
          <label className={styles.label} htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            className={styles.textarea}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={BIO_MAX}
            rows={4}
          />
          <div className={styles.counter}>{bio.length} / {BIO_MAX}</div>
          <div className={styles.actions}>
            <button className={styles.saveBtn} type="submit">Save</button>
            <button className={styles.cancelBtn} type="button">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};
