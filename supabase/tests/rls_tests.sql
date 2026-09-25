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

\echo ''
\echo '--- 1) anon: الاستبيان العام ---'

select pg_temp.as_role('anon', '');

-- ملاحظة مهمة: لا تستخدم ON CONFLICT هنا.
-- PostgreSQL يحتاج قراءة الصف المتعارض لتطبيقه، و anon بلا سياسة SELECT
-- فيرفض العملية بخطأ RLS رغم وجود سياسة insert مفتوحة.
-- قيد حقيقي يجب أن يتبعه كود التطبيق (docs/10-ops.md § 6).
insert into survey_responses (id, survey_id, sector_id)
  values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          '00000000-0000-4000-8000-000000000001', 'commerce');

insert into answers (response_id, question_id, value)
  values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          '00000000-0000-4000-8000-000000000201', '"commerce"');

select pg_temp.assert_true('anon يكتب survey_responses', true);
select pg_temp.assert_true('anon يكتب answers', true);

select pg_temp.assert_raises('anon لا يقرأ survey_responses',
  $$select count(*) from survey_responses$$);
select pg_temp.assert_raises('anon لا يعدّل survey_responses',
  $$update survey_responses set is_completed = true$$);
select pg_temp.assert_raises('anon لا يحذف survey_responses',
  $$delete from survey_responses$$);
select pg_temp.assert_raises('anon لا يقرأ questions',
  $$select count(*) from questions$$);
select pg_temp.assert_raises('anon لا يقرأ branching_rules',
  $$select count(*) from branching_rules$$);
select pg_temp.assert_raises('anon لا يقرأ problems',
  $$select count(*) from problems$$);
select pg_temp.assert_raises('anon لا يقرأ evidence',
  $$select count(*) from evidence$$);
select pg_temp.assert_raises('anon لا يُنشئ problems',
  $$insert into problems (title) values ('محاولة')$$);
select pg_temp.assert_raises('anon لا يُنشئ profiles',
  $$insert into profiles (id, role) values ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'admin')$$);

\echo ''
\echo '--- 2) researcher: قراءة + أدلة ---'

select pg_temp.as_role('authenticated', '22222222-2222-2222-2222-222222222222');

select pg_temp.assert_true('researcher يقرأ sectors (13)', (select count(*) from sectors) = 13);
select pg_temp.assert_true('researcher يقرأ surveys (1)', (select count(*) from surveys) = 1);
select pg_temp.assert_true('researcher يقرأ questions (15)', (select count(*) from questions) = 15);
select pg_temp.assert_true('researcher يقرأ branching_rules (4)', (select count(*) from branching_rules) = 4);
select pg_temp.assert_true('researcher يقرأ organizations', (select count(*) from organizations) >= 1);

select pg_temp.assert_raises('researcher لا يُنشئ question',
  $$insert into questions (survey_id, section_id, key, title, type)
    values ('00000000-0000-4000-8000-000000000001',
            '00000000-0000-4000-8000-000000000101', 'k', 'x', 'number')$$);
select pg_temp.assert_raises('researcher لا يُنشئ branching_rule',
  $$insert into branching_rules (survey_id, question_id, operator, compare_value, action)
    values ('00000000-0000-4000-8000-000000000001',
            '00000000-0000-4000-8000-000000000201', 'equals', '{}', 'skip')$$);
select pg_temp.assert_raises('researcher لا يرقّي نفسه إلى admin',
  $$update profiles set role = 'admin'
    where id = '22222222-2222-2222-2222-222222222222'$$);
select pg_temp.assert_raises('researcher لا يُنشئ organization',
  $$insert into organizations (sector_id, size_range) values ('commerce', '6-10')$$);
select pg_temp.assert_raises('researcher لا يحذف survey',
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

select pg_temp.assert_true('admin يقرأ surveys', (select count(*) from surveys) = 1);
select pg_temp.assert_raises('admin يعدّل question',
  $$update questions set title = 'عنوان جديد'
    where id = '00000000-0000-4000-8000-000000000201'$$);
select pg_temp.assert_raises('admin يحذف evidence', $$delete from evidence$$);
select pg_temp.assert_raises('admin يعدّل profiles',
  $$update profiles set role = 'researcher'
    where id = '11111111-1111-1111-1111-111111111111'$$);

\echo ''
\echo '--- 4) بلا هوية: auth.uid() = null ---'

select pg_temp.as_role('authenticated', '');

select pg_temp.assert_raises('بلا هوية: لا يرقّي أي profile',
  $$update profiles set role = 'admin'$$);
select pg_temp.assert_raises('بلا هوية: لا يحذف survey',
  $$delete from surveys$$);
select pg_temp.assert_raises('بلا هوية: لا يعدّل question',
  $$update questions set title = 'x'$$);
select pg_temp.assert_true('بلا هوية: يقرأ فقط (دور ضمني researcher)',
  (select count(*) from sectors) = 13);

reset role;

\echo ''
\echo '=== انتهت الاختبارات بنجاح ==='
