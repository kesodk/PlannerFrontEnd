import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell, Group, Text, Center, Stack, ThemeIcon, Menu, UnstyledButton, Modal, Divider } from '@mantine/core'
import { IconLogout, IconDeviceDesktop, IconUserCircle } from '@tabler/icons-react'
import { useViewportSize } from '@mantine/hooks'
import { Navigation } from './components/Navigation'
import { Dashboard, Planning, Evaluation, Attendance, Students, Classes, Assessments, AssessmentDetail, Teachers, LoginPage, Modulperioder, Oversigter } from './pages'
import { ThemeToggle } from './components/ThemeToggle'
import { SidebarProvider } from './contexts/SidebarContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import headerClasses from './AppHeader.module.css'

function AppInner() {
  const { user, logout } = useAuth()
  const [versionModalOpen, setVersionModalOpen] = useState(false)

  if (!user) return <LoginPage />

  return (
    <AppShell
      header={{ height: 86 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" align="center">
            <Menu shadow="md" width={180} position="bottom-start" withinPortal={false}>
              <Menu.Target>
                <UnstyledButton className={headerClasses.userButton}>
                  <IconUserCircle size={24} stroke={1.6} />
                  <Text size="xs" c="dimmed" style={{ lineHeight: 1.1, maxWidth: 90 }} truncate>
                    {user.initialer.toUpperCase()}
                  </Text>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>{user.initialer}</Menu.Label>
                <Menu.Item leftSection={<IconLogout size={14} />} onClick={logout}>
                  Log ud
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Divider orientation="vertical" style={{ height: 36 }} />

            <UnstyledButton
              className={headerClasses.brandButton}
              onClick={() => setVersionModalOpen(true)}
            >
              <Stack gap={0} className={headerClasses.brandStack}>
                <Text size="xl" fw={600} style={{ fontFamily: 'Sofia Pro Semi Bold, sans-serif', lineHeight: 1.1 }}>
                  AspIT Planner
                </Text>
                <Text size="10px" c="dimmed" tt="uppercase" fw={700} className={headerClasses.versionText}>
                  Version 0.9.2
                </Text>
              </Stack>
            </UnstyledButton>
            <Divider orientation="vertical" style={{ height: 36 }} />
          </Group>

          <Group style={{ flex: 1, justifyContent: 'center', minWidth: 0 }}>
            <Navigation />
          </Group>

          <Group gap="sm">
            <ThemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <SidebarProvider desktopOpened={true} mobileOpened={false}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/evaluation" element={<Evaluation />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/administration/students" element={<Students />} />
            <Route path="/administration/classes" element={<Classes />} />
            <Route path="/administration/assessments" element={<Assessments />} />
            <Route path="/administration/assessments/:studentId" element={<AssessmentDetail />} />
            <Route path="/administration/overviews" element={<Oversigter />} />
            <Route path="/administration/teachers" element={<Teachers />} />
            <Route path="/administration/modulperioder" element={<Modulperioder />} />
          </Routes>
        </SidebarProvider>
      </AppShell.Main>

      <Modal
        opened={versionModalOpen}
        onClose={() => setVersionModalOpen(false)}
        title={<Text fw={700}>Versionshistorik</Text>}
        centered
        size="lg"
      >
        <Stack gap="md">
          <div style={{
            padding: 'var(--mantine-spacing-sm)',
            border: '1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-4))',
            borderRadius: 'var(--mantine-radius-md)',
            background: 'light-dark(var(--mantine-color-gray-0), rgba(255, 255, 255, 0.02))',
          }}>
            <Group justify="space-between" align="flex-start" mb="xs">
              <div>
                <Text size="md" fw={700}>Version 0.9.2  - ingen aprilsnar!</Text>
                <Text size="xs" c="dimmed">Aktuel release</Text>
              </div>
              <Text size="xs" c="dimmed">01.04.2026</Text>
            </Group>

            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <li><strong>UI-opdatering:</strong> Navigationen er ændret fra venstre sidepanel til top-navigation.</li>
              <li><strong>UX-forbedring:</strong> Headeren er forenklet med klikbar versionsblok, brugerikon-menu og bedre hover-feedback.</li>
              <li><strong>Layout-optimering:</strong> Flere sider er tilpasset og finjusteret, da nogle brugere arbejder på laptops med 125% zoom, hvilket giver en faktisk skærmbredde på ca. 1280px. Det anbefales dog stadig at enten slå zoom fra eller bruge en ekstern skærm, for at få minimum 1920px bredde og dermed en bedre brugeroplevelse.</li>
            </ul>
          </div>

          <Divider />

          <div style={{
            padding: 'var(--mantine-spacing-sm)',
            border: '1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-4))',
            borderRadius: 'var(--mantine-radius-md)',
            background: 'light-dark(var(--mantine-color-gray-0), rgba(255, 255, 255, 0.02))',
          }}>
            <Group justify="space-between" align="flex-start" mb="xs">
              <div>
                <Text size="md" fw={700}>Version 0.9.1</Text>
                <Text size="xs" c="dimmed">Feature-opdatering</Text>
              </div>
              <Text size="xs" c="dimmed">27.03.2026</Text>
            </Group>

            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <li><strong>Bug fix:</strong> STU-indstilling følger nu eleven på tværs af evalueringer.</li>
              <li><strong>Ny feature:</strong> Aktive aftaler kan nu også ses, når man opretter ugeplaner.</li>
              <li><strong>Ny feature:</strong> Elevens fag-historik vises nu, når man vælger de 3 prioriteter til næste modul.</li>
              <li><strong>Ny feature:</strong> Ved oprettelse af ny formativ evaluering kan mål og/eller delmål overføres fra forrige evaluering.</li>
            </ul>
          </div>

          <Divider />

          <div style={{
            padding: 'var(--mantine-spacing-sm)',
            border: '1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-4))',
            borderRadius: 'var(--mantine-radius-md)',
            background: 'light-dark(var(--mantine-color-gray-0), rgba(255, 255, 255, 0.02))',
          }}>
            <Group justify="space-between" align="flex-start" mb="xs">
              <div>
                <Text size="md" fw={700}>Version 0.9.0</Text>
                <Text size="xs" c="dimmed">Første release</Text>
              </div>
              <Text size="xs" c="dimmed">22.03.2026</Text>
            </Group>

            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <li>Første officielle release af AspIT Planner (web) med alle kernefunktioner som vi kender fra desktop applikationen.</li>
            </ul>
          </div>
        </Stack>
      </Modal>
    </AppShell>
  )
}

function App() {
  const { width } = useViewportSize()

  if (width > 0 && width < 1240) {
    return (
      <Center style={{ height: '100vh', padding: '2rem' }}>
        <Stack align="center" gap="lg" maw={400} ta="center">
          <ThemeIcon size={64} radius="xl" variant="light" color="blue">
            <IconDeviceDesktop size={36} />
          </ThemeIcon>
          <Text fw={700} size="xl">AspIT Planner</Text>
          <Text c="dimmed" size="sm">
            AspIT Planner er ikke optimeret til mindre skærme og skal bruges på en desktop-computer.
          </Text>
          <Text c="dimmed" size="xs">
            Din nuværende skærmbredde: {width}px — anbefalet minimum: 1240px
          </Text>
        </Stack>
      </Center>
    )
  }

  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}

export default App
