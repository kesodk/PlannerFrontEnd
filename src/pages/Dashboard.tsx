import { Container, Title, Grid, Card, Text, Group, Badge, Stack } from '@mantine/core'
import { IconUsers, IconSchool, IconCalendarCheck, IconTrendingUp } from '@tabler/icons-react'
import { ApiStatusWidget } from '../components/ApiStatusWidget'

const stats = [
  { title: 'Aktive Elever', value: '245', icon: IconUsers, color: 'blue' },
  { title: 'Hold', value: '12', icon: IconSchool, color: 'green' },
  { title: 'Fremmøde i dag', value: '89%', icon: IconCalendarCheck, color: 'orange' },
  { title: 'Gennemsnitlig fremmøde', value: '92%', icon: IconTrendingUp, color: 'red' },
]

export function Dashboard() {
  return (
    <Container size="xl">
      <Title order={1} mb="lg">Dashboard</Title>
      
      <Grid>
        {stats.map((stat) => (
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }} key={stat.title}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <Stack gap="xs">
                  <Text size="sm" c="dimmed" fw={500}>
                    {stat.title}
                  </Text>
                  <Text size="xl" fw={700}>
                    {stat.value}
                  </Text>
                </Stack>
                <Badge color={stat.color} variant="light" size="lg">
                  <stat.icon size={20} />
                </Badge>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Grid mt="xl">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <ApiStatusWidget />
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h={400}>
            <Title order={3} mb="md">Seneste aktivitet</Title>
            <Text c="dimmed">Her vil der være en oversigt over seneste aktiviteter...</Text>
          </Card>
        </Grid.Col>
      </Grid>
      
      <Grid mt="xl">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h={400}>
            <Title order={3} mb="md">Hurtige handlinger</Title>
            <Text c="dimmed">Her vil der være genveje til almindelige opgaver...</Text>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  )
}

export default Dashboard
