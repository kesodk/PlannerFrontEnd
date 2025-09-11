import { ActionIcon, Tooltip } from '@mantine/core'
import { IconSun, IconMoon } from '@tabler/icons-react'
import { useTheme } from '../contexts/ThemeContext'

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useTheme()
  const isDark = colorScheme === 'dark'

  return (
    <Tooltip label={`Skift til ${isDark ? 'lys' : 'mørk'} mode`} position="bottom">
      <ActionIcon
        onClick={toggleColorScheme}
        variant="outline"
        size="lg"
        aria-label="Skift tema"
      >
        {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
    </Tooltip>
  )
}
