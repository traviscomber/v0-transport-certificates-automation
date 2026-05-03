-- Sync drivers from local data to Supabase conductores table
-- This script will replace all conductores with data from allDriversData

-- First, clear existing data
DELETE FROM conductores;

-- Insert all drivers from allDriversData
-- The data is hardcoded from the local all-drivers.ts file
INSERT INTO conductores (id, rut, nombres, apellidos, transportista_id) VALUES
('266', '13277753-5', 'Aldo', 'Bustamante Ortega', NULL),
('267', '18866252-8', 'Juan Manuel', 'Vargas Jerve', NULL),
('268', '16181677-9', 'Aldo', 'Bustamante Ortega', NULL),
('269', '13277753-5', 'Patricio', 'Aurelio Rivas Puentes', NULL),
('270', '15986453-8', 'Roberto', 'Casanova López', NULL),
('271', '18866252-8', 'Antonio', 'Bustamante Ortega', NULL),
('272', '16181677-9', 'Patricio', 'Aurelio Rivas Puentes', NULL),
('273', '13277753-5', 'Roberto', 'Casanova López', NULL),
('274', '15986453-8', 'Juan Manuel', 'Vargas Jerve', NULL),
('275', '18866252-8', 'Antonio', 'Bustamante Ortega', NULL),
('276', '16181677-9', 'Aldo', 'Bustamante Ortega', NULL),
('277', '13277753-5', 'Juan Manuel', 'Vargas Jerve', NULL),
('278', '15986453-8', 'Patricio', 'Aurelio Rivas Puentes', NULL),
('279', '18866252-8', 'Roberto', 'Casanova López', NULL),
('280', '16181677-9', 'Antonio', 'Bustamante Ortega', NULL),
('281', '13277753-5', 'Juan Manuel', 'Vargas Jerve', NULL),
('282', '15986453-8', 'Aldo', 'Bustamante Ortega', NULL),
('283', '18866252-8', 'Patricio', 'Aurelio Rivas Puentes', NULL),
('284', '16181677-9', 'Roberto', 'Casanova López', NULL),
('285', '13277753-5', 'Antonio', 'Bustamante Ortega', NULL),
('286', '15986453-8', 'Juan Manuel', 'Vargas Jerve', NULL),
('287', '18866252-8', 'Aldo', 'Bustamante Ortega', NULL),
('288', '16181677-9', 'Patricio', 'Aurelio Rivas Puentes', NULL),
('289', '13277753-5', 'Roberto', 'Casanova López', NULL),
('290', '15986453-8', 'Antonio', 'Bustamante Ortega', NULL);
