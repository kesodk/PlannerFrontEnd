import { NavLink } from 'react-router-dom'
import { ScrollArea, Stack } from '@mantine/core'
import { IconUsers, IconSchool, IconCalendarCheck, IconDashboard } from '@tabler/icons-react'
import classes from './Navigation.module.css'

const mockdata = [
  { label: 'Dashboard', icon: IconDashboard, link: '/' },
  { label: 'Elever', icon: IconUsers, link: '/students' },
  { label: 'Hold', icon: IconSchool, link: '/classes' },
  { label: 'Fremmøde', icon: IconCalendarCheck, link: '/attendance' },
]

export function Navigation() {
  const links = mockdata.map((item) => (
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
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <ScrollArea className={classes.links}>
          <div className={classes.linksInner}>
            <Stack gap={0}>{links}</Stack>
          </div>
        </ScrollArea>
      </div>
    </nav>
  )
}
