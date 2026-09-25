import { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Problem } from '@/types/models';
import './ProblemsPage.css';

const STATUS_LABELS: Record<string, string> = {
  DISCOVERED: 'مكتشفة', REPEATED: 'متكررة', EVIDENCED: 'موثقة',
  VALIDATED: 'متحقق منها', DEMAND_CONFIRMED: 'طلب مؤكد',
  PAYMENT_VALIDATED: 'دفع فعلي', MVP_CANDIDATE: 'مرشح MVP',
};

const STATUS_COLORS: Record<string, string> = {
  DISCOVERED: '#2563EB', REPEATED: '#7C3AED', EVIDENCED: '#0891B2',
  VALIDATED: '#16A34A', DEMAND_CONFIRMED: '#15803D',
  PAYMENT_VALIDATED: '#166534', MVP_CANDIDATE: '#EA580C',
};

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filtered, setFiltered] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false });
      setProblems(data ?? []);
      setFiltered(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    let result = problems;
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    if (search.trim()) result = result.filter(p => p.title.includes(search) || (p.description ?? '').includes(search));
    setFiltered(result);
  }, [problems, search, statusFilter]);

  return (
    <div className="problems-page">
      <div className="problems-header">
        <div>
          <h1 className="dashboard-title">المشاكل المكتشفة</h1>
          <p className="dashboard-sub">{filtered.length} مشكلة موجودة</p>
        </div>
      </div>

      {/* Filters */}
      <div className="problems-filters">
        <div className="search-box">
          <Search size={16} className="search-box__icon" />
          <input
            id="problems-search"
            type="text"
            placeholder="ابحث عن مشكلة..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-box__input"
          />
        </div>
        <div className="filter-group">
          <SlidersHorizontal size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            id="problems-status-filter"
            className="filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">كل الحالات</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading"><div className="survey-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ minHeight: '40vh' }}>
          <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p>لا توجد مشاكل مطابقة للبحث</p>
        </div>
      ) : (
        <div className="problems-table-wrap">
          <table className="problems-table">
            <thead>
              <tr>
                <th>المشكلة</th>
                <th>القطاع</th>
                <th>الحالة</th>
                <th>التكرار</th>
                <th>الحدة</th>
                <th>الاكتشاف</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="problems-row">
                  <td>
                    <p className="problems-row__title">{p.title}</p>
                    {p.description && <p className="problems-row__desc">{p.description}</p>}
                  </td>
                  <td><span className="sector-chip">{p.sector_id ?? '—'}</span></td>
                  <td>
                    <span className="status-badge" style={{
                      background: `${STATUS_COLORS[p.status] ?? '#64748B'}18`,
                      color: STATUS_COLORS[p.status] ?? '#64748B'
                    }}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </td>
                  <td>{p.frequency_level ?? '—'}</td>
                  <td>{p.severity_level ?? '—'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(p.discovered_at).toLocaleDateString('ar-DZ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
