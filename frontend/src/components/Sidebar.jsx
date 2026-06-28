import React from 'react';
import { Activity, Cpu, Globe, Shield, Zap, MemoryStick } from 'lucide-react';

function SideCard({ icon: Icon, title, children, accent }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Icon size={13} color={accent || 'var(--accent)'} />
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, color, bar, barColor }) {
  return (
    <div style={{ paddingBottom: '6px', borderBottom: '1px solid var(--border)', marginBottom: '2px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: '11px', fontWeight: 600, color: color || 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
          {value}
        </span>
      </div>
      {bar !== undefined && (
        <div style={{ marginTop: '3px', height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${Math.min(100, bar)}%`,
            background: barColor || 'var(--accent)',
            borderRadius: '2px', transition: 'width 0.5s ease',
          }} />
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ job }) {
  const m = job?.metrics || {};
  const elapsed = job?.createdAt
    ? Math.round((Date.now() - new Date(job.createdAt).getTime()) / 1000)
    : 0;

  const eta = job?.status === 'running' && job?.processed > 0 && elapsed > 0
    ? Math.round(((job.total - job.processed) / (job.processed / elapsed)))
    : null;

  const cpuColor = m.cpuPct > 80 ? 'var(--danger)' : m.cpuPct > 50 ? 'var(--warning)' : 'var(--success)';
  const memColor = m.memUsedPct > 80 ? 'var(--danger)' : m.memUsedPct > 60 ? 'var(--warning)' : 'var(--success)';

  return (
    <aside style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>

      <SideCard icon={Activity} title="Job Progress">
        <Row label="Status" value={job?.status || 'Idle'}
          color={job?.status === 'completed' ? 'var(--success)' : job?.status === 'running' ? 'var(--accent)' : 'var(--text-muted)'} />
        <Row label="Processed" value={job?.processed ?? '—'} />
        <Row label="Remaining" value={job ? (job.total - job.processed) : '—'} />
        <Row label="Success" value={job?.success ?? '—'} color="var(--success)" />
        <Row label="Failed" value={job?.failed ?? '—'} color="var(--danger)" />
        {eta !== null && <Row label="ETA" value={`~${eta}s`} color="var(--warning)" />}
        <Row label="Elapsed" value={elapsed > 0 ? `${elapsed}s` : '—'} />
      </SideCard>

      <SideCard icon={Zap} title="Throughput" accent="var(--warning)">
        <Row label="Concurrency" value={m.concurrency || '—'} color="var(--accent)" />
        <Row label="Speed" value={m.urlsPerSec ? `${m.urlsPerSec}/s` : '—'} color="var(--accent)" />
      </SideCard>

      <SideCard icon={Cpu} title="System Resources" accent="var(--success)">
        <Row label="CPU" value={m.cpuPct !== undefined ? `${m.cpuPct}%` : '—'}
          color={cpuColor} bar={m.cpuPct} barColor={cpuColor} />
        <Row label="RAM Used" value={m.memUsedPct !== undefined ? `${m.memUsedPct}%` : '—'}
          color={memColor} bar={m.memUsedPct} barColor={memColor} />
        <Row label="RAM Free" value={m.memFreeMb ? `${m.memFreeMb}MB` : '—'} />
        <Row label="Heap" value={m.heapUsedMb ? `${m.heapUsedMb}MB` : '—'} />
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
          Concurrency auto-adjusts based on available CPU + RAM
        </div>
      </SideCard>

      <SideCard icon={Globe} title="Data Extracted" accent="var(--warning)">
        {['Company Name','Industry','Email','Phone','LinkedIn','Facebook','Instagram','Twitter/X','Website URL'].map(d => (
          <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
            {d}
          </div>
        ))}
      </SideCard>

      <SideCard icon={Shield} title="Auto Features" accent="var(--danger)">
        {[
          'Adaptive concurrency',
          'CPU/RAM monitoring',
          'Browser pool + recycling',
          'Axios → PW fallback',
          'JS shell detection',
          'Parallel sub-pages',
          'Resource img blocking',
          'Context recycling',
          'Retry on failure',
          'URL deduplication',
          'Job auto-cleanup (2h)',
        ].map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
            <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span> {f}
          </div>
        ))}
      </SideCard>
    </aside>
  );
}
