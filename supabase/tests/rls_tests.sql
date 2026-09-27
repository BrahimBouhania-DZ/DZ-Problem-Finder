-- اختبار سياسات RLS بثلاثة أدوار حقيقية: anon / researcher / admin
--
--   psql "postgresql://user@127.0.0.1:5433/postgres_survey?sslmode=disable" \
--        -v ON_ERROR_STOP=1 -f supabase/tests/rls_tests.sql
--
-- كل تأكيد يرمي استثناءً عند الفشل، فيتوقف psql عند أول خطأ.
-- لتشغيله كاملًا استخدم -1 (--single-transaction) حتى تبقى set_config
-- المحلية سارية عبر الجمل.

\set ON_ERROR_STOP on

create or replace function pg_temp.assert_true(label text, cond boolean)
returns void language plpgsql as $$
begin
  if cond is not true then
    raise exception 'FAIL: %', label;
  end if;
  raise notice 'PASS  %', label;
end;
$$;

create or replace function pg_temp.assert_raises(label text, stmt text)
returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    raise notice 'PASS  %', label;
    return;
  end;
  raise exception 'FAIL: % — نجح ويجب أن يُرفض', label;
end;
$$;

-- SELECT الرافض لـ RLS لا يرمي استثناءً: يُصفّي الصفوف ويعيد 0 صفاً.
-- لذلك تأكيد المنع على SELECT يجب أن يكون عددياً لا استثنائياً.
-- (استخدام assert_raises هنا يجعل الاختبار يفشل دائماً أو يفشل دائماً بصمت.)
create or replace function pg_temp.assert_no_rows(label text, counting_stmt text)
returns void language plpgsql as $$
declare
  n bigint;
begin
  execute counting_stmt into n;
  if n is distinct from 0 then
    raise exception 'FAIL: % — رجع % صفاً، والمفروض 0', label, n;
  end if;
  raise notice 'PASS  %', label;
end;
$$;

create or replace function pg_temp.assert_count(label text, counting_stmt text, expected bigint)
returns void language plpgsql as $$
declare
  n bigint;
begin
  execute counting_stmt into n;
  if n is distinct from expected then
    raise exception 'FAIL: % — رجع %، والمفروض %', label, n, expected;
  end if;
  raise notice 'PASS  %', label;
end;
$$;

-- قواعد التأكيد حسب طريقة الرفض:
--   1) صلاحية مسحوبة صراحة (revoke)  → الاستثناء permission denied → assert_raises
--   2) صلاحية ممنوحة + RLS يصفّف     → صفوف صفر بلا استثناء → assert_denied
--   3) SELECT ممنوح + RLS يصفّف       → صفوف صفر → assert_no_rows
--   4) INSERT يخالف with check        → استثناء RLS → assert_raises
-- جداول الاستبيان (survey_responses / answers) من نوع (1) بعد
-- 20260101000100_public_survey_access.sql، وبقية الجداول نوع (2)/(3).
create or replace function pg_temp.assert_denied(label text, stmt text)
returns void language plpgsql as $$
declare
  affected bigint;
begin
  execute stmt;
  get diagnostics affected = row_count;
  if affected <> 0 then
    raise exception 'FAIL: % — اسمح بتعديل % صفاً، والمفروض 0', label, affected;
  end if;
  raise notice 'PASS  %', label;
end;
$$;

create or replace function pg_temp.assert_affects(label text, stmt text, expected bigint)
returns void language plpgsql as $$
declare
  affected bigint;
begin
  execute stmt;
  get diagnostics affected = row_count;
  if affected is distinct from expected then
    raise exception 'FAIL: % — عدّل % صفاً، والمفروض %', label, affected, expected;
  end if;
  raise notice 'PASS  %', label;
end;
$$;

-- تنفيذ ينجح بلا استثناء (لدوال void مثل upsert_answer).
create or replace function pg_temp.assert_ok(label text, stmt text)
returns void language plpgsql as $$
begin
  execute stmt;
  raise notice 'PASS  %', label;
exception when others then
  raise exception 'FAIL: % — %', label, sqlerrm;
end;
$$;

create or replace function pg_temp.as_role(role_name text, uid text)
returns void language plpgsql as $$
begin
  execute format('set role %I', role_name);
  perform set_config('request.jwt.claim.sub', uid, false);
end;
$$;

\echo '=== فحص مسبق: هل الصلاحيات ممنوحة؟ ==='

do $$
declare
  missing text;
begin
  select string_agg(rolname, ', ') into missing
  from unnest(ARRAY['anon', 'authenticated']) as r(rolname)
  where not has_table_privilege(r.rolname, 'public.survey_responses', 'INSERT');

  if missing is not null then
    raise exception
      'صلاحيات INSERT غير ممنوحة لـ: %. شغّل local_auth_stub.sql بعد migration أولًا (هو من يمنح الصلاحيات).',
      missing;
  end if;
  raise notice 'PASS  الصلاحيات ممنوحة لـ anon و authenticated';
end;
$$;

\echo '=== تهيئة بيانات الاختبار ==='

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'admin@test.dz'),
  ('22222222-2222-2222-2222-222222222222', 'researcher@test.dz')
on conflict (id) do nothing;

insert into profiles (id, full_name, role) values
  ('11111111-1111-1111-1111-111111111111', 'مدير', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'باحث', 'researcher')
on conflict (id) do update set role = excluded.role;

insert into organizations (id, sector_id, size_range)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'commerce', '6-10')
on conflict (id) do nothing;

insert into problems (id, title)
  values ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'مشكلة للاختبار')
  on conflict (id) do nothing;

-- استبيان مسودة: يجب أن يبقى مغلقاً أمام anon رغم أنه في نفس الجداول.
-- يُنشأ هنا (قبل set role) لأن الهدف إثبات أن سياسات anon لا تراه.
insert into surveys (id, title, status, version)
  values ('dddddddd-0000-4000-8000-000000000099', 'مسودة سرية', 'draft', 1)
  on conflict (id) do nothing;

insert into questions (id, survey_id, section_id, key, title, type, sort_order)
  values ('dddddddd-0000-4000-8000-000000000098',
          'dddddddd-0000-4000-8000-000000000099',
          '00000000-0000-4000-8000-000000000101',
          'secret_q', 'سؤال في مسودة', 'open_text', 99)
  on conflict (id) do nothing;

\echo ''
\echo '--- 1) anon: الاستبيان العام ---'

-- تنظيف ردود تشغيل سابق على نفس القاعدة — يجعل الاختبار قابلاً للتكرار.
-- يُنفَّذ بدور المالك قبل set role، والإجابات تنcascade مع الرد.
delete from survey_responses where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

select pg_temp.as_role('anon', '');

-- ملاحظة مهمة: لا تستخدم ON CONFLICT هنا.
-- الإنشاء المباشر مسموح فقط على survey_responses (بمعرّف يختاره العميل)،
-- ولا يقترن بـ RETURNING: anon بلا قراءة على الجدول، و RETURNING يُرفض
-- بـ RLS (اكتشاف موثّق في ترويسة 20260101000100_public_survey_access.sql).
insert into survey_responses (id, survey_id, sector_id)
  values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          '00000000-0000-4000-8000-000000000001', 'commerce');

select pg_temp.assert_true('anon يكتب survey_responses', true);

-- ── الكتابة المباشرة على الإجابات مرفوضة بالكامل (الصلاحية مسحوبة) ──
-- كل كتابة عبر upsert_answer — الدالة وحدها تتحقق أن الرد مفتوح.
select pg_temp.assert_raises('anon لا يكتب answers مباشرة (صلاحيات مسحوبة)',
  $$insert into answers (response_id, question_id, value)
    values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            '00000000-0000-4000-8000-000000000201', '"commerce"')$$);

-- ── القراءة: الصلاحية مسحوبة، فالرفض استثناء permission denied لا صفوف صفر ──
select pg_temp.assert_raises('anon لا يقرأ survey_responses',
  $$select count(*) from survey_responses$$);
select pg_temp.assert_raises('anon لا يقرأ إجابات',
  $$select count(*) from answers$$);
select pg_temp.assert_no_rows('anon لا يقرأ problems',
  $$select count(*) from problems$$);
select pg_temp.assert_no_rows('anon لا يقرأ evidence',
  $$select count(*) from evidence$$);
select pg_temp.assert_no_rows('anon لا يقرأ organizations',
  $$select count(*) from organizations$$);
select pg_temp.assert_no_rows('anon لا يقرأ profiles',
  $$select count(*) from profiles$$);

-- ── INSERT (استثناء) / UPDATE+DELETE (استثناء: الصلاحية مسحوبة) ──
-- القاعدة: SELECT/UPDATE/DELETE مسحوبة صراحة هنا → استثناء permission denied،
-- ما دامت ممنوحة فـ RLS يصفّف → صفوف صفر (assert_denied).
select pg_temp.assert_raises('anon لا يُنشئ problems',
  $$insert into problems (title) values ('محاولة')$$);
select pg_temp.assert_raises('anon لا يُنشئ profiles',
  $$insert into profiles (id, role) values ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'admin')$$);
select pg_temp.assert_raises('anon لا يحذف survey_responses',
  $$delete from survey_responses where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'$$);

-- ── الاستبيان المنشور مقروء عمداً (C7) ──
select pg_temp.assert_count('anon يقرأ الاستبيان المنشور (1)',
  $$select count(*) from surveys$$, 1);
select pg_temp.assert_count('anon يقرأ أسئلة الاستبيان المنشور (15)',
  $$select count(*) from questions$$, 15);
select pg_temp.assert_count('anon يقرأ أقسام الاستبيان (3)',
  $$select count(*) from survey_sections$$, 3);
select pg_temp.assert_count('anon يقرأ خيارات الأسئلة (67)',
  $$select count(*) from question_options$$, 67);
select pg_temp.assert_count('anon يقرأ قواعد branching المنشورة (4)',
  $$select count(*) from branching_rules$$, 4);
select pg_temp.assert_count('anon يقرأ sectors (13)',
  $$select count(*) from sectors$$, 13);

-- ── المسودة تبقى مغلقة رغم وجودها في نفس الجداول ──
select pg_temp.assert_no_rows('anon لا يرى المسودة نفسها',
  $$select count(*) from surveys where id = 'dddddddd-0000-4000-8000-000000000099'$$);
select pg_temp.assert_no_rows('anon لا يرى أسئلة المسودة',
  $$select count(*) from questions where survey_id = 'dddddddd-0000-4000-8000-000000000099'$$);
select pg_temp.assert_no_rows('anon لا يرى خيارات أسئلة المسودة',
  $$select count(*) from question_options
    where question_id = 'dddddddd-0000-4000-8000-000000000098'$$);

-- ── مسار التقدّم: مباشر مرفوض، والدالة تحفظ ──
select pg_temp.assert_raises('anon لا يعدّل تقدّم مباشرة (صلاحية مسحوبة)',
  $$update survey_responses
     set current_question_id = '00000000-0000-4000-8000-000000000202',
         visited_question_ids = array['00000000-0000-4000-8000-000000000201',
                                      '00000000-0000-4000-8000-000000000202']::uuid[]
   where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'$$);

-- الدالة SECURITY DEFINER: تتجاوز RLS وتحقق داخلها أن الرد مفتوح.
-- القيمة النهائية تُفحص بعد reset role في آخر الملف.
select pg_temp.assert_true('save_survey_progress تحفظ التقدّم',
  (select public.save_survey_progress(
     'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
     '00000000-0000-4000-8000-000000000202',
     array['00000000-0000-4000-8000-000000000201',
           '00000000-0000-4000-8000-000000000202']::uuid[])));

-- ── الإجابات: الكتابة عبر الدالة وحدها ──
select pg_temp.assert_raises('anon لا يعدّل إجابة مباشرة (صلاحية مسحوبة)',
  $$update answers set value = '"x"'
    where response_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'$$);

select pg_temp.assert_ok('upsert_answer تحفظ إجابة أولى',
  $$select public.upsert_answer('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
       '00000000-0000-4000-8000-000000000201', '"commerce"')$$);

-- هذا هو اختبار ON CONFLICT الحقيقي: إجابة لنفس السؤال يجب أن تُعدَّل لا تُكرَّر
select pg_temp.assert_ok('upsert_answer تعدّل إجابة قائمة (ON CONFLICT)',
  $$select public.upsert_answer('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
       '00000000-0000-4000-8000-000000000201', '"construction"')$$);

-- ── أعمدة الهوية: الرفض هنا صلاحية (permission denied) ──
select pg_temp.assert_raises('anon لا يغيّر survey_id',
  $$update survey_responses set survey_id = 'dddddddd-0000-4000-8000-000000000099'
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'$$);
select pg_temp.assert_raises('anon لا يغيّر sector_id',
  $$update survey_responses set sector_id = 'other'
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'$$);

-- ── إنهاء الاستجابة ──
select pg_temp.assert_raises('anon لا يُنهي مباشرة (صلاحية مسحوبة)',
  $$update survey_responses set is_completed = true, completed_at = now()
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'$$);
select pg_temp.assert_true('complete_response تُنهي الاستجابة',
  (select public.complete_response('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')));

-- ── بعد الإكمال: الرد مقفل حتى على الدوال نفسها ──
select pg_temp.assert_raises('anon لا يعدّل رداً مكتملاً مباشرة',
  $$update survey_responses set visited_question_ids = '{}'::uuid[]
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'$$);
select pg_temp.assert_raises('anon لا يقرأ إجابات (مهما كان الرد)',
  $$select count(*) from answers
    where response_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'$$);
select pg_temp.assert_raises('upsert_answer ترفض إجابة رد مكتمل',
  $$select public.upsert_answer('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
       '00000000-0000-4000-8000-000000000201', '"hack"')$$);
select pg_temp.assert_true('save_survey_progress ترفض ردّاً مكتملاً',
  not (select public.save_survey_progress(
     'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
     '00000000-0000-4000-8000-000000000201', '{}'::uuid[])));
select pg_temp.assert_true('complete_response ترفض إغلاقاً مكرراً',
  not (select public.complete_response('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')));


\echo ''
\echo '--- 2) researcher: قراءة + أدلة ---'

select pg_temp.as_role('authenticated', '22222222-2222-2222-2222-222222222222');

select pg_temp.assert_true('researcher يقرأ sectors (13)', (select count(*) from sectors) = 13);
select pg_temp.assert_true('researcher يقرأ surveys (2: منشور + مسودة)', (select count(*) from surveys) = 2);
select pg_temp.assert_true('researcher يقرأ questions (16: 15 منشور + 1 مسودة)', (select count(*) from questions) = 16);
select pg_temp.assert_true('researcher يقرأ branching_rules (4)', (select count(*) from branching_rules) = 4);
select pg_temp.assert_true('researcher يقرأ organizations', (select count(*) from organizations) >= 1);

-- الباحث يرى المسودة (is_staff) — بخلاف anon، وهذا مقصود
select pg_temp.assert_true('researcher يرى المسودة', (select count(*) from surveys where status = 'draft') = 1);

select pg_temp.assert_raises('researcher لا يُنشئ question',
  $$insert into questions (survey_id, section_id, key, title, type)
    values ('00000000-0000-4000-8000-000000000001',
            '00000000-0000-4000-8000-000000000101', 'k', 'x', 'number')$$);
select pg_temp.assert_raises('researcher لا يُنشئ branching_rule',
  $$insert into branching_rules (survey_id, question_id, operator, compare_value, action)
    values ('00000000-0000-4000-8000-000000000001',
            '00000000-0000-4000-8000-000000000201', 'equals', '{}', 'skip')$$);
select pg_temp.assert_denied('researcher لا يرقّي نفسه إلى admin',
  $$update profiles set role = 'admin'
    where id = '22222222-2222-2222-2222-222222222222'$$);
select pg_temp.assert_raises('researcher لا يُنشئ organization',
  $$insert into organizations (sector_id, size_range) values ('commerce', '6-10')$$);
select pg_temp.assert_denied('researcher لا يحذف survey',
  $$delete from surveys$$);

insert into evidence (problem_id, evidence_type, description, evidence_strength)
  values ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'interview', 'مقابلة', 3)
  on conflict do nothing;
select pg_temp.assert_true('researcher يُنشئ evidence', true);

insert into validation_scores (problem_id, frequency, severity, willingness_to_pay)
  values ('cccccccc-cccc-cccc-cccc-cccccccccccc', 4, 3, 1)
  on conflict (problem_id) do update set frequency = 4;
select pg_temp.assert_true('researcher يكتب validation_scores', true);

insert into validation_interviews (problem_id, summary, pain_level)
  values ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ملاحظة', 4)
  on conflict do nothing;
select pg_temp.assert_true('researcher يُنشئ validation_interview', true);

\echo ''
\echo '--- 3) admin: كل شيء ---'

select pg_temp.as_role('authenticated', '11111111-1111-1111-1111-111111111111');

select pg_temp.assert_true('admin يقرأ surveys (2)', (select count(*) from surveys) = 2);

-- ملاحظة: التأكيدات الثلاثة التالية في النسخة السابقة كانت معكوسة —
-- كانت تتوقع رفض admin، بينما السياسات (_admin_write / _staff_write) تمنحه
-- الوصول الكامل عمداً. صُحّحت إلى تأكيدات موجبة.
-- التنبيه: لا يُجرَّب تعديل دور المدير نفسه هنا — خفضه إلى researcher
-- يبطل is_admin() فوراً فيفشل أي كتابة تالية له (سلوك السياسة صحيح).
select pg_temp.assert_affects('admin يعدّل question', $$
  update questions set title = 'عنوان جديد'
    where id = '00000000-0000-4000-8000-000000000201'$$, 1);

select pg_temp.assert_affects('admin يحذف evidence', $$
  delete from evidence
    where problem_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'$$,
  (select count(*) from evidence where problem_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'));

-- ترقية الباحث ثم إعادته — الهدف إثبات صلاحية الكتابة على profiles
select pg_temp.assert_affects('admin يعدّل profiles', $$
  update profiles set role = 'admin'
    where id = '22222222-2222-2222-2222-222222222222'$$, 1);

-- إعادة الدور حتى لا تتأثر بقية الاختبارات
select pg_temp.assert_affects('admin يعيد دور الباحث', $$
  update profiles set role = 'researcher'
    where id = '22222222-2222-2222-2222-222222222222'$$, 1);

-- الأدوار المتاحة exhausted: لا يوجد دور أعلى من admin
select pg_temp.assert_raises('admin لا يرقّي إلى دور غير موجود',
  $$update profiles set role = 'superadmin'
    where id = '11111111-1111-1111-1111-111111111111'$$);

\echo ''
\echo '--- 4) بلا هوية: auth.uid() = null ---'

select pg_temp.as_role('authenticated', '');

select pg_temp.assert_denied('بلا هوية: لا يرقّي أي profile',
  $$update profiles set role = 'admin'$$);
select pg_temp.assert_denied('بلا هوية: لا يحذف survey',
  $$delete from surveys$$);
select pg_temp.assert_denied('بلا هوية: لا يعدّل question',
  $$update questions set title = 'x'$$);
select pg_temp.assert_true('بلا هوية: يقرأ فقط (دور ضمني researcher)',
  (select count(*) from sectors) = 13);

reset role;

\echo ''
\echo '--- 5) التحقق النهائي من الحالة المخزّنة (دور المالك) ---'

select pg_temp.assert_true('التقدّم حُفظ فعلاً في قاعدة البيانات',
  (select current_question_id from survey_responses
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
  = '00000000-0000-4000-8000-000000000202');
select pg_temp.assert_true('الاستجابة مكتملة',
  (select is_completed from survey_responses
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb') is true);
select pg_temp.assert_true('upsert حدّث القيمة فعلاً',
  (select value::text from answers
    where response_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
      and question_id = '00000000-0000-4000-8000-000000000201') = '"construction"');
select pg_temp.assert_true('أعمدة الهوية لم تُمسّت',
  (select sector_id from survey_responses
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb') = 'commerce');

\echo ''
\echo '=== انتهت الاختبارات بنجاح ==='
