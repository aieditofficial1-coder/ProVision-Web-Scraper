import React, { useState } from 'react';
import { ExternalLink, ChevronUp, ChevronDown, Search } from 'lucide-react';

const STATUS_STYLES = {
  'Success': { color: '#0dcf6b', bg: 'rgba(13,207,107,0.1)', border: 'rgba(13,207,107,0.2)' },
  'Invalid URL': { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.2)' },
  'Website Unreachable': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  'Failed': { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.2)' },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || { color: '#7a9ccf', bg: 'rgba(122,156,207,0.08)', border: 'rgba(122,156,207,0.2)' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '10px',
      fontWeight: 600,
      letterSpacing: '0.04em',
      color: style.color,
      background: style.bg,
      border: `1px solid ${style.border}`,
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

function CellValue({ value }) {
  if (!value || value === 'Not Available') {
    return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>;
  }
  if (value.startsWith('http')) {
    const domain = (() => { try { return new URL(value).hostname.replace('www.', ''); } catch { return value; } })();
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" style={{
        color: 'var(--accent)', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '3px',
      }}>
        {domain.length > 22 ? domain.slice(0, 22) + '…' : domain}
        <ExternalLink size={10} />
      </a>
    );
  }
  return <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{value.length > 28 ? value.slice(0, 28) + '…' : value}</span>;
}

const COLUMNS = [
  { key: 'companyName', label: 'Company' },
  { key: 'industry', label: 'Industry' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'twitter', label: 'Twitter/X' },
  { key: 'url', label: 'Website' },
  { key: 'status', label: 'Status' },
];

export default function ResultsTable({ results }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const PER_PAGE = 50;

  const filtered = results.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return Object.values(r).some(v => v && v.toString().toLowerCase().includes(q));
  });

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = (a[sortKey] || '').toString();
        const bv = (b[sortKey] || '').toString();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      })
    : filtered;

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  }

  if (results.length === 0) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
        <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-secondary)' }}>No results yet</div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>Paste URLs above and click Extract to begin</div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Search + count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{sorted.length}</strong> results
        </span>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Filter results…"
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)', padding: '6px 10px 6px 30px', fontSize: '12px', width: '200px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '8px 12px', width: '40px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '11px', textAlign: 'center' }}>#</th>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  style={{
                    padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600,
                    color: sortKey === col.key ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase',
                    userSelect: 'none', whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {col.label}
                    {sortKey === col.key
                      ? sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
                      : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(7,20,40,0.4)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(7,20,40,0.4)'}
              >
                <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                  {(page - 1) * PER_PAGE + i + 1}
                </td>
                {COLUMNS.map(col => (
                  <td key={col.key} style={{ padding: '9px 14px', maxWidth: '200px' }}>
                    {col.key === 'status'
                      ? <StatusBadge status={row[col.key]} />
                      : <CellValue value={row[col.key]} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)', padding: '5px 12px', fontSize: '12px',
              opacity: page === 1 ? 0.4 : 1,
            }}
          >
            ← Prev
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)', padding: '5px 12px', fontSize: '12px',
              opacity: page === totalPages ? 0.4 : 1,
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
