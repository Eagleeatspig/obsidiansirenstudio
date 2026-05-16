insert into storage.buckets (id, name, public) values ('manuscript-media', 'manuscript-media', false) on conflict (id) do nothing;

create policy "Users view own manuscript media"
on storage.objects for select
using (bucket_id = 'manuscript-media' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users upload own manuscript media"
on storage.objects for insert
with check (bucket_id = 'manuscript-media' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own manuscript media"
on storage.objects for delete
using (bucket_id = 'manuscript-media' and auth.uid()::text = (storage.foldername(name))[1]);