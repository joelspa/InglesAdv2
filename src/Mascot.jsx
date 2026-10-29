import React from 'react';

// Lingo, the LingoQuest mascot. mood: idle | happy | sad | cheer | wave | think
const mouths = {
  idle: <path d="M51 77 Q60 85 69 77" className="mascot-line" />,
  wave: <path d="M51 77 Q60 85 69 77" className="mascot-line" />,
  think: <circle cx="62" cy="80" r="3.6" className="mascot-ink" />,
  sad: <path d="M51 83 Q60 75 69 83" className="mascot-line" />,
  happy: <><path d="M49 74 Q60 93 71 74 Z" className="mascot-ink" /><path d="M54 84 Q60 89 66 84 Q60 81 54 84Z" fill="#FF7FA7" /></>,
  cheer: <><path d="M49 74 Q60 93 71 74 Z" className="mascot-ink" /><path d="M54 84 Q60 89 66 84 Q60 81 54 84Z" fill="#FF7FA7" /></>
};

function Eyes({ mood }) {
  if (mood === 'happy' || mood === 'cheer') return <g className="mascot-eyes"><path d="M38 63 Q46 52 54 63" className="mascot-line thick" /><path d="M66 63 Q74 52 82 63" className="mascot-line thick" /></g>;
  const look = mood === 'think' ? { x: 3, y: -4 } : mood === 'sad' ? { x: 0, y: 3 } : { x: 1, y: 1 };
  return <g className="mascot-eyes">
    <ellipse cx="46" cy="61" rx="10" ry="12" fill="#fff" />
    <ellipse cx="74" cy="61" rx="10" ry="12" fill="#fff" />
    <circle cx={46 + look.x} cy={61 + look.y} r="5.6" className="mascot-ink" />
    <circle cx={74 + look.x} cy={61 + look.y} r="5.6" className="mascot-ink" />
    <circle cx={48 + look.x} cy={58 + look.y} r="1.9" fill="#fff" />
    <circle cx={76 + look.x} cy={58 + look.y} r="1.9" fill="#fff" />
    {mood === 'sad' && <><path d="M36 48 L54 44" className="mascot-line" /><path d="M84 48 L66 44" className="mascot-line" /></>}
  </g>;
}

export function Mascot({ mood = 'idle', size = 96, className = '' }) {
  return <svg className={`mascot mascot-${mood} ${className}`} viewBox="0 0 120 124" width={size} height={size * 124 / 120} aria-hidden="true" focusable="false">
    <ellipse cx="60" cy="118" rx="30" ry="4.5" className="mascot-shadow" />
    <g className="mascot-figure">
      <g className="mascot-arm left"><ellipse cx="22" cy="86" rx="7.5" ry="13" className="mascot-limb" /></g>
      <g className="mascot-arm right"><ellipse cx="98" cy="86" rx="7.5" ry="13" className="mascot-limb" /></g>
      <ellipse cx="45" cy="109" rx="11" ry="6.5" className="mascot-limb" />
      <ellipse cx="75" cy="109" rx="11" ry="6.5" className="mascot-limb" />
      <path d="M60 33 C61 24 63 18 68 13" className="mascot-stem" />
      <path d="M68 13 C76 5 89 7 91 12 C84 21 73 21 68 13Z" className="mascot-leaf" />
      <rect x="22" y="31" width="76" height="80" rx="36" className="mascot-body" />
      <ellipse cx="60" cy="90" rx="24" ry="15" className="mascot-belly" />
      <ellipse cx="34" cy="76" rx="6.5" ry="3.8" className="mascot-cheek" />
      <ellipse cx="86" cy="76" rx="6.5" ry="3.8" className="mascot-cheek" />
      <Eyes mood={mood} />
      {mouths[mood] || mouths.idle}
    </g>
  </svg>;
}
