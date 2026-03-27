import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ScrollArea, Stack, Collapse, Modal, Text, Group, Divider } from '@mantine/core'
import { 
  IconCalendarCheck, 
  IconDashboard, 
  IconClipboardData, 
  IconCalendarStats, 
  IconSettings,
  IconUsers,
  IconSchool,
  IconCertificate,
  IconReportAnalytics,
  IconChevronDown,
  IconChalkboard,
  IconCalendarEvent,
} from '@tabler/icons-react'
import classes from './Navigation.module.css'

const mainLinks = [
  { label: 'Dashboard', icon: IconDashboard, link: '/' },
  { label: 'Planlægning', icon: IconCalendarStats, link: '/planning' },
  { label: 'Evaluering', icon: IconClipboardData, link: '/evaluation' },
  { label: 'Fremmøde', icon: IconCalendarCheck, link: '/attendance' },
]

const adminLinks = [
  { label: 'Elever', icon: IconUsers, link: '/administration/students' },
  { label: 'Hold', icon: IconSchool, link: '/administration/classes' },
  { label: 'Undervisere', icon: IconChalkboard, link: '/administration/teachers' },
  { label: 'Modulperioder', icon: IconCalendarEvent, link: '/administration/modulperioder' },
  { label: 'Bedømmelser', icon: IconCertificate, link: '/administration/assessments' },
  { label: 'Oversigter', icon: IconReportAnalytics, link: '/administration/overviews' },
]

export function Navigation() {
  const [adminOpen, setAdminOpen] = useState(false)
  const [versionModalOpen, setVersionModalOpen] = useState(false)

  const mainItems = mainLinks.map((item) => (
    <NavLink
      className={({ isActive }) => 
        isActive ? `${classes.link} ${classes.linkActive}` : classes.link
      }
      to={item.link}
      key={item.label}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </NavLink>
  ))

  const adminItems = adminLinks.map((item) => (
    <NavLink
      className={({ isActive }) => 
        isActive ? `${classes.link} ${classes.linkActive} ${classes.subLink}` : `${classes.link} ${classes.subLink}`
      }
      to={item.link}
      key={item.label}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </NavLink>
  ))

  return (
    <>
      <nav className={classes.navbar}>
        <div className={classes.navbarMain}>
          <ScrollArea className={classes.links}>
            <div className={classes.linksInner}>
              <Stack gap={0}>
                {mainItems}
                
                <button
                  className={`${classes.link} ${classes.expandButton} ${adminOpen ? classes.expanded : ''}`}
                  onClick={() => setAdminOpen(!adminOpen)}
                  type="button"
                >
                  <IconSettings className={classes.linkIcon} stroke={1.5} />
                  <span>Administration</span>
                  <IconChevronDown className={classes.chevron} stroke={1.5} />
                </button>
                
                <Collapse in={adminOpen}>
                  <Stack gap={0}>
                    {adminItems}
                  </Stack>
                </Collapse>
              </Stack>
            </div>
          </ScrollArea>
        </div>

        <div className={classes.versionFooter}>
          <button
            className={classes.versionButton}
            onClick={() => setVersionModalOpen(true)}
            type="button"
          >
            <span className={classes.versionLabel}>Version</span>
            <span className={classes.versionValue}>1.1.0</span>
          </button>
        </div>
      </nav>

      <Modal
        opened={versionModalOpen}
        onClose={() => setVersionModalOpen(false)}
        title={<Text fw={700}>Versionshistorik</Text>}
        centered
        size="lg"
      >
        <Stack gap="md">
          <div className={classes.releaseBlock}>
            <Group justify="space-between" align="flex-start" mb="xs">
              <div>
                <Text className={classes.releaseTitle}>Version 1.1.0</Text>
                <Text size="xs" c="dimmed">Aktuel release</Text>
              </div>
              <Text size="xs" className={classes.releaseDate}>27.03.2026</Text>
            </Group>

            <ul className={classes.releaseList}>
              <li><strong>Bug fix:</strong> STU-indstilling følger nu eleven på tværs af evalueringer.</li>
              <li><strong>Ny feature:</strong> Aktive aftaler kan nu også ses, når man opretter ugeplaner.</li>
              <li><strong>Ny feature:</strong> Elevens fag-historik vises nu, når man vælger de 3 prioriteter til næste modul.</li>
              <li><strong>Ny feature:</strong> Ved oprettelse af ny formativ evaluering kan mål og/eller delmål overføres fra forrige evaluering.</li>
            </ul>
          </div>

          <Divider />

          <div className={classes.releaseBlock}>
            <Group justify="space-between" align="flex-start" mb="xs">
              <div>
                <Text className={classes.releaseTitle}>Version 1.0.0</Text>
                <Text size="xs" c="dimmed">Første release</Text>
              </div>
              <Text size="xs" className={classes.releaseDate}>22.03.2026</Text>
            </Group>

            <ul className={classes.releaseList}>
              <li>Første officielle release af AspIT Planner (web) med alle kernefunktioner som vi kender fra desktop applikationen.</li>
            </ul>
          </div>
        </Stack>
      </Modal>
    </>
  )
}
