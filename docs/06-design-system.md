بالتأكيد. سأبني الـ **Design System** بحيث يكون مرجعًا ثابتًا لكل صفحات **DZ Problem Finder**، ويكون قابلًا للتنفيذ مباشرة بـ **Blade + CSS + JavaScript**، مع دعم RTL وواجهة الهاتف والكمبيوتر، وميزة تغيير اللون حسب المجال.

# DZ Problem Finder — Design System v1.0

## 1. الهوية البصرية

**اسم المنتج:**

> DZ Problem Finder

**الاسم العربي:**

> كاشف مشاكل السوق الجزائري

**الشعار النصي:**

> **اكتشف المشكلة • تحقق منها • ابنِ الحل**

**فلسفة التصميم:**

```text
Problem
   ↓
Discover
   ↓
Understand
   ↓
Validate
   ↓
Opportunity
```

الواجهة يجب أن تعطي إحساس:

**بيانات + بحث + ثقة + تقنية + بساطة**

وليس إحساس "استبيان تقليدي".

---

# 2. Design Tokens

سنضع جميع القيم في مكان واحد حتى نستطيع تغيير التصميم كاملًا لاحقًا.

```css
:root {
    /* =========================
       Brand
    ========================= */

    --brand-primary: #0F766E;
    --brand-primary-dark: #115E59;
    --brand-primary-light: #CCFBF1;

    /* =========================
       Background
    ========================= */

    --bg-main: #F7F9FC;
    --bg-surface: #FFFFFF;
    --bg-soft: #F1F5F9;
    --bg-dark: #0F172A;

    /* =========================
       Text
    ========================= */

    --text-primary: #172033;
    --text-secondary: #64748B;
    --text-muted: #94A3B8;
    --text-white: #FFFFFF;

    /* =========================
       Border
    ========================= */

    --border-light: #E2E8F0;
    --border-medium: #CBD5E1;

    /* =========================
       Status
    ========================= */

    --success: #16A34A;
    --warning: #F59E0B;
    --danger: #DC2626;
    --info: #2563EB;

    /* =========================
       Radius
    ========================= */

    --radius-xs: 6px;
    --radius-sm: 10px;
    --radius-md: 14px;
    --radius-lg: 20px;
    --radius-xl: 28px;
    --radius-pill: 999px;

    /* =========================
       Shadows
    ========================= */

    --shadow-sm:
        0 2px 8px rgba(15, 23, 42, .06);

    --shadow-md:
        0 8px 24px rgba(15, 23, 42, .08);

    --shadow-lg:
        0 20px 45px rgba(15, 23, 42, .12);

    --shadow-3d:
        0 18px 35px rgba(15, 23, 42, .14);

    /* =========================
       Motion
    ========================= */

    --transition-fast: 150ms ease;
    --transition-normal: 250ms ease;
    --transition-slow: 400ms ease;

    /* =========================
       Layout
    ========================= */

    --container: 1200px;
    --content-width: 850px;

    /* =========================
       Z-index
    ========================= */

    --z-header: 100;
    --z-dropdown: 200;
    --z-modal: 500;
    --z-toast: 700;
}
```

---

# 3. الخطوط

لأن المشروع عربي أولًا، أريد خطًا واضحًا جدًا.

### الخط الأساسي

**Cairo**

```css
font-family:
    "Cairo",
    system-ui,
    sans-serif;
```

### الأوزان

| الوزن | الاستخدام |
| ----- | --------- |
| 400   | النص      |
| 500   | Labels    |
| 600   | الأزرار   |
| 700   | العناوين  |
| 800   | Hero      |

لا نستخدم 900 إلا نادرًا.

---

# 4. Typography

## H1

```css
font-size: clamp(2rem, 5vw, 3.5rem);
font-weight: 800;
line-height: 1.15;
```

## H2

```css
font-size: clamp(1.6rem, 3vw, 2.4rem);
font-weight: 700;
```

## H3

```css
font-size: 1.35rem;
font-weight: 700;
```

## Body

```css
font-size: 1rem;
line-height: 1.8;
```

## Small

```css
font-size: .875rem;
```

---

# 5. نظام الألوان الديناميكي

هذه أهم نقطة في المشروع.

نستخدم:

```css
--accent
--accent-dark
--accent-light
--accent-rgb
```

مثلاً الوضع الافتراضي:

```css
:root {
    --accent: #0F766E;
    --accent-dark: #115E59;
    --accent-light: #CCFBF1;
}
```

وعند اختيار المجال تتغير هذه المتغيرات فقط.

---

# 6. ألوان المجالات

| المجال      | Accent    | Light     |
| ----------- | --------- | --------- |
| التجارة     | `#2563EB` | `#DBEAFE` |
| البناء      | `#EA580C` | `#FFEDD5` |
| الصحة       | `#0891B2` | `#CFFAFE` |
| الفلاحة     | `#16A34A` | `#DCFCE7` |
| البيطرة     | `#65A30D` | `#ECFCCB` |
| السياحة     | `#7C3AED` | `#EDE9FE` |
| التعليم     | `#9333EA` | `#F3E8FF` |
| المحاسبة    | `#0F766E` | `#CCFBF1` |
| التكنولوجيا | `#4F46E5` | `#E0E7FF` |
| الصيانة     | `#D97706` | `#FEF3C7` |
| الصناعة     | `#475569` | `#F1F5F9` |
| العقار      | `#0284C7` | `#E0F2FE` |
| النقل       | `#0369A1` | `#E0F2FE` |
| المطاعم     | `#DC2626` | `#FEE2E2` |

---

# 7. طريقة تطبيق اللون

مثلاً التجارة:

```html
<body data-sector="commerce">
```

CSS:

```css
[data-sector="commerce"] {
    --accent: #2563EB;
    --accent-dark: #1D4ED8;
    --accent-light: #DBEAFE;
}
```

الصحة:

```css
[data-sector="health"] {
    --accent: #0891B2;
    --accent-dark: #0E7490;
    --accent-light: #CFFAFE;
}
```

وهكذا.

**لا نغير كل التصميم.**

فقط:

```text
Button
Progress
Icons
Selected Card
Links
Focus
3D Glow
Charts
```

---

# 8. Buttons

لدينا 4 أنواع أساسية.

### Primary

```text
┌────────────────────────┐
│       ابدأ الآن →      │
└────────────────────────┘
```

```css
background: var(--accent);
color: white;
border-radius: var(--radius-md);
```

### Secondary

```text
┌────────────────────────┐
│       معرفة المزيد     │
└────────────────────────┘
```

خلفية شفافة وحدود.

### Ghost

للإجراءات الثانوية.

### Danger

للحذف أو الإجراءات الحساسة.

---

# 9. Button 3D

نريد 3D خفيف:

```css
.btn-primary {
    box-shadow:
        0 5px 0 var(--accent-dark),
        0 10px 20px rgba(0,0,0,.08);

    transform: translateY(0);

    transition:
        transform var(--transition-fast),
        box-shadow var(--transition-fast);
}

.btn-primary:hover {
    transform: translateY(-2px);
}

.btn-primary:active {
    transform: translateY(3px);

    box-shadow:
        0 2px 0 var(--accent-dark);
}
```

هذا يعطي إحساس زر حقيقي بدون مبالغة.

---

# 10. Cards

النظام الأساسي:

```text
┌──────────────────────────────┐
│  ICON                        │
│                              │
│  العنوان                    │
│                              │
│  وصف مختصر للمحتوى...       │
│                              │
│  ← المزيد                    │
└──────────────────────────────┘
```

### Card

```css
.card {
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
}
```

### Hover

```css
.card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-3d);
}
```

---

# 11. Sector Card

هذا سيكون عنصرًا رئيسيًا.

```text
┌─────────────────────┐
│                     │
│        🏪           │
│                     │
│      التجارة        │
│                     │
│   اكتشف مشاكل      │
│   القطاع            │
│                     │
└─────────────────────┘
```

عند hover:

```text
       ↗
   ┌───────────┐
  ╱            │
 │   🏪        │
 │  التجارة    │
 │             │
 └─────────────┘
```

CSS:

```css
.sector-card {
    transition:
        transform .3s ease,
        box-shadow .3s ease;
}

.sector-card:hover {
    transform:
        perspective(800px)
        rotateX(2deg)
        rotateY(-2deg)
        translateY(-6px);

    box-shadow: var(--shadow-3d);
}
```

---

# 12. الأيقونات

نستخدم **Lucide Icons** كأساس.

السبب:

* بسيطة
* احترافية
* SVG
* مناسبة للـRTL
* لا تعطي إحساسًا طفوليًا

الحجم:

| الاستخدام |   الحجم |
| --------- | ------: |
| Inline    |    16px |
| Button    |    18px |
| Card      |    24px |
| Hero      | 40–56px |
| Dashboard | 24–32px |

---

# 13. Hero Section

الـHero سيكون أهم جزء بصري.

```text
┌─────────────────────────────────────────────────────┐
│                                                     │
│                  🔎                                  │
│                                                     │
│       اكتشف المشكلة                                │
│       قبل أن تبني الحل                             │
│                                                     │
│   منصة لاكتشاف وتحليل مشاكل المؤسسات               │
│   والسوق الجزائري                                  │
│                                                     │
│       [ ابدأ الآن ]    [ كيف تعمل؟ ]               │
│                                                     │
│                   ◉                                 │
│             3D Data Core                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

# 14. عنصر 3D الرئيسي

نصنع عنصرًا باسم:

**Problem Core**

وهو عبارة عن كرة/شبكة نقاط خفيفة.

```text
             •
        •         •
      •      ●      •
        •         •
             •
```

وفي داخلها:

**?**

وعند اختيار قطاع تتغير إضاءتها إلى لون القطاع.

مثلاً:

```text
التجارة → أزرق
الصحة → سماوي
البناء → برتقالي
```

لكن هذا العنصر يجب أن يكون **خفيفًا**.

لا نحتاج Three.js في النسخة الأولى.

CSS + pseudo-elements يكفيان.

---

# 15. Background Pattern

بدل خلفية فارغة:

```text
.    .       .      .
    .     .       .
 .       .    .
```

نستخدم Grid خفيف جدًا.

```css
.background-grid {
    background-image:
        linear-gradient(
            rgba(15,118,110,.05) 1px,
            transparent 1px
        ),
        linear-gradient(
            90deg,
            rgba(15,118,110,.05) 1px,
            transparent 1px
        );

    background-size: 40px 40px;
}
```

لكن نستخدمه فقط:

* Hero
* Dashboard
* صفحات فارغة

وليس خلفية كل شيء.

---

# 16. Survey UI

واجهة الاستبيان يجب أن تختلف قليلًا عن الصفحة الرئيسية.

تكون:

**Focus Mode**

```text
                    التجارة

             السؤال 5 من 12

        ████████████░░░░░░

        كيف تدير مخزونك حاليًا؟

 ┌────────────────────────────────┐
 │                                │
 │   📊 Excel                     │
 │                                │
 └────────────────────────────────┘

 ┌────────────────────────────────┐
 │                                │
 │   💻 برنامج متخصص              │
 │                                │
 └────────────────────────────────┘

 ┌────────────────────────────────┐
 │                                │
 │   📝 بطريقة يدوية              │
 │                                │
 └────────────────────────────────┘
```

---

# 17. Answer Card

عند اختيار الإجابة:

```text
Normal

┌──────────────────────┐
│ ○ Excel              │
└──────────────────────┘

Selected

┌──────────────────────┐
│ ✓ Excel              │
└──────────────────────┘
```

وتصبح الحدود:

```css
border-color: var(--accent);
background: var(--accent-light);
```

---

# 18. الانتقالات

لا نريد الانتقال المفاجئ بين الأسئلة.

عند الانتقال:

```text
السؤال القديم
      ↓
   fade out
      ↓
   slide
      ↓
السؤال الجديد
```

المدة:

```css
300ms
```

ولا نتجاوز عادة:

```css
500ms
```

حتى لا يشعر المستخدم أن الموقع بطيء.

---

# 19. Progress System

لدينا:

### نسبة

```text
السؤال 6 / 12
```

### شريط

```text
████████████░░░░░░
```

### Label

```text
60% مكتمل
```

اللون:

```css
background: var(--accent);
```

---

# 20. Form System

كل input:

```text
اسم المؤسسة
┌──────────────────────────────┐
│ اكتب اسم المؤسسة...          │
└──────────────────────────────┘
```

Focus:

```css
input:focus {
    border-color: var(--accent);

    box-shadow:
        0 0 0 4px var(--accent-light);

    outline: none;
}
```

---

# 21. رسائل الخطأ

لا نستخدم:

> Error!

بل:

```text
⚠ يرجى اختيار إجابة للمتابعة.
```

باللون الأحمر.

والخطأ يكون أسفل الحقل وليس Toast فقط.

---

# 22. Status System

سنحتاجها لاحقًا للمشاكل.

| الحالة       | اللون     | المعنى            |
| ------------ | --------- | ----------------- |
| مكتشفة       | أزرق      | DISCOVERED        |
| متكررة       | بنفسجي    | REPEATED          |
| موثقة        | سماوي     | EVIDENCED         |
| متحقق منها   | أخضر      | VALIDATED         |
| طلب مؤكد     | أخضر داكن | DEMAND_CONFIRMED  |
| مرشح MVP     | برتقالي   | MVP_CANDIDATE     |
| قيد الاختبار | أصفر      | TESTING           |
| دفع فعلي     | أخضر قوي  | PAYMENT_VALIDATED |
| منتج         | Teal      | PRODUCT           |
| مرفوضة       | رمادي     | REJECTED          |
| مؤجلة        | رمادي     | ON_HOLD           |

---

# 23. Dashboard

Dashboard سيكون أكثر كثافة من الاستبيان.

التخطيط:

```text
┌──────────────────────────────────────────────────────┐
│ Sidebar                         Dashboard             │
│                                                      │
│ 🏠 الرئيسية                    ┌─────┐ ┌─────┐      │
│ 📊 الإحصائيات                  │1248 │ │ 347 │      │
│ 🔎 المشاكل                     └─────┘ └─────┘      │
│ 📋 الاستبيانات                                      │
│ 👥 المشاركون                  ┌─────────────────┐   │
│ ✓ التحقق                      │                 │   │
│ ⚙ الإعدادات                   │      Chart      │   │
│                              │                 │   │
│                              └─────────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

# 24. Sidebar

Desktop:

```text
┌─────────────────────┐
│ 🔎 DZ Problem       │
│    Finder           │
├─────────────────────┤
│ 🏠 الرئيسية         │
│ 📊 التحليلات        │
│ 🔎 المشاكل          │
│ 📋 الاستبيانات      │
│ 👥 المشاركون        │
│ ✓ التحقق            │
├─────────────────────┤
│ ⚙ الإعدادات         │
└─────────────────────┘
```

Mobile:

Sidebar تتحول إلى:

**Bottom Navigation**

```text
────────────────────────
🏠    📊    🔎    📋    ⚙
الرئيسية تحليل مشاكل استبيان
────────────────────────
```

---

# 25. Navbar

الواجهة العامة:

```text
🔎 DZ Problem Finder

الرئيسية
كيف تعمل؟
المجالات
عن المشروع

                 العربية ▾
```

وفي الهاتف:

```text
🔎 DZ Problem Finder                    ☰
```

---

# 26. Responsive System

### Mobile

```text
320px+
```

### Tablet

```text
768px+
```

### Desktop

```text
1024px+
```

### Large

```text
1440px+
```

لا نعتمد على أجهزة محددة فقط؛ نعتمد على **breakpoints حسب الحاجة**.

---

# 27. Container

```css
.container {
    width: min(
        calc(100% - 32px),
        var(--container)
    );

    margin-inline: auto;
}
```

على الهاتف:

```text
16px
```

على Desktop:

```text
24px+
```

---

# 28. RTL

من البداية:

```html
<html lang="ar" dir="rtl">
```

لكن النظام يجب أن يكون جاهزًا:

```text
العربية
   ↓
RTL

English
   ↓
LTR

Français
   ↓
LTR
```

ولا نكتب:

```css
margin-left
```

بشكل عشوائي.

نستخدم:

```css
margin-inline-start
margin-inline-end

padding-inline
inset-inline-start
```

حتى يبقى النظام قابلًا للتدويل.

---

# 29. Logo System

لدينا 3 نسخ.

### Logo Full

```text
🔎 DZ Problem Finder
   كاشف مشاكل السوق الجزائري
```

### Logo Compact

```text
🔎 DZPF
```

### Logo Mark

```text
🔎
```

يستخدم:

* favicon
* mobile
* loading
* app icon

---

# 30. الشعار النهائي المقترح

أقترح ألا يكون الشعار مجرد عدسة.

بل:

**عدسة تحتوي شبكة من النقاط، وفي مركزها نقطة واحدة مضيئة.**

المعنى:

```text
السوق
 ↓
بيانات كثيرة
 ↓
مشاكل كثيرة
 ↓
اكتشاف نقطة المشكلة
```

وهذا مناسب جدًا لفكرة المشروع.

---

# 31. Micro-interactions

نستخدم مؤثرات صغيرة:

### Button

```text
hover → ارتفاع 2px
```

### Card

```text
hover → ارتفاع 4–6px
```

### Selection

```text
border + glow
```

### Loading

```text
Skeleton
```

### Success

```text
✓ + subtle scale
```

### Error

```text
shake خفيف جدًا
```

لا نستخدم animations مستمرة إلا للعناصر الزخرفية.

---

# 32. Loading

بدل Spinner كبير:

```text
┌──────────────────────┐
│ ░░░░░░░░░░░░░░░░     │
│ ░░░░░░░░░░░░░░░░     │
│ ░░░░░░░░░░░░░░░░     │
└──────────────────────┘
```

نستخدم Skeleton Loading.

---

# 33. Toast

مثلاً:

```text
┌──────────────────────────────┐
│ ✓ تم حفظ إجابتك بنجاح       │
└──────────────────────────────┘
```

يظهر أسفل الشاشة.

Desktop:

```text
bottom: 24px
right: 24px
```

RTL يمكن أن يكون:

```text
bottom: 24px
left: 24px
```

---

# 34. Accessibility

النظام يجب أن يدعم:

* Keyboard navigation
* Focus واضح
* Contrast مناسب
* Labels واضحة
* ARIA
* لا نعتمد على اللون وحده
* حجم زر مناسب للهاتف
* Reduced Motion

مثلاً:

```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

# 35. قاعدة مهمة للـ3D

نضع قاعدة:

> **3D للتوجيه وليس للزينة.**

أي:

❌ لا نضع 3D في كل عنصر.

❌ لا نستخدم دورانًا مستمرًا.

❌ لا نضع عشرات الظلال.

✅ Hero → 3D

✅ Sector Cards → 3D Hover

✅ Dashboard KPIs → Depth

✅ Buttons → Press effect

أما النصوص والجداول والاستبيان:

**Flat + Clean**

---

# 36. النظام البصري النهائي

```text
                    DZ PROBLEM FINDER
                           │
          ┌────────────────┴────────────────┐
          │                                 │
       BRAND                            SECTOR
       ثابت                              متغير
          │                                 │
     Teal / Navy                    Commerce → Blue
                                    Health → Cyan
                                    Construction → Orange
                                    ...
          │                                 │
          └────────────────┬────────────────┘
                           ↓
                     UI COMPONENTS
                           ↓
                 ┌─────────┴─────────┐
                 │                   │
               Flat                Light 3D
                 │                   │
             Forms/Text          Cards/Hero
             Tables              Dashboard
             Survey              Buttons
```

---

# 37. الهيكل الذي سأعتمده في CSS

وأقترح ألا نجمع كل شيء في `style.css`.

بل:

```text
resources/
└── css/
    ├── app.css
    │
    ├── foundation/
    │   ├── variables.css
    │   ├── reset.css
    │   ├── typography.css
    │   └── rtl.css
    │
    ├── components/
    │   ├── buttons.css
    │   ├── cards.css
    │   ├── forms.css
    │   ├── badges.css
    │   ├── alerts.css
    │   ├── progress.css
    │   ├── modal.css
    │   ├── toast.css
    │   └── navigation.css
    │
    ├── layouts/
    │   ├── container.css
    │   ├── navbar.css
    │   ├── sidebar.css
    │   └── dashboard.css
    │
    ├── pages/
    │   ├── home.css
    │   ├── sectors.css
    │   ├── survey.css
    │   ├── problems.css
    │   └── dashboard.css
    │
    ├── effects/
    │   ├── 3d.css
    │   ├── animations.css
    │   └── background.css
    │
    └── sectors/
        ├── commerce.css
        ├── health.css
        ├── construction.css
        └── ...
```

لكن **ألوان القطاعات نفسها لا نريد تكرارها في كل ملف**؛ الأفضل أن تكون Tokens/variables مركزية.

---

# 38. أهم قرار تصميمي

أريد أن يكون انتقال المستخدم:

```text
الصفحة الرئيسية
       ↓
اختر المجال
       ↓
🎨 يتغير اللون
       ↓
تبدأ الأسئلة
       ↓
الأسئلة تتغير حسب الإجابات
       ↓
يكتشف المشكلة
       ↓
يؤكد البيانات
       ↓
✓ تم جمع البيانات
```

بحيث يشعر المستخدم أن الموقع **يفهم مجاله**.

وهذا يتوافق مباشرة مع الـDynamic Branching الذي صممناه سابقًا.

---

## الشكل النهائي الذي أقترحه

**Style:**

> Modern SaaS + Data Platform + Light 3D

**Base:**

> أبيض + Slate + Teal

**Dynamic Accent:**

> يتغير حسب المجال

**3D:**

> خفيف، وظيفي، CSS-based

**Typography:**

> Cairo

**Icons:**

> Lucide

**Layout:**

> RTL-first + Responsive

**Survey:**

> Focused / خطوة واحدة في كل مرة

**Dashboard:**

> Data-dense ولكن نظيف

**Animation:**

> 150–400ms فقط

**قاعدة الهوية:**

> **المشكلة هي المركز، واللون والـ3D يخدمان تجربة اكتشافها، وليس العكس.**

الخطوة المنطقية التالية هي تحويل هذا الـDesign System إلى **صفحة UI كاملة فعلية للـLanding Page + اختيار المجال**، ثم نبني منها بقية الواجهات بنفس النظام.













