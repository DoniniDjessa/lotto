-- =====================================================
-- NOUVELLE ARCHITECTURE - Par Jour au lieu de Par Room
-- =====================================================
-- Chaque jour = UNE seule entrée dans la base de données
-- Toutes les rooms d'un jour sont stockées dans un seul objet JSON

DROP TABLE IF EXISTS lotto_draws;

CREATE TABLE lotto_draws (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Date du tirage (UNIQUE - une seule entrée par jour)
  draw_date DATE NOT NULL UNIQUE,
  
  -- Toutes les rooms du jour stockées en JSON
  -- Structure: { "room_name": { "winning_numbers": [1,2,3,4,5], "machine_numbers": [6,7,8,9,10] } }
  rooms JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Index pour recherche rapide par date
CREATE INDEX idx_lotto_date ON lotto_draws (draw_date DESC);

-- Index GIN pour recherche dans le JSON
CREATE INDEX idx_lotto_rooms ON lotto_draws USING GIN (rooms);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lotto_draws_updated_at 
  BEFORE UPDATE ON lotto_draws 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Exemple de données
-- =====================================================
-- Pour le 25/12/2025 avec 3 rooms:
/*
INSERT INTO lotto_draws (draw_date, rooms) VALUES (
  '2025-12-25',
  '{
    "Digital Reveil 7h": {
      "winning_numbers": [38, 78, 52, 12, 39],
      "machine_numbers": [45, 84, 75, 4, 59]
    },
    "Awale": {
      "winning_numbers": [12, 45, 67, 23, 89],
      "machine_numbers": [34, 56, 78, 90, 12]
    },
    "National": {
      "winning_numbers": [5, 15, 25, 35, 45],
      "machine_numbers": []
    }
  }'::jsonb
);
*/

-- =====================================================
-- Requêtes utiles
-- =====================================================

-- Récupérer toutes les dates
SELECT draw_date, jsonb_object_keys(rooms) as room_count 
FROM lotto_draws 
ORDER BY draw_date DESC;

-- Récupérer un jour spécifique
SELECT * FROM lotto_draws WHERE draw_date = '2025-12-25';

-- Mettre à jour / ajouter une room à un jour existant
UPDATE lotto_draws 
SET rooms = rooms || '{"New Room": {"winning_numbers": [1,2,3,4,5], "machine_numbers": [6,7,8,9,10]}}'::jsonb
WHERE draw_date = '2025-12-25';

-- Supprimer un jour complet
DELETE FROM lotto_draws WHERE draw_date = '2025-12-25';

-- =====================================================
-- Avantages de cette structure
-- =====================================================
-- ✅ Un seul row par jour (facile à supprimer)
-- ✅ Insertion/Update atomique (pas de doublons)
-- ✅ Flexible pour ajouter des rooms
-- ✅ Performance: moins de rows à scanner
-- ✅ Gestion de conflits simplifiée
