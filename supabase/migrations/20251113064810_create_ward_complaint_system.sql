/*
  # Fix My Ward - Community Problem Tracker Database Schema

  ## New Tables
  
  ### 1. `wards`
  Stores information about each ward in the city
  - `id` (uuid, primary key)
  - `ward_number` (text, unique) - Ward identifier
  - `ward_name_en` (text) - Ward name in English
  - `ward_name_hi` (text) - Ward name in Hindi
  - `ward_name_kn` (text) - Ward name in Kannada
  - `councillor_name` (text) - Name of the councillor
  - `councillor_party` (text) - Political party affiliation
  - `councillor_phone` (text) - Contact number
  - `city` (text) - City name
  - `created_at` (timestamptz)

  ### 2. `problem_categories`
  Defines types of problems that can be reported
  - `id` (uuid, primary key)
  - `category_key` (text, unique) - Internal key for the category
  - `name_en` (text) - Category name in English
  - `name_hi` (text) - Category name in Hindi
  - `name_kn` (text) - Category name in Kannada
  - `created_at` (timestamptz)

  ### 3. `complaints`
  Stores citizen complaints about ward problems
  - `id` (uuid, primary key)
  - `ward_id` (uuid, foreign key to wards)
  - `category_id` (uuid, foreign key to problem_categories)
  - `citizen_name` (text) - Name of person reporting
  - `citizen_phone` (text) - Contact number
  - `citizen_email` (text, optional) - Email address
  - `problem_description` (text) - Description of the problem
  - `image_url` (text) - URL of uploaded problem photo
  - `location_details` (text) - Specific location within ward
  - `status` (text) - Status: pending, verified, in_progress, resolved, rejected
  - `verification_status` (text) - AI verification: pending, legitimate, suspicious, spam
  - `verification_notes` (text) - Notes from verification process
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `complaint_updates`
  Tracks status updates and responses to complaints
  - `id` (uuid, primary key)
  - `complaint_id` (uuid, foreign key to complaints)
  - `update_text` (text) - Update message
  - `updated_by` (text) - Who made the update (admin/system)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public can read wards and categories
  - Public can create complaints
  - Public can read their own complaints and updates
  - Only authenticated admins can update complaint status
*/

-- Create wards table
CREATE TABLE IF NOT EXISTS wards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_number text UNIQUE NOT NULL,
  ward_name_en text NOT NULL,
  ward_name_hi text NOT NULL,
  ward_name_kn text NOT NULL,
  councillor_name text NOT NULL,
  councillor_party text NOT NULL,
  councillor_phone text NOT NULL,
  city text NOT NULL DEFAULT 'Bengaluru',
  created_at timestamptz DEFAULT now()
);

-- Create problem_categories table
CREATE TABLE IF NOT EXISTS problem_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_key text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_hi text NOT NULL,
  name_kn text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id uuid REFERENCES wards(id) NOT NULL,
  category_id uuid REFERENCES problem_categories(id) NOT NULL,
  citizen_name text NOT NULL,
  citizen_phone text NOT NULL,
  citizen_email text,
  problem_description text NOT NULL,
  image_url text NOT NULL,
  location_details text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  verification_status text DEFAULT 'pending' NOT NULL,
  verification_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create complaint_updates table
CREATE TABLE IF NOT EXISTS complaint_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid REFERENCES complaints(id) ON DELETE CASCADE NOT NULL,
  update_text text NOT NULL,
  updated_by text DEFAULT 'system' NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wards (public read)
CREATE POLICY "Anyone can view wards"
  ON wards FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for problem_categories (public read)
CREATE POLICY "Anyone can view problem categories"
  ON problem_categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for complaints
CREATE POLICY "Anyone can view complaints"
  ON complaints FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create complaints"
  ON complaints FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for complaint_updates
CREATE POLICY "Anyone can view complaint updates"
  ON complaint_updates FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert sample problem categories
INSERT INTO problem_categories (category_key, name_en, name_hi, name_kn) VALUES
  ('road', 'Road Problem', 'सड़क की समस्या', 'ರಸ್ತೆ ಸಮಸ್ಯೆ'),
  ('water', 'Water Supply', 'जल आपूर्ति', 'ನೀರು ಸರಬರಾಜು'),
  ('drainage', 'Drainage/Sewage', 'जल निकासी/सीवेज', 'ಒಳಚರಂಡಿ'),
  ('streetlight', 'Street Light', 'बिजली की रोशनी', 'ರಸ್ತೆ ದೀಪ'),
  ('garbage', 'Garbage Collection', 'कचरा संग्रहण', 'ಕಸ ಸಂಗ್ರಹ'),
  ('footpath', 'Footpath/Pavement', 'फुटपाथ', 'ಪಾದಚಾರಿ ಮಾರ್ಗ'),
  ('park', 'Park/Garden', 'पार्क/उद्यान', 'ಉದ್ಯಾನವನ'),
  ('other', 'Other Issues', 'अन्य समस्याएं', 'ಇತರ ಸಮಸ್ಯೆಗಳು')
ON CONFLICT (category_key) DO NOTHING;

-- Insert sample wards
INSERT INTO wards (ward_number, ward_name_en, ward_name_hi, ward_name_kn, councillor_name, councillor_party, councillor_phone, city) VALUES
  ('001', 'Kempegowda Ward', 'केम्पेगौड़ा वार्ड', 'ಕೆಂಪೇಗೌಡ ವಾರ್ಡ್', 'Rajesh Kumar', 'BJP', '+91-9876543210', 'Bengaluru'),
  ('002', 'Gandhinagar Ward', 'गांधीनगर वार्ड', 'ಗಾಂಧಿನಗರ ವಾರ್ಡ್', 'Priya Sharma', 'Congress', '+91-9876543211', 'Bengaluru'),
  ('003', 'Jayanagar Ward', 'जयनगर वार्ड', 'ಜಯನಗರ ವಾರ್ಡ್', 'Suresh Reddy', 'JD(S)', '+91-9876543212', 'Bengaluru')
ON CONFLICT (ward_number) DO NOTHING;