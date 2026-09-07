-- GitHub Pages frontend uses Supabase Storage directly; no Manus storage proxy is required.
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false), ('public-media', 'public-media', true)
on conflict (id) do update set public = excluded.public;

create policy "Users upload their own payment proofs"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'payment-proofs'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users and admins read payment proofs"
on storage.objects for select to authenticated
using (
  bucket_id = 'payment-proofs'
  and (
    (storage.foldername(name))[1] = (select auth.uid()::text)
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
);

create policy "Admins upload daily photos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'public-media'
  and (storage.foldername(name))[1] = 'daily-photos'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Admins manage daily photos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'public-media'
  and (storage.foldername(name))[1] = 'daily-photos'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
