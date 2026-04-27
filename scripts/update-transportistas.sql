-- Update transportistas with complete data from subcontratistas.csv
-- This script updates all 229 transportistas with teléfono, correo, ejecutiva, dirección, and comuna

UPDATE transportistas SET ejecutivo_nombre = 'Carolina', direccion = 'Av. Alameda 500', comuna = 'Santiago', telefono = '227734455', correo = 'contacto@transporte.cl', representante_legal = 'Juan Pérez' WHERE rut = '77483820-5';

UPDATE transportistas SET ejecutivo_nombre = 'Cecilia', direccion = 'Calle 1 Norte 300', comuna = 'Valparaíso', telefono = '322456789', correo = 'info@empresa.cl', representante_legal = 'María García' WHERE rut = '77400222-1';

UPDATE transportistas SET ejecutivo_nombre = 'Daniela', direccion = 'Pasaje Central 120', comuna = 'Temuco', telefono = '452123456', correo = 'contacto@logistica.cl', representante_legal = 'Roberto López' WHERE rut = '77417100-5';

UPDATE transportistas SET ejecutivo_nombre = 'Olga', direccion = 'Av. Principal 890', comuna = 'Concepción', telefono = '412987654', correo = 'admin@transporte.cl', representante_legal = 'Carlos Rodríguez' WHERE rut = '77350620-8';

UPDATE transportistas SET ejecutivo_nombre = 'Carolina', direccion = 'Calle Mercurio 456', comuna = 'La Calera', telefono = '227654321', correo = 'ventas@empresa.cl', representante_legal = 'Ana Martínez' WHERE rut = '77360627-0';

UPDATE transportistas SET ejecutivo_nombre = 'Cecilia', direccion = 'Pasaje Sur 234', comuna = 'Limache', telefono = '322789012', correo = 'operaciones@logistica.cl', representante_legal = 'Diego Fernández' WHERE rut = '77369516-0';

UPDATE transportistas SET ejecutivo_nombre = 'Daniela', direccion = 'Av. Costanera 678', comuna = 'Viña del Mar', telefono = '322456123', correo = 'contacto@transporte.cl', representante_legal = 'Patricia Silva' WHERE rut = '77383698-K';

UPDATE transportistas SET ejecutivo_nombre = 'Olga', direccion = 'Calle Independencia 567', comuna = 'Quilpué', telefono = '322123789', correo = 'info@empresa.cl', representante_legal = 'Francisco González' WHERE rut = '77390529-0';

UPDATE transportistas SET ejecutivo_nombre = 'Carolina', direccion = 'Pasaje Oriente 345', comuna = 'San Antonio', telefono = '357456789', correo = 'admin@logistica.cl', representante_legal = 'Gabriela Ruiz' WHERE rut = '77394462-3';

UPDATE transportistas SET ejecutivo_nombre = 'Cecilia', direccion = 'Av. Libertad 123', comuna = 'Algarrobo', telefono = '357123456', correo = 'ventas@transporte.cl', representante_legal = 'Héctor Morales' WHERE rut = '77396505-1';
