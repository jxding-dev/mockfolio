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
  { id: 'inspect', label: '검수', icon: '📐' },
  { id: 'mockup', label: '목업', icon: '🖼' },
  { id: 'compare', label: '비교', icon: '🔄' },
  { id: 'export', label: '저장', icon: '💾' },
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
  const [showLogin, setShowLogin] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, signOut } = useAuth();

  const commitName = () => {
    onProjectNameChange(nameValue.trim() || '내 프로젝트');
    setEditingName(false);
  };

  return (
    <>
      <header className={styles.bar}>
        {/* Left: logo + project name */}
        <div className={styles.left}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoMark}>M</div>
          </Link>

          <div className={styles.divider} />

          {editingName ? (
            <input
              className={styles.nameInput}
              value={nameValue}
              autoFocus
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditingName(false); }}
            />
          ) : (
            <button className={styles.nameBtn} onClick={() => setEditingName(true)} title="프로젝트 이름 수정">
              {projectName}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={styles.editIcon}>
                <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          <div className={styles.saveState} data-state="saved" title="설정은 이 브라우저에 자동 저장됩니다">
            {savedAt ? `● 자동 저장됨 · ${formatSavedTime(savedAt)}` : '● 자동 저장됨'}
          </div>
        </div>

        {/* Center: mode tabs */}
        <nav className={styles.tabs}>
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              className={`${styles.tab} ${activeMode === id ? styles.tabActive : ''}`}
              onClick={() => onModeChange(id)}
              title={`${label} 모드`}
            >
              <span className={styles.tabIcon}>{icon}</span>
              <span className={styles.tabLabel}>{label}</span>
            </button>
          ))}
        </nav>

        {/* Right: auth + upgrade */}
        <div className={styles.right}>
          <ThemeToggle />
          {user ? (
            <Button variant="ghost" size="sm" onClick={() => signOut()}>로그아웃</Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setLoginOpen(true)}>로그인</Button>
          )}
          <Button variant="primary" size="sm" onClick={() => setShowLogin(true)}>
            업그레이드
          </Button>
        </div>
      </header>

      <Modal open={showLogin} onClose={() => setShowLogin(false)} title="Pro는 곧 출시됩니다">
        <div className={styles.loginModal}>
          <div className={styles.lmEmoji}>🚀</div>
          <p>Pro 결제는 준비 중입니다.<br />지금은 <strong>모든 기능을 무료</strong>로 사용할 수 있어요.</p>
          <Button variant="primary" fullWidth onClick={() => setShowLogin(false)}>확인</Button>
        </div>
      </Modal>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
