import { useNavigate } from 'react-router-dom';
import frameImg from '../assets/images/Home/frame.webp';
import trustedByImg from '../assets/images/Home/trustedBy.webp';

export default function ReadyMockupBanner({
  className = '',
  target = '/editor',
  animated = false,
  fullWidth = false,
  label = 'Ready To Get Started?',
  title,
  titleHighlight,
  subtitle = 'Bring your ideas to life with our premium mockups and packaging solutions.',
  buttonText = 'Start Designing',
  showButton = true,
  compact = false,
}) {
  const navigate = useNavigate();
  const widthClass = fullWidth ? 'w-full max-w-none' : 'mx-auto w-full max-w-[1352px]';

  const defaultTitle = (
    <>Ready to Create Stunning<br />Packaging <span style={{ color: '#F2B62C' }}>Mockups?</span></>
  );

  const renderedTitle = title ? (
    titleHighlight
      ? <>{title} <span style={{ color: '#F2B62C' }}>{titleHighlight}</span></>
      : <>{title}</>
  ) : defaultTitle;

  return (
    <div
      data-scroll-section={animated ? true : undefined}
      className={`frame-banner relative ${widthClass} min-h-[262px] overflow-hidden rounded-[10px] px-[clamp(28px,4.35vw,59px)] py-[52px] ${className}`}
      style={{ backgroundColor: '#294A26' }}
    >
      <div className={`frame-copy relative z-10 w-full max-w-full lg:max-w-[700px] text-left ${compact ? 'lg:pl-[2%]' : ''}`}>
        <div className="frame-text mb-2 flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-4">
            <div className="h-[2px] w-6" style={{ backgroundColor: '#F2B62C' }} />
            <span
              className="text-[10px] md:text-[11px] font-bold uppercase leading-none tracking-[0.16em]"
              style={{ color: '#F2B62C' }}
            >
              {label}
            </span>
          </div>
          <img
            src={trustedByImg}
            alt="Trusted By"
            className="lg:hidden w-12 h-auto object-contain pointer-events-none"
          />
        </div>
        <h2
          className="frame-text mb-3 text-[clamp(20px,4vw,32px)] lg:text-[clamp(31px,2.7vw,38px)] font-bold leading-[1.28] text-white"
        >
          {renderedTitle}
        </h2>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:flex-wrap md:gap-6 lg:gap-8">
          <p
            className="frame-text max-w-full md:max-w-[340px] lg:max-w-[395px] text-[13px] lg:text-[15px] font-medium leading-[1.65] text-white shrink-0"
          >
            {subtitle}
          </p>
          {showButton && (
            <button
              onClick={() => navigate(target)}
              className="frame-text group flex h-[44px] lg:h-[51px] w-fit min-w-[160px] lg:min-w-[207px] items-center justify-center gap-4 lg:gap-7 rounded-[10px] border-none px-4 text-[13px] lg:text-[16px] font-bold text-[#20391E] transition-opacity hover:opacity-90 cursor-pointer"
              style={{ background: '#F2B62C' }}
            >
              {buttonText}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 md:w-6 md:h-6 transition-transform duration-300 ease-out group-hover:translate-x-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          )}
        </div>
      </div>

        <img
          src={trustedByImg}
          alt="Trusted By"
          className="trusted-by-badge absolute hidden lg:block lg:right-[360px] xl:right-[440px] lg:top-8 w-16 md:w-20 lg:w-24 h-auto z-20 pointer-events-none"
        />

        <img
          src={frameImg}
          alt="Products"
          className={`frame-product pointer-events-none relative z-0 mt-8 w-full max-w-[700px] object-contain sm:mt-6 lg:absolute lg:bottom-0 lg:mt-0 lg:w-[420px] xl:w-[500px] ${compact ? 'lg:right-[8%]' : 'lg:right-[-2%] xl:right-0'}`}
        />
 
    </div>
  );
}
