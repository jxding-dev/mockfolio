import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/authContext';
import styles from './LoginModal.module.css';

export function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { configured, configMessage, authNotice, clearAuthNotice, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!open) return;
    setStatus('idle');
    setErrorMsg('');
  }, [open]);

  const closeModal = useCallback(() => {
    clearAuthNotice();
    onClose();
  }, [clearAuthNotice, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || status === 'sending') return;
    setStatus('sending');
    setErrorMsg('');
    const { error } = await signInWithEmail(trimmed);
    if (error) {
      setStatus('error');
      setErrorMsg(error === 'auth-not-configured'
        ? '로그인을 준비 중이에요. Supabase 환경 변수를 먼저 연결해 주세요.'
        : '로그인 링크를 보내지 못했어요. 이메일 주소와 네트워크 상태를 확인한 뒤 다시 시도해 주세요.');
      return;
    }
    setStatus('sent');
  }

  return (
    <Modal open={open} onClose={closeModal} title="이메일로 로그인">
      {!configured ? (
        <div className={styles.centerBlock}>
          <div className={styles.emoji} aria-hidden>!</div>
          <p>
            로그인을 준비 중이에요.
            <br />
            {configMessage ?? 'Supabase 설정을 확인한 뒤 다시 시도해 주세요.'}
          </p>
          <Button variant="primary" fullWidth onClick={closeModal}>확인</Button>
        </div>
      ) : status === 'sent' ? (
        <div className={styles.centerBlock}>
          <div className={styles.emoji} aria-hidden>@</div>
          <p>
            <strong>{email}</strong>로 로그인 링크를 보냈어요.
            <br />
            메일함에서 링크를 눌러 계속 진행해 주세요.
          </p>
          <div className={styles.actions}>
            <Button variant="secondary" fullWidth onClick={() => setStatus('idle')}>다른 이메일로 보내기</Button>
            <Button variant="primary" fullWidth onClick={closeModal}>닫기</Button>
          </div>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <p className={styles.lead}>
            비밀번호 없이 이메일 링크로 로그인합니다. 저장 기능을 쓰려면 먼저 로그인해 주세요.
          </p>
          {authNotice && <p className={styles.notice} role="status">{authNotice}</p>}
          <label className={styles.field} htmlFor="login-email">
            <span>이메일</span>
            <input
              id="login-email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          {status === 'error' && <p className={styles.error} role="alert">{errorMsg}</p>}
          <Button type="submit" variant="primary" fullWidth loading={status === 'sending'} disabled={!email.trim()}>
            {status === 'sending' ? '링크 보내는 중...' : '로그인 링크 받기'}
          </Button>
          <p className={styles.privacy}>
            링크는 현재 페이지로 돌아오도록 전송됩니다. 작업 이미지는 브라우저 안에서만 처리됩니다.
          </p>
        </form>
      )}
    </Modal>
  );
}
