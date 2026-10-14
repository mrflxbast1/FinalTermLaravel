import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    ArrowUpRight,
    Boxes,
    Check,
    ChevronRight,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    Search,
    UsersRound,
    X,
} from 'lucide-react';
import { initials } from '../lib/format';

export function Logo({ light = false }) {
    return (
        <span className={`brand ${light ? 'brand-light' : ''}`}>
            <span className="brand-icon">
                <Boxes size={25} strokeWidth={1.8} />
            </span>
            stockroom<span className="brand-period">.</span>
        </span>
    );
}

export default function AppLayout({
    children,
    title,
    description,
    actions,
    eyebrow = 'YOUR WORKSPACE',
}) {
    const { auth, flash } = usePage().props;
    const path = usePage().url.split('?')[0];
    const [menuOpen, setMenuOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);
    const searchRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setToast({ message: flash.success || flash.error, error: Boolean(flash.error) });
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    useEffect(() => {
        const handler = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    useEffect(() => {
        const dialog = menuRef.current;
        if (menuOpen && !dialog.open) dialog.showModal();
        if (!menuOpen && dialog.open) dialog.close();
    }, [menuOpen]);

    const links = [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/products', label: 'Products', icon: Package },
        { href: '/categories', label: 'Categories', icon: Boxes },
        ...(auth.permissions.includes('users.manage')
            ? [{ href: '/team', label: 'Team members', icon: UsersRound }]
            : []),
    ];
    const nav = (
        <>
            <Link href="/dashboard" className="brand-link" aria-label="Stockroom overview">
                <Logo light />
            </Link>
            <div className="workspace-label">
                <span className="workspace-monogram">S</span>
                <span>
                    <strong>Stockroom workspace</strong>
                    <small>Inventory management</small>
                </span>
            </div>
            <p className="nav-caption">WORKSPACE</p>
            <nav aria-label="Main navigation">
                {links.map(({ href, label, icon: Icon }) => {
                    const active = path === href || path.startsWith(href + '/');
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`nav-link ${active ? 'active' : ''}`}
                            aria-current={active ? 'page' : undefined}
                            onClick={() => setMenuOpen(false)}
                        >
                            <Icon size={19} strokeWidth={1.7} />
                            {label}
                            {active && <span className="nav-active-dot" />}
                        </Link>
                    );
                })}
            </nav>
            <div className="sidebar-note">
                <div className="note-orbit">
                    <Package size={27} strokeWidth={1.4} />
                    <span />
                    <i />
                </div>
                <strong>Room for good things.</strong>
                <p>A little structure. A clearer picture of everything you manage.</p>
                <Link href="/products">
                    Explore inventory <ArrowUpRight size={15} />
                </Link>
            </div>
            <div className="sidebar-bottom">
                <span className="workspace-status">
                    <i /> Stored on this PC
                </span>
                <div className="user-card">
                    <span className="avatar">{initials(auth.user.name)}</span>
                    <span>
                        <strong>{auth.user.name}</strong>
                        <small>{auth.roles[0] || 'Member'}</small>
                    </span>
                    <button
                        className="logout-button"
                        aria-label="Sign out"
                        title="Sign out"
                        onClick={() => router.post('/logout')}
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <>
            <Head title={title} />
            <a href="#main-content" className="skip-link">
                Skip to content
            </a>
            <div className="app-shell">
                <aside className="sidebar">{nav}</aside>
                <dialog
                    ref={menuRef}
                    className="mobile-nav"
                    aria-label="Navigation"
                    onClose={() => setMenuOpen(false)}
                    onClick={(event) => {
                        if (event.target === menuRef.current) setMenuOpen(false);
                    }}
                >
                    <button
                        className="mobile-nav-close icon-button"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close navigation"
                    >
                        <X size={20} />
                    </button>
                    {nav}
                </dialog>
                <div className="main-shell">
                    <header className="topbar">
                        <div className="breadcrumb">
                            <button
                                className="mobile-menu icon-button"
                                onClick={() => setMenuOpen(true)}
                                aria-label="Open navigation"
                            >
                                <Menu size={21} />
                            </button>
                            <span>Workspace</span>
                            <ChevronRight size={14} />
                            <strong>{title}</strong>
                        </div>
                        <form
                            className="global-search"
                            onSubmit={(event) => {
                                event.preventDefault();
                                router.get('/products', { search: search.trim() });
                            }}
                        >
                            <Search size={16} />
                            <input
                                ref={searchRef}
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Find a product..."
                                aria-label="Find a product"
                                maxLength={100}
                            />
                            <kbd>Ctrl K</kbd>
                        </form>
                        <span className="topbar-status">
                            <i /> Local workspace
                        </span>
                        <span className="topbar-avatar" aria-label={auth.user.name}>
                            {initials(auth.user.name)}
                        </span>
                    </header>
                    <main id="main-content" className="main-content">
                        <div className="page-heading">
                            <div>
                                <p className="eyebrow">{eyebrow}</p>
                                <h1>{title}</h1>
                                {description && <p className="page-description">{description}</p>}
                            </div>
                            {actions && <div className="page-actions">{actions}</div>}
                        </div>
                        {children}
                        <footer className="page-footer">
                            <span>Made for a more organized day.</span>
                            <span>
                                Stockroom <span> / </span> Inventory workspace
                            </span>
                        </footer>
                    </main>
                </div>
                {toast && (
                    <div
                        className={`toast ${toast.error ? 'toast-error' : ''}`}
                        role={toast.error ? 'alert' : 'status'}
                    >
                        <span>
                            <Check size={17} />
                        </span>
                        {toast.message}
                        <button
                            className="icon-button"
                            aria-label="Dismiss notification"
                            onClick={() => setToast(null)}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
