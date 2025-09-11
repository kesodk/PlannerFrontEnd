import { Container, Title, Stack, Card, Text, Group, Badge, ThemeIcon, Alert } from '@mantine/core'
import { IconSchool, IconCalendar, IconUsers, IconInfoCircle } from '@tabler/icons-react'

export function Classes() {
  return (
    <Container size="md">
      <Stack align="center" gap="xl" py="xl">
        <ThemeIcon size={120} radius="xl" variant="light" color="blue">
          <IconSchool size={60} />
        </ThemeIcon>
        
        <Stack align="center" gap="sm">
          <Title order={1} ta="center">Hold administration</Title>
          <Text size="lg" c="dimmed" ta="center">
            Denne funktionalitet er under udvikling
          </Text>
        </Stack>

        <Alert 
          icon={<IconInfoCircle size={16} />} 
          title="Kommer snart!" 
          color="blue"
          radius="md"
          style={{ maxWidth: 500 }}
        >
          Hold administration systemet er planlagt til at omfatte:
          <br />• Oprettelse og redigering af hold
          <br />• Tilmelding af elever til hold  
          <br />• Oversigt over holdaktiviteter
          <br />• Integration med fremmøderegistrering
        </Alert>

        <Card withBorder padding="xl" radius="md" style={{ maxWidth: 600 }}>
          <Stack gap="md">
            <Group justify="center">
              <Badge size="lg" variant="light" color="blue">Fase 2</Badge>
            </Group>
            
            <Text ta="center" fw={500}>
              I mellemtiden kan du teste elevadministrationen
            </Text>
            
            <Group justify="space-around" mt="md">
              <Stack align="center" gap="xs">
                <ThemeIcon size={50} radius="md" variant="light" color="green">
                  <IconUsers size={24} />
                </ThemeIcon>
                <Text size="sm" fw={500}>Elevadministration</Text>
                <Badge size="sm" color="green">Klar</Badge>
              </Stack>
              
              <Stack align="center" gap="xs">
                <ThemeIcon size={50} radius="md" variant="light" color="gray">
                  <IconSchool size={24} />
                </ThemeIcon>
                <Text size="sm" fw={500}>Hold</Text>
                <Badge size="sm" color="gray">Kommer snart</Badge>
              </Stack>
              
              <Stack align="center" gap="xs">
                <ThemeIcon size={50} radius="md" variant="light" color="gray">
                  <IconCalendar size={24} />
                </ThemeIcon>
                <Text size="sm" fw={500}>Fremmøde</Text>
                <Badge size="sm" color="gray">Kommer snart</Badge>
              </Stack>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}

export default Classes
