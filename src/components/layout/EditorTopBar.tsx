import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { AppMode } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LoginModal } from '../auth/LoginModal';
import { useAuth } from '../../hooks/authContext';
import styles from './EditorTopBar.module.css';

interface Props {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  /** epoch ms of the last settings auto-save; shown as a clock time */
  savedAt?: number;
}

function formatSavedTime(ts: number): string {
  return new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit' }).format(new Date(ts));
}

const TABS: { id: AppMode; label: string; icon: string }[] = [
  { id: 'inspect', label: '검수', icon: 'I' },
  { id: 'mockup', label: '목업', icon: 'M' },
  { id: 'compare', label: '비교', icon: 'B' },
  { id: 'export', label: '저장', icon: 'E' },
];

export function EditorTopBar({
  projectName,
  onProjectNameChange,
  activeMode,
  onModeChange,
  savedAt,
}: Props) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(projectName);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { user, signOut } = useAuth();

  const commitName = () => {
    onProjectNameChange(nameValue.trim() || '내 프로젝트');
    setEditingName(false);
  };

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  }

  return (
    <>
      <header className={styles.bar}>
        <div className={styles.left}>
          <Link to="/" className={styles.logo} aria-label="Mockfolio 홈">
            <div className={styles.logoMark}>M</div>
          </Link>

          <div className={styles.divider} />

          {editingName ? (
            <input
              className={styles.nameInput}
              value={nameValue}
              aria-label="프로젝트 이름"
              autoFocus
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitName();
                if (e.key === 'Escape') {
                  setNameValue(projectName);
                  setEditingName(false);
                }
              }}
            />
          ) : (
            <button className={styles.nameBtn} onClick={() => setEditingName(true)} title="프로젝트 이름 수정">
              {projectName}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={styles.editIcon} aria-hidden>
                <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <div className={styles.saveState} data-state="saved" title="설정은 이 브라우저에 자동 저장됩니다">
            {savedAt ? `자동 저장됨 · ${formatSavedTime(savedAt)}` : '자동 저장됨'}
          </div>
        </div>

        <nav className={styles.tabs} aria-label="에디터 모드">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              className={`${styles.tab} ${activeMode === id ? styles.tabActive : ''}`}
              onClick={() => onModeChange(id)}
              aria-pressed={activeMode === id}
              title={`${label} 모드`}
            >
              <span className={styles.tabIcon} aria-hidden>{icon}</span>
              <span className={styles.tabLabel}>{label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.right}>
          <ThemeToggle />
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut} loading={signingOut}>로그아웃</Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setLoginOpen(true)}>로그인</Button>
          )}
          <Button variant="primary" size="sm" onClick={() => setShowUpgrade(true)}>
            업그레이드
          </Button>
        </div>
      </header>

      <Modal open={showUpgrade} onClose={() => setShowUpgrade(false)} title="Pro는 준비 중이에요">
        <div className={styles.loginModal}>
          <div className={styles.lmEmoji} aria-hidden>Pro</div>
          <p>
            현재 베타 기간에는 모든 기능을 무료로 사용할 수 있어요.
            <br />
            결제가 열리면 저장한 작업과 고해상도 내보내기가 Pro에 연결됩니다.
          </p>
          <Button variant="primary" fullWidth onClick={() => setShowUpgrade(false)}>확인</Button>
        </div>
      </Modal>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
