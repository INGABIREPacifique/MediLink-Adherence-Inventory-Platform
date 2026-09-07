-- Adds the role needed for the Ministry tier (11 mock screens under
-- /ministry/*). Kept as its own migration: Postgres doesn't allow a newly
-- added enum value to be referenced by policies in the same transaction
-- it was added in, so this must run and commit before 0019 uses it.

alter type user_role add value 'ministry';
