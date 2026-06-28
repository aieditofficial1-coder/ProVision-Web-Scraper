import React from 'react';
import { Globe, CheckCircle, XCircle, AlertCircle, Loader, BarChart2, TrendingUp } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid var(--border)`,
      borderRadius: 'var(--radius-md)',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      transition: 'border-color 0.2s',
    }}>
      <div style={{
        width: '38px', height: '38px',
        background: bg,
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={17} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export default function StatsBar({ stats }) {
  const successRate = stats.total > 0
    ? Math.round((stats.success / Math.max(stats.processed, 1)) * 100)
    : 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '12px',
      marginBottom: '20px',
    }}>
      <StatCard icon={Globe} label="Total URLs" value={stats.total} color="var(--accent)" bg="rgba(30,124,255,0.12)" />
      <StatCard icon={CheckCircle} label="Valid URLs" value={stats.valid} color="var(--success)" bg="var(--success-bg)" />
      <StatCard icon={XCircle} label="Invalid" value={stats.invalid} color="var(--danger)" bg="var(--danger-bg)" />
      <StatCard icon={Loader} label="Processed" value={stats.processed} color="var(--warning)" bg="var(--warning-bg)" />
      <StatCard icon={CheckCircle} label="Succeeded" value={stats.success} color="var(--success)" bg="var(--success-bg)" />
      <StatCard icon={AlertCircle} label="Failed" value={stats.failed} color="var(--danger)" bg="var(--danger-bg)" />
      <StatCard icon={TrendingUp} label="Success Rate" value={`${successRate}%`} color="var(--accent)" bg="rgba(30,124,255,0.12)" />
    </div>
  );
}
