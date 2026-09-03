import { describe, expect, it } from '@jest/globals'
import { resolveExecutiveAssignment } from '@/lib/executive-login-resolution'

describe('resolveExecutiveAssignment', () => {
  const staff = [
    {
      email: 'carolina.sepulveda@labbe.cl',
      full_name: 'Carolina Pilar Sepulveda Contreras',
      transportista_id: 'transportista-1',
      is_active: true,
    },
  ]

  it('resolves an exact canonical email match', () => {
    expect(resolveExecutiveAssignment('carolina.sepulveda@labbe.cl', 'Carolina Pilar Sepulveda Contreras', staff))
      .toMatchObject({ transportista_id: 'transportista-1' })
  })

  it('resolves a profile alias by exact normalized full name', () => {
    expect(resolveExecutiveAssignment('csepulveda@labbe.cl', 'Carolina Pilar Sepulveda Contreras', staff))
      .toMatchObject({ email: 'carolina.sepulveda@labbe.cl', transportista_id: 'transportista-1' })
  })

  it('does not guess when names do not match', () => {
    expect(resolveExecutiveAssignment('other@labbe.cl', 'Otra Persona', staff)).toBeNull()
  })
})
