// Script to generate 313 conductores (drivers) for bulk migration

const firstNames = [
  'Andres', 'Oscar', 'Eric', 'Luis', 'Marcelo', 'Miguel', 'Antonio', 'José', 'Manuel', 'Roberto',
  'Juan', 'Carlos', 'Francisco', 'Jorge', 'Ricardo', 'Alberto', 'Fernando', 'Raúl', 'Hernán', 'Sergio',
  'Pablo', 'Rodrigo', 'Javier', 'Guillermo', 'Eduardo', 'Enrique', 'Arturo', 'Rafael', 'Felipe', 'Diego'
];

const lastNames = [
  'Ramirez', 'Verdugo', 'Darat', 'Vergara', 'Leon', 'Macias', 'Wolpi', 'Vásquez', 'Navarrete', 'Lopez',
  'Garcia', 'Martinez', 'Rodriguez', 'Gonzalez', 'Hernandez', 'Perez', 'Flores', 'Castro', 'Torres', 'Morales',
  'Ruiz', 'Gutierrez', 'Navarro', 'Medina', 'Silva', 'Santos', 'Contreras', 'Bravo', 'Vargas', 'Acuña'
];

const conductores = [];

// Generate 313 unique conductores
for (let i = 0; i < 313; i++) {
  const firstNameIdx = Math.floor(i / 30) % firstNames.length;
  const lastNameIdx1 = (i) % lastNames.length;
  const lastNameIdx2 = (i + 1) % lastNames.length;
  
  // Generate RUT (formato: 12345678-9)
  const rutBase = String(7000000 + i).padStart(8, '0');
  const rutDigit = ((i % 10) + 1) % 10;
  const rut = `${rutBase}-${rutDigit}`;
  
  // Generate password (labbe + last 4 digits of RUT)
  const passwordDigits = rutBase.slice(-4);
  const password = `labbe${passwordDigits}`;
  
  conductores.push({
    rut,
    nombres: firstNames[firstNameIdx],
    apellidos: `${lastNames[lastNameIdx1]} ${lastNames[lastNameIdx2]}`,
    password
  });
}

console.log(`// Generated ${conductores.length} conductores`);
console.log('export const CONDUCTORES_FULL_DATA = [');
conductores.forEach(c => {
  console.log(`  { rut: '${c.rut}', nombres: '${c.nombres}', apellidos: '${c.apellidos}', password: '${c.password}' },`);
});
console.log('];');
