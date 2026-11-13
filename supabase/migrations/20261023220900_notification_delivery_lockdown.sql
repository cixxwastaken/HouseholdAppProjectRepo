-- notification_deliveries is written only by the privileged reminder function.
-- Keep it invisible and immutable to all Data API clients.
create policy "no client access to notification deliveries"
on public.notification_deliveries
for all
using (false)
with check (false);
