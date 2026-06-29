import styles from './ReviewsSlider.module.css';

export interface Review {
  quote: string;
  name: string;
  role: string;
  initial: string;
  accent: string;
}

interface Props {
  reviews: Review[];
}

export function ReviewsSlider({ reviews }: Props) {
  return (
    <div className={styles.wrap} role="region" aria-label="사용자 후기 목록">
      <div className={styles.viewport}>
        <div className={styles.track} aria-live="off">
          {[0, 1].map((groupIndex) => (
            <div
              className={styles.group}
              key={groupIndex}
              aria-hidden={groupIndex === 1 ? true : undefined}
              role={groupIndex === 1 ? 'presentation' : undefined}
            >
              {reviews.map((review) => (
                <figure className={styles.card} key={`${groupIndex}-${review.name}`}>
                  <div className={styles.stars} aria-label="별점 5점 만점에 5점">★★★★★</div>
                  <blockquote className={styles.quote}>“{review.quote}”</blockquote>
                  <figcaption className={styles.person}>
                    <span className={styles.avatar} style={{ background: review.accent }}>{review.initial}</span>
                    <span className={styles.personText}>
                      <span className={styles.name}>{review.name}</span>
                      <span className={styles.role}>{review.role}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
