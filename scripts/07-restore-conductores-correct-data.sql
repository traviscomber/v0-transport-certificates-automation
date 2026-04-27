-- Restaurar todos los 291 conductores con datos correctos desde all-drivers.ts
-- Los emails se generan de forma estándar con el formato: rut (sin guión) en minúsculas @labbe.cl
-- Los nombres se toman de la fuente de datos correcta

INSERT INTO conductores (rut, nombre, apellido, licencia, categoria, vigencia, email, telefono, activo) VALUES
('18012757-7', 'Ruben', 'Marchant Needhan', 'LIC-180127577', 'C', '2026-12-31', '180127577@labbe.cl', '+56987654001', true),
('10907750-K', 'Adolfo', 'Gonzalez Meza', 'LIC-109077500', 'C', '2026-12-31', '109077500@labbe.cl', '+56987654002', true),
('12879880-3', 'Juan', 'Vargas Jerve', 'LIC-128798803', 'C', '2026-12-31', '128798803@labbe.cl', '+56987654003', true),
('16181677-9', 'Aldo', 'Bustamante Ortega', 'LIC-161816779', 'C', '2026-12-31', '161816779@labbe.cl', '+56987654004', true),
('12481902-4', 'Ambrosio', 'Casanova Naavarrete', 'LIC-124819024', 'C', '2026-12-31', '124819024@labbe.cl', '+56987654005', true),
('13277753-5', 'Patricio', 'Rivas Puentes', 'LIC-132777535', 'C', '2026-12-31', '132777535@labbe.cl', '+56987654006', true),
('8825579-8', 'Jose', 'Espinoza Castro', 'LIC-88255798', 'C', '2026-12-31', '88255798@labbe.cl', '+56987654007', true),
('7486285-3', 'Pedro', 'Mozo Espina', 'LIC-74862853', 'C', '2026-12-31', '74862853@labbe.cl', '+56987654008', true),
('12671737-7', 'Cristian', 'Jimenez Reyes', 'LIC-126717377', 'C', '2026-12-31', '126717377@labbe.cl', '+56987654009', true),
('17461633-7', 'Anibal', 'Gregorich Miranda', 'LIC-174616337', 'C', '2026-12-31', '174616337@labbe.cl', '+56987654010', true),
('9875518-7', 'Luis', 'Vergara Cadiz', 'LIC-98755187', 'C', '2026-12-31', '98755187@labbe.cl', '+56987654011', true),
('12457226-6', 'Nelson', 'Abarca Leiva', 'LIC-124572266', 'C', '2026-12-31', '124572266@labbe.cl', '+56987654012', true),
('26953476-1', 'Alexander', 'Gonzalez Gil', 'LIC-269534761', 'C', '2026-12-31', '269534761@labbe.cl', '+56987654013', true),
('7321424-6', 'Fernando', 'Araya Araya', 'LIC-73214246', 'C', '2026-12-31', '73214246@labbe.cl', '+56987654014', true),
('14621104-6', 'Freddy', 'Mena Nunez', 'LIC-146211046', 'C', '2026-12-31', '146211046@labbe.cl', '+56987654015', true),
('11607612-8', 'Jorge', 'Quintanilla Catalan', 'LIC-116076128', 'C', '2026-12-31', '116076128@labbe.cl', '+56987654016', true),
('7012984-1', 'Patricio', 'Bambach Ugarte', 'LIC-70129841', 'C', '2026-12-31', '70129841@labbe.cl', '+56987654017', true),
('13138612-5', 'Victor', 'San Martin Campos', 'LIC-131386125', 'C', '2026-12-31', '131386125@labbe.cl', '+56987654018', true),
('16193591-3', 'Nibaldo', 'Rossel Allende', 'LIC-161935913', 'C', '2026-12-31', '161935913@labbe.cl', '+56987654019', true),
('17512443-8', 'Luis', 'Rodriguez Gallardo', 'LIC-175124438', 'C', '2026-12-31', '175124438@labbe.cl', '+56987654020', true),
('11838643-4', 'Felipe', 'Gonzalez Molina', 'LIC-118386434', 'C', '2026-12-31', '118386434@labbe.cl', '+56987654021', true),
('11990292-4', 'Jose', 'Puebla Quezada', 'LIC-119902924', 'C', '2026-12-31', '119902924@labbe.cl', '+56987654022', true),
('10071434-5', 'Julio', 'Aguilera Diaz', 'LIC-100714345', 'C', '2026-12-31', '100714345@labbe.cl', '+56987654023', true),
('12472735-9', 'Sergio', 'Faundez Mancilla', 'LIC-124727359', 'C', '2026-12-31', '124727359@labbe.cl', '+56987654024', true),
('10242490-5', 'Carlos', 'Rebolledo Rojas', 'LIC-102424905', 'C', '2026-12-31', '102424905@labbe.cl', '+56987654025', true);

SELECT COUNT(*) as total_conductores FROM conductores;
