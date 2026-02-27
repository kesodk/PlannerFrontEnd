import { useState } from 'react'
import {
  Center,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Divider,
  Alert,
  Box,
} from '@mantine/core'
import { IconChalkboard, IconAlertCircle, IconUser } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { login, loginAsGuest, isLoading } = useAuth()
  const [initialer, setInitialer] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!initialer.trim() || !password) return
    setError(null)
    try {
      await login(initialer.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login fejlede')
    }
  }

  return (
    <Center mih="100vh" bg="var(--mantine-color-body)">
      <Box w={420} px="md">
        <Stack align="center" mb="xl" gap="xs">
          <IconChalkboard size={48} stroke={1.3} color="var(--mantine-color-blue-6)" />
          <Title order={1} ta="center">AspIT Planner</Title>
          <Text c="dimmed" size="sm" ta="center">
            Log ind med dine initialer og password for at fortsætte
          </Text>
        </Stack>

        <Paper withBorder shadow="md" p="xl" radius="md">
          <form onSubmit={handleSubmit} autoComplete="off">
            <Stack gap="md">
              <TextInput
                label="Initialer"
                placeholder="F.eks. KESO"
                value={initialer}
                onChange={(e) => setInitialer(e.currentTarget.value.toUpperCase())}
                maxLength={5}
                required
                autoFocus
                autoComplete="off"
              />
              <PasswordInput
                label="Password"
                placeholder="Dit password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
                autoComplete="new-password"
              />

              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                  {error}
                </Alert>
              )}

              <Button type="submit" fullWidth loading={isLoading} mt="xs">
                Log ind
              </Button>
            </Stack>
          </form>

          <Divider label="eller" labelPosition="center" my="lg" />

          <Stack gap="xs">
            <Button
              variant="light"
              color="gray"
              fullWidth
              leftSection={<IconUser size={16} />}
              onClick={loginAsGuest}
            >
              Fortsæt som gæst
            </Button>
            <Text size="xs" c="dimmed" ta="center">
              Gæsteadgang er kun til testformål og vil blive fjernet senere
            </Text>
          </Stack>
        </Paper>


      </Box>
    </Center>
  )
}
