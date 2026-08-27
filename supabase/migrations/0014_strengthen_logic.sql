-- Logic-correctness fixes found on review, not new features:
--
--   1. inventoryService.logUsage() was read-then-write from the client
--      (fetch current_stock, compute new value in JS, write it back).
--      Two people logging stock at the same moment could race and one
--      update silently overwrites the other. Replaced with an atomic
--      Postgres function -- the increment happens in a single statement,
--      no race window.
--
--   2. No database-level guarantee against duplicate escalations for the
--      same missed dose/appointment -- the engine functions only check
--      "not exists" before inserting, which is technically racy if the
--      cron job were ever triggered twice concurrently. Added real unique
--      constraints as defense in depth, not just application logic.
--
--   3. chw_training_progress had an INSERT policy but no UPDATE policy --
--      the frontend uses .upsert(), which needs UPDATE permission for the
--      conflict-resolution path. Currently never triggered in practice
--      (the UI only calls it once per module), but it was a real gap that
--      would surface as a confusing RLS error the moment it was needed.

-- ---------- 1. Atomic stock update ----------

create or replace function log_stock_usage(p_item_id uuid, p_delta int)
returns inventory_items as $$
declare
  updated_row inventory_items;
  new_status stock_status;
begin
  update inventory_items
  set current_stock = greatest(0, current_stock + p_delta),
      last_logged_at = now()
  where id = p_item_id
  returning * into updated_row;

  if updated_row is null then
    raise exception 'Inventory item % not found', p_item_id;
  end if;

  new_status := case
    when updated_row.current_stock <= updated_row.reorder_threshold * 0.5 then 'critical'
    when updated_row.current_stock <= updated_row.reorder_threshold then 'warning'
    when updated_row.current_stock <= updated_row.reorder_threshold * 1.5 then 'adequate'
    else 'healthy'
  end;

  update inventory_items set status = new_status where id = p_item_id
  returning * into updated_row;

  insert into stock_movements (item_id, delta) values (p_item_id, p_delta);

  return updated_row;
end;
$$ language plpgsql security definer;

-- ---------- 2. Defense-in-depth uniqueness ----------

create unique index if not exists escalations_dose_reminder_unique
  on escalations (dose_reminder_id) where dose_reminder_id is not null;
create unique index if not exists escalations_appointment_unique
  on escalations (appointment_id) where appointment_id is not null;

-- ---------- 3. Fix missing UPDATE policy ----------

create policy "CHW updates own training progress" on chw_training_progress
  for update using (chw_id = auth.uid());
