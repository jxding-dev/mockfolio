import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.brand}>Mockfolio</span>
          <span className={styles.copy}>© {new Date().getFullYear()}. All rights reserved.</span>
        </div>
        <div className={styles.center}>
          <span className={styles.privacy}>
            🔒 No AI · No Server Upload · Local First — 모든 이미지는 브라우저 내에서만 처리됩니다
          </span>
        </div>
        <div className={styles.right}>
          <span className={styles.tag}>Made with ☕ for designers</span>
        </div>
      </div>
    </footer>
  );
}
