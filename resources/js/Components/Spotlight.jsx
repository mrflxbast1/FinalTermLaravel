export default function Spotlight({ children, className = '', ...props }) {
    const followPointer = (event) => {
        if (
            event.pointerType !== 'mouse' ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        )
            return;
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
        event.currentTarget.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
    };
    return (
        <section
            {...props}
            className={`spotlight ${className}`}
            onPointerMove={followPointer}
            onPointerLeave={(event) => {
                event.currentTarget.style.removeProperty('--spot-x');
                event.currentTarget.style.removeProperty('--spot-y');
            }}
        >
            {children}
        </section>
    );
}
