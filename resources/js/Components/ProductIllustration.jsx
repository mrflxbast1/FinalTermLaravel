import { useId } from 'react';

export default function ProductIllustration({ name = 'box', className = '' }) {
    const id = useId().replaceAll(':', '');
    const ink = '#323930';
    let drawing;
    switch (name) {
        case 'headphones':
            drawing = (
                <>
                    <path
                        d="M28 62V47a32 32 0 0 1 64 0v15"
                        fill="none"
                        stroke={ink}
                        strokeWidth="10"
                    />
                    <path
                        d="M28 48a32 32 0 0 1 64 0"
                        fill="none"
                        stroke="#858f7c"
                        strokeWidth="3"
                    />
                    <rect
                        x="21"
                        y="52"
                        width="20"
                        height="37"
                        rx="9"
                        fill={ink}
                        transform="rotate(-8 31 70)"
                    />
                    <rect
                        x="79"
                        y="52"
                        width="20"
                        height="37"
                        rx="9"
                        fill={ink}
                        transform="rotate(8 89 70)"
                    />
                    <rect x="31" y="56" width="8" height="29" rx="4" fill="#a2b293" />
                    <rect x="81" y="56" width="8" height="29" rx="4" fill="#a2b293" />
                </>
            );
            break;
        case 'lamp':
            drawing = (
                <>
                    <ellipse cx="60" cy="98" rx="28" ry="6" fill={ink} />
                    <path
                        d="M61 93V62L43 44"
                        fill="none"
                        stroke={ink}
                        strokeWidth="6"
                        strokeLinecap="round"
                    />
                    <path
                        d="M27 55L38 28Q42 20 50 25L76 43Z"
                        fill="#b4c89b"
                        stroke={ink}
                        strokeWidth="2.5"
                    />
                    <path d="M28 55L76 43" stroke={ink} strokeWidth="5" strokeLinecap="round" />
                    <path d="M45 55L61 79L87 61" fill="#e4edb9" opacity=".6" />
                </>
            );
            break;
        case 'keyboard':
            drawing = (
                <>
                    <g transform="translate(12 38) rotate(-7 48 23)">
                        <rect width="96" height="51" rx="8" fill={ink} />
                        <rect x="3" y="3" width="90" height="42" rx="5" fill="#c8cebd" />
                        {Array.from({ length: 27 }, (_, i) => (
                            <rect
                                key={i}
                                x={8 + (i % 9) * 9}
                                y={8 + Math.floor(i / 9) * 9}
                                width="7"
                                height="6"
                                rx="1.3"
                                fill={i % 7 === 0 ? '#8d9d7e' : '#f4f2e8'}
                            />
                        ))}
                        <rect x="28" y="35" width="41" height="6" rx="1.5" fill="#f4f2e8" />
                    </g>
                </>
            );
            break;
        case 'mouse':
            drawing = (
                <>
                    <g transform="rotate(-18 60 60)">
                        <path
                            d="M36 54Q36 25 60 25Q84 25 84 54V75Q84 96 60 96Q36 96 36 75Z"
                            fill="#c4cbb9"
                            stroke={ink}
                            strokeWidth="2"
                        />
                        <path d="M60 26V58M38 57H82" stroke="#8c9783" strokeWidth="1.5" />
                        <rect x="57" y="37" width="6" height="13" rx="3" fill={ink} />
                    </g>
                </>
            );
            break;
        case 'speaker':
            drawing = (
                <>
                    <rect x="30" y="25" width="60" height="74" rx="15" fill={ink} />
                    <rect x="35" y="31" width="50" height="62" rx="11" fill="#798771" />
                    {Array.from({ length: 42 }, (_, i) => (
                        <circle
                            key={i}
                            cx={41 + (i % 6) * 7.5}
                            cy={40 + Math.floor(i / 6) * 7.5}
                            r="1.3"
                            fill="#333e30"
                        />
                    ))}
                    <path
                        d="M44 24Q44 13 61 13Q78 13 78 24"
                        fill="none"
                        stroke="#525e4b"
                        strokeWidth="3"
                    />
                </>
            );
            break;
        case 'camera':
            drawing = (
                <>
                    <rect x="17" y="38" width="86" height="53" rx="9" fill={ink} />
                    <path d="M38 38L44 26H68L76 38" fill="#69765d" />
                    <rect x="25" y="46" width="70" height="36" rx="3" fill="#8e9c7d" />
                    <circle cx="61" cy="64" r="23" fill={ink} />
                    <circle cx="61" cy="64" r="17" fill="#9ea999" />
                    <circle cx="61" cy="64" r="12" fill="#273229" />
                    <circle cx="56" cy="59" r="4" fill="#b4c9bd" opacity=".65" />
                    <rect x="81" y="42" width="13" height="8" rx="2" fill="#e5ebd7" />
                </>
            );
            break;
        case 'watch':
            drawing = (
                <>
                    <path d="M45 9H75L79 38H41Z M41 80H79L75 111H45Z" fill="#8d9e7b" />
                    <rect x="34" y="32" width="52" height="56" rx="13" fill={ink} />
                    <rect x="39" y="37" width="42" height="46" rx="9" fill="#dbe3c8" />
                    <path
                        d="M60 45V60L70 65"
                        fill="none"
                        stroke={ink}
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <circle cx="60" cy="60" r="3" fill={ink} />
                    <rect x="86" y="49" width="4" height="12" rx="2" fill="#69765e" />
                </>
            );
            break;
        case 'chair':
            drawing = (
                <>
                    <rect
                        x="32"
                        y="19"
                        width="56"
                        height="46"
                        rx="12"
                        fill="#98aa83"
                        stroke={ink}
                        strokeWidth="2"
                    />
                    <path
                        d="M43 27V56M54 27V56M65 27V56M76 27V56"
                        stroke="#7e906b"
                        strokeWidth="1"
                    />
                    <rect x="28" y="65" width="64" height="13" rx="6" fill={ink} />
                    <path
                        d="M60 78V98M60 98L32 105M60 98L88 105M60 98V109"
                        stroke={ink}
                        strokeWidth="5"
                        strokeLinecap="round"
                    />
                    <path d="M25 55V68M95 55V68" stroke={ink} strokeWidth="4" />
                </>
            );
            break;
        case 'bag':
            drawing = (
                <>
                    <path
                        d="M43 29V24Q43 12 60 12Q77 12 77 24V29"
                        fill="none"
                        stroke={ink}
                        strokeWidth="5"
                    />
                    <rect
                        x="30"
                        y="26"
                        width="60"
                        height="76"
                        rx="15"
                        fill="#94a57f"
                        stroke={ink}
                        strokeWidth="2"
                    />
                    <path d="M35 43H85" stroke="#657551" strokeWidth="2" />
                    <rect x="37" y="61" width="46" height="31" rx="7" fill="#7c8f68" />
                    <path d="M41 68H79" stroke={ink} strokeWidth="2" />
                    <rect x="55" y="45" width="11" height="7" rx="1" fill="#e1ddc5" />
                </>
            );
            break;
        case 'bottle':
            drawing = (
                <>
                    <rect x="46" y="14" width="28" height="15" rx="5" fill={ink} />
                    <path
                        d="M44 29H76L81 42V96Q81 105 60 105Q39 105 39 96V42Z"
                        fill="#adc397"
                        stroke={ink}
                        strokeWidth="2"
                    />
                    <path d="M46 41V91" stroke="#d7e5c7" strokeWidth="4" strokeLinecap="round" />
                    <rect x="46" y="58" width="28" height="20" rx="3" fill="#edf0dc" />
                    <path d="M55 68H65" stroke="#748668" strokeWidth="2" />
                </>
            );
            break;
        case 'notebook':
            drawing = (
                <>
                    <g transform="rotate(-12 60 60)">
                        <rect x="30" y="24" width="63" height="79" rx="4" fill="#747e66" />
                        <rect
                            x="25"
                            y="18"
                            width="63"
                            height="79"
                            rx="4"
                            fill="#bacba5"
                            stroke={ink}
                            strokeWidth="1.5"
                        />
                        <path d="M36 19V96" stroke="#82936d" strokeWidth="2" />
                        <rect x="45" y="36" width="32" height="20" rx="2" fill="#e9edda" />
                        <path d="M50 44H72M50 49H65" stroke="#8b967e" strokeWidth="1.5" />
                        <path d="M78 18V97" stroke="#536146" strokeWidth="2" />
                    </g>
                </>
            );
            break;
        case 'plant':
            drawing = (
                <>
                    <path d="M60 76V37" stroke="#576e44" strokeWidth="4" />
                    <path d="M59 51Q22 51 26 22Q59 22 59 51" fill="#7d9d61" />
                    <path d="M61 63Q97 60 96 33Q64 32 61 63" fill="#597c44" />
                    <path d="M58 44Q53 14 76 12Q85 36 58 44" fill="#93b176" />
                    <path
                        d="M38 72H82L76 103H44Z"
                        fill="#d2c5ac"
                        stroke="#9a8e77"
                        strokeWidth="2"
                    />
                    <ellipse cx="60" cy="73" rx="22" ry="5" fill="#b0a087" />
                </>
            );
            break;
        default:
            drawing = (
                <>
                    <path
                        d="M22 42L60 23L98 42V85L60 106L22 85Z"
                        fill="#d3c8ad"
                        stroke="#8d836c"
                        strokeWidth="2"
                    />
                    <path
                        d="M22 42L60 62L98 42M60 62V106M41 32L79 52"
                        fill="none"
                        stroke="#8d836c"
                        strokeWidth="2"
                    />
                    <path d="M48 56V77L60 84V62" fill="#eadfc5" />
                </>
            );
    }
    return (
        <span className={`product-illustration ${className}`} aria-hidden="true">
            <svg viewBox="0 0 120 120" fill="none">
                <defs>
                    <radialGradient id={id}>
                        <stop stopColor="#a6b098" stopOpacity=".35" />
                        <stop offset="1" stopColor="#a6b098" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <ellipse cx="60" cy="105" rx="44" ry="10" fill={`url(#${id})`} />
                {drawing}
            </svg>
        </span>
    );
}
