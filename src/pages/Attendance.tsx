import { Container, Title, Stack, Text, ThemeIcon } from '@mantine/core'
import { IconCalendarEvent } from '@tabler/icons-react'

export function Attendance() {
  return (
    <Container size="md">
      <Stack align="center" gap="xl" py="xl">
        <ThemeIcon size={120} radius="xl" variant="light" color="green">
          <IconCalendarEvent size={60} />
        </ThemeIcon>
        
        <Stack align="center" gap="sm">
          <Title order={1} ta="center">Fremmøderegistrering</Title>
          <Text size="lg" c="dimmed" ta="center">
            Denne funktionalitet er under udvikling
          </Text>
        </Stack>

        

        
      </Stack>
    </Container>
  )
}

export default Attendance
