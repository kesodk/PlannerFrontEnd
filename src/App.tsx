import { Routes, Route } from 'react-router-dom'
import { AppShell, Group, Text, ActionIcon } from '@mantine/core'
import { IconChevronRight, IconChevronLeft } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { Navigation } from './components/Navigation'
import { Dashboard, Planning, Evaluation, Attendance, Students, Classes, Assessments, AssessmentDetail } from './pages'
import { ThemeToggle } from './components/ThemeToggle'
import { SidebarProvider } from './contexts/SidebarContext'

function App() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure()
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)

  return (
    <AppShell
      navbar={{ 
        width: 300, 
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened }
      }}
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <ActionIcon
              onClick={toggleMobile}
              variant="outline"
              color="gray"
              hiddenFrom="sm"
              size="md"
              title={mobileOpened ? "Luk menu" : "Åbn menu"}
            >
              {mobileOpened ? <IconChevronLeft size={18} /> : <IconChevronRight size={18} />}
            </ActionIcon>
            <ActionIcon
              onClick={toggleDesktop}
              variant="outline"
              color="gray"
              visibleFrom="sm"
              size="md"
              title={desktopOpened ? "Luk sidebar" : "Åbn sidebar"}
            >
              {desktopOpened ? <IconChevronLeft size={18} /> : <IconChevronRight size={18} />}
            </ActionIcon>
            <Text size="lg" fw={500}>
              AspIT Planner (test)
            </Text>
          </Group>
          <ThemeToggle />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <Navigation />
      </AppShell.Navbar>

      <AppShell.Main>
        <SidebarProvider desktopOpened={desktopOpened} mobileOpened={mobileOpened}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/evaluation" element={<Evaluation />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/administration/students" element={<Students />} />
            <Route path="/administration/classes" element={<Classes />} />
            <Route path="/administration/assessments" element={<Assessments />} />
            <Route path="/administration/assessments/:studentId" element={<AssessmentDetail />} />
            <Route path="/administration/overviews" element={<div>Oversigter - kommer snart</div>} />
          </Routes>
        </SidebarProvider>
      </AppShell.Main>
    </AppShell>
  )
}

export default App
