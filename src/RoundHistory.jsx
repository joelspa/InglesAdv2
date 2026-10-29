import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChartNoAxesColumnIncreasing, Target } from 'lucide-react';

function dateLabel(value) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(date);
}

export function RoundHistory({ history, onStart }) {
  const rounds = history.slice(0, 8).toReversed();
  const [selected, setSelected] = useState(Math.max(0, rounds.length - 1));
  const scrollRef = useRef();
  useEffect(() => {
    setSelected(Math.max(0, Math.min(8, history.length) - 1));
    const viewport = scrollRef.current;
    if (viewport) viewport.scrollLeft = viewport.scrollWidth - viewport.clientWidth;
  }, [history]);
  const current = rounds[selected] || rounds.at(-1);
  return <section className="round-history">
    <header><span><ChartNoAxesColumnIncreasing size={21} /></span><div><h2>{'Tus últimas rondas'}</h2><p>{'Cada barra es una ronda. Tócala para ver cómo te fue.'}</p></div></header>
    {!rounds.length ? <div className="history-empty"><Target size={30} /><h3>{'Tu primera referencia empieza aquí'}</h3><p>{'Completa una prueba para descubrir tus fortalezas y guardar tu primer resultado.'}</p><button className="primary" onClick={onStart}>{'Hacer una prueba'}<ArrowRight size={16} /></button></div> : <>
      <div className="history-chart-scroll" ref={scrollRef}><div className="history-plot" role="group" aria-label={'Resultados al primer intento'} style={{ '--columns': rounds.length }}>
        <span className="history-target" aria-hidden="true"><i />80%</span>
        {rounds.map((round, index) => <button key={`${round.date}-${index}`} className={`history-column ${round.percentage >= 80 ? 'at-target' : ''}`} style={{ '--height': `${round.percentage}%`, '--delay': `${index * 65}ms` }} aria-pressed={selected === index} aria-controls="round-history-detail" aria-label={`${'Ronda'} ${index + 1}: ${round.percentage}%, ${dateLabel(round.date)}, ${round.total} ${'ejercicios'}`} onClick={() => setSelected(index)}><span className="history-bar-area"><b>{round.percentage}%</b><i /></span><small>{dateLabel(round.date)}</small></button>)}
      </div></div>
      <div id="round-history-detail" className="history-detail" aria-live="polite" aria-atomic="true" key={`${selected}-${current.date}`}><div><b>{current.title || 'Ronda de práctica'}</b><span>{current.percentage}% {'al primer intento'} · {current.total} {'ejercicios'}</span></div><p>{'Cada ronda puede evaluar temas distintos. Abre una nueva prueba para seguir practicando.'}</p></div>
      <button className="secondary history-action" onClick={onStart}>{'Comenzar otra prueba general'}<ArrowRight size={15} /></button>
    </>}
  </section>;
}
