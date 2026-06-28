import { Router } from 'express';
import * as XLSX from 'xlsx';
import { getJob } from '../utils/jobStore.js';

export const exportRouter = Router();

const COLUMNS = [
  { key: 'companyName', header: 'Company Name' },
  { key: 'industry', header: 'Industry' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
  { key: 'linkedin', header: 'LinkedIn' },
  { key: 'facebook', header: 'Facebook' },
  { key: 'instagram', header: 'Instagram' },
  { key: 'twitter', header: 'Twitter/X' },
  { key: 'url', header: 'Website URL' },
  { key: 'status', header: 'Status' },
];

function buildRows(results) {
  return results.map(r => {
    const row = {};
    for (const col of COLUMNS) {
      row[col.header] = r[col.key] || 'Not Available';
    }
    return row;
  });
}

// GET /api/export/csv/:jobId
exportRouter.get('/csv/:jobId', (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const rows = buildRows(job.results);
  const headers = COLUMNS.map(c => c.header);

  const csvLines = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = (row[h] || '').toString().replace(/"/g, '""');
        return `"${val}"`;
      }).join(',')
    ),
  ];

  const csv = csvLines.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="provision-scraper-${job.id.slice(0, 8)}.csv"`);
  res.send(csv);
});

// GET /api/export/xlsx/:jobId
exportRouter.get('/xlsx/:jobId', (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const rows = buildRows(job.results);
  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws['!cols'] = COLUMNS.map(() => ({ wch: 28 }));

  // Header style (bold)
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const addr = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[addr]) continue;
    ws[addr].s = { font: { bold: true }, fill: { fgColor: { rgb: '0A1628' } } };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Scrape Results');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="provision-scraper-${job.id.slice(0, 8)}.xlsx"`);
  res.send(buffer);
});
