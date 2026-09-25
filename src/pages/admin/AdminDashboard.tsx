import { useState, useEffect } from 'react';
import { Users, AlertCircle, CheckSquare, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import './AdminDashboard.css';

interface Stats {
  totalResponses: number;
  completedResponses: number;
  totalProblems: number;
  validatedProblems: number;
}

const STATUS_LABELS: Record<string, string> = {
  DISCOVERED: 'مكتشفة',
  REPEATED: 'متكررة',
  EVIDENCED: 'موثقة',
  VALIDATED: 'متحقق منها',
  DEMAND_CONFIRMED: 'طلب مؤكد',
  PAYMENT_VALIDATED: 'دفع فعلي',
  MVP_CANDIDATE: 'مرشح MVP',
};

const STATUS_COLORS: Record<string, string> = {
  DISCOVERED: '#2563EB',
  REPEATED: '#7C3AED',
  EVIDENCED: '#0891B2',
  VALIDATED: '#16A34A',
  DEMAND_CONFIRMED: '#15803D',
  PAYMENT_VALIDATED: '#166534',
  MVP_CANDIDATE: '#EA580C',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalResponses: 0, completedResponses: 0, totalProblems: 0, validatedProblems: 0 });
  const [problemsByStatus, setProblemsByStatus] = useState<Record<string, number>>({});
  const [recentProblems, setRecentProblems] = useState<Array<{ id: string; title: string; status: string; sector_id: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ count: totalResp }, { count: completedResp }, { count: totalProb }, { count: validatedProb }, { data: problems }] = await Promise.all([
          supabase.from('survey_responses').select('*', { count: 'exact', head: true }),
          supabase.from('survey_responses').select('*', { count: 'exact', head: true }).eq('is_completed', true),
          supabase.from('problems').select('*', { count: 'exact', head: true }),
          supabase.from('problems').select('*', { count: 'exact', head: true }).eq('status', 'VALIDATED'),
          supabase.from('problems').select('id,title,status,sector_id').order('created_at', { ascending: false }).limit(5),
        ]);

        setStats({
          totalResponses: totalResp ?? 0,
          completedResponses: completedResp ?? 0,
          totalProblems: totalProb ?? 0,
          validatedProblems: validatedProb ?? 0,
        });

        // Group by status
        const byStatus: Record<string, number> = {};
        for (const p of problems ?? []) {
          byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
        }
        setProblemsByStatus(byStatus);
        setRecentProblems(problems ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const STAT_CARDS = [
    { label: 'إجمالي المشاركات', value: stats.totalResponses, icon: Users,        color: '#2563EB', sub: `${stats.completedResponses} مكتملة` },
    { label: 'المشاكل المكتشفة',  value: stats.totalProblems,   icon: AlertCircle,  color: '#DC2626', sub: 'مشاكل سوق جزائري' },
    { label: 'مشاكل متحقق منها', value: stats.validatedProblems,icon: CheckSquare,  color: '#16A34A', sub: 'من مصدرين أو أكثر' },
    { label: 'نسبة الإتمام',      value: stats.totalResponses > 0 ? `${Math.round((stats.completedResponses / stats.totalResponses) * 100)}%` : '0%', icon: TrendingUp, color: '#7C3AED', sub: 'معدل إتمام الاستبيان' },
  ];

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="survey-spinner" />
        <p>جارٍ تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">لوحة التحكم</h1>
        <p className="dashboard-sub">نظرة عامة على بيانات السوق الجزائري</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {STAT_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="stat-card">
              <div className="stat-card__icon" style={{ background: `${card.color}18`, color: card.color }}>
                <Icon size={22} />
              </div>
              <div className="stat-card__body">
                <p className="stat-card__label">{card.label}</p>
                <p className="stat-card__value">{card.value}</p>
                <p className="stat-card__sub">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        {/* Problem Status */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <Activity size={18} />
            <h2>المشاكل حسب الحالة</h2>
          </div>
          <div className="status-list">
            {Object.entries(STATUS_LABELS).map(([key, label]) => {
              const count = problemsByStatus[key] ?? 0;
              const total = stats.totalProblems || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key} className="status-row">
                  <span className="status-badge" style={{ background: `${STATUS_COLORS[key]}18`, color: STATUS_COLORS[key] }}>
                    {label}
                  </span>
                  <div className="status-bar-track">
                    <div className="status-bar-fill" style={{ width: `${pct}%`, background: STATUS_COLORS[key] }} />
                  </div>
                  <span className="status-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Problems */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <AlertCircle size={18} />
            <h2>أحدث المشاكل</h2>
          </div>
          {recentProblems.length === 0 ? (
            <div className="empty-state">
              <p>لا توجد مشاكل مسجَّلة بعد</p>
            </div>
          ) : (
            <div className="recent-list">
              {recentProblems.map(p => (
                <div key={p.id} className="recent-item">
                  <div className="recent-item__info">
                    <p className="recent-item__title">{p.title}</p>
                    <span className="status-badge" style={{ background: `${STATUS_COLORS[p.status] ?? '#64748B'}18`, color: STATUS_COLORS[p.status] ?? '#64748B', fontSize: '0.75rem' }}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </div>
                  <ArrowUpRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
