-- بيئة اختبار محلية — الجزء 1: مخطط auth والأدوار
-- يُشغَّل قبل الـmigration (لأن profiles يشير إلى auth.users).
--
--   psql -d postgres_survey -f supabase/tests/local_auth_stub.sql
--   psql -d postgres_survey -f supabase/migrations/20260101000000_initial_schema.sql
--   psql -d postgres_survey -f supabase/seed.sql
--   psql -d postgres_survey -f supabase/tests/local_grants.sql
--   psql -d postgres_survey -1 -f supabase/tests/rls_tests.sql
--
-- للتطوير المحلي فقط — لا يُرفع ولا يُطبَّق على Supabase حقيقي.

create schema if not exists auth;

create table if not exists auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text
);

-- نفس ما يفعله Supabase: يقرأ sub من GUC، فيمكن تبديل الهوية داخل الجلسة
create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create or replace function auth.role() returns text
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.role', true), '');
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end
$$;

grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
grant execute on function auth.role() to anon, authenticated;
