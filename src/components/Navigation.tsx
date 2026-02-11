import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ScrollArea, Stack, Collapse } from '@mantine/core'
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
  IconChevronDown
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
  { label: 'Bedømmelser', icon: IconCertificate, link: '/administration/assessments' },
  { label: 'Oversigter', icon: IconReportAnalytics, link: '/administration/overviews' },
]

export function Navigation() {
  const [adminOpen, setAdminOpen] = useState(false)

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
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <ScrollArea className={classes.links}>
          <div className={classes.linksInner}>
            <Stack gap={0}>
              {mainItems}
              
              <button
                className={`${classes.link} ${classes.expandButton} ${adminOpen ? classes.expanded : ''}`}
                onClick={() => setAdminOpen(!adminOpen)}
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
    </nav>
  )
}
