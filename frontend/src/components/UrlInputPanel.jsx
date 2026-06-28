import React, { useState } from 'react';
import { Play, Trash2, ClipboardPaste, Info } from 'lucide-react';

export default function UrlInputPanel({ onStart, isRunning }) {
  const [text, setText] = useState('');

  const lineCount = text.split('\n').filter(l => l.trim()).length;

  function handlePaste() {
    navigator.clipboard.readText().then(t => setText(prev => prev ? prev + '\n' + t : t)).catch(() => {});
  }

  function handleClear() {
    setText('');
  }

  function handleStart() {
    if (!text.trim() || isRunning) return;
    onStart(text);
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Paste URLs</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            One URL per line · Supports 1000+ URLs · Duplicates removed automatically
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handlePaste} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)',
            padding: '5px 10px', fontSize: '11px', fontWeight: 500, transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ClipboardPaste size={12} /> Paste
          </button>
          <button onClick={handleClear} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)',
            padding: '5px 10px', fontSize: '11px', fontWeight: 500, transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Trash2 size={12} /> Clear
          </button>
        </div>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={`https://example.com\nhttps://another-site.com\nhttps://business.co.uk`}
        rows={8}
        style={{
          width: '100%',
          background: 'var(--bg-input)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          lineHeight: '1.7',
          padding: '12px 14px',
          resize: 'vertical',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <Info size={11} />
          <span>{lineCount} URL{lineCount !== 1 ? 's' : ''} detected</span>
        </div>
        <button
          onClick={handleStart}
          disabled={!text.trim() || isRunning}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: isRunning ? 'var(--accent-dim)' : 'linear-gradient(135deg, var(--accent) 0%, #0055cc 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '10px 24px',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s',
            boxShadow: isRunning ? 'none' : '0 2px 16px rgba(30,124,255,0.3)',
            opacity: (!text.trim() || isRunning) ? 0.6 : 1,
            cursor: (!text.trim() || isRunning) ? 'not-allowed' : 'pointer',
          }}
        >
          {isRunning ? (
            <>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Extracting…
            </>
          ) : (
            <>
              <Play size={13} />
              Extract Data
            </>
          )}
        </button>
      </div>
    </div>
  );
}
