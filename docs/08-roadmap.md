# خطة العمل — DZ Problem Finder

> خطة تنفيذية مبنية على `docs/00-INDEX.md` (القرارات D1–D10) و `docs/01-survey-design.md:924` (تعريف الـMVP).
> المبدأ الحاكم (`docs/02-project-charter.md:777`): **لا نبني Feature بدون حاجة واضحة.**
> حالة المشروع الآن: `Planning` — البنية جاهزة، لا كود.

---

## المرحلة 0 — إغلاق التناقضات ⚠️ شرط البداية

**لا تبدأ أي كود قبل إنهاء هذه المرحلة.** التناقضات C1–C6 في `00-INDEX.md` ستُBake في الكود إن تُركت.

| المهمة | المخرج | الوقت |
| --- | --- | --- |
| C1: اختيار صيغة جدول واحدة بعينها (النسخة الأحدث `03:1560` المرشحة) | `docs/09-schema.md` معتمد | 2h |
| C2: إدراج `questions` + `branching_rules` في المخطط | ضمن ERD | (مع C1) |
| C3: توحيد Opportunity Score في تعريف واحد | `docs/09-schema.md` § scoring | 1h |
| C4: كتابة Design System بـ CSS variables بدل Blade | reviewed | 1h |
| C5: تسجيل حدود Supabase المجاني رقميًا | `docs/10-ops.md` | 1h |
| C6: خطة 5 مقابلات تحقق قبل أي تحليل آلي | `docs/11-validation-plan.md` | 2h |

**معيار القبول:** ملف `docs/09-schema.md` موجود، ولكل تناقض C1–C6 قرار مكتوب.

---

## المرحلة 1 — قاعدة البيانات

| المهمة | المخرج |
| --- | --- |
| رسم ERD لـ 15 جدولًا | `docs/09-schema.md` ✅ |
| كتابة migrations في `supabase/migrations/` | `20260101000000_initial_schema.sql` ✅ 17 جدولًا |
| RLS: `public` قراءة محدودة، `admin` كتابة | 33 سياسة على 17/17 جدول ✅ |
| حساب `opportunity_score` في القاعدة | دالة `compute_opportunity_score` ✅ |
| توليد `database.types.ts` من Supabase | `src/types/database.types.ts` ⏳ يحتاج مشروع Supabase |
| seed: 12 قطاعًا + 15 سؤالًا + 3 قواعد branching | `supabase/seed.sql` ✅ 13 قطاع · 58 ولاية · 15 سؤال · 67 خيار · 4 قواعد |

**معيار القبول:** ~~`supabase db reset` ينجح~~ ✅ تم التحقق على PostgreSQL 16 حقيقي — 17 جدول، 7 enums، 33 سياسة RLS، 15 فهرس، 3 triggers، CASCADE سليم، و4 اختبارات سلبية مرفوضة بشكل صحيح.

⚠️ **Database-first لا Server-first**: المشروع بلا backend خاص، فـRLS هي خط الدفاع الوحيد. لا تتخطَّها.

---

## المرحلة 2 — الأساس التقني

| المهمة | الملفات |
| --- | --- |
| Bootstrap + Router + Layout | `src/main.tsx` · `src/app/App.tsx` · `src/app/router.tsx` |
| استبدال `types/models.ts` بـ types مولّدة | `src/types/models.ts` |
| Supabase Auth (magic link للإدارة فقط) | `src/lib/supabase/auth.ts` |
| حارس المسارات `/admin/*` | `src/components/layout/RequireAuth.tsx` |
| Layout: Navbar + Sidebar + Container | `src/components/layout/` |

**معيار القبول:** `/admin` محمي، RTL يعمل، و`npm run typecheck` نظيف.

---

## المرحلة 3 — Design System

حوّل `docs/06-design-system.md` (1343 سطرًا) إلى مكوّنات حقيقية:

| المكوّن | الأولوية |
| --- | --- |
| Button (Primary/Secondary/Ghost/Danger) + 3D خفيف | P0 |
| Card + SectorCard | P0 |
| Progress bar (يتغير لونه حسب تقدّم الإجابة) | P0 |
| AnswerCard (Single/Multi/Text/Number/Scale) | P0 |
| Input / Select / Textarea + رسائل الخطأ | P0 |
| StatusBadge (6 مستويات المشكلة) | P1 |
| Toast / Loading / EmptyState | P1 |
| Sidebar / Navbar | P1 |

**معيار القبول:** Storybook-lite أو `/design-system` route يعرض كل مكوّن بحالاته (hover/disabled/error)، ولا يتجاوز 3D حد 400ms.

---

## المرحلة 4 — أول شاشتين

| الشاشة | المسار | ملاحظات |
| --- | --- | --- |
| Landing Page | `/` | 3D خفيف، CTA واضح |
| Sector Selector | `/select-sector` | 13 بطاقة، يغيّر `data-sector` فيتغير لون الموقع كله |

**معيار القبول:** تغيير القطاع يعيد تلوين الواجهة فورًا دون إعادة تحميل (تحقق من `tokens.css`).

---

## المرحلة 5 — Survey Engine (الأهم)

المحركexists منطقيًا في `src/lib/branching/engine.ts` — يحتاج الآن ربطًا بالواجهة.

| المهمة | الملفات |
| --- | --- |
| `useSurveySession` — حفظ الجلسة في `localStorage` | `src/stores/surveySession.ts` |
| شاشة خطوة واحدة | `src/pages/public/SurveyPage.tsx` |
| ربط `resolveNextQuestion` | `src/features/survey-engine/` |
| حفظ الإجابة بـ upsert | `src/lib/supabase/survey.ts` |
| **لا تحذف إجابة عند تغيير المسار** (`docs/04:4327`) | في الـstore |
| شاشة التأكيد والإرسال | `src/pages/public/SubmitPage.tsx` |

**معيار القبول:** مسار `docs/04:1116` يعمل حرفيًا — تجارة + 6-10 + نعم + Excel يعرض Q4→Q9، وتجارة + «لا» فيتخطى Q4–Q9 فورًا.

---

## المرحلة 6 — Problem Discovery

| المهمة | ملاحظات |
| --- | --- |
| استخراج `ProblemCandidate` من إجابة Q6 (السؤال الذهبي) | `docs/01:194` |
| الإسناد اليدوي من لوحة الإدارة | v1 بلا ذكاء اصطناعي |
| جدول `problems` + `problem_occurrences` | |

**معيار القبول:** إجابة Q6 تظهر كعنصر فرز في `/admin/problems` مع كل القطاعات المتكررة.

---

## المرحلة 7 — لوحة الإدارة

Dashboard مبسّط + المشاركات + المؤسسات + المشاكل + بحث/تصفية + تصدير Excel.
(order حسب `docs/01:926` بنقاط 6→11)

**معيار القبول:** تصفية بالقطاع + الولاية + الحجم، وتصدير xlsx يحترم الفلترة.

---

## المرحلة 8 — Validation (C6)

الاستبيان **ليس** validation (`docs/03:1251`). هذه المرحلة لا تُؤجل لما بعد الإطلاق:

1. Recruitment لـ 5 مؤسسات (سؤال التحقق في `docs/03:2860`)
2. 5 مقابلات + تسجيل Evidence
3. `evidence.type='interview'` في الجدول
4. قراءة `docs/03:2892` (دليل التحقق) قبل قبول أي مشكلة

**معيار القبول:** لا مشكلة تتجاوز `REPEATED` بدون evidence من مصدرين على الأقل.

---

## ما بعد MVP

| الإصدار | المحتوى | المصدر |
| --- | --- | --- |
| V2 | تحليل متقدم، Charts، Problem Scoring، Tags، Follow-up، Problem Lifecycle | `docs/01:942` |
| V3 | AI، تحليل النصوص، اكتشاف المشاكل المتشابهة | `docs/01:955` |

⛔ **لا تضف AI في البداية** (`docs/01:966`) — البيانات الخام أولًا.

---

## ترتيب الأولويات (إن كان الوقت ضيقًا)

```text
Must:  0 → 1 → 2 → 5 (Survey Engine) → 7 (Admin)
Should: 3 (Design System) → 4 (Landing)
Later:  6 (Discovery) → 8 (Validation) → V2
```

MVP الحقيقي = **7 عناصر** من `docs/01:924`: الصفحة الرئيسية · نموذج المشاركة · اختيار القطاع · أسئلة ديناميكية · حفظ البيانات · لوحة الإدارة · Dashboard بسيط.

---

## Risks

| الخطر | الأثر | التخفيف |
| --- | --- | --- |
| Supabase free tier عند تكرار المشاركين | lockout | C5: حدّد الأرقام، راقب الاستهلاك من اليوم الأول |
| Netlify لا serverless functions | لا cron | لا تعتمد على cron؛ أبقِ كل شيء client-side + Supabase |
| recursion في branching | حلقات لا نهائية | `visitedQuestionIds` في الجلسة + سقف 50 خطوة |
| استبيانات طويل جدًا | معدل إتمام منخفض | خطوة واحدة + حفظ الجلسة + شريط تقدم |
| غياب بيانات تحقق | Fake validation | C6 قبل الإطلاق |
