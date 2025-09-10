import { Container, Title, Group, Button, Grid, Card, Text, Badge, Stack, Progress } from '@mantine/core'
import { IconPlus, IconUsers, IconCalendar } from '@tabler/icons-react'

const mockClasses = [
  { 
    id: 1, 
    name: 'Frontend Development 2024', 
    students: 24, 
    maxStudents: 30, 
    startDate: '2024-02-01',
    endDate: '2024-12-15',
    status: 'Aktiv',
    instructor: 'Lars Andersen'
  },
  { 
    id: 2, 
    name: 'Backend Development 2024', 
    students: 18, 
    maxStudents: 25, 
    startDate: '2024-01-15',
    endDate: '2024-11-30',
    status: 'Aktiv',
    instructor: 'Marie Jensen'
  },
  { 
    id: 3, 
    name: 'Fullstack Development 2024', 
    students: 22, 
    maxStudents: 25, 
    startDate: '2024-03-01',
    endDate: '2025-01-31',
    status: 'Aktiv',
    instructor: 'Peter Nielsen'
  },
  { 
    id: 4, 
    name: 'Frontend Development 2023', 
    students: 28, 
    maxStudents: 30, 
    startDate: '2023-02-01',
    endDate: '2023-12-15',
    status: 'Afsluttet',
    instructor: 'Anna Hansen'
  },
]

export function Classes() {
  return (
    <Container size="xl">
      <Group justify="space-between" mb="lg">
        <Title order={1}>Hold</Title>
        <Button leftSection={<IconPlus size={16} />}>
          Opret nyt hold
        </Button>
      </Group>

      <Grid>
        {mockClasses.map((classItem) => (
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={classItem.id}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h={280}>
              <Stack justify="space-between" h="100%">
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="lg" lineClamp={2}>
                      {classItem.name}
                    </Text>
                    <Badge 
                      color={classItem.status === 'Aktiv' ? 'green' : 'gray'}
                      variant="light"
                    >
                      {classItem.status}
                    </Badge>
                  </Group>

                  <Group mb="md">
                    <Group gap="xs">
                      <IconUsers size={16} />
                      <Text size="sm" c="dimmed">
                        {classItem.students}/{classItem.maxStudents} elever
                      </Text>
                    </Group>
                  </Group>

                  <Progress 
                    value={(classItem.students / classItem.maxStudents) * 100} 
                    size="sm" 
                    mb="md"
                    color={classItem.students === classItem.maxStudents ? 'red' : 'blue'}
                  />

                  <Group gap="xs" mb="xs">
                    <IconCalendar size={16} />
                    <Text size="sm" c="dimmed">
                      {new Date(classItem.startDate).toLocaleDateString('da-DK')} - {new Date(classItem.endDate).toLocaleDateString('da-DK')}
                    </Text>
                  </Group>

                  <Text size="sm" c="dimmed">
                    Instruktør: {classItem.instructor}
                  </Text>
                </div>

                <Button variant="light" fullWidth mt="md">
                  Se detaljer
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  )
}

export default Classes
