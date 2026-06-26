import styles from './Editor.module.css';

export function Editor() {
  return (
    <div className={styles.placeholder}>
      <div className={styles.placeholderInner}>
        <div className={styles.placeholderIcon}>🛠</div>
        <h2>에디터 준비 중</h2>
        <p>2단계 이후 구현됩니다.</p>
      </div>
    </div>
  );
}
