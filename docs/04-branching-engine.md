نعم. بما أننا فصلنا **نموذج الاستبيان** عن **نموذج المشكلة**، فالأفضل أن نبني الـDynamic Branching كـ **محرك قواعد مستقل**، وليس بوضع شروط كثيرة داخل JavaScript أو Controller.

## 1. الفكرة المعمارية

نقسم النظام إلى 4 طبقات:

```text
┌──────────────────────────┐
│       Survey Builder     │
│ إنشاء الأسئلة والقواعد   │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│     Branching Engine     │
│ تحديد السؤال التالي      │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│     Survey Session       │
│ إجابات المستخدم الحالية  │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│       Answers DB         │
│ حفظ الإجابات الخام       │
└──────────────────────────┘
```

**المهم:** محرك الـBranching لا ينشئ مشكلة ولا يحللها. وظيفته فقط:

> **ما السؤال الذي يجب عرضه بعد ذلك؟**

---

# 2. لا تجعل الأسئلة Hard-coded

خطأ أن نكتب:

```php
if ($sector == 'trade') {
    // show question 15
}
```

ثم بعد أشهر يصبح لدينا:

```php
if (...)
if (...)
if (...)
if (...)
```

وسيصعب جدًا تعديل الاستبيان.

الأفضل أن تكون الأسئلة والقواعد موجودة في قاعدة البيانات.

مثلاً:

```text
questions
question_options
branching_rules
```

وبالتالي تستطيع من لوحة الإدارة إنشاء:

> إذا اختار المستخدم "نعم" → اعرض السؤال X.

بدون تعديل الكود.

---

# 3. بنية السؤال

كل سؤال يحتاج إلى معلومات مثل:

```text
id
survey_id
section_id
key
title
description
type
required
order
is_active
```

مثال:

```text
id: 15
key: uses_software
title: هل تستخدم المؤسسة برنامجًا لإدارة هذا العمل؟
type: single_choice
required: true
order: 15
```

---

# 4. خيارات السؤال

جدول:

```text
question_options
```

مثلاً:

| id | question_id | value     | label   |
| -: | ----------: | --------- | ------- |
| 41 |          15 | yes       | نعم     |
| 42 |          15 | no        | لا      |
| 43 |          15 | sometimes | أحيانًا |

---

# 5. جدول قواعد الـBranching

أقترح:

```text
branching_rules
```

الحقول:

```text
id
survey_id
question_id
operator
value
action
target_question_id
priority
is_active
```

مثلاً:

```text
question_id = 15
operator = equals
value = yes
action = show
target_question_id = 16
```

المعنى:

> إذا كانت إجابة السؤال 15 = نعم، اعرض السؤال 16.

---

# 6. أنواع القواعد

لا نحتاج في البداية إلى نظام معقد جدًا.

ابدأ بهذه العمليات:

```text
equals
not_equals
contains
greater_than
less_than
greater_or_equal
less_or_equal
in
not_in
```

مثلاً:

### اختيار نعم

```text
equals → yes
```

### عدد الموظفين أكبر من 10

```text
greater_than → 10
```

### القطاع تجارة أو جملة

```text
in → ["trade", "wholesale"]
```

---

# 7. أنواع الإجراءات

القواعد لا يجب أن تكون فقط `show`.

نحتاج:

```text
show
hide
skip
jump
require
end
```

لكن في **الإصدار الأول** أنصح باستخدام:

```text
show
skip
jump
end
```

ثم نضيف البقية عند الحاجة.

---

# 8. مثال كامل: القطاع

السؤال الأول:

> ما القطاع الذي تعمل فيه؟

```text
sector
```

الخيارات:

```text
trade
accounting
construction
health
agriculture
hotel
tourism
hr
workshop
education
other
```

بعد الإجابة:

```text
trade
```

محرك الـBranching يقول:

```text
sector == trade
        ↓
انتقل إلى Trade Section
```

بينما:

```text
health
        ↓
انتقل إلى Health Section
```

---

# 9. مثال عملي: التجارة

السؤال:

> هل تواجهون مشاكل في إدارة المخزون؟

```text
inventory_problem
```

إذا:

```text
نعم
```

نعرض:

> كم مرة تحدث مشكلة المخزون؟

ثم:

> كيف تديرون المخزون حاليًا؟

ثم:

> ما الأداة المستخدمة؟

ثم:

> ما تأثير المشكلة؟

أما إذا:

```text
لا
```

فلا داعي لعرض 5 أسئلة عن المخزون.

ينتقل مباشرة إلى العملية التالية.

---

# 10. مثال أكثر ذكاءً

السؤال:

> كيف تديرون المخزون حاليًا؟

الخيارات:

```text
paper
excel
software
none
other
```

### إذا اختار Excel

نعرض:

> ما المشاكل التي تواجهها عند استخدام Excel للمخزون؟

ثم:

> هل تحدث فروقات بين المخزون الفعلي والمسجل؟

### إذا اختار برنامجًا

نعرض:

> ما اسم البرنامج؟

ثم:

> ما الشيء الذي لا يوفره البرنامج وتحتاج إليه؟

ثم:

> هل دفعت المؤسسة مقابل البرنامج؟

### إذا اختار ورقًا

نعرض:

> ما سبب عدم استخدام نظام رقمي؟

وهكذا يصبح الاستبيان **محادثة ذكية** بدل قائمة طويلة من الأسئلة.

---

# 11. مثال على Branching متعدد المستويات

لنأخذ:

```text
Q1: هل تستخدم برنامجًا؟
```

إذا:

```text
نعم
```

ننتقل إلى:

```text
Q2: ما نوع البرنامج؟
```

ثم:

```text
Q2 = محاسبة
```

ننتقل:

```text
Q3: هل البرنامج يغطي جميع احتياجاتك؟
```

إذا:

```text
لا
```

ننتقل:

```text
Q4: ما الذي ينقصه؟
```

ثم:

```text
Q5: هل جربت برنامجًا آخر؟
```

أما إذا:

```text
نعم
```

يمكن تخطي:

```text
Q4
```

والانتقال إلى:

```text
Q5
```

الشجرة:

```text
Q1
│
├── لا
│    ↓
│   Q6
│
└── نعم
     ↓
    Q2
     │
     ├── محاسبة
     │     ↓
     │    Q3
     │     │
     │     ├── نعم → Q5
     │     │
     │     └── لا → Q4 → Q5
     │
     └── أخرى
           ↓
          Q5
```

---

# 12. Branching حسب القطاع

هذه نقطة مهمة جدًا لمشروعك.

لا نريد:

```text
كل المستخدمين
↓
100 سؤال
```

بل:

```text
المستخدم
   ↓
القطاع
   │
   ├── تجارة → 15 سؤال
   ├── محاسبة → 18 سؤال
   ├── ورشة → 14 سؤال
   ├── صحة → 16 سؤال
   ├── فلاحة → 17 سؤال
   └── مقاولات → 20 سؤال
```

لكن هناك قسم مشترك:

```text
الأسئلة العامة
      ↓
القطاع
      ↓
أسئلة القطاع
      ↓
أسئلة المشكلة
      ↓
أسئلة الحل الحالي
      ↓
أسئلة التحقق الأولي
      ↓
التواصل الاختياري
```

---

# 13. الأفضل: Section-Based Branching

بدل التحكم في كل سؤال بشكل منفرد، أنشئ Sections:

```text
01 basic_information
02 organization
03 technology
04 sector
05 workflow
06 problem
07 current_solution
08 impact
09 willingness
10 contact
```

ثم:

```text
trade
 ↓
trade_inventory
 ↓
trade_sales
 ↓
common_problem
```

مثلاً:

```text
section_rules
```

يمكن أن تقول:

```text
sector = trade
→ show section trade_inventory
```

وهذا يقلل تعقيد النظام.

---

# 14. لا تجعل الـBranching يعتمد فقط على سؤال واحد

يمكن أيضًا بناء شرط مركب.

مثلاً:

> إذا كان القطاع تجارة **و** عدد الموظفين أكبر من 10 **و** يستخدمون Excel.

```text
sector == trade
AND
employee_count > 10
AND
uses_excel == true
```

ثم:

> اعرض أسئلة متقدمة عن إدارة المخزون.

---

# 15. دعم AND / OR

نحتاج في قاعدة البيانات:

```text
branching_rule_groups
branching_rules
```

مثلاً:

```text
Group 1
 ├── sector = trade
 ├── uses_excel = yes
 └── inventory_problem = yes
```

العلاقة:

```text
AND
```

أو:

```text
Group 2
 ├── sector = trade
 └── sector = wholesale
```

العلاقة:

```text
OR
```

فتصبح القاعدة:

```text
IF
(
    sector = trade
    AND
    uses_excel = yes
)
OR
(
    sector = wholesale
)
THEN
    SHOW advanced_inventory
```

---

# 16. كيف يعمل محرك الـBranching؟

عند كل إجابة:

```text
User answers Q15
       ↓
Save answer
       ↓
Load active rules
       ↓
Find rules related to Q15
       ↓
Evaluate conditions
       ↓
Determine next question
       ↓
Return next question
```

مثلاً:

```text
الإجابة:
uses_software = no
```

المحرك يبحث:

```text
Rule:
uses_software == no
→ jump to Q25
```

فيعيد:

```text
Q25
```

---

# 17. لا تحفظ ترتيب الأسئلة فقط

يجب أن يكون لدينا:

```text
order
```

لكن أيضًا:

```text
next_question_id
```

أو قواعد تحدد الانتقال.

لأن:

```text
Q1 → Q2 → Q3 → Q4
```

لا يصلح دائمًا.

قد يصبح:

```text
Q1
 ↓
Q2
 ↓
Q5
 ↓
Q9
```

بحسب الإجابات.

---

# 18. حفظ حالة جلسة الاستبيان

أنشئ:

```text
survey_sessions
```

مثلاً:

```text
id
survey_id
session_token
current_question_id
started_at
last_activity_at
completed_at
status
```

ويصبح لدينا:

```text
session
   ↓
current_question
   ↓
answer
   ↓
branching engine
   ↓
next_question
```

وهذا يسمح للمستخدم بإغلاق المتصفح والعودة لاحقًا، إذا أردت دعم ذلك.

---

# 19. لا تحذف الإجابات عند تغيير المسار

هذه نقطة مهمة.

مثلاً:

```text
Q1 = تجارة
Q2 = نعم
Q3 = Excel
```

ثم يعود المستخدم ويغير:

```text
Q1 = ورشة
```

الأسئلة السابقة الخاصة بالتجارة أصبحت غير صالحة للمسار الجديد.

لكن لا نحذفها مباشرة.

نضع عليها:

```text
is_active_answer = false
```

أو نربطها بإصدار/مسار الجلسة.

وهذا يحافظ على البيانات ويمنع تلويث التحليل.

---

# 20. نسخة أفضل للإجابات

أقترح:

```text
answers

id
survey_response_id
question_id
option_id
value_text
value_number
value_boolean
value_date
is_active
created_at
updated_at
```

مثلاً:

```text
question:
uses_software

answer:
yes
```

ثم إذا تغيرت الإجابة:

```text
old answer → is_active = false
new answer → is_active = true
```

---

# 21. لا تربط المشكلة مباشرة بالـBranching

هذا مهم جدًا بسبب الفصل الذي اتفقنا عليه.

الـDynamic Branching يحدد:

```text
ما السؤال التالي؟
```

ولا يحدد:

```text
ما المشكلة؟
```

بعد انتهاء الاستبيان تبدأ مرحلة أخرى:

```text
Survey
   ↓
Answers
   ↓
Problem Discovery
   ↓
Problem Candidate
```

مثلاً:

```text
Q:
كيف تدير المخزون؟

A:
Excel

Q:
ما المشكلة؟

A:
الفروقات بين المخزون الفعلي والمسجل.
```

الاستبيان انتهى.

بعد ذلك يستطيع الباحث أو نظام التحليل إنشاء:

```text
Problem Candidate:
عدم تطابق المخزون الفعلي مع البيانات المسجلة.
```

---

# 22. لوحة الإدارة

يجب أن تحتوي على **Survey Builder**.

مثلاً:

```text
┌────────────────────────────────────┐
│ Survey Builder                     │
├────────────────────────────────────┤
│ Q1 القطاع                          │
│     ↓                              │
│ Q2 حجم المؤسسة                     │
│     ↓                              │
│ Q3 هل تستخدم برنامجًا؟            │
│                                    │
│     ├── نعم → Q4 البرنامج          │
│     │           ↓                  │
│     │          Q5 هل أنت راضٍ؟     │
│     │                              │
│     └── لا → Q8 سبب عدم الاستخدام  │
│                                    │
└────────────────────────────────────┘
```

ويستطيع Admin:

* إضافة سؤال.
* تعديل سؤال.
* حذف/تعطيل سؤال.
* تغيير ترتيب السؤال.
* إضافة خيارات.
* إنشاء Rule.
* تحديد السؤال المستهدف.
* اختبار المسار.

---

# 23. أضف وضع Preview

هذه ميزة مهمة جدًا.

قبل نشر الاستبيان:

```text
Preview Survey
```

ثم يستطيع المسؤول تجربة:

```text
اختيار تجارة
↓
اختيار 10 موظفين
↓
اختيار Excel
↓
نعم للمشكلة
```

ويشاهد المسار:

```text
Q1
↓
Q2
↓
Q5
↓
Q7
↓
Q12
```

ثم يجرب مسارًا آخر.

---

# 24. أضف Branching Debugger

بما أنك مبرمج، هذه الميزة ستكون مفيدة جدًا.

مثلاً:

```text
Session #1024

Q1:
sector = trade

Rule #12:
sector == trade
✓ TRUE

Action:
SHOW section trade_inventory

Q5:
uses_excel = yes

Rule #21:
uses_excel == yes
✓ TRUE

Action:
SHOW Q6

Next:
Q6
```

هذا يسهل اكتشاف أخطاء الاستبيان.

---

# 25. بنية Laravel المقترحة

```text
app/
├── Models/
│   ├── Survey.php
│   ├── SurveySection.php
│   ├── Question.php
│   ├── QuestionOption.php
│   ├── BranchingRule.php
│   ├── SurveyResponse.php
│   ├── SurveySession.php
│   └── Answer.php
│
├── Services/
│   └── Survey/
│       ├── SurveyEngine.php
│       ├── BranchingEngine.php
│       ├── AnswerService.php
│       └── SurveyValidator.php
│
└── Http/
    ├── Controllers/
    │   ├── SurveyController.php
    │   └── Admin/
    │       ├── SurveyController.php
    │       ├── QuestionController.php
    │       └── BranchingRuleController.php
    │
    └── Requests/
        └── Survey/
```

---

# 26. مسؤولية BranchingEngine

اجعله مستقلًا:

```text
BranchingEngine
```

وظيفته:

```text
getNextQuestion()
evaluateRule()
evaluateCondition()
evaluateGroup()
resolveAction()
```

ولا تضع منطق الـBranching داخل:

```text
Controller
Blade
JavaScript
Model
```

إلا في حدود بسيطة.

---

# 27. AJAX أم صفحة كاملة؟

بما أن مشروعك Laravel + Blade، أنصح في الإصدار الأول:

```text
Blade
+
AJAX
+
JSON
```

عند الإجابة:

```text
POST /survey/{session}/answer
```

الخادم:

```text
يحفظ الإجابة
↓
BranchingEngine
↓
يحدد السؤال التالي
```

ثم يعيد:

```json
{
  "success": true,
  "next_question": {
    "id": 25,
    "type": "single_choice",
    "title": "كيف تدير المخزون حاليًا؟"
  }
}
```

والواجهة تستبدل السؤال الحالي بالسؤال الجديد.

---

# 28. مثال فعلي لمسار تجارة

```text
Q1
ما القطاع؟
        ↓
[تجارة]
        ↓
Q2
كم عدد الموظفين؟
        ↓
[6-10]
        ↓
Q3
هل تديرون المخزون؟
        ↓
[نعم]
        ↓
Q4
كيف تديرونه؟
        ↓
[Excel]
        ↓
Q5
هل تحدث فروقات؟
        ↓
[نعم]
        ↓
Q6
كم مرة؟
        ↓
[أسبوعيًا]
        ↓
Q7
ما تأثيرها؟
        ↓
[خسارة مالية + ضياع وقت]
        ↓
Q8
هل جربتم برنامجًا؟
        ↓
[نعم]
        ↓
Q9
لماذا لم يستمر استخدامه؟
        ↓
...
```

أما مستخدم آخر:

```text
Q1 = تجارة
Q2 = 1-2 موظفين
Q3 = لا ندير المخزون
```

فيتجاوز:

```text
Q4
Q5
Q6
Q7
Q8
Q9
```

وينتقل إلى القسم التالي.

---

# 29. مثال لقطاعين مختلفين

```text
                Q1 القطاع
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
       تجارة                عيادة
          │                   │
          ↓                   ↓
   أسئلة المخزون         أسئلة المواعيد
          │                   │
          ↓                   ↓
   أسئلة المبيعات        ملفات المرضى
          │                   │
          └─────────┬─────────┘
                    ↓
              أسئلة المشكلة
                    ↓
              الحل الحالي
                    ↓
              الاستعداد
```

وهذا بالضبط ما نريده.

---

# 30. خطة التنفيذ العملية

أنصح ألا نبدأ مباشرة بالـAND/OR المعقدة.

### المرحلة 1 — الأساس

أنشئ:

```text
surveys
survey_sections
questions
question_options
survey_responses
answers
```

واجعل النظام قادرًا على عرض الأسئلة وحفظ الإجابات.

### المرحلة 2 — Branching بسيط

أضف:

```text
branching_rules
```

وادعم:

```text
equals
not_equals
```

مع:

```text
show
jump
```

### المرحلة 3 — Branching القطاعي

أضف:

```text
sector → section
```

مثلاً:

```text
trade → trade_questions
health → health_questions
```

### المرحلة 4 — شروط متقدمة

أضف:

```text
>
<
>=
<=
contains
in
```

### المرحلة 5 — AND / OR

أضف:

```text
rule_groups
```

### المرحلة 6 — إدارة المسارات

أضف:

```text
survey_sessions
```

ودعم استئناف الاستبيان.

### المرحلة 7 — Preview & Debug

أضف:

```text
Preview
Path Simulator
Branching Debugger
```

### المرحلة 8 — التحليل

بعد استقرار الاستبيان، نربطه بنموذج المشكلة:

```text
Answers
   ↓
Problem Candidates
   ↓
Problem Clustering
   ↓
Validation
```

---

# 31. النتيجة المعمارية النهائية

```text
                         ┌──────────────┐
                         │ Survey Admin │
                         └──────┬───────┘
                                ↓
                    ┌─────────────────────┐
                    │ Questions + Rules   │
                    └──────────┬──────────┘
                               ↓
                         Survey Engine
                               ↓
                    ┌─────────────────────┐
                    │ User Survey Session  │
                    └──────────┬──────────┘
                               ↓
                         User Answer
                               ↓
                      Branching Engine
                               ↓
                    ┌──────────┴──────────┐
                    ↓                     ↓
              Next Question          Skip/Jump
                    │
                    ↓
                Final Data
                    │
                    ↓
              Problem Discovery
                    │
                    ↓
              Problem Model
                    │
                    ↓
               Validation
                    │
                    ↓
                  MVP
```

**بهذه البنية يصبح الاستبيان نفسه قابلًا للتغيير من لوحة الإدارة، دون إعادة برمجة المسارات في كل مرة.** والأهم أن بيانات الاستبيان تبقى منفصلة عن كيان **Problem**؛ وهذا سيعطي المشروع أساسًا نظيفًا جدًا عندما نصل لاحقًا إلى تحليل البيانات واكتشاف المشاكل تلقائيًا.







