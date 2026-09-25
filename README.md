# DZ Problem Finder — كاشف مشاكل السوق الجزائري

منصة لاكتشاف مشاكل السوق الجزائري وتحويل البيانات الواقعية إلى فرص لمنتجات وحلول تقنية.

الوثائق المرجعية في [`docs/`](./docs) — اقرأ [`docs/00-INDEX.md`](./docs/00-INDEX.md) أولًا.

## الـStack

| الطبقة | التقنية |
| --- | --- |
| Framework | React 18 + Vite 5 |
| Language | TypeScript 5 |
| Routing | React Router 6 |
| Database / API / Auth | Supabase (PostgreSQL) |
| Charts | Chart.js + react-chartjs-2 |
| Icons | Lucide |
| Hosting | Netlify |
| Cost | ≈ 0 |

## المسارات

```text
src/
├── app/                    نقطة الانطلاق: Router, Providers, Layout
├── pages/
│   ├── public/             الشاشات السبع (Landing → Dashboard)
│   └── admin/              شاشات الإدارة
├── features/
│   ├── survey-builder/     إنشاء الأسئلة والقواعد
│   ├── survey-engine/      محرك الـBranching أثناء الإجابة
│   ├── problem-discovery/  استخراج المشكلة من الإجابات
│   ├── validation/         Evidence + Interview + Prototype
│   └── analytics/          Dashboard + Opportunity Score
├── components/
│   ├── ui/                 مكوّنات Design System (Button, Card, Progress…)
│   ├── forms/              AnswerCard, Validation, ErrorMessage
│   ├── layout/             Navbar, Sidebar, Container
│   └── survey/             مكوّنات خاصة بالاستبيان
├── lib/
│   ├── branching/          BranchingEngine (منطق خالص قابل للاختبار)
│   ├── supabase/           client.ts
│   └── utils/
├── hooks/  stores/  types/  constants/  styles/  assets/

supabase/
├── migrations/             مخططات قاعدة البيانات
├── functions/              Edge Functions عند الحاجة
└── tests/
```

## البدء

```bash
cp .env.example .env     # املأ مفاتيح Supabase
npm install
npm run dev
```

أوامر أخرى: `npm run build` · `npm run typecheck` · `npm run lint` · `npm run format`

## الحالة الحالية

`Planning` — البنية فقط. الخطوات المتبقية (من `docs/07-stack.md:298`):

1. ~~اختيار الـStack~~ ✅
2. Database Schema
3. ERD
4. ~~إنشاء مشروع React/Vite~~ ✅ (بنية فقط)
5. Design System فعليًا
6. Landing Page
7. Sector Selector
8. Survey Engine

## تناقضات مفتوحة

راجع جدول التناقضات C1–C6 في [`docs/00-INDEX.md`](./docs/00-INDEX.md) — أبرزها C1 (ثلاث صيغ مختلفة لقاعدة البيانات) و C4 (Design System مكتوب لـ Blade بينما القرار React).
