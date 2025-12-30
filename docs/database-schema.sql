-- =====================================================
-- LOTTO PREDICT MASTER - DATABASE SCHEMA
-- =====================================================
-- Table for storing all lottery draws
-- Note: National room may not have machine_numbers (can be empty array)

CREATE TABLE lotto_draws (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Draw date (selected via datepicker)
  draw_date DATE NOT NULL,
  
  -- Room name (ex: 'Special Weekend 1h', 'Awale', 'Prestige', 'National')
  room_name TEXT NOT NULL,
  
  -- 5 winning numbers stored as integer array
  winning_numbers INTEGER[] NOT NULL CHECK (array_length(winning_numbers, 1) = 5),
  
  -- 5 machine numbers stored as integer array
  -- Can be empty for National room (length 0 or 5)
  machine_numbers INTEGER[] NOT NULL CHECK (
    array_length(machine_numbers, 1) = 0 OR 
    array_length(machine_numbers, 1) = 5
  ),
  
  -- Unique constraint: one room can only play once per day
  UNIQUE (draw_date, room_name)
);

-- Indexes for fast searches
CREATE INDEX idx_lotto_winning ON lotto_draws USING GIN (winning_numbers);
CREATE INDEX idx_lotto_machine ON lotto_draws USING GIN (machine_numbers);
CREATE INDEX idx_lotto_date ON lotto_draws (draw_date DESC);
CREATE INDEX idx_lotto_room ON lotto_draws (room_name);

-- =====================================================
-- MIGRATION: Update existing table
-- =====================================================
-- If the table already exists, run this to update the constraint:

ALTER TABLE lotto_draws 
DROP CONSTRAINT IF EXISTS lotto_draws_machine_numbers_check;

ALTER TABLE lotto_draws 
ADD CONSTRAINT lotto_draws_machine_numbers_check 
CHECK (
  array_length(machine_numbers, 1) = 0 OR 
  array_length(machine_numbers, 1) = 5
);
