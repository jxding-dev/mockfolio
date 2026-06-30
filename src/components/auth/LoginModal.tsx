import { useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/authContext';
import styles from './LoginModal.module.css';

export function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { configured, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus('sending');
    setErrorMsg('');
    const { error } = await signInWithEmail(trimmed);
    if (error) {
      setStatus('error');
      setErrorMsg(error === 'auth-not-configured'
        ? '로그인은 곧 제공됩니다. 지금은 로그인 없이 사용하세요.'
        : '메일을 보내지 못했어요. 주소를 다시 확인해주세요.');
    } else {
      setStatus('sent');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="로그인 / 회원가입">
      {!configured ? (
        <div className={styles.centerBlock}>
          <div className={styles.emoji}>🔐</div>
          <p>로그인 기능을 준비 중입니다.<br />지금은 로그인 없이 모든 기능을 무료로 사용할 수 있어요.</p>
          <Button variant="primary" fullWidth onClick={onClose}>확인</Button>
        </div>
      ) : status === 'sent' ? (
        <div className={styles.centerBlock}>
          <div className={styles.emoji}>📩</div>
          <p><strong>{email}</strong> 으로 로그인 링크를 보냈어요.<br />메일의 버튼을 누르면 자동으로 로그인됩니다.</p>
          <Button variant="primary" fullWidth onClick={onClose}>확인</Button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <p className={styles.lead}>비밀번호 없이 이메일로 로그인하세요. 입력한 주소로 로그인 링크가 전송됩니다.</p>
          <label className={styles.field}>
            <span>이메일</span>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          {status === 'error' && <p className={styles.error}>{errorMsg}</p>}
          <Button type="submit" variant="primary" fullWidth loading={status === 'sending'}>
            로그인 링크 받기
          </Button>
          <p className={styles.privacy}>로그인 정보는 인증에만 쓰이며, 작업 이미지는 여전히 브라우저에서만 처리됩니다.</p>
        </form>
      )}
    </Modal>
  );
}
