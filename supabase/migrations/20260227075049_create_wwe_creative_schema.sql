/*
  # WWE Creative Tool Database Schema

  1. New Tables
    - `wrestlers`
      - `id` (uuid, primary key)
      - `name` (text, wrestler name)
      - `brand` (text, RAW/SmackDown/NXT)
      - `alignment` (text, Face/Heel/Tweener/Neutral)
      - `status` (text, Active/Injured/Champion)
      - `title` (text, current championship if any)
      - `bio` (text, character description)
      - `image_url` (text, photo URL)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `feuds`
      - `id` (uuid, primary key)
      - `wrestler1_id` (uuid, foreign key to wrestlers)
      - `wrestler2_id` (uuid, foreign key to wrestlers)
      - `description` (text, feud description)
      - `intensity` (text, Low/Medium/High)
      - `status` (text, Active/Resolved/On Hold)
      - `started_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `storylines`
      - `id` (uuid, primary key)
      - `title` (text, storyline title)
      - `description` (text, full storyline description)
      - `type` (text, Feud/Turn/Surprise/Reunion/Betrayal)
      - `participants` (jsonb, array of wrestler IDs involved)
      - `execution_steps` (jsonb, array of steps to execute)
      - `promos` (jsonb, array of promo ideas)
      - `key_lines` (jsonb, array of important lines)
      - `created_at` (timestamp)
      - `favorited` (boolean, user can favorite storylines)

  2. Security
    - Enable RLS on all tables
    - Allow public read access for demonstration purposes
    - Allow authenticated insert/update/delete
*/

-- Create wrestlers table
CREATE TABLE IF NOT EXISTS wrestlers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL DEFAULT 'RAW',
  alignment text NOT NULL DEFAULT 'Face',
  status text NOT NULL DEFAULT 'Active',
  title text,
  bio text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create feuds table
CREATE TABLE IF NOT EXISTS feuds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wrestler1_id uuid REFERENCES wrestlers(id) ON DELETE CASCADE,
  wrestler2_id uuid REFERENCES wrestlers(id) ON DELETE CASCADE,
  description text,
  intensity text DEFAULT 'Medium',
  status text DEFAULT 'Active',
  started_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create storylines table
CREATE TABLE IF NOT EXISTS storylines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL,
  participants jsonb DEFAULT '[]'::jsonb,
  execution_steps jsonb DEFAULT '[]'::jsonb,
  promos jsonb DEFAULT '[]'::jsonb,
  key_lines jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  favorited boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE wrestlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE feuds ENABLE ROW LEVEL SECURITY;
ALTER TABLE storylines ENABLE ROW LEVEL SECURITY;

-- Create policies for access
CREATE POLICY "Allow public read access to wrestlers"
  ON wrestlers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert wrestlers"
  ON wrestlers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update wrestlers"
  ON wrestlers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete wrestlers"
  ON wrestlers FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow public read access to feuds"
  ON feuds FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert feuds"
  ON feuds FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update feuds"
  ON feuds FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete feuds"
  ON feuds FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow public read access to storylines"
  ON storylines FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert storylines"
  ON storylines FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update storylines"
  ON storylines FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete storylines"
  ON storylines FOR DELETE
  TO authenticated
  USING (true);

-- Insert some sample WWE roster data
INSERT INTO wrestlers (name, brand, alignment, status, title, bio, image_url) VALUES
  ('Roman Reigns', 'SmackDown', 'Heel', 'Active', 'Undisputed WWE Universal Champion', 'The Tribal Chief, Head of the Table', 'https://www.thesmackdownhotel.com/images/wrestling/wrestlers/r/roman-reigns-2024-new.png'),
  ('Cody Rhodes', 'RAW', 'Face', 'Active', NULL, 'The American Nightmare, finishing the story', 'https://www.thesmackdownhotel.com/images/wrestling/wrestlers/c/cody-rhodes-2025.png'),
  ('Seth Rollins', 'RAW', 'Face', 'Active', 'World Heavyweight Champion', 'The Visionary, architect of change', 'https://www.thesmackdownhotel.com/images/wrestling/wrestlers/s/seth-rollins-2024.png'),
  ('Becky Lynch', 'RAW', 'Face', 'Active', NULL, 'The Man, trailblazer of womens wrestling', 'https://www.thesmackdownhotel.com/images/wrestling/wrestlers/b/becky-lynch-2025.png'),
  ('Rhea Ripley', 'RAW', 'Heel', 'Active', 'Womens World Champion', 'Mami, dominant force in the division', 'https://www.thesmackdownhotel.com/images/wrestling/wrestlers/r/rhea-ripley-2025.png'),
  ('Jey Uso', 'RAW', 'Face', 'Active', NULL, 'Main Event Jey Uso, breaking free from the Bloodline', 'https://www.thesmackdownhotel.com/images/wrestling/wrestlers/j/jey-uso-2025.png'),
  ('Gunther', 'RAW', 'Heel', 'Active', 'Intercontinental Champion', 'The Ring General, technical master', 'https://www.thesmackdownhotel.com/images/wrestling/wrestlers/g/gunther-2026.png'),
  ('Bianca Belair', 'SmackDown', 'Face', 'Active', NULL, 'The EST, strongest and fastest', 'https://www.thesmackdownhotel.com/images/wrestling/wrestlers/b/bianca-belair-2025.png'),
  ('LA Knight', 'SmackDown', 'Face', 'Active', 'United States Champion', 'YEAH! Megastar on the rise', 'https://www.thesmackdownhotel.com/images/wrestling/wrestlers/l/la-knight-2025.png'),
  ('Bayley', 'SmackDown', 'Heel', 'Active', NULL, 'Role Model, leader of Damage CTRL', 'https://www.thesmackdownhotel.com/images/wrestling/wrestlers/b/bayley-2025.png'),
  ('Drew McIntyre', 'SmackDown', 'Heel', 'Active', NULL, 'The Scottish Warrior, seeking redemption', 'https://www.thesmackdownhotel.com/images/wrestling/wrestlers/d/drew-mcintyre-2025.png'),
  ('Charlotte Flair', 'SmackDown', 'Face', 'Injured', NULL, 'The Queen, genetically superior', 'https://www.thesmackdownhotel.com/images/wrestling/wrestlers/c/charlotte-flair-2025.png'),
  ('Kevin Owens', 'SmackDown', 'Heel', 'Injured', NULL, 'The Prizefighter, fighting for whats right', 'https://www.thesmackdownhotel.com/images/wrestling/wrestlers/k/kevin-owens-2024-2.png'),
  ('CM Punk', 'RAW', 'Face', 'Active', 'World Heavyweight Championship', 'The Best in the World, controversial return', 'https://www.thesmackdownhotel.com/images/wrestling/wrestlers/c/cm-punk-2025.png'),
  ('Damian Priest', 'RAW', 'Face', 'Active', NULL, 'The Punisher, Judgment Day enforcer', 'https://www.thesmackdownhotel.com/images/wrestling/wrestlers/d/damian-priest-2024.png');

-- Insert some current feuds
INSERT INTO feuds (wrestler1_id, wrestler2_id, description, intensity, status) 
SELECT 
  w1.id, 
  w2.id, 
  'The Tribal Chief defends his legacy against The American Nightmare',
  'High',
  'Active'
FROM wrestlers w1, wrestlers w2 
WHERE w1.name = 'Roman Reigns' AND w2.name = 'Cody Rhodes';

INSERT INTO feuds (wrestler1_id, wrestler2_id, description, intensity, status) 
SELECT 
  w1.id, 
  w2.id, 
  'Championship rivalry between two dominant forces',
  'High',
  'Active'
FROM wrestlers w1, wrestlers w2 
WHERE w1.name = 'Rhea Ripley' AND w2.name = 'Becky Lynch';
