import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import styles from './Header.module.css';

export function Header() {
  const { pathname } = useLocation();
  const [comingSoon, setComingSoon] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <div className={styles.logoMark}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.9"/>
                <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.6"/>
                <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6"/>
                <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.3"/>
              </svg>
            </div>
            <span className={styles.logoText}>Mockfolio</span>
            <Badge variant="accent">Beta</Badge>
          </Link>

          {/* Nav */}
          <nav className={styles.nav}>
            <Link to="/"        className={`${styles.navLink} ${pathname === '/'        ? styles.active : ''}`}>홈</Link>
            <Link to="/editor"  className={`${styles.navLink} ${pathname === '/editor'  ? styles.active : ''}`}>에디터</Link>
            <Link to="/pricing" className={`${styles.navLink} ${pathname === '/pricing' ? styles.active : ''}`}>요금제</Link>
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            <Button variant="ghost" size="sm" onClick={() => setComingSoon(true)}>
              로그인
            </Button>
            <Button variant="primary" size="sm" onClick={() => setComingSoon(true)}>
              무료로 시작
            </Button>
          </div>
        </div>
      </header>

      <Modal open={comingSoon} onClose={() => setComingSoon(false)} title="준비 중입니다">
        <div className={styles.comingSoonBody}>
          <div className={styles.comingSoonIcon}>🚀</div>
          <p className={styles.comingSoonText}>
            계정 기능은 현재 개발 중입니다.<br />
            지금은 <strong>로그인 없이 무료로</strong> 모든 핵심 기능을 사용하실 수 있습니다.
          </p>
          <Button variant="primary" fullWidth onClick={() => setComingSoon(false)}>
            에디터 바로 열기
          </Button>
        </div>
      </Modal>
    </>
  );
}
