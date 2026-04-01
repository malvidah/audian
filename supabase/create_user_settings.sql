create table if not exists user_settings (
  id          bigint generated always as identity primary key,
  key         text unique not null,
  value       text not null,
  updated_at  timestamptz default now()
);

-- Seed account name
insert into user_settings (key, value) values ('account_name', 'Big Think')
on conflict (key) do update set value = excluded.value, updated_at = now();
