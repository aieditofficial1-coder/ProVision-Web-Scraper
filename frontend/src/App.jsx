import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import UrlInputPanel from './components/UrlInputPanel.jsx';
import StatsBar from './components/StatsBar.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import ResultsTable from './components/ResultsTable.jsx';
import ExportPanel from './components/ExportPanel.jsx';
import { startScrapeJob, subscribeToJob } from './utils/api.js';

const INITIAL_STATS = {
  total: 0,
  valid: 0,
  invalid: 0,
  processed: 0,
  success: 0,
  failed: 0,
};

export default function App() {
  const [job, setJob] = useState(null);
  const [jobStatus, setJobStatus] = useState('idle'); // idle | running | completed | error
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [error, setError] = useState(null);
  const unsubRef = useRef(null);

  const handleStart = useCallback(async (urlText) => {
    setError(null);
    setResults([]);
    setJobStatus('running');
    setStats(INITIAL_STATS);

    if (unsubRef.current) unsubRef.current();

    try {
      const { jobId, total, valid, invalid } = await startScrapeJob(urlText);
      setStats(prev => ({ ...prev, total, valid, invalid }));

      const unsub = subscribeToJob(
        jobId,
        (data) => {
          setJob({ id: jobId, ...data });
          setResults(data.results || []);
          setStats({
            total: data.total || total,
            valid: valid,
            invalid: data.invalid || invalid,
            processed: data.processed || 0,
            success: data.success || 0,
            failed: data.failed || 0,
          });
          if (data.status === 'completed') setJobStatus('completed');
        },
        (finalData) => {
          if (finalData) {
            setResults(finalData.results || []);
            setJobStatus(finalData.status === 'completed' ? 'completed' : 'error');
          } else {
            setJobStatus('error');
            setError('Connection lost. Results shown may be partial.');
          }
        }
      );
      unsubRef.current = unsub;
      setJob({ id: jobId, status: 'running', total, processed: 0, success: 0, failed: 0, invalid, results: [], createdAt: new Date().toISOString() });
    } catch (err) {
      setJobStatus('error');
      setError(err.message || 'Failed to start extraction job.');
    }
  }, []);

  const isRunning = jobStatus === 'running';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Hero strip */}
        <div style={{
          background: 'linear-gradient(180deg, #071428 0%, var(--bg-base) 100%)',
          borderBottom: '1px solid var(--border)',
          padding: '24px 32px 20px',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h1 style={{
              fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)',
              letterSpacing: '-0.02em', marginBottom: '4px',
            }}>
              Extract Business Data at Scale
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Paste URLs → validate → scrape → export. No AI needed, just fast regex + headless browser extraction.
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          {error && (
            <div style={{
              background: 'var(--danger-bg)', border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: 'var(--radius-md)', padding: '10px 14px',
              color: 'var(--danger)', fontSize: '12px', marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            {/* Main content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <UrlInputPanel onStart={handleStart} isRunning={isRunning} />

              {(job || results.length > 0) && (
                <>
                  <StatsBar stats={stats} />
                  <ProgressBar
                    processed={stats.processed}
                    total={stats.total}
                    status={jobStatus}
                  />
                  <ExportPanel
                    jobId={job?.id}
                    resultCount={results.length}
                    disabled={isRunning || results.length === 0}
                  />
                  <ResultsTable results={results} />
                </>
              )}

              {!job && results.length === 0 && (
                <div style={{
                  background: 'var(--bg-card)', border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '48px 20px',
                  textAlign: 'center', color: 'var(--text-muted)',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '14px', opacity: 0.5 }}>🌐</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Ready to Extract
                  </div>
                  <div style={{ fontSize: '12px', lineHeight: 1.8 }}>
                    Paste your URLs in the box above<br />
                    and click <strong style={{ color: 'var(--accent)' }}>Extract Data</strong> to begin
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
                    {['Company Name', 'Email', 'Phone', 'LinkedIn', 'Industry'].map(tag => (
                      <span key={tag} style={{
                        background: 'rgba(30,124,255,0.08)', border: '1px solid rgba(30,124,255,0.2)',
                        color: 'var(--accent)', borderRadius: '20px', padding: '3px 10px', fontSize: '11px',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <Sidebar job={job} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '12px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: '11px', color: 'var(--text-muted)',
        background: 'var(--bg-surface)',
      }}>
        <span>PROVISION WEB SCRAPER · AI-Powered Website Data Extraction</span>
        <span>Playwright · Axios · Cheerio · Regex · No LLM Required</span>
      </footer>
    </div>
  );
}
