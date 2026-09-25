import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button/Button';
import './LandingPage.css';

const STEPS = [
  { icon: '🔎', num: 1, title: 'اختر مجالك', text: 'حدد قطاع عملك من بين 14 مجالاً لتخصيص الأسئلة.' },
  { icon: '📝', num: 2, title: 'أجب بصدق', text: 'أسئلة ذكية تتكيف مع إجاباتك — لا يستغرق أكثر من 7 دقائق.' },
  { icon: '💡', num: 3, title: 'اكتشف المشكلة', text: 'بياناتك تُحول إلى مشاكل حقيقية في السوق الجزائري.' },
  { icon: '🚀', num: 4, title: 'فرص حقيقية', text: 'المشاكل الموثقة تصبح فرصاً لمنتجات وحلول تقنية.' },
];

const STATS = [
  { value: '14', label: 'قطاع اقتصادي' },
  { value: '58', label: 'ولاية جزائرية' },
  { value: '6', label: 'مستويات تحقق' },
  { value: '0', label: 'تكلفة على المشاركين' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-badge">
          <span>🇩🇿</span> منصة بحثية للسوق الجزائري
        </div>

        <div className="hero-core">
          <div className="hero-core__inner">🔎</div>
        </div>

        <h1 className="hero-title">
          اكتشف <em>المشكلة</em> قبل أن تبني الحل
        </h1>
        <p className="hero-subtitle">
          منصة لاكتشاف وتحليل مشاكل المؤسسات والسوق الجزائري وتحويل البيانات الواقعية إلى فرص حقيقية.
        </p>

        <div className="hero-actions">
          <Button
            id="btn-start-survey"
            variant="primary"
            size="lg"
            onClick={() => navigate('/select-sector')}
          >
            ابدأ الاستبيان ←
          </Button>
          <Button
            id="btn-how-it-works"
            variant="secondary"
            size="lg"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ borderColor: 'rgba(255,255,255,.3)', color: 'white' }}
          >
            كيف تعمل المنصة؟
          </Button>
        </div>
      </section>

      {/* Stats */}
      <div className="landing-stats">
        {STATS.map(s => (
          <div key={s.label} className="stat-item">
            <span className="stat-item__value">{s.value}+</span>
            <span className="stat-item__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Steps */}
      <section id="how-it-works" className="landing-steps">
        <h2 className="section-title">كيف تعمل المنصة؟</h2>
        <p className="section-subtitle">
          أربع خطوات بسيطة من استبيان ذكي إلى فرصة منتج حقيقية
        </p>
        <div className="steps-grid">
          {STEPS.map(step => (
            <div key={step.num} className="step-card">
              <div className="step-card__num">{step.num}</div>
              <div className="step-card__icon">{step.icon}</div>
              <h3 className="step-card__title">{step.title}</h3>
              <p className="step-card__text">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-cta">
        <h2>مستعد لمشاركة تجربتك؟</h2>
        <p>إجابتك تساهم في بناء منتجات وحلول تقنية تخدم السوق الجزائري</p>
        <Button
          id="btn-cta-final"
          onClick={() => navigate('/select-sector')}
          style={{ background: 'white', color: 'var(--accent)', fontWeight: 700 }}
          size="lg"
        >
          ابدأ الآن — مجاناً ←
        </Button>
      </section>
    </div>
  );
}
