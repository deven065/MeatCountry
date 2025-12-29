-- Fix addresses RLS policy for insertion
drop policy if exists "Users can insert own addresses" on public.addresses;
create policy "Users can insert own addresses" on public.addresses for insert with check (auth.uid() = user_id);

-- Verify all address policies are in place
drop policy if exists "Users can view own addresses" on public.addresses;
create policy "Users can view own addresses" on public.addresses for select using (auth.uid() = user_id);

drop policy if exists "Users can update own addresses" on public.addresses;
create policy "Users can update own addresses" on public.addresses for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own addresses" on public.addresses;
create policy "Users can delete own addresses" on public.addresses for delete using (auth.uid() = user_id);