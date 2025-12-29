-- Updated RLS policies for addresses table that work with service role
-- Drop existing policies
drop policy if exists "Users can view own addresses" on public.addresses;
drop policy if exists "Users can insert own addresses" on public.addresses;
drop policy if exists "Users can update own addresses" on public.addresses;  
drop policy if exists "Users can delete own addresses" on public.addresses;

-- Create new policies that work with both authenticated users and service role
create policy "Users can view own addresses" on public.addresses 
for select using (
  auth.uid() = user_id 
  OR auth.role() = 'service_role'
);

create policy "Users can insert own addresses" on public.addresses 
for insert with check (
  auth.uid() = user_id 
  OR auth.role() = 'service_role'
);

create policy "Users can update own addresses" on public.addresses 
for update using (
  auth.uid() = user_id 
  OR auth.role() = 'service_role'
);

create policy "Users can delete own addresses" on public.addresses 
for delete using (
  auth.uid() = user_id 
  OR auth.role() = 'service_role'
);