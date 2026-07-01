import { useCallback, useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import styles from './ReviewModal.module.css';

const REVIEW_EMAIL = 'vlsptm1130@naver.com';
const REVIEW_ENDPOINT = `https://formsubmit.co/ajax/${REVIEW_EMAIL}`;

interface Props {
  open: boolean;
  exportType: string | null;
  projectName: string;
  onClose: () => void;
}

export function ReviewModal({ open, exportType, projectName, onClose }: Props) {
  const [quality, setQuality] = useState('좋았어요');
  const [painPoint, setPainPoint] = useState('');
  const [wish, setWish] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const closeAndReset = useCallback(() => {
    setStatus('idle');
    setError('');
    setPainPoint('');
    setWish('');
    setQuality('좋았어요');
    onClose();
  }, [onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError('');

    const payload = {
      _subject: '[Mockfolio] 저장 후 사용자 리뷰',
      projectName,
      exportType: exportType ?? 'unknown',
      quality,
      painPoint: painPoint.trim() || '작성 없음',
      wish: wish.trim() || '작성 없음',
      page: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(REVIEW_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('review-submit-failed');
      setStatus('sent');
    } catch {
      setStatus('error');
      setError('리뷰를 보내지 못했어요. 네트워크 상태를 확인한 뒤 다시 제출해 주세요.');
    }
  }

  return (
    <Modal open={open} onClose={closeAndReset} title="저장 결과는 어땠나요?" width={520}>
      {status === 'sent' ? (
        <div className={styles.success}>
          <p className={styles.successTitle}>리뷰를 보냈어요.</p>
          <p className={styles.successText}>남겨준 내용은 서비스 개선에 바로 참고하겠습니다.</p>
          <Button variant="primary" fullWidth onClick={closeAndReset}>닫기</Button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <p className={styles.lead}>
            방금 저장한 결과 기준으로 짧게 알려주세요. 제출하면 운영자 이메일로 전송됩니다.
          </p>

          <label className={styles.field}>
            <span className={styles.label}>1. 저장 결과가 원하는 수준이었나요?</span>
            <select className={styles.select} value={quality} onChange={(event) => setQuality(event.target.value)}>
              <option>좋았어요</option>
              <option>보통이에요</option>
              <option>아쉬웠어요</option>
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>2. 사용하면서 불편하거나 헷갈린 점이 있었나요?</span>
            <textarea
              className={styles.textarea}
              value={painPoint}
              onChange={(event) => setPainPoint(event.target.value)}
              placeholder="예: 목업 선택이 어려웠어요, 저장 위치를 모르겠어요"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>3. 다시 쓰고 싶어지려면 무엇이 더 필요할까요?</span>
            <textarea
              className={styles.textarea}
              value={wish}
              onChange={(event) => setWish(event.target.value)}
              placeholder="예: 더 많은 실사 목업, 자동 맞춤, 팀 공유 기능"
            />
          </label>

          {status === 'error' && <p className={styles.error} role="alert">{error}</p>}

          <div className={styles.actions}>
            <Button type="button" variant="ghost" onClick={closeAndReset}>나중에</Button>
            <Button type="submit" variant="primary" loading={status === 'sending'}>
              제출하기
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
