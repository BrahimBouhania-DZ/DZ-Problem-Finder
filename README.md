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

`Development` — قاعدة البيانات والواجهة تعملان معاً:

- ✅ **Schema**: 17 جدولًا · 38 سياسة RLS · seed كامل — `supabase/migrations/`
- ✅ **اختبارات RLS**: 63 تأكيداً تمر كاملاً (anon / researcher / admin) وقابلة للتكرار — [`supabase/tests/rls_tests.sql`](./supabase/tests/rls_tests.sql)
- ✅ **الاستبيان العام**: Landing → اختيار القطاع → محرك Branching مع حفظ التقدّم عبر دوال `SECURITY DEFINER`
- ✅ **لوحة الإدارة**: Dashboard + Problems (لوحة بدون حارس مصادقة بعد)
- ⏳ **متبقٍّ** (من [`docs/08-roadmap.md`](./docs/08-roadmap.md)): حارس `/admin` (Supabase Auth) · شاشة Submit/Resume · Problem Discovery · تصدير Excel · C6 (خطة التحقق)

> **نموذج أمان الاستبيان**: المشارك مجهول — الـuuid الذي يولّده المتصفح للاستجابة هو رمز الوصول وحده. لا قراءة مباشرة على `survey_responses`/`answers`، والكتابة عبر `save_survey_progress` / `complete_response` / `upsert_answer` فقط. الموثّق في ترويسة [`supabase/migrations/20260101000100_public_survey_access.sql`](./supabase/migrations/20260101000100_public_survey_access.sql).

## تناقضات مفتوحة

C1–C5 مغلقة — راجع [`docs/00-INDEX.md`](./docs/00-INDEX.md). المفتوح: **C6** (الاستبيان ليس validation — تُغلقه `docs/11-validation-plan.md`، لم تُنشأ بعد).
