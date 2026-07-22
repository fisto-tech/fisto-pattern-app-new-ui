import fistoLogo from '../assets/images/fisto-logo.webp';
import { useEffect, useRef, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import roundContainerUrl from '../assets/models/Food Containers/Round/Round.glb?url';

const navLinks = ['Home','Mockups', 'Features', 'Contact'];

export default function Navbar({ onTogglePanel }) {
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return undefined;

    const context = gsap.context(() => {
      gsap.fromTo(
        navRef.current,
        { autoAlpha: 0, y: -28 },
        { autoAlpha: 1, y: 0, duration: 0.72, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.nav-animate-item',
        { autoAlpha: 0, y: -12 },
        { autoAlpha: 1, y: 0, duration: 0.48, ease: 'power3.out', stagger: 0.07, delay: 0.12 }
      );
    }, navRef);

    return () => context.revert();
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen((isOpen) => !isOpen);
    onTogglePanel?.();
  };

  const handleUploadIMLClick = () => {
    navigate('/editor', { state: { initialModelUrl: roundContainerUrl } });
  };

  const isEditorPage = location.pathname === '/editor';

  return (
    <nav ref={navRef} className={`w-full bg-white z-[99] relative shrink-0 border-b sticky top-0 transition-shadow duration-300 ${isEditorPage ? 'shadow-[0_4px_20px_rgba(0,0,0,0.10)] border-gray-100' : isScrolled ? 'shadow-md border-transparent' : 'shadow-none border-transparent'}`}>
      <div className="w-full flex items-center justify-between px-6 lg:px-12 xl:px-20 py-2 lg:py-2">
        
        {/* Logo */}
        <div className="nav-animate-item flex items-center">
          <img src={fistoLogo} alt="Fisto Logo" className="h-10 lg:h-12 w-auto object-contain" />
        </div>

        {/* Right Group: Nav Links + Sign In Button */}
        <div className="flex items-center gap-8 lg:gap-12">
          
          {/* Nav Links */}
          <ul className="hidden lg:flex items-center gap-8 lg:gap-10 list-none m-0 p-0">
            {navLinks.map((link) => {
              // Route mapping
              const path = link === 'Home' ? '/' : link === 'Mockups' ? '/modelsMockup' : `/${link.toLowerCase()}`;
              const isSelected = location.pathname === path || (link === 'Mockups' && location.pathname === '/editor');
              return (
                <li key={link} className="nav-animate-item">
                  <Link
                    to={path}
                    onClick={(e) => {
                      if (location.pathname === '/editor') {
                        e.preventDefault();
                        window.location.href = path;
                      }
                    }}
                    className={`text-[14px] lg:text-[16px] transition-colors duration-200 no-underline ${
                      isSelected  
                        ? 'text-black font-bold' 
                        : 'text-[#8B8B8B] font-medium hover:text-black'
                    }`}
                  >
                    {link}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right side buttons */}
          <div className="nav-animate-item flex items-center gap-4">
            {/* Upload Your IML Button */}
            {location.pathname !== '/editor' && (
              <button
                onClick={handleUploadIMLClick}
                className="px-4 py-1.5 text-[14px] lg:text-[16px] font-semibold text-white rounded-lg transition-all duration-200 cursor-pointer border-none hover:shadow-lg hover:brightness-110"
                style={{ background: '#C15F27' }}
              >
                Upload Your IML
              </button>
            )}

            {/* Mobile menu toggle for right panel */}
            <button
              onClick={handleMenuToggle}
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 text-gray-500 hover:text-gray-800 border-none bg-transparent cursor-pointer rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7">
                  <path fillRule="evenodd" d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7">
                  <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden border-t border-[#f1eee9] bg-[#FBF9F6] transition-[max-height,opacity] duration-300 ${
          isMenuOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-5 pt-3">
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {navLinks.map((link) => {
              const path = link === 'Home' ? '/' : link === 'Mockups' ? '/modelsMockup' : `/${link.toLowerCase()}`;
              const isSelected = location.pathname === path || (link === 'Mockups' && location.pathname === '/editor');
              return (
                <li key={link}>
                  <Link
                    to={path}
                    onClick={(e) => {
                      if (location.pathname === '/editor') {
                        e.preventDefault();
                        window.location.href = path;
                      } else {
                        setIsMenuOpen(false);
                      }
                    }}
                    className={`block rounded-lg px-4 py-3 text-[16px] no-underline transition-colors ${
                      isSelected
                        ? 'bg-[#f7eee9] text-[#C15F27] font-bold'
                        : 'text-[#6B7280] font-semibold hover:bg-[#f7eee9] hover:text-[#C15F27]'
                    }`}
                  >
                    {link}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
