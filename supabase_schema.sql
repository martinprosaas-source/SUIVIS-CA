-- Entrées de CA
create table if not exists entries (
  id          text primary key,
  amount      numeric       not null,
  note        text          not null default 'Entrée',
  date        date          not null,
  created_at  timestamptz   default now()
);

-- Objectifs (ligne unique, id fixe = 1)
create table if not exists goals (
  id        integer primary key default 1,
  annual    numeric not null default 120000,
  monthly   numeric not null default 10000,
  updated_at timestamptz default now()
);

-- Ligne par défaut pour les objectifs
insert into goals (id, annual, monthly)
values (1, 120000, 10000)
on conflict (id) do nothing;

-- RLS : accès libre (application personnelle)
alter table entries enable row level security;
alter table goals   enable row level security;

create policy "allow_all_entries" on entries for all using (true) with check (true);
create policy "allow_all_goals"   on goals   for all using (true) with check (true);
