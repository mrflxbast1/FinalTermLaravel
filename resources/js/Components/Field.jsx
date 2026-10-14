import { useId } from 'react';

export default function Field({
    label,
    error,
    hint,
    as: Element = 'input',
    children,
    className = '',
    ...props
}) {
    const generatedId = useId();
    const id = props.id || generatedId;
    return (
        <div className={`field ${className}`}>
            <label htmlFor={id}>
                {label}
                {props.required && (
                    <span className="required-mark" aria-hidden="true">
                        {' '}
                        *
                    </span>
                )}
            </label>
            <Element
                {...props}
                id={id}
                className={`input ${error ? 'input-error' : ''}`}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            >
                {children}
            </Element>
            {error ? (
                <p className="field-error" id={`${id}-error`} role="alert">
                    {error}
                </p>
            ) : (
                hint && (
                    <p className="field-hint" id={`${id}-hint`}>
                        {hint}
                    </p>
                )
            )}
        </div>
    );
}
