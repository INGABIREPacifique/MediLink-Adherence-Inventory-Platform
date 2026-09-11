-- Enables a real 5-step tracking timeline on the Request Detail page
-- (Submitted -> Approved -> Dispatched -> In Transit -> Arrived), matching
-- the original design. Without these columns, RequestDetail.tsx could
-- only honestly show 4 steps (no separate "Dispatched" moment existed to
-- record), since inventing a timestamp for an event nobody logged would
-- have been exactly the kind of fabrication this project avoids elsewhere.

alter table replenishment_requests
  add column dispatched_at timestamptz,
  add column arrived_at timestamptz;

comment on column replenishment_requests.dispatched_at is
  'Set when pharmacy/logistics staff mark the shipment as physically dispatched. Distinct from reviewed_at (approval) -- a request can be approved well before it is actually put on a vehicle.';

comment on column replenishment_requests.arrived_at is
  'Set when the requesting facility/CHW confirms receipt. Distinct from status=delivered being set automatically -- this is the human confirmation timestamp.';
