# 09 — مخطط قاعدة البيانات (Schema) — معتمد

> **قرار C1 + C2 معتمد:**Basis = الصيغة **الأحدث** من `03:1499–1615` (فصل Survey عن Problem) + جدولا
> `questions` + `branching_rules` من `04:74–156`.
> **قرار C3 معتمد:** Opportunity Score بأوزان `01:719–727` في جدول واحد `validation_scores`.
> **قرار C4:** ERD|PostgreSQL (Supabase) — لا Blade ولا MySQL.

**عدد الجداول: 17** (كنت توقعنا 13 — 증가 4 بسبب جداول التحقق+Jز prerogative الجغرافية+الأدوار، وهي مذكورة في التبرير).

---

## 1. ERD

```text
┌──────────────┐         ┌──────────────────┐
│   profiles   │         │     sectors      │
│  (admins)    │         │  (12+other)      │
└──────┬───────┘         └────────┬─────────┘
       │ 1:N                     │ 1:N
       │                         │
       │              ┌──────────▼───────────┐
       │              │     wilayas          │
       │              └──────────┬───────────┘
       │                         │ 1:N
       ▼                         ▼
┌──────────────────────────────────────────────┐
│                  surveys                     │
│  (الاستبيان: مصدر بيانات خام فقط — D3)        │
└──┬────────────┬──────────────┬───────────────┘
   │ 1:N        │ 1:N          │ 1:N
   ▼            ▼              ▼
survey_    questions      branching_rules ──┐
sections       │ 1:N                        │
   │           ▼                            │
   │    question_options                     │
   │                                        │
   │ N:M (sector_questions)                  │
   ▼                                        │
┌────────────────────┐                      │
│ organizations      │                      │
│ (sector_id, size)  │                      │
└─────────┬──────────┘                      │
          │ 1:N                             │
          ▼                                 │
   ┌─────────────┐   1:N    ┌────────────┐  │
   │ respondents │─────────▶│  answers   │  │
   └─────────────┘          └─────┬──────┘  │
                                 │ 1:N     │
                    ┌────────────▼─────────▼──┐
                    │    survey_responses     │
                    │  (الجلسة:当前位置+المسار) │
                    └────────────┬────────────┘
                                 │ 1:N
                                 ▼
                          ┌──────────────┐
                          │    problems  │◄──── problem_sources ── answers
                          │  (كيان تحليلي │      (N:M مع إجابة)
                          │   مستقل D4)  │
                          └──────┬───────┘
                                 │ 1:N
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              evidence    validation_    validation_
                          interviews     scores
```

---

## 2. الجداول

### 2.1 المرجعية (3)

**`sectors`** — 13 صفًا (seed)
`id text PK` · `label text` · `icon text` · `color text` · `sort_order int`

**`wilayas`** — 58 ولاية
`id int PK` · `code int` · `name_ar text` · `name_fr text`

**`profiles`** — مستخدمو الإدارة (يمتد من `auth.users`)
`id uuid PK → auth.users` · `full_name text` · `role user_role` · `created_at`

---

### 2.2 Survey Builder (5)

**`surveys`**
`id uuid PK` · `title text` · `status survey_status DEFAULT 'draft'` · `version int` · `created_at` · `updated_at`

**`survey_sections`**
`id uuid PK` · `survey_id uuid FK→surveys ON DELETE CASCADE` · `title text` · `sort_order int` · `sector_ids text[] NULL` — *NULL = يظهر لكل القطاعات*

**`questions`**
`id uuid PK` · `survey_id uuid FK` · `section_id uuid FK` · `key text` · `title text` · `description text` · `type question_type` · `required bool` · `sort_order int` · `is_active bool DEFAULT true` · `created_at` · `updated_at`
UNIQUE `(survey_id, key)`

**`question_options`**
`id uuid PK` · `question_id uuid FK→questions ON DELETE CASCADE` · `value text` · `label text` · `sort_order int`
UNIQUE `(question_id, value)`

**`branching_rules`**
`id uuid PK` · `survey_id uuid FK→surveys ON DELETE CASCADE` · `question_id uuid FK→questions ON DELETE CASCADE` · `target_question_id uuid FK NULL` · `target_section_id uuid FK NULL` · `operator rule_operator` · `compare_value text[]` · `combinator text CHECK IN ('AND','OR')` · `action rule_action` · `priority int DEFAULT 0` · `is_active bool`
CHECK: `action IN ('jump_to_section') → target_section_id NOT NULL` و `action IN ('show','hide') → target_question_id NOT NULL`

> `compare_value` مصفوفة دائمًا — يجعل `in`/`not_in` مجرد حالة خاصة من `equals` بلا جدول مرافق.

---

### 2.3 المشاركون (4)

**`organizations`**
`id uuid PK` · `sector_id text FK→sectors` · `size_range text` · `age_range text` · `wilaya_id int FK NULL` · `current_tools text[]` · `created_at`

**`respondents`**
`id uuid PK` · `organization_id uuid FK NULL` · `role text` · `contact_email text NULL` — *التواصل اختياري ويفصل عن الهوية*

**`survey_responses`**
`id uuid PK` · `survey_id uuid FK` · `organization_id uuid FK NULL` · `respondent_id uuid FK NULL` · `sector_id text FK` · `current_question_id uuid NULL` · `visited_question_ids uuid[]` · `is_completed bool DEFAULT false` · `started_at` · `completed_at NULL`

**`answers`**
`id uuid PK` · `response_id uuid FK→survey_responses ON DELETE CASCADE` · `question_id uuid FK` · `value jsonb` · `created_at`
UNIQUE `(response_id, question_id)`

> `jsonb` يغطي `string | string[] | number | null` في عمود واحد — لا أعمدة متخصصة.
> ⛔ **لا `problem_id` هنا** — العلاقة عبر `problem_sources` فقط (`03:1567`).

---

### 2.4 جانب المشكلة (3)

**`problems`**
`id uuid PK` · `title text` · `description text` · `sector_id text FK` · `category_id uuid NULL` · `status problem_status DEFAULT 'DISCOVERED'` · `frequency_level int NULL` · `severity_level int NULL` · `time_impact_hours numeric NULL` · `financial_impact_dzd numeric NULL` · `affected_people int NULL` · `current_solution text NULL` · `solution_gap text NULL` · `feasibility int NULL` · `discovered_at` · `validated_at NULL` · `created_at` · `updated_at`

**`problem_sources`** — N:M بين إجابة ومشكلة (`03:1572`)
`id uuid PK` · `problem_id uuid FK→problems ON DELETE CASCADE` · `source_type text` · `answer_id uuid FK NULL` · `response_id uuid FK NULL` · `interview_id uuid FK NULL` · `notes text` · `created_at`

**`evidence`**
`id uuid PK` · `problem_id uuid FK ON DELETE CASCADE` · `evidence_type evidence_type` · `source text` · `description text` · `organization_id uuid NULL` · `respondent_id uuid NULL` · `interview_id uuid NULL` · `evidence_strength int CHECK 1..5` · `created_at`

---

### 2.5 التحقق (2)

**`validation_interviews`**
`id uuid PK` · `problem_id uuid FK` · `organization_id uuid NULL` · `respondent_id uuid NULL` · `happened_on date` · `duration_min int` · `summary text` · `pain_level int NULL` · `current_solution text NULL` · `past_spending_dzd numeric NULL` · `willing_to_test bool NULL` · `willing_to_pay_dzd numeric NULL` · `validation_result text NULL` · `notes text` · `created_at`

**`validation_scores`** — C3: مكان واحد لكل الأوزان
`problem_id uuid PK FK→problems ON DELETE CASCADE` · `frequency numeric` · `severity numeric` · `time_loss numeric` · `financial_impact numeric` · `reach numeric` · `feasibility numeric` · `willingness_to_pay numeric` · `opportunity_score numeric GENERATED` · `calculated_at`

#### Opportunity Score (C3 معتمد)

```text
opportunity_score =
    frequency          × 0.30
  + severity           × 0.20
  + time_loss          × 0.15
  + financial_impact   × 0.15
  + reach              × 0.10
  + feasibility        × 0.05
  + willingness_to_pay × 0.05
```

كل/components من 0 إلى 5. المجموع من 0 إلى 5.
> ⚠️ `01:741`: المؤشر **أداة تحليل داخلية، وليس دليلًا على وجود سوق**.

---

## 3. الفهارس

```sql
questions(survey_id, sort_order)
questions(section_id)
branching_rules(question_id) WHERE is_active
question_options(question_id, sort_order)
answers(response_id)
answers(question_id)
survey_responses(survey_id, sector_id) WHERE is_completed
survey_responses(wilaya ...)  -- عبر organization
problems(sector_id, status)
problems(status, opportunity_score DESC)  -- عبر join على validation_scores
problem_sources(problem_id)
evidence(problem_id, evidence_type)
validation_interviews(problem_id)
```

---

## 4. RLS — خط الدفاع الوحيد

لا يوجد backend خاص؛ الـRLS هي الحماية الوحيدة.

| الدور | surveys/questions/options/rules | responses/answers | problems/evidence/validation |
| --- | --- | --- | --- |
| `anon` | ❌ | INSERT فقط | ❌ |
| `researcher` | SELECT | SELECT | SELECT + INSERT |
| `admin` | ALL | ALL | ALL |

القواعد:
1. `anon` لا يقرأ ولا يعدّل — يستلهم فقط.
2. `anon` يُنشئ `survey_responses` + `answers` (لا بدّ منه للاستبيان العام).
3. الحذف مقيّد بـ`admin` فقط — `docs/02:778` لا تحذف feature/بيانات دون موافقة.
4. `profiles.role` هو المصدر الوحيد للصلاحية.

---

## 5. Migration

`supabase/migrations/20260101000000_initial_schema.sql` — 17 جدولًا + 9 enums + RLS + الفهارس + `updated_at` trigger.

```bash
supabase db reset     # يطبّق migrations + seed
supabase db diff      # يقارن DB الفعلي بـmigrations
```

---

## 6. ينتهي به C1–C4

| التناقض | كيف أُغلق |
| --- | --- |
| **C1** ثلاث صيغ جداول | ✅ اعتُمدت الأحدث `03:1499` + استُبعدت `02:488` |
| **C2** غياب branching من C1 | ✅ `questions` + `branching_rules` مضافان |
| **C3** Opportunity Score مرتين | ✅ جدول واحد `validation_scores` بمعادلة واحدة |
| **C4** Blade vs React | ✅ PostgreSQL + RLS، و `docs/06` يُقرأ كـCSS variables |

**متبقٍّ:** C5 (حدود Supabase) → `docs/10-ops.md` · C6 (خطة 5 مقابلات) → `docs/11-validation-plan.md`
