import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { authProviderLabel, type AuthMode } from '../services/auth/authContracts';
import styles from './SaasApp.module.css';

interface Props {
  mode: AuthMode;
}

const copyByMode: Record<AuthMode, { title: string; description: string; cta: string }> = {
  login: {
    title: '로그인',
    description: '나중에 Supabase Auth를 연결하면 이 화면이 실제 로그인 진입점이 됩니다.',
    cta: '로그인 준비 확인',
  },
  signup: {
    title: '계정 만들기',
    description: '현재는 UI만 준비되어 있습니다. 실제 계정 생성은 아직 수행하지 않습니다.',
    cta: '가입 준비 확인',
  },
  'forgot-password': {
    title: '비밀번호 재설정',
    description: 'Supabase password reset flow를 연결할 예정인 화면입니다.',
    cta: '재설정 준비 확인',
  },
};

export function AuthPage({ mode }: Props) {
  const [message, setMessage] = useState('');
  const copy = copyByMode[mode];
  const isForgot = mode === 'forgot-password';
  const isLogin = mode === 'login';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(`${authProviderLabel} 연결 전 준비 UI입니다. 입력값은 서버로 전송되지 않습니다.`);
  }

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard}>
        <Badge variant="outline">Auth Ready</Badge>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>

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
        <span>Supabase 연결 지점</span>
        <h2>UI는 완성하고, 인증 로직은 경계 밖에 둡니다.</h2>
        <ul>
          <li>AuthService 인터페이스로 교체 가능</li>
          <li>현재 입력값은 외부로 전송하지 않음</li>
          <li>세션/토큰 저장 로직 없음</li>
        </ul>
      </aside>
    </main>
  );
}
