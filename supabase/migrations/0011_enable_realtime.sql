-- Required for Supabase Realtime (postgres_changes) to actually stream
-- INSERT events on this table -- without this, the notification bell's
-- websocket subscription connects but never receives anything.
alter publication supabase_realtime add table escalations;
