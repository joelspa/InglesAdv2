import React, { useState } from 'react';
import { Award, BookOpen, CircleHelp, Flame, Gem, RotateCcw, Timer, Volume2, VolumeX, Zap } from 'lucide-react';
import { Mascot } from './Mascot.jsx';
import { RoundHistory } from './RoundHistory.jsx';
import { badgeIcons } from './Celebrations.jsx';
import { achievementList } from './rewards.mjs';
import { levelInfo, streak } from './learning.mjs';

export function Profile({ progress, onSound, onIntro, onReset, onGeneral }) {
  const [confirm, setConfirm] = useState(false);
  const level = levelInfo(progress.xp);
  const lessons = Object.keys(progress.lessons).length;
  const stats = [
    [Flame, 'flame', streak(progress.days), 'Días de racha'],
    [Zap, 'gold', progress.xp, 'XP total'],
    [BookOpen, 'grape', lessons, 'Lecciones completadas'],
    [Gem, 'sky', progress.perfectLessons, 'Lecciones perfectas'],
    [Award, 'good', progress.bestCombo, 'Mejor combo'],
    [Timer, 'gold', progress.speedBest, 'Récord relámpago']
  ];
  return <div className="profile">
    <section className="profile-card">
      <Mascot mood="happy" size={110} />
      <div>
        <h2>Nivel {level.level}</h2>
        <div className="level-bar" role="progressbar" aria-label="Progreso al siguiente nivel" aria-valuemin={0} aria-valuemax={level.needed} aria-valuenow={level.current}><i style={{ transform: `scaleX(${level.fraction})` }} /></div>
        <p>{level.needed - level.current} XP para el nivel {level.level + 1}</p>
      </div>
    </section>

    <section aria-labelledby="stats-title">
      <h2 id="stats-title" className="section-title">Estadísticas</h2>
      <div className="stats-grid">{stats.map(([Icon, tone, value, label]) => <div key={label} className={`mini-stat ${tone}`}><Icon size={24} aria-hidden="true" /><b>{value}</b><span>{label}</span></div>)}</div>
    </section>

    <section aria-labelledby="badges-title">
      <h2 id="badges-title" className="section-title">Logros <small>{progress.achievements.length} de {achievementList.length}</small></h2>
      <ul className="badges">{achievementList.map(item => {
        const Icon = badgeIcons[item.icon] || Award;
        const on = progress.achievements.includes(item.id);
        return <li key={item.id} className={`badge ${on ? 'on' : ''}`}>
          <span className="badge-icon"><Icon size={30} aria-hidden="true" /></span>
          <b>{item.name}</b><span>{item.desc}</span>
          <span className="visually-hidden">{on ? 'Desbloqueado' : 'Bloqueado'}</span>
        </li>;
      })}</ul>
    </section>

    <RoundHistory history={progress.history} onStart={onGeneral} />

    <section className="settings" aria-labelledby="settings-title">
      <h2 id="settings-title" className="section-title">Ajustes</h2>
      <button type="button" className="setting" role="switch" aria-checked={progress.sound} onClick={onSound}>
        {progress.sound ? <Volume2 size={22} aria-hidden="true" /> : <VolumeX size={22} aria-hidden="true" />}<span>Efectos de sonido</span><b>{progress.sound ? 'Activados' : 'Desactivados'}</b>
      </button>
      <button type="button" className="setting" onClick={onIntro}><CircleHelp size={22} aria-hidden="true" /><span>Ver cómo se juega</span></button>
      {!confirm ? <button type="button" className="setting danger" onClick={() => setConfirm(true)}><RotateCcw size={22} aria-hidden="true" /><span>Reiniciar mi progreso</span></button>
        : <div className="setting confirm-reset" role="alert">
          <p>Se borrarán tu XP, estrellas, racha y logros de este navegador.</p>
          <div><button type="button" className="btn btn-small btn-bad" onClick={() => { setConfirm(false); onReset(); }}>Sí, reiniciar</button><button type="button" className="btn btn-small btn-plain" onClick={() => setConfirm(false)}>Cancelar</button></div>
        </div>}
    </section>
  </div>;
}
