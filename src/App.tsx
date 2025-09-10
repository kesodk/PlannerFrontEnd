import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@mantine/core'
import { Navigation } from './components/Navigation'
import { Dashboard, Students, Classes, Attendance } from './pages'

function App() {
  return (
    <AppShell
      navbar={{ width: 300, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Navbar>
        <Navigation />
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/attendance" element={<Attendance />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  )
}

export default App
