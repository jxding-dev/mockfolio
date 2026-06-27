import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export function NotFound() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="notfound-title">
        <span className={styles.code}>404</span>
        <h1 id="notfound-title" className={styles.title}>페이지를 찾을 수 없습니다</h1>
        <p className={styles.desc}>
          주소가 변경되었거나 더 이상 존재하지 않는 페이지입니다.
        </p>
        <div className={styles.actions}>
          <Link to="/" className={styles.primary}>홈으로</Link>
          <Link to="/editor" className={styles.secondary}>에디터 열기</Link>
        </div>
      </section>
    </main>
  );
}
