/*
  # WWE Creative Tool Database Schema

  1. New Tables
    - `wrestlers`
      - `id` (uuid, primary key)
      - `name` (text, wrestler name)
      - `brand` (text, RAW/SmackDown/NXT)
      - `alignment` (text, Face/Heel/Tweener)
      - `status` (text, Active/Injured/Champion)
      - `title` (text, current championship if any)
      - `bio` (text, character description)
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
      - `created_at` (timestamp)
      - `favorited` (boolean, user can favorite storylines)

  2. Security
    - Enable RLS on all tables
    - Allow public read access for demonstration purposes
    - Allow public insert/update for creative tool functionality
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
  created_at timestamptz DEFAULT now(),
  favorited boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE wrestlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE feuds ENABLE ROW LEVEL SECURITY;
ALTER TABLE storylines ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (creative tool)
CREATE POLICY "Allow public read access to wrestlers"
  ON wrestlers FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert wrestlers"
  ON wrestlers FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update wrestlers"
  ON wrestlers FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete wrestlers"
  ON wrestlers FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to feuds"
  ON feuds FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert feuds"
  ON feuds FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update feuds"
  ON feuds FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete feuds"
  ON feuds FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to storylines"
  ON storylines FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert storylines"
  ON storylines FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update storylines"
  ON storylines FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete storylines"
  ON storylines FOR DELETE
  TO anon
  USING (true);

-- Insert some sample WWE roster data
INSERT INTO wrestlers (name, brand, alignment, status, title, bio) VALUES
  ('Roman Reigns', 'SmackDown', 'Heel', 'Active', 'Undisputed WWE Universal Champion', 'The Tribal Chief, Head of the Table'),
  ('Cody Rhodes', 'RAW', 'Face', 'Active', NULL, 'The American Nightmare, finishing the story'),
  ('Seth Rollins', 'RAW', 'Face', 'Active', 'World Heavyweight Champion', 'The Visionary, architect of change'),
  ('Becky Lynch', 'RAW', 'Face', 'Active', NULL, 'The Man, trailblazer of womens wrestling'),
  ('Rhea Ripley', 'RAW', 'Heel', 'Active', 'Womens World Champion', 'Mami, dominant force in the division'),
  ('Jey Uso', 'RAW', 'Face', 'Active', NULL, 'Main Event Jey Uso, breaking free from the Bloodline'),
  ('Gunther', 'RAW', 'Heel', 'Active', 'Intercontinental Champion', 'The Ring General, technical master'),
  ('Bianca Belair', 'SmackDown', 'Face', 'Active', NULL, 'The EST, strongest and fastest'),
  ('LA Knight', 'SmackDown', 'Face', 'Active', 'United States Champion', 'YEAH! Megastar on the rise'),
  ('Bayley', 'SmackDown', 'Heel', 'Active', NULL, 'Role Model, leader of Damage CTRL'),
  ('Drew McIntyre', 'SmackDown', 'Tweener', 'Active', NULL, 'The Scottish Warrior, seeking redemption'),
  ('Charlotte Flair', 'SmackDown', 'Heel', 'Injured', NULL, 'The Queen, genetically superior'),
  ('Kevin Owens', 'SmackDown', 'Face', 'Active', NULL, 'The Prizefighter, fighting for whats right'),
  ('CM Punk', 'RAW', 'Tweener', 'Active', NULL, 'The Best in the World, controversial return'),
  ('Damian Priest', 'RAW', 'Heel', 'Active', NULL, 'The Punisher, Judgment Day enforcer');

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
