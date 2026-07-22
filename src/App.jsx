import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import EditorPage from './pages/EditorPage'
import HomePage from './pages/HomePage'
import ModelsMockupPage from './pages/ModelsMockupPage'
import FeaturesPage from './pages/FeaturesPage'
import ContactPage from './pages/ContactPage'
import Navbar from './components/Navbar'
import fistoLogo from './assets/images/fisto-logo.webp'

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const { pathname } = location;
  const isEditor = pathname === '/editor';
  
  // App is instantly loaded if not on the home page, else wait for HomePage callback
  const [appLoaded, setAppLoaded] = useState(pathname !== '/');

  return (
    <div className={`flex flex-col w-full bg-white ${isEditor ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {!appLoaded && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#EEE2D3]">
          <img
            src={fistoLogo}
            alt="Loading..."
            className="w-48 h-auto animate-pulse drop-shadow-xl"
          />
        </div>
      )}
      <Navbar />
      <div className={`flex-1 flex flex-col min-h-0 relative ${pathname === '/' ? '-mt-[5vh]' : ''}`}>
        <Routes location={location}>
          <Route path="/" element={<HomePage onLoaded={() => setAppLoaded(true)} />} />
          <Route path="/modelsMockup" element={<ModelsMockupPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/editor" element={<EditorPage />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  )
}


export default App
