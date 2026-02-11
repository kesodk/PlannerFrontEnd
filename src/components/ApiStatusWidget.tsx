import { Card, Text, Badge, Group, Stack, Button, Loader, Alert } from '@mantine/core'
import { IconPlugConnected, IconPlugConnectedX, IconRefresh } from '@tabler/icons-react'
import { useStudents } from '../services/studentApi'

/**
 * Komponent til at vise API forbindelse status
 */
export function ApiStatusWidget() {
  const { data, isLoading, isError, error, refetch } = useStudents()

  const getStatusBadge = () => {
    if (isLoading) {
      return (
        <Badge color="gray" variant="light" leftSection={<Loader size="xs" />}>
          Forbinder...
        </Badge>
      )
    }
    
    if (isError) {
      return (
        <Badge color="red" variant="light" leftSection={<IconPlugConnectedX size={14} />}>
          Offline
        </Badge>
      )
    }

    return (
      <Badge color="green" variant="light" leftSection={<IconPlugConnected size={14} />}>
        Forbundet
      </Badge>
    )
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={500}>API Forbindelse</Text>
          {getStatusBadge()}
        </Group>

        {isError && (
          <Alert color="red" title="Fejl ved forbindelse">
            <Text size="sm">{error?.message || 'Kunne ikke forbinde til API'}</Text>
            <Text size="xs" c="dimmed" mt="xs">
              Server: cv-pc-x-server:1102
            </Text>
          </Alert>
        )}

        {!isLoading && !isError && (
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              Antal studerende: <Text span fw={500}>{data?.length || 0}</Text>
            </Text>
            <Text size="sm" c="dimmed">
              Server: cv-pc-x-server:1102
            </Text>
          </Stack>
        )}

        <Button 
          variant="light" 
          size="xs" 
          leftSection={<IconRefresh size={14} />}
          onClick={() => refetch()}
          disabled={isLoading}
        >
          Test forbindelse
        </Button>
      </Stack>
    </Card>
  )
}
