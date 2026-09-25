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
