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
        :root {
          --folio-ink: #F5F1E8;
          --folio-paper: #12151B;
          --folio-line: rgba(245, 241, 232, 0.12);
          --folio-muted: #AEB7C4;
          --folio-accent: #D99032;
          --folio-accent-dark: #B97A1A;
          --folio-accent-soft: rgba(217, 144, 50, 0.12);
          --folio-card: #171A21;
        }

        .folio-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(18, 21, 27, 0.8);
          border-bottom: 1px solid var(--folio-line);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition: box-shadow 0.35s ease, border-color 0.35s ease, background 0.35s ease;
        }

        .folio-header--scrolled {
          background: rgba(18, 21, 27, 0.82);
          box-shadow: 0 12px 28px -20px rgba(0, 0, 0, 0.7);
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
        }

        .folio-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .folio-brand__mark {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: linear-gradient(135deg, var(--folio-accent), #287765);
          color: #10182A;
          font-family: Georgia, 'Iowan Old Style', 'Palatino Linotype', serif;
          font-size: 17px;
          font-style: italic;
          box-shadow: 0 12px 24px rgba(217, 144, 50, 0.22);
        }

        .folio-brand__name {
          font-family: Georgia, 'Iowan Old Style', 'Palatino Linotype', serif;
          font-size: 21px;
          letter-spacing: 0.01em;
          color: var(--folio-ink);
        }

        .folio-brand__name span {
          color: var(--folio-accent);
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
        }

        .folio-menu span {
          width: 16px;
          height: 1.5px;
          background: var(--folio-ink);
          transition: transform 0.25s ease, opacity 0.25s ease;
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif;
          font-size: 14.5px;
          color: var(--folio-ink);
          text-decoration: none;
          border-radius: 7px;
          transition: color 0.2s ease, background 0.2s ease;
        }

        .folio-nav__link::after {
          content: '';
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: 4px;
          height: 1.5px;
          background: var(--folio-accent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease;
        }

        .folio-nav__link:hover {
          color: var(--folio-accent-dark);
          background: var(--folio-accent-soft);
        }

        .folio-nav__link.active {
          color: var(--folio-accent-dark);
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif;
          font-size: 14.5px;
          color: var(--folio-ink);
          text-decoration: none;
          padding: 9px 6px;
          transition: color 0.2s ease;
        }

        .folio-login:hover {
          color: var(--folio-accent-dark);
        }

        .folio-signup {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif;
          font-size: 14.5px;
          color: #10182A;
          background: linear-gradient(135deg, var(--folio-accent), #E7A75B);
          text-decoration: none;
          padding: 10px 18px;
          border-radius: 999px;
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
          box-shadow: 0 14px 26px rgba(217, 144, 50, 0.22);
        }

        .folio-signup span {
          transition: transform 0.2s ease;
        }

        .folio-signup:hover {
          transform: translateY(-1px);
          filter: brightness(1.04);
          box-shadow: 0 18px 32px rgba(217, 144, 50, 0.28);
        }

        .folio-signup:hover span {
          transform: translateX(3px);
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .folio-user-button:hover {
          background: var(--folio-accent-soft);
          border-color: var(--folio-accent);
        }

        .folio-avatar {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: var(--folio-accent);
          color: var(--folio-paper);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
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
          transition: transform 0.2s ease;
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
          border: 1px solid var(--folio-line);
          border-radius: 12px;
          box-shadow: 0 16px 32px -18px rgba(20, 22, 27, 0.35);
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          opacity: 0;
          transform: translateY(-6px) scale(0.98);
          pointer-events: none;
          transition: opacity 0.18s ease, transform 0.18s ease;
        }

        .folio-user-menu__panel.is-open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .folio-user-menu__panel a,
        .folio-user-menu__panel button {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif;
          font-size: 14px;
          text-align: left;
          color: var(--folio-ink);
          text-decoration: none;
          background: transparent;
          border: none;
          padding: 9px 10px;
          border-radius: 7px;
          cursor: pointer;
        }

        .folio-user-menu__panel a:hover,
        .folio-user-menu__panel button:hover {
          background: var(--folio-accent-soft);
          color: var(--folio-accent-dark);
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
            transition: opacity 0.22s ease, transform 0.22s ease;
          }

          .folio-nav--open {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
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
      `}</style>

      <div className="folio-header__inner">
        <Link to="/" className="folio-brand" onClick={close} aria-label="Folio home">
          <span className="folio-brand__mark">F</span>
          <span className="folio-brand__name">folio<span>.</span></span>
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