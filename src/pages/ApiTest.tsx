import { useState } from 'react'
import { Container, Title, Card, Text, Button, Stack, Alert, Code, Group, Badge } from '@mantine/core'
import { IconCheck, IconX, IconRefresh } from '@tabler/icons-react'
import { apiService } from '../services/api'

interface TestResult {
  step: string
  status: 'success' | 'error' | 'pending'
  message: string
  details?: string
}

export function ApiTest() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const runTests = async () => {
    setTesting(true)
    const testResults: TestResult[] = []

    // Test 1: Basic connectivity
    testResults.push({ step: 'Forbindelse', status: 'pending', message: 'Tester forbindelse til server...' })
    setResults([...testResults])

    try {
      await fetch('https://cv-pc-x-server:1102', { 
        method: 'GET',
        mode: 'no-cors' // Bypass CORS for connectivity test
      })
      testResults[0] = { 
        step: 'Forbindelse', 
        status: 'success', 
        message: 'Serveren er nåbar'
      }
    } catch (error) {
      testResults[0] = { 
        step: 'Forbindelse', 
        status: 'error', 
        message: 'Kan ikke nå serveren',
        details: error instanceof Error ? error.message : String(error)
      }
      setResults([...testResults])
      setTesting(false)
      return
    }

    setResults([...testResults])

    // Test 2: Authentication
    testResults.push({ step: 'Authentication', status: 'pending', message: 'Forsøger login...' })
    setResults([...testResults])

    try {
      await apiService.login()
      testResults[1] = { 
        step: 'Authentication', 
        status: 'success', 
        message: 'Login succesfuldt - token modtaget'
      }
    } catch (error) {
      testResults[1] = { 
        step: 'Authentication', 
        status: 'error', 
        message: 'Login fejlede',
        details: error instanceof Error ? error.message : String(error)
      }
      setResults([...testResults])
      setTesting(false)
      return
    }

    setResults([...testResults])

    // Test 3: Fetch students
    testResults.push({ step: 'Data Fetch', status: 'pending', message: 'Henter studerende...' })
    setResults([...testResults])

    try {
      const students = await apiService.getStudents()
      testResults[2] = { 
        step: 'Data Fetch', 
        status: 'success', 
        message: `Hentet ${students.length} studerende fra API`
      }
    } catch (error) {
      testResults[2] = { 
        step: 'Data Fetch', 
        status: 'error', 
        message: 'Kunne ikke hente data',
        details: error instanceof Error ? error.message : String(error)
      }
    }

    setResults([...testResults])
    setTesting(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <IconCheck size={20} color="green" />
      case 'error':
        return <IconX size={20} color="red" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge color="green">Success</Badge>
      case 'error':
        return <Badge color="red">Error</Badge>
      default:
        return <Badge color="gray">Testing...</Badge>
    }
  }

  return (
    <Container size="md" py="xl">
      <Title order={1} mb="lg">API Test</Title>

      <Alert color="blue" title="✅ Vite Proxy er nu aktiveret" mb="lg">
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Projektet bruger nu en proxy til at omgå CORS problemer i development mode.
          </Text>
          <Text size="sm">
            Dette betyder at API calls går via Vite dev server (localhost:5173) som så videresender til cv-pc-x-server:1102.
          </Text>
          <Text size="sm" c="dimmed" mt="xs">
            API URL i development: <Code>/api</Code> (proxy)
          </Text>
          <Text size="sm" c="dimmed">
            Backend server: <Code>cv-pc-x-server:1102</Code>
          </Text>
        </Stack>
      </Alert>

      <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={500}>Test Resultat</Text>
            <Button 
              leftSection={<IconRefresh size={16} />}
              onClick={runTests}
              loading={testing}
              disabled={testing}
            >
              Kør Test
            </Button>
          </Group>

          {results.length === 0 && (
            <Text c="dimmed" size="sm">
              Klik på "Kør Test" for at teste API forbindelsen
            </Text>
          )}

          {results.map((result, index) => (
            <Card key={index} padding="sm" withBorder>
              <Group justify="space-between" mb="xs">
                <Group>
                  {getStatusIcon(result.status)}
                  <Text fw={500}>{result.step}</Text>
                </Group>
                {getStatusBadge(result.status)}
              </Group>
              <Text size="sm" c={result.status === 'error' ? 'red' : 'dimmed'}>
                {result.message}
              </Text>
              {result.details && (
                <Code block mt="xs" c="red">
                  {result.details}
                </Code>
              )}
            </Card>
          ))}
        </Stack>
      </Card>

      <Alert color="yellow" title="Hvis testen stadig fejler">
        <Stack gap="xs">
          <Text size="sm" fw={500}>1. Backend serveren skal køre:</Text>
          <Text size="sm">→ Bed din kollega tjekke at serveren er startet</Text>
          
          <Text size="sm" fw={500} mt="xs">2. CORS headers skal være sat op:</Text>
          <Text size="sm">→ Backend skal acceptere requests fra localhost:5173</Text>
          <Code block mt="xs">
{`// C# backend skal have:
app.UseCors(policy => policy
  .WithOrigins("http://localhost:5173")
  .AllowAnyMethod()
  .AllowAnyHeader()
  .AllowCredentials());`}
          </Code>
          
          <Text size="sm" fw={500} mt="xs">3. API endpoint skal være korrekt:</Text>
          <Text size="sm">→ Verificer at login endpointet er <Code>/api/auth/login</Code></Text>
          
          <Text size="sm" fw={500} mt="xs">4. Genstart Vite efter config ændring:</Text>
          <Text size="sm">→ Stop dev serveren (Ctrl+C) og kør <Code>npm run dev</Code> igen</Text>
        </Stack>
      </Alert>
    </Container>
  )
}

export default ApiTest
