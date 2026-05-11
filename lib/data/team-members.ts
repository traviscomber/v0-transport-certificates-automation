export interface TeamMember {
  id: string
  nombre_completo: string
  rut: string
  cargo: string
  telefono: string
  email: string
}

export const allTeamMembers: TeamMember[] = [
  {
    id: '1',
    nombre_completo: 'Olga Lydia Carrasco Olivares',
    rut: '10574005-0',
    cargo: 'Ejecutiva',
    telefono: '569 77764753',
    email: 'ocarrasco@labbe.cl'
  },
  {
    id: '2',
    nombre_completo: 'Carolina Pilar Sepulveda Contreras',
    rut: '15464094-0',
    cargo: 'Ejecutiva',
    telefono: '569 50067666',
    email: 'csepulveda@labbe.cl'
  },
  {
    id: '3',
    nombre_completo: 'Daniela Constanza Silva Rojas',
    rut: '17768246-2',
    cargo: 'Ejecutiva',
    telefono: '569 78540722',
    email: 'dsilva@labbe.cl'
  },
  {
    id: '4',
    nombre_completo: 'Javiera Ayala Rodríguez',
    rut: '18450987-1',
    cargo: 'Ejecutiva',
    telefono: '569 87654321',
    email: 'jayala@labbe.cl'
  },
  {
    id: '5',
    nombre_completo: 'Katherinne Johanna Canales Hernandez',
    rut: '18717311-6',
    cargo: 'Asistente RRHH',
    telefono: '569 56139744',
    email: 'kcanales@labbe.cl'
  },
  {
    id: '6',
    nombre_completo: 'Diego Andres Gonzalez Valenzuela',
    rut: '20114106-0',
    cargo: 'Jefe RRHH',
    telefono: '569 78455527',
    email: 'dgonzalez@labbe.cl'
  }
]
