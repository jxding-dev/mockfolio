import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LoginModal } from '../auth/LoginModal';
import { useAuth } from '../../hooks/authContext';
import styles from './Header.module.css';

function displayName(email: string | null, name: string | null): string {
  if (name) return name;
  if (!email) return '로그인됨';
  const [local, domain] = email.split('@');
  if (!domain) return local;
  return `${local.slice(0, 10)}${local.length > 10 ? '...' : ''}@${domain.split('.')[0]}...`;
}

export function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const { user, loading, signOut } = useAuth();

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError(null);
    const { error } = await signOut();
    if (error) setSignOutError('로그아웃하지 못했어요. 잠시 후 다시 시도해 주세요.');
    setSigningOut(false);
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoMark} aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.9" />
                <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
                <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
                <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <span className={styles.logoText}>Mockfolio</span>
            <Badge variant="accent">Beta</Badge>
          </Link>

          <nav id="primary-navigation" className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
            <Link to="/" onClick={() => setMenuOpen(false)} className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>홈</Link>
            <Link to="/editor" onClick={() => setMenuOpen(false)} className={`${styles.navLink} ${pathname === '/editor' ? styles.active : ''}`}>에디터</Link>
            <Link to="/pricing" onClick={() => setMenuOpen(false)} className={`${styles.navLink} ${pathname === '/pricing' ? styles.active : ''}`}>요금제</Link>
          </nav>

          <div className={styles.actions}>
            <ThemeToggle />
            {!loading && (user ? (
              <div className={styles.userArea}>
                <span className={styles.userLabel} title={user.email ?? undefined}>{displayName(user.email, user.name)}</span>
                <Button variant="ghost" size="sm" onClick={handleSignOut} loading={signingOut}>로그아웃</Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setLoginOpen(true)}>
                로그인
              </Button>
            ))}
            <Button variant="primary" size="sm" onClick={() => navigate('/editor')}>
              무료로 시작
            </Button>
            <button
              type="button"
              className={styles.menuButton}
              aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={menuOpen}
              aria-controls="primary-navigation"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
        {signOutError && <div className={styles.authError} role="alert">{signOutError}</div>}
      </header>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
