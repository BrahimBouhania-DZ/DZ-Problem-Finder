-- DZ Problem Finder — المخطط الأولي
-- مبني على docs/09-schema.md (قرار C1 + C2 + C3 + C4)

create extension if not exists pgcrypto;

-- ─────────────── Enums ───────────────

create type user_role as enum ('admin', 'researcher');
create type survey_status as enum ('draft', 'published', 'closed');
create type question_type as enum ('single_choice', 'multi_choice', 'open_text', 'number', 'scale');
create type rule_operator as enum (
  'equals', 'not_equals', 'contains',
  'greater_than', 'greater_or_equal', 'less_than', 'less_or_equal',
  'in', 'not_in'
);
create type rule_action as enum ('show', 'hide', 'jump_to_section', 'skip');
create type problem_status as enum (
  'DISCOVERED', 'REPEATED', 'EVIDENCED',
  'VALIDATED', 'DEMAND_CONFIRMED', 'PAYMENT_VALIDATED'
);
create type evidence_type as enum (
  'survey', 'interview', 'observation', 'existing_solution',
  'customer_request', 'prototype_test', 'quote_request', 'payment'
);

-- ─────────────── 2.1 المرجعية ───────────────

create table sectors (
  id          text primary key,
  label       text not null,
  icon        text not null default 'Shapes',
  color       text not null,
  sort_order  int  not null default 0
);

create table wilayas (
  id        int primary key,
  code      int  not null,
  name_ar   text not null,
  name_fr   text not null
);

create table profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  role       user_role not null default 'researcher',
  created_at timestamptz not null default now()
);

-- ─────────────── 2.2 Survey Builder ───────────────

create table surveys (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  status     survey_status not null default 'draft',
  version    int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table survey_sections (
  id          uuid primary key default gen_random_uuid(),
  survey_id   uuid not null references surveys (id) on delete cascade,
  title       text not null,
  sort_order  int not null default 0,
  sector_ids  text[] null
);

comment on column survey_sections.sector_ids is
  'NULL = يظهر لكل القطاعات، وإلا يقصر القسم على هذه القطاعات';

create table questions (
  id          uuid primary key default gen_random_uuid(),
  survey_id   uuid not null references surveys (id) on delete cascade,
  section_id  uuid not null references survey_sections (id) on delete cascade,
  key         text not null,
  title       text not null,
  description text,
  type        question_type not null,
  required    boolean not null default false,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (survey_id, key)
);

create table question_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions (id) on delete cascade,
  value       text not null,
  label       text not null,
  sort_order  int not null default 0,
  unique (question_id, value)
);

create table branching_rules (
  id                 uuid primary key default gen_random_uuid(),
  survey_id          uuid not null references surveys (id) on delete cascade,
  question_id        uuid not null references questions (id) on delete cascade,
  target_question_id uuid references questions (id) on delete cascade,
  target_section_id  uuid references survey_sections (id) on delete cascade,
  operator           rule_operator not null,
  compare_value      text[] not null default '{}',
  combinator         text not null default 'AND' check (combinator in ('AND', 'OR')),
  action             rule_action not null,
  priority           int not null default 0,
  is_active          boolean not null default true,
  constraint branching_target_check check (
    (action = 'jump_to_section' and target_section_id is not null)
    or (action in ('show', 'hide') and target_question_id is not null)
    or (action = 'skip')
  )
);

-- ─────────────── 2.3 المشاركون ───────────────

create table organizations (
  id            uuid primary key default gen_random_uuid(),
  sector_id     text not null references sectors (id),
  size_range    text not null,
  age_range     text,
  wilaya_id     int references wilayas (id),
  current_tools text[] not null default '{}',
  created_at    timestamptz not null default now()
);

create table respondents (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations (id) on delete set null,
  role            text not null,
  contact_email   text
);

create table survey_responses (
  id                  uuid primary key default gen_random_uuid(),
  survey_id           uuid not null references surveys (id) on delete cascade,
  organization_id     uuid references organizations (id) on delete set null,
  respondent_id       uuid references respondents (id) on delete set null,
  sector_id           text not null references sectors (id),
  current_question_id uuid,
  visited_question_ids uuid[] not null default '{}',
  is_completed        boolean not null default false,
  started_at          timestamptz not null default now(),
  completed_at        timestamptz
);

create table answers (
  id          uuid primary key default gen_random_uuid(),
  response_id uuid not null references survey_responses (id) on delete cascade,
  question_id uuid not null references questions (id) on delete cascade,
  value       jsonb not null,
  created_at  timestamptz not null default now(),
  unique (response_id, question_id)
);

-- ─────────────── 2.4 جانب المشكلة ───────────────

create table problems (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  description         text,
  sector_id           text references sectors (id),
  category_id         uuid,
  status              problem_status not null default 'DISCOVERED',
  frequency_level     int check (frequency_level between 0 and 5),
  severity_level      int check (severity_level between 0 and 5),
  time_impact_hours   numeric,
  financial_impact_dzd numeric,
  affected_people     int,
  current_solution    text,
  solution_gap        text,
  feasibility         int check (feasibility between 0 and 5),
  discovered_at       timestamptz not null default now(),
  validated_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table validation_interviews (
  id                    uuid primary key default gen_random_uuid(),
  problem_id            uuid not null references problems (id) on delete cascade,
  organization_id       uuid references organizations (id) on delete set null,
  respondent_id         uuid references respondents (id) on delete set null,
  happened_on           date not null default now(),
  duration_min          int,
  summary               text,
  pain_level            int check (pain_level between 0 and 5),
  current_solution      text,
  past_spending_dzd     numeric,
  willing_to_test       boolean,
  willing_to_pay_dzd    numeric,
  validation_result     text,
  notes                 text,
  created_at            timestamptz not null default now()
);

create table problem_sources (
  id           uuid primary key default gen_random_uuid(),
  problem_id   uuid not null references problems (id) on delete cascade,
  source_type  text not null,
  answer_id    uuid references answers (id) on delete set null,
  response_id  uuid references survey_responses (id) on delete set null,
  interview_id uuid references validation_interviews (id) on delete set null,
  notes        text,
  created_at   timestamptz not null default now()
);

create table evidence (
  id                uuid primary key default gen_random_uuid(),
  problem_id        uuid not null references problems (id) on delete cascade,
  evidence_type     evidence_type not null,
  source            text,
  description       text,
  organization_id   uuid references organizations (id) on delete set null,
  respondent_id     uuid references respondents (id) on delete set null,
  interview_id      uuid references validation_interviews (id) on delete set null,
  evidence_strength int not null default 1 check (evidence_strength between 1 and 5),
  created_at        timestamptz not null default now()
);

create table validation_scores (
  problem_id         uuid primary key references problems (id) on delete cascade,
  frequency          numeric check (frequency between 0 and 5),
  severity           numeric check (severity between 0 and 5),
  time_loss          numeric check (time_loss between 0 and 5),
  financial_impact   numeric check (financial_impact between 0 and 5),
  reach              numeric check (reach between 0 and 5),
  feasibility        numeric check (feasibility between 0 and 5),
  willingness_to_pay numeric check (willingness_to_pay between 0 and 5),
  calculated_at      timestamptz not null default now()
);

comment on column validation_scores.frequency is 'التكرار — وزن 30%';
comment on column validation_scores.severity is 'شدة الألم — وزن 20%';
comment on column validation_scores.time_loss is 'الوقت الضائع — وزن 15%';
comment on column validation_scores.financial_impact is 'الخسارة/التكلفة — وزن 15%';
comment on column validation_scores.reach is 'عدد المؤسسات — وزن 10%';
comment on column validation_scores.feasibility is 'قابلية الحل — وزن 5%';
comment on column validation_scores.willingness_to_pay is 'استعداد الدفع — وزن 5%';

-- ─────────────── 3. الفهارس ───────────────

create index idx_questions_survey_order on questions (survey_id, sort_order);
create index idx_questions_section on questions (section_id);
create index idx_options_question on question_options (question_id, sort_order);
create index idx_rules_question on branching_rules (question_id) where is_active;
create index idx_sections_survey on survey_sections (survey_id, sort_order);
create index idx_answers_response on answers (response_id);
create index idx_answers_question on answers (question_id);
create index idx_responses_completed on survey_responses (survey_id, sector_id) where is_completed;
create index idx_organizations_sector on organizations (sector_id);
create index idx_organizations_wilaya on organizations (wilaya_id);
create index idx_problems_sector_status on problems (sector_id, status);
create index idx_problem_sources_problem on problem_sources (problem_id);
create index idx_problem_sources_answer on problem_sources (answer_id);
create index idx_evidence_problem_type on evidence (problem_id, evidence_type);
create index idx_interviews_problem on validation_interviews (problem_id);

-- ─────────────── updated_at trigger ───────────────

create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_surveys_updated
  before update on surveys
  for each row execute function set_updated_at();

create trigger trg_questions_updated
  before update on questions
  for each row execute function set_updated_at();

create trigger trg_problems_updated
  before update on problems
  for each row execute function set_updated_at();

-- ─────────────── 4. الأدوار ───────────────

-- Opportunity Score — C3: معادلة واحدة، مكان واحد (أوزان docs/01-survey-design.md:719-727)
create function compute_opportunity_score(
  p_frequency numeric,
  p_severity numeric,
  p_time_loss numeric,
  p_financial_impact numeric,
  p_reach numeric,
  p_feasibility numeric,
  p_willingness_to_pay numeric
) returns numeric
language sql immutable as $$
  select
      coalesce(p_frequency, 0) * 0.30
    + coalesce(p_severity, 0) * 0.20
    + coalesce(p_time_loss, 0) * 0.15
    + coalesce(p_financial_impact, 0) * 0.15
    + coalesce(p_reach, 0) * 0.10
    + coalesce(p_feasibility, 0) * 0.05
    + coalesce(p_willingness_to_pay, 0) * 0.05;
$$;

comment on function compute_opportunity_score is
  'المجموع من 0 إلى 5. مؤشر بحث داخلي فقط — ليس دليلًا على وجود سوق (docs/01-survey-design.md:741)';

-- يُعيد NULL عند غياب صف profile — مهم أمنيًا:
-- NULL في شرط RLS يعني DENY، فيُغلق الباب افتراضيًا (fail closed).
-- استخدام coalesce(..., 'researcher') هنا يمنح صلاحيات قراءة لأي
-- متصل بلا صف profile، بما في ذلك anon. لا تفعل ذلك.
create function dzpf_role() returns user_role
language sql stable security definer set search_path = public as $$
  select (select role from profiles where id = auth.uid());
$$;

create function is_admin() returns boolean
language sql stable as $$
  select dzpf_role() = 'admin';
$$;

create function is_staff() returns boolean
language sql stable as $$
  select dzpf_role() in ('admin', 'researcher');
$$;

-- ─────────────── 5. RLS ───────────────

alter table sectors              enable row level security;
alter table wilayas              enable row level security;
alter table profiles             enable row level security;
alter table surveys              enable row level security;
alter table survey_sections      enable row level security;
alter table questions            enable row level security;
alter table question_options     enable row level security;
alter table branching_rules      enable row level security;
alter table organizations        enable row level security;
alter table respondents          enable row level security;
alter table survey_responses     enable row level security;
alter table answers              enable row level security;
alter table problems             enable row level security;
alter table validation_interviews enable row level security;
alter table problem_sources      enable row level security;
alter table evidence             enable row level security;
alter table validation_scores    enable row level security;

-- مراجع: قراءة للجميع
create policy sectors_read on sectors
  for select using (true);

create policy wilayas_read on wilayas
  for select using (true);

-- profiles: كل موظف يرى نفسه، والإدارة ترى الجميع
create policy profiles_read_self on profiles
  for select using (id = auth.uid() or is_staff());

create policy profiles_admin_write on profiles
  for all using (is_admin()) with check (is_admin());

-- Survey Builder: الإدارة تقرأ وتكتب، الباحث يقرأ فقط
create policy surveys_staff_read on surveys
  for select using (is_staff());
create policy surveys_admin_write on surveys
  for all using (is_admin()) with check (is_admin());

create policy sections_staff_read on survey_sections
  for select using (is_staff());
create policy sections_admin_write on survey_sections
  for all using (is_admin()) with check (is_admin());

create policy questions_staff_read on questions
  for select using (is_staff());
create policy questions_admin_write on questions
  for all using (is_admin()) with check (is_admin());

create policy options_staff_read on question_options
  for select using (is_staff());
create policy options_admin_write on question_options
  for all using (is_admin()) with check (is_admin());

create policy rules_staff_read on branching_rules
  for select using (is_staff());
create policy rules_admin_write on branching_rules
  for all using (is_admin()) with check (is_admin());

-- المشاركون: الموظفون يقرأون، لا أحد يكتب من العميل
create policy organizations_staff_read on organizations
  for select using (is_staff());

create policy respondents_staff_read on respondents
  for select using (is_staff());
create policy respondents_admin_write on respondents
  for all using (is_admin()) with check (is_admin());

-- الاستبيان العام: anon يكتب فقط، ولا يقرأ ولا يعدّل أبدًا
create policy responses_public_insert on survey_responses
  for insert with check (true);

create policy responses_staff_read on survey_responses
  for select using (is_staff());

create policy answers_public_insert on answers
  for insert with check (true);

create policy answers_staff_read on answers
  for select using (is_staff());

-- جانب المشكلة
create policy problems_staff_read on problems
  for select using (is_staff());
create policy problems_staff_write on problems
  for insert with check (is_staff());
create policy problems_admin_write on problems
  for update using (is_admin()) with check (is_admin());
create policy problems_admin_delete on problems
  for delete using (is_admin());

create policy problem_sources_staff_read on problem_sources
  for select using (is_staff());
create policy problem_sources_staff_write on problem_sources
  for all using (is_staff()) with check (is_staff());

create policy interviews_staff_read on validation_interviews
  for select using (is_staff());
create policy interviews_staff_write on validation_interviews
  for all using (is_staff()) with check (is_staff());

create policy evidence_staff_read on evidence
  for select using (is_staff());
create policy evidence_staff_write on evidence
  for all using (is_staff()) with check (is_staff());

create policy scores_staff_read on validation_scores
  for select using (is_staff());
create policy scores_staff_write on validation_scores
  for all using (is_staff()) with check (is_staff());
