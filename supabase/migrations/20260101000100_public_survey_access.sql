-- DZ Problem Finder — فتح الاستبيان العام (يغلق C7)
--
-- المشكلة: سياسات القراءة في 20260101000000_initial_schema.sql تشترط is_staff()
-- على surveys / survey_sections / questions / question_options / branching_rules.
-- مستخدم الاستبيان anon بلا صف profiles ← dzpf_role() = NULL ← RLS denies.
-- فكان fetchPublishedSurvey() يفشل عند أول استعلام، ولا يعمل الاستبيان لأحد.
--
-- الحل المعتمد: قراءة anon محصورة حصراً بالاستبيان المنشور (status='published').
-- المسودات تبقى مغلقة. لا يُعدَّل أي جدول ولا أي سياسة قائمة.
--
-- إضافةً إلى ذلك: مسار التقدّم (updateSurveyProgress / completeSurveyResponse)
-- و upsertAnswer لم تكن لهم أي سياسة UPDATE لـ anon إطلاقاً، فكان يتعطّل
-- الاستبيان بعد السؤال الأول حتى لو صُلحت القراءة. هذا الملف يغلق تلك الفجوة أيضاً.
--
-- ───────── نموذج الأمان المعتمد: UUID = رمز الوصول (Bearer Token) ─────────
-- اكتشاف حاسم أثناء الاختبار على PostgreSQL 16 حقيقي:
--   1) INSERT ... RETURNING يُطبّق سياسات SELECT → بدونها يُرفض بـ
--      "new row violates row-level security policy"، فكان createSurveyResponse
--      (.select().single()) يفشل فعلياً في الإنتاج.
--   2) UPDATE يتطلّب مرور الصف بسياسة SELECT (usING) → بدونها يُحدّث 0 صفوف
--      بصمت، فكان التقدّم لا يُحفظ إطلاقاً.
-- الحل السهل (سياسة SELECT مفتوحة) كان سيفتح ثغرة: أي anon يقرأ معرّفات كل
-- الردود المفتوحة ثم يقفلها بـ update ... set is_completed = true دفعة واحدة.
--
-- لذلك اعتمدنا: لا قراءة مباشرة لـ anon على survey_responses / answers إطلاقاً،
-- والكتابة عبر دوال SECURITY DEFINER (القسم 5) تتحقق أن الرد ما زال مفتوحاً.
-- المعرّف uuid يُولَّده العميل نفسه (crypto.randomUUID) فلا حاجة لـ RETURNING،
-- وبما أنه غير قابل للتخمين وغير مسرود → يصبح رمز وصول لصاحبه وحده.

-- ─────────────── 1. دوال مساعدة (SECURITY DEFINER) ───────────────
-- ليست ترفاً: بدون SECURITY DEFINER تُطبَّق RLS على الاستعلام الفرعي،
-- فيرى anon ما تسمح به سياسات anon فقط، فتصبح نتيجة الدالة خاطئة.

-- هل هذا الاستبيان منشور ومتاح للمشاركين؟
create function survey_is_published(p_survey_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from surveys
    where id = p_survey_id and status = 'published'
  );
$$;

comment on function survey_is_published is
  'بوابة قراءة الاستبيان العام — المنشور فقط، المسودات مغلقة (C7)';

-- هل ينتمي هذا السؤال إلى استبيان منشور؟
create function question_is_published(p_question_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from questions q
    join surveys s on s.id = q.survey_id
    where q.id = p_question_id and s.status = 'published'
  );
$$;

-- هل ما زالت هذه الاستجابة مفتوحة (غير مكتملة)؟
create function response_is_open(p_response_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from survey_responses
    where id = p_response_id and is_completed = false
  );
$$;

comment on function response_is_open is
  'تتجاوز RLS على survey_responses — بدون SECURITY DEFINER يرى anon صفوفاً لا يراها';

grant execute on function survey_is_published(uuid)   to anon, authenticated;
grant execute on function question_is_published(uuid) to anon, authenticated;
grant execute on function response_is_open(uuid)      to anon, authenticated;

-- ─────────────── 2. قراءة: anon محصور بالاستبيان المنشور ───────────────

create policy surveys_public_read_published on surveys
  for select to anon
  using (status = 'published');

create policy sections_public_read_published on survey_sections
  for select to anon
  using (public.survey_is_published(survey_id));

create policy questions_public_read_published on questions
  for select to anon
  using (public.survey_is_published(survey_id));

create policy options_public_read_published on question_options
  for select to anon
  using (public.question_is_published(question_id));

create policy rules_public_read_published on branching_rules
  for select to anon
  using (public.survey_is_published(survey_id));

-- sectors و wilayas لهما أصلاً سياسة using (true) — لا تغيير.

-- ─────────────── 3. الكتابة المباشرة: الإنشاء فقط ───────────────
-- لا ننشئ أي سياسة UPDATE أو SELECT لـ anon على survey_responses / answers.
-- السبب موثّق في الترويسة: أي سياسة SELECT مفتوحة تُسرّ معرّفات الردود
-- فتتاح ثغرة قفل جماعي، وأي سياسة UPDATE تتطلّب معها مرور الصف بسياسة
-- SELECT — أي أن إضافة UPDATE وحدها لا تعمل أصلاً.
--
-- الإنشاء يبقى مسموحاً مباشرة (responses_public_insert من المخطط الأول):
-- anon يولّد uuid بنفسه ويدوّن ردّه ولا يقرؤه بعدها — رمز الوصول هو الـuuid.
-- الكتابة اللاحقة (التقدّم / الإجابات / الإنهاء) تنحصر في دوال القسم 5.

-- ─────────────── 4. سحب صلاحيات anon المباشرة ───────────────
-- local_grants.sql يمنح كل شيء grant all (محاكاة default privileges في
-- Supabase)، لذا نسحب ما لا يجب أن يملكه anon. من دون هذا السحب:
--   - قراءة survey_responses / answers مباشرة رغم غياب سياسات SELECT،
--   - تعديل أي عمود بفضل grant update الافتراضي،
--   - إدراج إجابة لرد مكتمل أو لاستبيان آخر (تجاوز الدوال والتحقق).

revoke select, update, delete on survey_responses from anon;
revoke insert, select, update, delete on answers from anon;

-- لاحظ: authenticated (researcher/admin) لا تُمسّ صلاحياته — سياسات
-- answers_staff_read / _admin_write من الم الأول تظل تعمل كما هي.

-- ─────────────── 5. دوال الكتابة (SECURITY DEFINER) ───────────────
-- الواجهة تستدعيها عبر supabase.rpc(). تتجاوز RLS بصلاحية المالك،
-- وتحوّل التحقق إلى داخل الدالة: الرد يجب أن يكون موجوداً ومفتوحاً.

-- حفظ التقدّم (current_question_id + visited_question_ids).
create function save_survey_progress(
  p_response_id uuid, p_question_id uuid, p_visited uuid[]
) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update survey_responses
     set current_question_id = p_question_id,
         visited_question_ids = p_visited
   where id = p_response_id and is_completed = false;
  return found;
end;
$$;

comment on function save_survey_progress is
  'كتابة التقدّم لردّ مفتوح — ترجع false إن كان الرد مكتملاً أو غير موجود';

-- إنهاء الاستجابة. الترتيب في الواجهة: الإجابات ثم الإنهاء.
create function complete_response(p_response_id uuid) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update survey_responses
     set is_completed = true, completed_at = now()
   where id = p_response_id and is_completed = false;
  return found;
end;
$$;

comment on function complete_response is
  'إقفال الرد — ترجع false إن كان مقفلاً أصلاً (idempotent)';

-- upsert إجابة واحدة. تتحقق أن الرد مفتوح وأن السؤال ينتمي لنفس الاستبيان،
-- فتمنع الإجابة على رد مكتمل أو حقن أسئلة استبيان آخر في ردّنا.
create function upsert_answer(
  p_response_id uuid, p_question_id uuid, p_value jsonb
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1
      from survey_responses r
      join questions q on q.survey_id = r.survey_id
     where r.id = p_response_id
       and r.is_completed = false
       and q.id = p_question_id
  ) then
    raise exception 'الرد مكتمل أو غير موجود، أو السؤال لا ينتمي للاستبيان';
  end if;

  insert into answers (response_id, question_id, value)
  values (p_response_id, p_question_id, p_value)
  on conflict (response_id, question_id)
  do update set value = excluded.value;
end;
$$;

comment on function upsert_answer is
  'إدراج أو تعديل إجابة لردّ مفتوح — بديل upsertAnswer المباشر';

grant execute on function save_survey_progress(uuid,uuid,uuid[]) to anon, authenticated;
grant execute on function complete_response(uuid)              to anon, authenticated;
grant execute on function upsert_answer(uuid,uuid,jsonb)       to anon, authenticated;
