import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FeatureLock } from '../components/saas/FeatureLock';
import { FeatureKey } from '../domain/features';
import { PlanTier } from '../domain/plans';
import { projectService } from '../services/projects/projectService';
import type { SavedProject } from '../types';
import styles from './SaasApp.module.css';

const sidebarItems = ['Projects', 'Templates', 'Export', 'Billing', 'Settings', 'Account'];

export function Dashboard() {
  const [projects, setProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    let active = true;
    projectService.list().then((items) => {
      if (active) setProjects(items);
    });
    return () => {
      active = false;
    };
  }, []);

  const visibleProjects = projects.length ? projects : [
    { id: 'demo-1', name: 'SaaS landing mockup', updatedAt: 'Supabase DB 연결 전 예시' },
    { id: 'demo-2', name: 'Mobile app showcase', updatedAt: 'Local ProjectService fallback' },
  ];

  return (
    <main className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div>
          <Badge variant="accent">Mock workspace</Badge>
          <h1>Dashboard</h1>
          <p>로그인 이후 화면을 가정한 운영형 구조입니다.</p>
        </div>
        <nav>
          {sidebarItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}>{item}</a>
          ))}
        </nav>
      </aside>

      <section className={styles.dashboardContent}>
        <div className={styles.dashboardHead}>
          <div>
            <span className={styles.eyebrow}>Projects</span>
            <h2>최근 작업</h2>
            <p>현재는 LocalStorage 기반 ProjectService를 사용하며, Supabase DB 구현체로 교체할 수 있습니다.</p>
          </div>
          <Button variant="primary" onClick={() => window.location.assign('#/editor')}>새 프로젝트</Button>
        </div>

        <div className={styles.projectGrid}>
          {visibleProjects.map((project) => (
            <article key={project.id} className={styles.projectCard}>
              <div className={styles.projectThumb}>{project.thumbnail ? 'Preview' : 'Mockfolio'}</div>
              <h3>{project.name}</h3>
              <p>{project.updatedAt}</p>
            </article>
          ))}
        </div>

        <div className={styles.dashboardGrid}>
          <section id="templates" className={styles.panel}>
            <span className={styles.eyebrow}>Templates</span>
            <h3>Premium templates</h3>
            <p>Pro 사용자를 위한 목업 템플릿 영역입니다.</p>
            <FeatureLock feature={FeatureKey.PremiumMockups} currentPlan={PlanTier.Free} />
          </section>

          <section id="export" className={styles.panel}>
            <span className={styles.eyebrow}>Export</span>
            <h3>고화질 Export</h3>
            <p>현재 Free는 기본 PNG 저장을 제공하고, 고화질 Export는 Pro 권한으로 분리됩니다.</p>
            <FeatureLock feature={FeatureKey.HighQualityExport} currentPlan={PlanTier.Free} />
          </section>

          <section id="billing" className={styles.panel}>
            <span className={styles.eyebrow}>Billing</span>
            <h3>구독 관리</h3>
            <p>결제 내역과 구독 상태는 Toss Payments와 서버 검증 연결 후 표시합니다.</p>
            <Link to="/billing">Billing 페이지로 이동</Link>
          </section>

          <section id="settings" className={styles.panel}>
            <span className={styles.eyebrow}>Settings</span>
            <h3>Workspace settings</h3>
            <p>계정, 워크스페이스, 플랜 값은 향후 Supabase user profile과 연결합니다.</p>
          </section>
        </div>
      </section>
    </main>
  );
}

