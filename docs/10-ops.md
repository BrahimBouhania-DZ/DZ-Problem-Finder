# 10 — بيئة العمل وقواعد العمليات (Ops)

> يغلق **C5**: حدود الخطة المجانية بأرقام، ومسار عمل واضح.
>前提: Docker غير متاح على هذا الجهاز، لذلك هذا الملف يوثّق مسارين.

---

## 1. حدود Supabase المجانية (C5)

| البند | الحد المجاني |اقرأه |
| --- | --- | --- |
| حجم قاعدة البيانات | 500 MB | يكفي لآلاف مشاركات الاستبيان |
| نقل البيانات (Egress) | 5 GB/شهر | ⚠️ **هذا هو الحد الخطر** — كل قراءة Dashboard تستهلكه |
|نقاط النهاية REST | 500 ألف طلب/شهر | الاستبيان العام سيستهلكها أسرع من أي شيء آخر |
| تخزين الملفات | 1 GB | لا نستخدمه في v1 |
| المشاريع القصوى | 2 | كافٍ |

### مصادر الاستهلاك المتوقعة

```text
كل مشاركة في الاستبيان
  = 1 insert لـ survey_responses
  + 15 insert لـ answers          → 16 طلب
  + تحميل 15 سؤالًا + 67 خيارًا   → طلبات مقروءة

1000 مشارك  →  ~16,000 طلب
10,000 مشارك → ~160,000 طلب   (32% من الحد الشهري)
50,000 مشارك → ~800,000 طلب   🚨 تجاوز الحد
```

### قواعد الحماية (طبَّقها من اليوم الأول — لا تُؤجَّل)

| # | القاعدة | السبب |
| --- | --- | --- |
| 1 | **حمّل أسئلة الاستبيان مرة واحدة** و cache في `localStorage` | يمنع ~15 طلب قراءة لكل مشارك |
| 2 | **batch للإجابات** — `upsert` بمصفوفة واحدة بدل 15 استدعاء | يخفض 16 طلبًا إلى 2 |
| 3 | **لا polling** — استخدم Realtime selectively أو تكرار يدوي | polling يلتهم الـ egrss بلا فائدة |
| 4 | **Dashboard بصفحات** — لا `select *` على `answers` | قراءة 15 سطرًا لكل مشارك = ضخّ |
| 5 | **راجع الاستهلاك أسبوعيًا** من Supabase Dashboard → Usage | الانتظار حتى نفاد الحد يعني توقّف الموقع |

⚠️ **القاعدة 2 هي الأهم** — وهي التي يجب أن تُكتب في كود الاستبيان من أول يوم، لأن إصلاحها لاحقًا يعني إعادة كتابة الاستبيان كله.

---

## 2. مسار العمل

### المسار أ — مع Docker (المستقبل)

```bash
npm run db:start      # يشغّل postgresql محلي على 54322
npm run db:reset      # migrations + seed
npm run db:types      # يولّد src/types/database.types.ts
npm run db:studio     # واجهة على 54323
```

### المسار ب — بلا Docker (هذا الجهاز) ✅ مُتحقَّق منه

```bash
# 1) تهيئة PostgreSQL محلي
initdb -D ./pgdata -U $USER --auth=trust -E UTF8
pg_ctl -D ./pgdata -o "-h 127.0.0.1 -p 55433 -c listen_addresses=127.0.0.1 -c unix_socket_directories=/tmp" -l pg.log start

# 2) مِد{supabase.auth} (غير موجود خارج Supabase)
psql -d postgres_survey -f auth_stub.sql

# 3) migration + seed
psql -d postgres_survey -f supabase/migrations/20260101000000_initial_schema.sql
psql -d postgres_survey -f supabase/seed.sql

# 4) توليد الأنواع
supabase gen types typescript \
  --db-url "postgresql://$USER@127.0.0.1:55433/postgres_survey?sslmode=disable" \
  > src/types/database.types.ts
```

⚠️ `sslmode=disable` إلزامي — الخادم المحلي بلا TLS.
⚠️ `unix_socket_directories` إلزامي أيضًا، وإلا فشل `pg_ctl` بـ`Permission denied` على `/var/run/postgresql`.

### ملف `auth_stub.sql`

```sql
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text
);
create or replace function auth.uid() returns uuid
  language sql stable as $$ select null::uuid $$;
```

هذا لا يوجد إلا محليًا. **لا ترفعه** — `supabase/.gitignore` يستثني `.temp`، و`auth_stub.sql` يبقى خارج `supabase/migrations/`.

---

## 3. متى تحتاج مشروع Supabase حقيقي؟

| السبب | الأولوية |
| --- | --- |
| تريد `npm run db:start` و`db:studio` بلا hacks | مريح |
| تريد اختبار RLS بصلاحية `anon` حقيقية | **ضروري** — الـ stub لا يُختبر السياسات |
| تريد Deploy على Netlify | **ضروري** |

**الخطوة الموصى بها الآن:** أنشئ مشروعًا مجانيًا على [supabase.com](https://supabase.com) ثم:

```bash
supabase login
supabase link --project-ref <REF>
supabase db push
npm run db:types      # لتحل محل الأنواع المولَّدة محليًا
```

---

## 4. قواعد النشر إلى Netlify

| المتغيّر | في Build Environment؟ | ملاحظات |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | ✅ نعم | آمن — يُضمَّن في الحزمة |
| `VITE_SUPABASE_ANON_KEY` | ✅ نعم | آمن — المفتاح العام بطبيعته |
| `SUPABASE_SERVICE_ROLE_KEY` | ⛔ **لا** | **مفتاح سري — لا تضعه في `VITE_` أبدًا** |

**اختبار قبل كل نشر:**

```bash
npm run typecheck && npm run lint && npm run build
```

`netlify.toml` مضبوط مسبقًا: `publish = "dist"` · SPA redirect · ترويسات أمان · cache للم/assets.

---

## 5. ما لم يُختبر بعد (بصراحة)

| لم يُختبر | السبب | متى |
| --- | --- | --- |
| **RLLMatching بصلاحية `anon`** | `auth.uid()` يعيد `null` في البيئة المحلية | بعد `supabase link` |
| **Supabase Auth (magic link)** | يحتاج مشروعًا حقيقيًا | المرحلة 2 |
| **حدود الخطة المجانية فعليًا** | بلا حركة مستخدمين | بعد أول 100 مشارك |
| **CORS / Netlify headers** | بلا deploy | عند أول نشر |
