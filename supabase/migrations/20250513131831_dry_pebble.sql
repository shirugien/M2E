/*
  # Forms and Users Schema

  1. New Tables
    - `contact_submissions`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `subject` (text)
      - `message` (text)
      - `created_at` (timestamp)
      - `status` (text)

    - `admission_requests`
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `email` (text)
      - `phone` (text)
      - `program` (text)
      - `education_level` (text)
      - `motivation` (text)
      - `created_at` (timestamp)
      - `status` (text)

    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `preferences` (jsonb)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Contact form submissions
CREATE TABLE contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending'
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for all users" ON contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for authenticated users" ON contact_submissions
  FOR SELECT TO authenticated
  USING (true);

-- Admission requests
CREATE TABLE admission_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  program text NOT NULL,
  education_level text NOT NULL,
  motivation text,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending'
);

ALTER TABLE admission_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for all users" ON admission_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for authenticated users" ON admission_requests
  FOR SELECT TO authenticated
  USING (true);

-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  preferences jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for all users" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for authenticated users" ON newsletter_subscribers
  FOR SELECT TO authenticated
  USING (true);