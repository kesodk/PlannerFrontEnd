import {
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { IconPlus, IconSearch } from '@tabler/icons-react'
import type { ClassData } from '../services/classApi'

const CLASS_BADGE_WIDTH = 58

function getBadgeColor(fag: string): string {
  const fagUpper = fag.toUpperCase()
  if (fagUpper.startsWith('V')) return 'teal'
  if (fagUpper.startsWith('UP')) return 'violet'
  if (fagUpper.startsWith('LAB')) return 'cyan'
  return 'blue'
}

function getTeacherInitials(teacherName: string): string {
  const parts = teacherName
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return '-'
  if (parts.length === 1) return parts[0].slice(0, 4).toUpperCase()

  return parts
    .slice(0, 4)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function getStatusBadgeColor(status: ClassData['status']): string {
  if (status === 'Igangværende') return 'green'
  if (status === 'Fremtidig') return 'blue'
  return 'gray'
}

type FindHoldModalProps = {
  opened: boolean
  onClose: () => void
  classSearch: string
  onClassSearchChange: (value: string) => void
  classes: ClassData[]
  isLoading: boolean
  isPinning?: boolean
  onPinClass: (classId: number) => void
}

export function FindHoldModal({
  opened,
  onClose,
  classSearch,
  onClassSearchChange,
  classes,
  isLoading,
  isPinning = false,
  onPinClass,
}: FindHoldModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Find hold" size={400}>
      <TextInput
        placeholder="Søg på navn, fag, lærer eller modulperiode..."
        leftSection={<IconSearch size={14} />}
        value={classSearch}
        onChange={(event) => onClassSearchChange(event.currentTarget.value)}
        mb="md"
        autoFocus
      />

      <ScrollArea h={700} offsetScrollbars="present" scrollbarSize={8}>
        {isLoading ? (
          <Center py="xl">
            <Loader size="sm" />
          </Center>
        ) : classes.length === 0 ? (
          <Text ta="center" c="dimmed" py="xl" size="sm">
            {classSearch ? 'Ingen hold matcher søgningen' : 'Alle hold er allerede tilføjet'}
          </Text>
        ) : (
          <Stack gap="xs" pr={4}>
            {classes.map((klass) => (
              <Group
                key={klass.id}
                justify="space-between"
                wrap="nowrap"
                p="xs"
                style={{
                  border: '1px solid var(--mantine-color-gray-3)',
                  borderRadius: 6,
                }}
              >
                <Stack gap={0} style={{ minWidth: 0, flex: 1 }}>
                  <Group gap="xs" wrap="nowrap" align="flex-start">
                    <Stack gap={4} style={{ minWidth: 0 }}>
                      <Badge
                        color={getBadgeColor(klass.fag)}
                        size="sm"
                        radius="xs"
                        style={{
                          width: CLASS_BADGE_WIDTH,
                          display: 'inline-flex',
                          justifyContent: 'center',
                        }}
                      >
                        {klass.fag.substring(0, 4)}
                      </Badge>
                      <Badge
                        variant="outline"
                        color="gray"
                        size="sm"
                        radius="xs"
                        style={{
                          width: CLASS_BADGE_WIDTH,
                          display: 'inline-flex',
                          justifyContent: 'center',
                          backgroundColor: 'transparent',
                        }}
                      >
                        {getTeacherInitials(klass.lærer)}
                      </Badge>
                    </Stack>

                    <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
                      <Text size="sm" fw={600} lineClamp={1}>
                        {klass.modulperiode}
                      </Text>
                      <Group gap="xs" wrap="nowrap">
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {klass.students?.length ?? 0} elever
                        </Text>
                        <Badge
                          color={getStatusBadgeColor(klass.status)}
                          variant="light"
                          size="xs"
                          radius="xs"
                        >
                          {klass.status}
                        </Badge>
                      </Group>
                    </Stack>
                  </Group>
                </Stack>
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconPlus size={12} />}
                  loading={isPinning}
                  onClick={() => onPinClass(klass.id)}
                >
                  Tilføj
                </Button>
              </Group>
            ))}
          </Stack>
        )}
      </ScrollArea>
    </Modal>
  )
}

export default FindHoldModal