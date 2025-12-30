-- =====================================================
-- MIGRATION ONLY: Update existing lotto_draws table
-- =====================================================
-- Run this if the table already exists

-- Step 1: Drop the old constraint
ALTER TABLE lotto_draws 
DROP CONSTRAINT IF EXISTS lotto_draws_machine_numbers_check;

-- Step 2: Add the new constraint that allows 0 or 5 machine numbers
ALTER TABLE lotto_draws 
ADD CONSTRAINT lotto_draws_machine_numbers_check 
CHECK (
  array_length(machine_numbers, 1) = 0 OR 
  array_length(machine_numbers, 1) = 5
);

-- Verify the update worked
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'lotto_draws_machine_numbers_check';
