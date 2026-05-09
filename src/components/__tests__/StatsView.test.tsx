import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatsView } from '../StatsView'

describe('StatsView Component', () => {
  it('debería renderizar correctamente los KPIs iniciales sin datos', () => {
    // 1. Arrange & Act: Renderizamos el componente con arrays vacíos
    render(<StatsView expenses={[]} incomes={[]} />)
    
    // 2. Assert: Verificamos que los títulos de las tarjetas KPI estén en pantalla
    expect(screen.getByText('Total Gastado')).toBeInTheDocument()
    expect(screen.getByText('Total Ingresos')).toBeInTheDocument()
    expect(screen.getByText('Gasto Promedio')).toBeInTheDocument()
    
    // 3. Assert: Al no haber datos para las gráficas, debería mostrar el mensaje de vacío
    const emptyMessages = screen.getAllByText('No hay datos para mostrar')
    expect(emptyMessages.length).toBeGreaterThan(0)
  })
})
