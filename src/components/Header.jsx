import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  ['Templates', '/templates'],
  ['ATS', '/ats'],
  ['Career Center', '/career-center'],
];

export default function Header() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (event) => {
      if (!event.target.closest('.folio-user-menu')) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const close = () => {
    setOpen(false);
    setMenuOpen(false);
  };

  const displayName = useMemo(() => {
    const source = user?.profile?.name || user?.displayName || user?.email || '';
    if (!source) return 'Profile';
    return source.includes('@') ? source.split('@')[0] : source;
  }, [user]);

  const initials = useMemo(() => {
    const name = displayName || 'F';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'F';
  }, [displayName]);

  const logOut = async () => {
    await logout();
    close();
    navigate('/');
  };

  return (
    <header className={`folio-header ${scrolled ? 'folio-header--scrolled' : ''}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&display=swap');

        :root {
          --folio-ink: #F5F1E8;
          --folio-paper: #10131A;
          --folio-line: rgba(245, 241, 232, 0.10);
          --folio-line-strong: rgba(245, 241, 232, 0.22);
          --folio-muted: #AEB7C4;
          --folio-accent: #D99032;
          --folio-accent-dark: #B97A1A;
          --folio-accent-light: #EFB25E;
          --folio-accent-soft: rgba(217, 144, 50, 0.12);
          --folio-teal: #2E8C77;
          --folio-card: #171A21;
          --folio-ease: cubic-bezier(0.22, 1, 0.36, 1);
        }

        .folio-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(16, 19, 26, 0.72);
          border-bottom: 1px solid var(--folio-line);
          backdrop-filter: blur(16px) saturate(140%);
          -webkit-backdrop-filter: blur(16px) saturate(140%);
          transition: box-shadow 0.4s var(--folio-ease), border-color 0.4s var(--folio-ease), background 0.4s var(--folio-ease);
        }

        .folio-header::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--folio-accent) 45%, var(--folio-teal) 55%, transparent);
          opacity: 0;
          transform: scaleX(0.4);
          transition: opacity 0.5s var(--folio-ease), transform 0.5s var(--folio-ease);
        }

        .folio-header--scrolled {
          background: rgba(16, 19, 26, 0.88);
          box-shadow: 0 18px 36px -24px rgba(0, 0, 0, 0.75);
        }

        .folio-header--scrolled::after {
          opacity: 1;
          transform: scaleX(1);
        }

        .folio-header__inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 28px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          animation: folio-drop-in 0.6s var(--folio-ease) both;
        }

        @keyframes folio-drop-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .folio-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .folio-brand__mark {
          position: relative;
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: linear-gradient(135deg, var(--folio-accent), var(--folio-teal));
          color: #10182A;
          font-family: 'Fraunces', Georgia, serif;
          font-size: 17px;
          font-style: italic;
          box-shadow: 0 12px 24px rgba(217, 144, 50, 0.22);
          transition: transform 0.45s var(--folio-ease), box-shadow 0.45s var(--folio-ease);
        }

        .folio-brand__mark::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 12px;
          border: 1px solid var(--folio-accent);
          opacity: 0;
          transform: scale(0.85);
          transition: opacity 0.35s var(--folio-ease), transform 0.35s var(--folio-ease);
        }

        .folio-brand:hover .folio-brand__mark {
          transform: rotate(-6deg) scale(1.06);
          box-shadow: 0 16px 30px rgba(217, 144, 50, 0.32);
        }

        .folio-brand:hover .folio-brand__mark::before {
          opacity: 1;
          transform: scale(1);
        }

        .folio-brand__name {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 21px;
          letter-spacing: 0.01em;
          color: var(--folio-ink);
        }

        .folio-brand__name span {
          color: var(--folio-accent);
          font-style: italic;
        }

        .folio-menu {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 38px;
          height: 38px;
          border: 1px solid var(--folio-line);
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          padding: 0;
          align-items: center;
          transition: border-color 0.25s var(--folio-ease), background 0.25s var(--folio-ease);
        }

        .folio-menu:hover {
          border-color: var(--folio-accent);
          background: var(--folio-accent-soft);
        }

        .folio-menu span {
          width: 16px;
          height: 1.5px;
          background: var(--folio-ink);
          transition: transform 0.3s var(--folio-ease), opacity 0.3s var(--folio-ease);
        }

        .folio-menu[aria-expanded='true'] span:nth-child(1) {
          transform: translateY(6.5px) rotate(45deg);
        }

        .folio-menu[aria-expanded='true'] span:nth-child(2) {
          opacity: 0;
        }

        .folio-menu[aria-expanded='true'] span:nth-child(3) {
          transform: translateY(-6.5px) rotate(-45deg);
        }

        .folio-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex: 1;
          gap: 24px;
          min-width: 0;
        }

        .folio-nav__links {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .folio-nav__link {
          position: relative;
          padding: 8px 14px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14.5px;
          font-weight: 500;
          color: var(--folio-ink);
          text-decoration: none;
          border-radius: 7px;
          transition: color 0.25s var(--folio-ease), background 0.25s var(--folio-ease);
        }

        .folio-nav__link::after {
          content: '';
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: 4px;
          height: 1.5px;
          background: linear-gradient(90deg, var(--folio-accent), var(--folio-teal));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s var(--folio-ease);
        }

        .folio-nav__link:hover {
          color: var(--folio-accent-light);
          background: var(--folio-accent-soft);
        }

        .folio-nav__link:hover::after {
          transform: scaleX(1);
        }

        .folio-nav__link.active {
          color: var(--folio-accent-light);
        }

        .folio-nav__link.active::after {
          transform: scaleX(1);
        }

        .folio-nav__auth {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }

        .folio-login {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14.5px;
          font-weight: 500;
          color: var(--folio-ink);
          text-decoration: none;
          padding: 9px 6px;
          position: relative;
          transition: color 0.25s var(--folio-ease);
        }

        .folio-login::after {
          content: '';
          position: absolute;
          left: 6px;
          right: 6px;
          bottom: 4px;
          height: 1px;
          background: var(--folio-accent);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s var(--folio-ease);
        }

        .folio-login:hover {
          color: var(--folio-accent-light);
        }

        .folio-login:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        .folio-signup {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14.5px;
          font-weight: 600;
          color: #10182A;
          background: linear-gradient(120deg, var(--folio-accent), var(--folio-accent-light) 45%, var(--folio-accent) 90%);
          background-size: 200% 100%;
          background-position: 0% 0%;
          text-decoration: none;
          padding: 10px 18px;
          border-radius: 999px;
          transition: transform 0.3s var(--folio-ease), box-shadow 0.3s var(--folio-ease), background-position 0.5s var(--folio-ease);
          box-shadow: 0 14px 26px rgba(217, 144, 50, 0.22);
        }

        .folio-signup span {
          transition: transform 0.3s var(--folio-ease);
        }

        .folio-signup:hover {
          transform: translateY(-1px);
          background-position: 100% 0%;
          box-shadow: 0 18px 34px rgba(217, 144, 50, 0.3);
        }

        .folio-signup:hover span {
          transform: translateX(3px);
        }

        .folio-signup:active {
          transform: translateY(0);
        }

        .folio-user-menu {
          position: relative;
        }

        .folio-user-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: 1px solid var(--folio-line);
          border-radius: 999px;
          padding: 5px 14px 5px 6px;
          cursor: pointer;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          transition: border-color 0.25s var(--folio-ease), background 0.25s var(--folio-ease);
        }

        .folio-user-button:hover {
          background: var(--folio-accent-soft);
          border-color: var(--folio-accent);
        }

        .folio-avatar {
          position: relative;
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--folio-accent), var(--folio-teal));
          color: var(--folio-paper);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .folio-user-button[aria-expanded='true'] .folio-avatar::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 999px;
          border: 1px solid var(--folio-accent);
          animation: folio-pulse-ring 1.4s var(--folio-ease) infinite;
        }

        @keyframes folio-pulse-ring {
          0% { opacity: 0.7; transform: scale(0.9); }
          70% { opacity: 0; transform: scale(1.25); }
          100% { opacity: 0; transform: scale(1.25); }
        }

        .folio-user-button__name {
          font-size: 14px;
          color: var(--folio-ink);
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .folio-user__chevron {
          color: var(--folio-muted);
          font-size: 13px;
          transition: transform 0.3s var(--folio-ease);
        }

        .folio-user-button[aria-expanded='true'] .folio-user__chevron {
          transform: rotate(180deg);
        }

        .folio-user-menu__panel {
          position: absolute;
          right: 0;
          top: calc(100% + 10px);
          min-width: 176px;
          background: var(--folio-paper);
          border: 1px solid var(--folio-line-strong);
          border-radius: 12px;
          box-shadow: 0 20px 40px -18px rgba(0, 0, 0, 0.5);
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          opacity: 0;
          transform: translateY(-6px) scale(0.96);
          pointer-events: none;
          transform-origin: top right;
          transition: opacity 0.22s var(--folio-ease), transform 0.22s var(--folio-ease);
        }

        .folio-user-menu__panel.is-open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .folio-user-menu__panel a,
        .folio-user-menu__panel button {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          text-align: left;
          color: var(--folio-ink);
          text-decoration: none;
          background: transparent;
          border: none;
          padding: 9px 10px;
          border-radius: 7px;
          cursor: pointer;
          transition: background 0.2s var(--folio-ease), color 0.2s var(--folio-ease), padding-left 0.2s var(--folio-ease);
        }

        .folio-user-menu__panel a:hover,
        .folio-user-menu__panel button:hover {
          background: var(--folio-accent-soft);
          color: var(--folio-accent-light);
          padding-left: 14px;
        }

        @media (max-width: 860px) {
          .folio-menu {
            display: inline-flex;
          }

          .folio-nav {
            position: fixed;
            top: 72px;
            left: 0;
            right: 0;
            flex-direction: column;
            align-items: stretch;
            gap: 4px;
            background: var(--folio-paper);
            border-bottom: 1px solid var(--folio-line);
            padding: 12px 20px 20px;
            transform: translateY(-8px);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s var(--folio-ease), transform 0.3s var(--folio-ease);
          }

          .folio-nav--open {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
          }

          .folio-nav--open .folio-nav__link {
            animation: folio-item-in 0.35s var(--folio-ease) both;
          }

          .folio-nav--open .folio-nav__links .folio-nav__link:nth-child(1) { animation-delay: 0.02s; }
          .folio-nav--open .folio-nav__links .folio-nav__link:nth-child(2) { animation-delay: 0.07s; }
          .folio-nav--open .folio-nav__links .folio-nav__link:nth-child(3) { animation-delay: 0.12s; }

          @keyframes folio-item-in {
            from { opacity: 0; transform: translateX(-6px); }
            to { opacity: 1; transform: translateX(0); }
          }

          .folio-nav__links {
            flex-direction: column;
            align-items: stretch;
            gap: 2px;
          }

          .folio-nav__link {
            padding: 12px 10px;
          }

          .folio-nav__link::after {
            display: none;
          }

          .folio-nav__auth {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            margin-top: 8px;
            padding-top: 12px;
            border-top: 1px solid var(--folio-line);
          }

          .folio-signup {
            justify-content: center;
          }

          .folio-user-menu__panel {
            position: static;
            box-shadow: none;
            border: none;
            padding: 4px 0 0;
            opacity: 1;
            transform: none;
            pointer-events: auto;
            display: none;
          }

          .folio-user-menu__panel.is-open {
            display: flex;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .folio-header__inner,
          .folio-nav--open .folio-nav__link,
          .folio-user-button[aria-expanded='true'] .folio-avatar::before {
            animation: none !important;
          }

          .folio-header,
          .folio-header::after,
          .folio-brand__mark,
          .folio-brand__mark::before,
          .folio-nav__link,
          .folio-nav__link::after,
          .folio-login::after,
          .folio-signup,
          .folio-signup span,
          .folio-user-button,
          .folio-user__chevron,
          .folio-user-menu__panel,
          .folio-nav,
          .folio-menu span {
            transition: none !important;
          }
        }
      `}</style>

      <div className="folio-header__inner">
        <Link to="/" className="folio-brand" onClick={close} aria-label="HyrMe home">
          <span className="folio-brand__mark">H</span>
          <span className="folio-brand__name">Hyr<span>Me</span></span>
        </Link>

        <button
          className="folio-menu"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`folio-nav ${open ? 'folio-nav--open' : ''}`} aria-label="Main navigation">
          <div className="folio-nav__links">
            {links.map(([label, to]) => (
              <NavLink
                key={label}
                to={to}
                onClick={close}
                className={({ isActive }) => `folio-nav__link ${isActive ? 'active' : ''}`}
                end={to === '/'}
              >
                {label}
              </NavLink>
            ))}
          </div>

          <div className="folio-nav__auth">
            {user ? (
              <div className="folio-user-menu">
                <button
                  type="button"
                  className="folio-user-button"
                  onClick={() => setMenuOpen((value) => !value)}
                  aria-expanded={menuOpen}
                >
                  <span className="folio-avatar">{initials}</span>
                  <span className="folio-user-button__name">{displayName}</span>
                  <span className="folio-user__chevron">⌄</span>
                </button>

                <div className={`folio-user-menu__panel ${menuOpen ? 'is-open' : ''}`}>
                  <Link to="/dashboard" onClick={close}>Dashboard</Link>
                  <Link to="/profile" onClick={close}>Profile</Link>
                  <button type="button" onClick={logOut}>Log out</button>
                </div>
              </div>
            ) : (
              <>
                <Link className="folio-login" to="/login" onClick={close}>Log in</Link>
                <Link className="folio-signup" to="/signup" onClick={close}>Get started <span>→</span></Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}