import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Intentionally no remote logging: the app is local-first.
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className={styles.page}>
        <section className={styles.card} aria-labelledby="error-title">
          <span className={styles.eyebrow}>Mockfolio</span>
          <h1 id="error-title">화면을 불러오지 못했습니다</h1>
          <p>설정이 손상되었거나 일시적인 문제가 발생했습니다. 작업 이미지는 외부로 전송되지 않았습니다.</p>
          <div className={styles.actions}>
            <Button variant="primary" onClick={() => window.location.reload()}>새로고침</Button>
            <Link to="/" className={styles.homeLink}>홈으로 이동</Link>
          </div>
        </section>
      </main>
    );
  }
}
