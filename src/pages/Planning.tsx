import { Container, Title, Text, Card, Grid, Stack } from '@mantine/core'

export function Planning() {
  return (
    <Container size="xl">
      <Title order={1} mb="lg">Planlægning</Title>
      
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h={300}>
            <Stack>
              <Title order={3}>Undervisningsplaner</Title>
              <Text c="dimmed">
                Her kan du oprette og administrere undervisningsplaner for de forskellige hold.
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h={300}>
            <Stack>
              <Title order={3}>Skemaer</Title>
              <Text c="dimmed">
                Oversigt over skemaer og undervisningstider for hold og vejledere.
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h={300}>
            <Stack>
              <Title order={3}>Materialer</Title>
              <Text c="dimmed">
                Upload og administrer undervisningsmaterialer og ressourcer.
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h={300}>
            <Stack>
              <Title order={3}>Aktiviteter</Title>
              <Text c="dimmed">
                Planlæg aktiviteter, ekskursioner og særlige arrangementer.
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  )
}

export default Planning
