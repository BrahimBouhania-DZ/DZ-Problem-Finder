# DZ Problem Finder — فهرس الوثائق

> هذا المجلد تقسيم حرفي لمحتوى `dz` الأصلي (7,214 سطرًا) إلى سبعة أقسام حسب المراحل المتعاقبة development.
> **لم يُحذف أي محتوى**، والنسخة الأصلية `dz` بقيت كما هي.
> التحقق: تجميع الملفات `01`–`07` ينتج نفس البصمة (MD5) لأسطر `1–7214` من الملف الأصلي.

---

## خريطة الملفات

| الملف | الأسطر في الأصل | المحتوى | الحالة |
| --- | --- | --- | --- |
| [01-survey-design.md](01-survey-design.md) | 1–984 | تصميم الاستبيان: 12 قطاعًا، القاعدة الذهبية، Q1–Q19، أسئلة قطاعية، سؤال الدفع، Problem Score، MVP/V2/V3، أول قرار لـ Stack | ✅ جاهز |
| [02-project-charter.md](02-project-charter.md) | 985–1899 | الوثيقة التأسيسية v2: الفكرة، الأهداف، منهج جمع البيانات، لوحة الإدارة، مؤشرات Opportunity Score، دورة حياة المشكلة، 20 جدولًا، بنية Laravel، 8 مراحل تطوير، الرؤية | ⚠️ Contains Laravel/MySQL |
| [03-data-model-validation.md](03-data-model-validation.md) | 1900–3565 | فصل `Survey` عن `Problem` (مكرَّر 3 مرات)، منهجية التحقق (Evidence، Interviews، Pain Validation، WTP)، مستويات التحقق، Problem Cluster، قاعدة البيانات المدمجة | ⚠️ فيه تكرار |
| [04-branching-engine.md](04-branching-engine.md) | 3566–4942 | محرك الـ Branching: 4 طبقات معمارية، جداول القواعد، أنواع القواعد، AND/OR، Section-Based، حفظ الجلسة، Debugger، هيكل Laravel | ✅ جاهز |
| [05-visual-identity.md](05-visual-identity.md) | 4943–5571 | الهوية البصرية: فكرة الشعار، لون أساسي متغيّر حسب المجال (12 قطاعًا)، Floating 3D Cards، 7 شاشات أساسية | ✅ جاهز |
| [06-design-system.md](06-design-system.md) | 5572–6914 | **Design System v1.0**: التوكنز، الخطوط، Buttons، Cards، Progress، Form System، Sidebar، RTL، Responsive، Micro-interactions، Accessibility، 3D | ✅ جاهز |
| [07-stack.md](07-stack.md) | 6915–7214 | قرار الـ Stack النهائي: React + Vite + TypeScript + Supabase + Netlify، التكلفة ≈ 0، اللغات المطلوبة | ✅ القرار الأخير |

---

## سجل القرارات (Decision Log)

الملف يحتوي **قرارات متعاقبة متعارضة** لأن evoluo في 4 نسخ متتالية. هذا ترتيبها الزمني:

| # | القرار | الملف | الحالة |
| --- | --- | --- | --- |
| D1 | 12 قطاعًا بدل عشرات القطاعات | 01 | ✅ مُعتمد |
| D2 | **لا نسأل "هل تحتاج تطبيق؟"** — نسأل "كيف تدير عملك الآن؟" | 01 | ✅ مُعتمد |
| D3 | الاستبيان يجمع بيانات خام فقط، ولا يحمل `problem_status` ولا `validation_score` | 03 | ✅ مُعتمد |
| D4 | المشكلة كيان مستقل يُستخرج من عدة مصادر (Evidence / Interviews / Prototype) | 03 | ✅ مُعتمد |
| D5 | الاستبيان وحده **ليس** Validation — 6 مستويات من DISCOVERED إلى PAYMENT_VALIDATED | 03 | ✅ مُعتمد |
| D6 | الـ Branching كمحرك قواعد مستقل، وليس شروطًا داخل JS/Controller | 04 | ✅ مُعتمد |
| D7 | اللون يتغير حسب المجال المختار (ثيم ديناميكي) | 05, 06 | ✅ مُعتمد |
| D8 | لا نبدأ بالبرمجة قبل: Schema → ERD → المشروع → Design System → Landing → Survey Engine | 07 | ✅ مُعتمد |
| D9 | ~~Laravel 11 + MySQL 8 + Blade + AJAX~~ | 01, 02 | ❌ **ملغى** |
| D10 | **React + Vite + TypeScript + Supabase (PostgreSQL) + Netlify** | 07 | ✅ **القرار النافذ** |

### لماذا أُلغي D9؟
`07-stack.md:1-3` يعطي السبب الصريح: Netlify لا يشغّل PHP/Laravel ولا MySQL. وبما أن شرط المشروع هو **استضافة مجانية**، فقد استُبدل بـ D10.

---

## التناقضات (C1–C6)

| # | التناقض | المواضع | الحالة |
| --- | --- | --- | --- |
| C1 | **3 صيغ مختلفة لقاعدة البيانات** | `02:488`، `03:63`، `03:1560` | ✅ **مغلق** — الأحدث `03:1560` معتمدة في [`09-schema.md`](09-schema.md) |
| C2 | **`Question` + `BranchingRule` غائبة** عن الصيغة المختارة | `02:488`، `04:1330` | ✅ **مغلق** — أُضيفا للمخطط |
| C3 | **Opportunity Score معرَّف مرتين** بصيغتين | `01:713`، `02:910`، `03:1396` | ✅ **مغلق** — `validation_scores` + دالة `compute_opportunity_score` |
| C4 | `06-design-system.md` مكتوب لـ **Blade** بينما D10 يقول **React** | `06:1`، `07:230` | ✅ **مغلق** — يُقرأ كـCSS variables عبر `src/styles/tokens.css` |
| C5 | **حدود الخطة المجانية لـ Supabase** غير رقمية | `07:262` | ✅ **مغلق** — [`10-ops.md`](10-ops.md) بأرقام و5 قواعد حماية |
| C6 | الاستبيان **ليس** Validation — فجوة منهجية | `03:1251`، `03:1580` | ⏳ مفتوح → `11-validation-plan.md` |

---

## الخطوة التالية (من `07-stack.md:298`)

```text
1. اختيار الـ Stack النهائي   → محسوم: React + Vite + TS + Supabase  ✅
2. إنشاء Database Schema     → ✅ 17 جدولًا · supabase/migrations/20260101000000_initial_schema.sql
3. ERD                        → ✅ docs/09-schema.md
4. إنشاء مشروع React/Vite    → ✅ البنية + ملفات الإعداد
5. بناء Design System فعليًا → موثّق في 06، غير منفّذ
6. Landing Page               → ❌
7. Sector Selector            → ❌
8. Survey Engine              → المنطق في src/lib/branching/engine.ts، غير مربوط بالواجهة
```

**الحالة الحالية للمشروع: `Planning`** — لا يوجد سطر برمجي واحد بعد.

---

## ملاحظةMaintainer

الأقسام `03-data-model-validation.md` يحتوي نفس نموذج الاستبيان/المشكلة **3 مرات** عند الأسطر:
- `03:39–276`
- `03:277–479`
- `03:1440–1666`

`03:1440–1666` هي الأحدث (لأنها تتحدث عن فصل `problem_status`)، و `03:39–479` الأقدم.
لم تُحذف أي نسخة حفاظًا على المبدأ، لكن عند البدء في الـ Schema يمكن无视 النسختين الأقدم.
