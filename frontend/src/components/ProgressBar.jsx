import React from 'react';

export default function ProgressBar({ processed, total, status }) {
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  const isRunning = status === 'running';
  const isDone = status === 'completed';

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isRunning && (
            <span style={{
              display: 'inline-block',
              width: '8px', height: '8px',
              background: 'var(--accent)',
              borderRadius: '50%',
              animation: 'pulse-dot 1s infinite',
            }} />
          )}
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {isDone ? '✓ Extraction Complete' : isRunning ? 'Extracting data...' : 'Ready'}
          </span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {processed} / {total} ({pct}%)
        </span>
      </div>
      <div style={{
        height: '6px',
        background: 'var(--bg-card)',
        borderRadius: '3px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: isDone
            ? 'linear-gradient(90deg, var(--success), #06af5c)'
            : 'linear-gradient(90deg, var(--accent), #47a3ff)',
          borderRadius: '3px',
          transition: 'width 0.4s ease',
          boxShadow: isRunning ? '0 0 8px rgba(30,124,255,0.5)' : 'none',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {isRunning && (
            <div style={{
              position: 'absolute',
              top: 0, left: '-100%',
              width: '100%', height: '100%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              animation: 'shimmer 1.5s infinite',
              backgroundSize: '400px 100%',
            }} />
          )}
        </div>
      </div>
    </div>
  );
}
