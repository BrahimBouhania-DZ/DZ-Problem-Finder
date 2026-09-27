-- بيئة اختبار محلية — الجزء 2: منح الصلاحيات
-- يُشغَّل بعد الـmigration (لأنه يمرّ على الجداول الموجودة).
-- Supabase يفعل هذا تلقائيًا بعد كل migration؛ هنا نحاكي ذلك يدويًا.
--
--   psql -d postgres_survey -f supabase/tests/local_grants.sql

do $$
declare
  t record;
begin
  for t in
    select tablename from pg_tables
    where schemaname = 'public' and tablename not like 'pg_%'
  loop
    execute format('grant all on table public.%I to anon, authenticated', t.tablename);
  end loop;
end
$$;

grant usage on schema public to anon, authenticated;
grant execute on function public.dzpf_role() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_staff() to anon, authenticated;

do $$
declare
  n int;
begin
  select count(*) into n
  from pg_tables
  where schemaname = 'public' and tablename not like 'pg_%';

  raise notice '✅ منح % جدولًا لـ anon و authenticated', n;
end
$$;

-- ─────────────── تضييق anon (يجب أن يبقى بعد الحلقة أعلاه) ───────────────
-- هذا الملف يُشغَّل بعد الـmigrations، وحلقة GRANT ALL أعلاه تُطبّق
-- grant all على مستوى الجدول. في Supabase يحدث الشيء نفسه لحظة إنشاء
-- الجدول عبر default privileges، وسحب الصلاحيات في migration
-- 20260101000100 يبقى سارياً لأن السحب يحدث بعدها. هنا نُعيد تطبيقه
-- في النهاية ليطابق الإنتاج بالضبط. لا تحذف هذا القسم.
revoke select, update, delete on survey_responses from anon;
revoke insert, select, update, delete on answers from anon;

grant execute on function public.survey_is_published(uuid)   to anon, authenticated;
grant execute on function public.question_is_published(uuid) to anon, authenticated;
grant execute on function public.response_is_open(uuid)      to anon, authenticated;
grant execute on function public.save_survey_progress(uuid,uuid,uuid[]) to anon, authenticated;
grant execute on function public.complete_response(uuid)              to anon, authenticated;
grant execute on function public.upsert_answer(uuid,uuid,jsonb)       to anon, authenticated;
