import '@testing-library/jest-dom'

// Mock de ResizeObserver, necesario porque Recharts lo utiliza para 
// la responsividad de los gráficos y no existe de forma nativa en jsdom.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
