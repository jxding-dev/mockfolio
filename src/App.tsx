import { HashRouter as BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Landing } from './pages/Landing';
import { Editor } from './pages/Editor';
import { Pricing } from './pages/Pricing';
import { NotFound } from './pages/NotFound';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ThemeProvider } from './hooks/useTheme';

function AppShell() {
  const { pathname } = useLocation();
  const isEditor = pathname === '/editor';

  return (
    <ErrorBoundary>
      {!isEditor && <Header />}
      <Routes>
        <Route path="/"        element={<Landing />} />
        <Route path="/editor"  element={<Editor />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="*"        element={<NotFound />} />
      </Routes>
      {!isEditor && <Footer />}
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter><AppShell /></BrowserRouter>
    </ThemeProvider>
  );
}
