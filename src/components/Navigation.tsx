import { NavLink } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { Menu, Group } from '@mantine/core'
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
  { label: 'Forside', icon: IconDashboard, link: '/' },
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
  const location = useLocation()
  const isAdminActive = location.pathname.startsWith('/administration')

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

  return (
    <nav className={classes.topNav}>
      <Group gap="xs" wrap="nowrap">
        {mainItems}

        <Menu shadow="md" width={260} withinPortal={false}>
          <Menu.Target>
            <button
              className={`${classes.link} ${classes.expandButton} ${isAdminActive ? classes.linkActive : ''}`}
              type="button"
            >
              <IconSettings className={classes.linkIcon} stroke={1.5} />
              <span>Administration</span>
              <IconChevronDown className={classes.chevron} stroke={1.5} />
            </button>
          </Menu.Target>

          <Menu.Dropdown>
            {adminLinks.map((item) => (
              <Menu.Item
                key={item.label}
                component={NavLink}
                to={item.link}
                leftSection={<item.icon size={16} stroke={1.5} />}
              >
                {item.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Group>
    </nav>
  )
}
