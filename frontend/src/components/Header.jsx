import React from 'react';
import { Zap, Globe } from 'lucide-react';

export default function Header() {
  return (
    <header style={{
      background: 'linear-gradient(90deg, var(--bg-surface) 0%, #081a35 100%)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px', height: '36px',
          background: 'linear-gradient(135deg, var(--accent) 0%, #0055cc 100%)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(30,124,255,0.4)',
        }}>
          <Zap size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '0.03em', color: 'var(--text-primary)' }}>
            PROVISION
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '-2px' }}>
            Web Scraper
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <Globe size={13} />
        <span>AI-Powered Website Data Extraction</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          background: 'var(--success-bg)', color: 'var(--success)',
          border: '1px solid rgba(13,207,107,0.2)',
          borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 500,
        }}>
          <span style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%', animation: 'pulse-dot 2s infinite' }} />
          Live
        </span>
      </div>
    </header>
  );
}
