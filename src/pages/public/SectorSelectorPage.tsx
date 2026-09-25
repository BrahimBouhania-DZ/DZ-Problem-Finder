import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, HardHat, HeartPulse, Wheat, Dog, Plane, GraduationCap, Calculator, Laptop, Wrench, Factory, Home, Car, Utensils } from 'lucide-react';
import { setSectorTheme } from '@/lib/utils/theme';
import './SectorSelectorPage.css';

const SECTORS = [
  { id: 'commerce',     label: 'التجارة',     icon: ShoppingCart, desc: 'البيع بالتجزئة والجملة' },
  { id: 'construction', label: 'البناء',      icon: HardHat,      desc: 'المقاولات والبنية التحتية' },
  { id: 'health',       label: 'الصحة',       icon: HeartPulse,   desc: 'العيادات والمستشفيات' },
  { id: 'agriculture',  label: 'الفلاحة',     icon: Wheat,        desc: 'الزراعة والإنتاج الحيواني' },
  { id: 'veterinary',   label: 'البيطرة',     icon: Dog,          desc: 'رعاية الحيوانات' },
  { id: 'tourism',      label: 'السياحة',     icon: Plane,        desc: 'الفنادق والسفر' },
  { id: 'education',    label: 'التعليم',     icon: GraduationCap,desc: 'المدارس والمراكز الخاصة' },
  { id: 'accounting',   label: 'المحاسبة',    icon: Calculator,   desc: 'الخدمات المالية والمحاسبة' },
  { id: 'technology',   label: 'التكنولوجيا', icon: Laptop,       desc: 'البرمجيات والتقنية' },
  { id: 'maintenance',  label: 'الصيانة',     icon: Wrench,       desc: 'الصيانة والإصلاح' },
  { id: 'industry',     label: 'الصناعة',     icon: Factory,      desc: 'التصنيع والإنتاج' },
  { id: 'realestate',   label: 'العقار',      icon: Home,         desc: 'البيع والإيجار والتطوير' },
  { id: 'transport',    label: 'النقل',       icon: Car,          desc: 'النقل والخدمات اللوجستية' },
  { id: 'restaurant',   label: 'المطاعم',     icon: Utensils,     desc: 'المطاعم والمقاهي' },
];

export default function SectorSelectorPage() {
  const navigate = useNavigate();

  const handleSelect = (sectorId: string) => {
    setSectorTheme(sectorId);
    localStorage.setItem('dz_sector', sectorId);
    navigate(`/survey?sector=${sectorId}`);
  };

  return (
    <div className="sector-page">
      <div className="sector-page__header">
        <h1 className="sector-page__title">اختر مجال عملك</h1>
        <p className="sector-page__sub">
          سيتم تخصيص الأسئلة بالكامل بناءً على قطاعك — اختر الأقرب لنشاطك
        </p>
      </div>

      <div className="sector-grid">
        {SECTORS.map(sector => {
          const Icon = sector.icon;
          return (
            <button
              key={sector.id}
              id={`sector-${sector.id}`}
              type="button"
              className="sector-card"
              onClick={() => handleSelect(sector.id)}
            >
              <div className="sector-card__icon-wrap">
                <Icon size={28} />
              </div>
              <h3 className="sector-card__label">{sector.label}</h3>
              <p className="sector-card__desc">{sector.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
