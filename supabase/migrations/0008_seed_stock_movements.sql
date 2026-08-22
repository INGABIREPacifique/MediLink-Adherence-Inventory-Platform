-- Realistic stock movement history so the monthly report has real
-- consumption/reorder data to summarize, not just today's snapshot.
-- Without this, stock_movements is nearly empty (only what's accumulated
-- from manual Stock-In/Stock-Out clicks since the pilot started).

do $$
declare
  item record;
  day_offset int;
begin
  for item in select id, current_stock from inventory_items loop
    for day_offset in 1 .. 30 loop
      -- Daily consumption (negative delta), skew larger for high-turnover items
      if random() < 0.7 then
        insert into stock_movements (item_id, delta, logged_at)
        values (item.id, -(1 + floor(random() * 5))::int, now() - (day_offset || ' days')::interval);
      end if;
      -- Occasional restock (positive delta)
      if random() < 0.1 then
        insert into stock_movements (item_id, delta, logged_at)
        values (item.id, (20 + floor(random() * 40))::int, now() - (day_offset || ' days')::interval);
      end if;
    end loop;
  end loop;
end $$;
