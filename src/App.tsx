import { useEffect } from 'react';
import { HashRouter as BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Landing } from './pages/Landing';
import { Editor } from './pages/Editor';
import { Pricing } from './pages/Pricing';
import { NotFound } from './pages/NotFound';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './hooks/AuthProvider';

const DEFAULT_TITLE = 'Mockfolio - 포트폴리오 목업 빌더';
const ROUTE_TITLES: Record<string, string> = {
  '/': 'Mockfolio - 포트폴리오 목업과 반응형 검수',
  '/editor': '에디터 - Mockfolio',
  '/pricing': '요금제 - Mockfolio',
};

function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
    document.title = ROUTE_TITLES[pathname] ?? DEFAULT_TITLE;
  }, [pathname]);
  return null;
}

function AppShell() {
  const { pathname } = useLocation();
  const isEditor = pathname === '/editor';

  return (
    <ErrorBoundary>
      <RouteEffects />
      {!isEditor && <Header />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isEditor && <Footer />}
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
