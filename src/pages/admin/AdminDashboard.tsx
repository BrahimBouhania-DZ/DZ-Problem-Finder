import { useState, useEffect } from 'react';
import { Briefcase, Activity, AlertCircle, TrendingUp, Sparkles, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';
import './AdminDashboard.css';

interface DashboardStats {
  totalProjects: number;
  analyzingNow: number;
  totalRevenue: number;
  avgROI: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    analyzingNow: 0,
    totalRevenue: 0,
    avgROI: 0
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch projects from our new NestJS Backend
        const projects = await api.projects.getAll();
        
        setStats({
          totalProjects: projects.length,
          analyzingNow: projects.filter((p: any) => p.status === 'analyzing').length,
          totalRevenue: 12500000, // Mocked for demonstration
          avgROI: 18.5,           // Mocked for demonstration
        });
        
        setRecentProjects(projects.slice(0, 5));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const STAT_CARDS = [
    { label: 'المشاريع المحللة', value: stats.totalProjects, icon: Briefcase, color: 'var(--brand-primary)' },
    { label: 'قيد التحليل (AI)', value: stats.analyzingNow, icon: Sparkles, color: 'var(--brand-secondary)' },
    { label: 'إجمالي الإيرادات المتوقعة', value: `${(stats.totalRevenue / 1000000).toFixed(1)}M DZD`, icon: DollarSign, color: 'var(--success)' },
    { label: 'متوسط العائد (ROI)', value: `${stats.avgROI}%`, icon: TrendingUp, color: 'var(--warning)' },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="glow-spinner" />
        <p>جاري تهيئة البيانات والمحرك المالي...</p>
      </div>
    );
  }

  return (
    <div className="premium-dashboard">
      <header className="dashboard-header glass-panel">
        <div>
          <h1 className="gradient-text">لوحة التحكم الذكية</h1>
          <p>تحليل السوق وإدارة المشاريع المدعومة بالذكاء الاصطناعي</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary-glow">
            <Sparkles size={18} />
            تحليل مشروع جديد
          </button>
        </div>
      </header>

      <div className="stats-grid">
        {STAT_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="stat-card glass-panel">
              <div className="stat-icon-wrapper" style={{ boxShadow: `0 0 15px ${card.color}40` }}>
                <Icon size={24} color={card.color} />
              </div>
              <div className="stat-details">
                <h3>{card.value}</h3>
                <p>{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-bento">
        {/* Recent Projects Panel */}
        <div className="bento-box glass-panel span-2">
          <div className="bento-header">
            <Activity size={20} color="var(--brand-primary)" />
            <h2>أحدث دراسات الجدوى</h2>
          </div>
          {recentProjects.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={32} opacity={0.5} />
              <p>لم يتم إضافة مشاريع بعد في قاعدة البيانات الجديدة.</p>
            </div>
          ) : (
            <div className="project-list">
              {recentProjects.map(p => (
                <div key={p.id} className="project-item">
                  <div className="project-info">
                    <h4>{p.name}</h4>
                    <span>{p.industry}</span>
                  </div>
                  <div className={`status-badge status-${p.status}`}>
                    {p.status === 'draft' ? 'مسودة' : p.status === 'analyzing' ? 'قيد التحليل' : 'مكتمل'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Insights Panel */}
        <div className="bento-box glass-panel ai-insights">
          <div className="bento-header">
            <Sparkles size={20} color="var(--brand-secondary)" />
            <h2>رؤى الذكاء الاصطناعي</h2>
          </div>
          <div className="insight-card">
            <p>💡 <strong>قطاع التكنولوجيا:</strong> الطلب يرتفع بنسبة 25% على الحلول السحابية في الجزائر العاصمة.</p>
          </div>
          <div className="insight-card">
            <p>⚠️ <strong>قطاع البناء:</strong> تحذير من ارتفاع تكاليف المواد الأولية بنسبة 12% هذا الربع.</p>
          </div>
          <button className="btn-secondary-glow mt-auto">توليد تقرير شامل</button>
        </div>
      </div>
    </div>
  );
}
