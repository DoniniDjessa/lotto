# National Room - Machine Numbers Update

## Summary

Updated the application to handle the "National" room which sometimes doesn't have machine numbers.

## Changes Made

### 1. **Database Schema** (`docs/database-schema.sql`)

- Updated `machine_numbers` constraint to allow empty arrays (length 0) OR exactly 5 numbers
- Added migration script to update existing tables

```sql
CHECK (
  array_length(machine_numbers, 1) = 0 OR
  array_length(machine_numbers, 1) = 5
)
```

### 2. **Zod Schema** (`lib/schemas.ts`)

- Modified `DrawEntrySchema` to accept either empty array or 5 numbers for `machine_numbers`
- Added refinement validation with clear error message

### 3. **AI Prompt** (`app/actions/import-draws.ts`)

- Updated AI instructions to handle National room specially
- AI now returns empty array `[]` for machine_numbers when National room has no machine numbers
- Other rooms still require exactly 5 machine numbers

### 4. **UI Display** (`components/draws-history.tsx`)

- Added conditional rendering for machine numbers section
- Shows machine numbers only when array is not empty
- Displays "Pas de numéros machine pour cette room" message when empty

### 5. **Form Placeholder** (`components/import-sidebar.tsx`)

- Updated example to show National room without machine numbers
- Updated help text to clarify:
  - National room may not have machine numbers
  - Other rooms require 5 machine numbers

## Business Rules

✅ **All Rooms**: Must have exactly 5 winning numbers

✅ **National Room**:

- May have 0 machine numbers (empty array)
- May have 5 machine numbers (when provided)

✅ **Other Rooms** (Awale, Prestige, Special Weekend, etc.):

- Must have exactly 5 machine numbers

## Database Migration

If you already have a table created, run this in Supabase SQL Editor:

```sql
ALTER TABLE lotto_draws
DROP CONSTRAINT IF EXISTS lotto_draws_machine_numbers_check;

ALTER TABLE lotto_draws
ADD CONSTRAINT lotto_draws_machine_numbers_check
CHECK (
  array_length(machine_numbers, 1) = 0 OR
  array_length(machine_numbers, 1) = 5
);
```

## Testing

Test with data like:

```
National
Gagnants : 5 15 25 35 45

National
Gagnants : 10 20 30 40 50
Machine : 12 22 32 42 52

Awale
Gagnants : 8 18 28 38 48
Machine : 7 17 27 37 47
```

All three cases should now work correctly! ✅
