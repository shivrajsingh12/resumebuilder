import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  ['Templates', '/templates'],
  ['ATS Check', '/ats'],
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

