import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, Boxes, Check, ShieldCheck } from 'lucide-react';
import { Logo } from './AppLayout';
import ProductIllustration from '../Components/ProductIllustration';

export default function AuthLayout({ title, subtitle, children }) {
    return (
        <>
            <Head title={title} />
            <main className="auth-page">
                <section className="auth-story">
                    <Link className="brand-link" href="/login">
                        <Logo light />
                    </Link>
                    <div className="auth-story-copy">
                        <span className="story-pill">
                            <span /> A little order goes a long way
                        </span>
                        <h1>
                            Good things.
                            <br />
                            All in <em>one place.</em>
                        </h1>
                        <p>
                            A clearer view of your inventory.
                            <br />A little more room to do your best work.
                        </p>
                    </div>
                    <div className="auth-art" aria-hidden="true">
                        <div className="art-orbit orbit-one" />
                        <div className="art-orbit orbit-two" />
                        <div className="art-product art-headphones">
                            <ProductIllustration name="headphones" />
                            <span>Studio Headphones</span>
                            <small>24 units in stock</small>
                        </div>
                        <div className="art-product art-lamp">
                            <ProductIllustration name="lamp" />
                            <span>Arc Desk Lamp</span>
                        </div>
                        <div className="art-product art-bottle">
                            <ProductIllustration name="bottle" />
                        </div>
                        <div className="art-notification">
                            <span>
                                <Check size={18} />
                            </span>
                            <div>
                                <strong>Everything accounted for.</strong>
                                <small>Less searching. More doing.</small>
                            </div>
                        </div>
                        <span className="art-spark spark-one">✳</span>
                        <span className="art-spark spark-two">✳</span>
                    </div>
                    <div className="auth-story-footer">
                        <span>
                            <ShieldCheck size={16} /> Your workspace, your control.
                        </span>
                        <ArrowUpRight size={20} />
                    </div>
                </section>
                <section className="auth-form-side">
                    <div className="auth-mobile-logo">
                        <Logo />
                    </div>
                    <span className="auth-top-label">
                        <Boxes size={15} /> INVENTORY, SIMPLIFIED
                    </span>
                    <div className="auth-form-wrap">
                        <div className="auth-heading">
                            <h2>{title}</h2>
                            <p>{subtitle}</p>
                        </div>
                        {children}
                    </div>
                    <footer className="auth-footer">
                        A place for every product. <span>A better everyday.</span>
                    </footer>
                </section>
            </main>
        </>
    );
}
