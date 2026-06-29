import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { AuthMode } from '../services/auth/authContracts';
import styles from './SaasApp.module.css';

interface Props {
  mode: AuthMode;
}

const copyByMode: Record<AuthMode, { title: string; description: string; cta: string }> = {
  login: {
    title: '로그인',
    description: '현재는 데모 화면입니다. 이메일과 비밀번호는 어디에도 전송되지 않습니다.',
    cta: '데모 상태 확인',
  },
  signup: {
    title: '계정 만들기',
    description: '현재는 데모 화면입니다. 실제 계정 생성이나 저장은 수행하지 않습니다.',
    cta: '데모 상태 확인',
  },
  'forgot-password': {
    title: '비밀번호 재설정',
    description: '현재는 데모 화면입니다. 재설정 메일은 발송되지 않습니다.',
    cta: '데모 상태 확인',
  },
};

export function AuthPage({ mode }: Props) {
  const [message, setMessage] = useState('');
  const copy = copyByMode[mode];
  const isForgot = mode === 'forgot-password';
  const isLogin = mode === 'login';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('데모 화면입니다. 입력한 값은 저장되거나 전송되지 않습니다.');
  }

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard}>
        <Badge variant="outline">Demo only</Badge>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        <p className={styles.formMessage}>안심하고 살펴보세요. 이 화면은 외부로 데이터를 보내지 않습니다.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            이메일
            <input type="email" name="email" placeholder="you@company.com" autoComplete="email" required />
          </label>

          {!isForgot && (
            <label>
              비밀번호
              <input
                type="password"
                name="password"
                placeholder="8자 이상"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
            </label>
          )}

          <Button type="submit" variant="primary" fullWidth>{copy.cta}</Button>
        </form>

        {message && <p className={styles.formMessage}>{message}</p>}

        <div className={styles.authLinks}>
          {!isLogin && <Link to="/login">로그인</Link>}
          {isLogin && <Link to="/signup">Sign up</Link>}
          {!isForgot && <Link to="/forgot-password">Forgot password</Link>}
        </div>
      </section>

      <aside className={styles.authAside}>
        <span>계정 기능 준비 중</span>
        <h2>지금은 목업 제작을 먼저 체험할 수 있습니다.</h2>
        <ul>
          <li>입력값은 저장하거나 전송하지 않음</li>
          <li>실제 로그인과 계정 생성은 아직 비활성화</li>
          <li>이미지 제작 기능은 가입 없이 사용 가능</li>
        </ul>
      </aside>
    </main>
  );
}
