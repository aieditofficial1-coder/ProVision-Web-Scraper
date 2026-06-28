import React from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { getExportUrl } from '../utils/api.js';

export default function ExportPanel({ jobId, resultCount, disabled }) {
  function handleExport(format) {
    if (!jobId || disabled) return;
    const url = getExportUrl(jobId, format);
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Download size={16} color="var(--accent)" />
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Export Results</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {resultCount > 0 ? `${resultCount} records ready` : 'Run extraction to export'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => handleExport('csv')}
          disabled={disabled || !jobId}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: disabled || !jobId ? 'var(--bg-input)' : 'var(--success-bg)',
            color: disabled || !jobId ? 'var(--text-muted)' : 'var(--success)',
            border: `1px solid ${disabled || !jobId ? 'var(--border)' : 'rgba(13,207,107,0.3)'}`,
            borderRadius: 'var(--radius-sm)', padding: '7px 16px',
            fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
            cursor: disabled || !jobId ? 'not-allowed' : 'pointer',
          }}
        >
          <FileText size={13} /> Export CSV
        </button>
        <button
          onClick={() => handleExport('xlsx')}
          disabled={disabled || !jobId}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: disabled || !jobId ? 'var(--bg-input)' : 'rgba(30,124,255,0.1)',
            color: disabled || !jobId ? 'var(--text-muted)' : 'var(--accent)',
            border: `1px solid ${disabled || !jobId ? 'var(--border)' : 'rgba(30,124,255,0.3)'}`,
            borderRadius: 'var(--radius-sm)', padding: '7px 16px',
            fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
            cursor: disabled || !jobId ? 'not-allowed' : 'pointer',
          }}
        >
          <Table size={13} /> Export Excel
        </button>
      </div>
    </div>
  );
}
