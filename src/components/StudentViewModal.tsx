import { Modal, Stack, Grid, Title, Card, Text, Badge, Group } from '@mantine/core'
import { IconMapPin, IconMail, IconPhone, IconCalendar, IconUser, IconSchool } from '@tabler/icons-react'
import type { Student } from '../types/Student'

interface StudentViewModalProps {
  opened: boolean
  onClose: () => void
  student: Student | null
}

export function StudentViewModal({ opened, onClose, student }: StudentViewModalProps) {
  if (!student) return null

  const formatDate = (date: string) => {
    if (!date) return '-'
    try {
      return new Date(date).toLocaleDateString('da-DK')
    } catch {
      return date
    }
  }

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={`Elevoplysninger - ${student.navn}`}
      size="xl"
      styles={{
        content: { maxHeight: '90vh', overflow: 'auto' }
      }}
    >
      <Stack gap="md">
        {/* Grundlæggende elevoplysninger */}
        <Card withBorder>
          <Title order={4} mb="md">
            <Group gap="xs">
              <IconUser size={20} />
              Elevoplysninger
            </Group>
          </Title>
          
          <Grid>
            <Grid.Col span={12}>
              <Group gap="xs" mb="xs">
                <Text fw={500} size="lg">{student.navn}</Text>
                <Badge 
                  color={student.status === 'Indskrevet' ? 'green' : 'yellow'} 
                  variant="light"
                >
                  {student.status}
                </Badge>
              </Group>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Fødselsdato</Text>
              <Group gap="xs">
                <IconCalendar size={16} />
                <Text>{formatDate(student.fødselsdato)}</Text>
              </Group>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">CPR nummer</Text>
              <Text>{student.cpr || '-'}</Text>
            </Grid.Col>
            
            <Grid.Col span={12}>
              <Text size="sm" c="dimmed">Adresse</Text>
              <Group gap="xs">
                <IconMapPin size={16} />
                <Text>{student.adresse || '-'}</Text>
              </Group>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Telefonnummer</Text>
              <Group gap="xs">
                <IconPhone size={16} />
                <Text>{student.telefonnr || '-'}</Text>
              </Group>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Email</Text>
              <Group gap="xs">
                <IconMail size={16} />
                <Text>{student.email || '-'}</Text>
              </Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Forældreoplysninger */}
        {(student.forældreNavn || student.forældreTelefon || student.forældreEmail) && (
          <Card withBorder>
            <Title order={4} mb="md">
              <Group gap="xs">
                <IconUser size={20} />
                Forældreoplysninger
              </Group>
            </Title>
            
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Forældre navn</Text>
                <Text>{student.forældreNavn || '-'}</Text>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Forældre telefon</Text>
                <Group gap="xs">
                  <IconPhone size={16} />
                  <Text>{student.forældreTelefon || '-'}</Text>
                </Group>
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Text size="sm" c="dimmed">Forældre adresse</Text>
                <Group gap="xs">
                  <IconMapPin size={16} />
                  <Text>{student.forældreAdresse || 'Samme som elev'}</Text>
                </Group>
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Text size="sm" c="dimmed">Forældre email</Text>
                <Group gap="xs">
                  <IconMail size={16} />
                  <Text>{student.forældreEmail || '-'}</Text>
                </Group>
              </Grid.Col>
            </Grid>
          </Card>
        )}

        {/* Uddannelse */}
        <Card withBorder>
          <Title order={4} mb="md">
            <Group gap="xs">
              <IconSchool size={20} />
              Uddannelse
            </Group>
          </Title>
          
          <Grid>
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Afdeling</Text>
              <Text fw={500}>{student.afdeling}</Text>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Spor</Text>
              <Badge 
                size="sm"
                style={{ 
                  backgroundColor: student.spor === 'AspIT' ? 'rgb(25, 69, 65)' : 
                                 student.spor === 'AspIN' ? 'rgb(105, 214, 199)' : 
                                 '#e9ecef',
                  color: student.spor === 'AspIT' ? 'white' : 
                        student.spor === 'AspIN' ? 'rgb(25, 69, 65)' : 
                        '#495057'
                }}
              >
                {student.spor}
              </Badge>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Kursistnummer</Text>
              <Text>{student.kursistnr || '-'}</Text>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Kommune</Text>
              <Group gap="xs">
                <IconMapPin size={16} />
                <Text>{student.kommune}</Text>
              </Group>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Lovgrundlag</Text>
              <Badge variant="outline">{student.lovgrundlag}</Badge>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Status</Text>
              <Badge 
                color={student.status === 'Indskrevet' ? 'green' : 'yellow'} 
                variant="light"
              >
                {student.status}
              </Badge>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Startdato</Text>
              <Group gap="xs">
                <IconCalendar size={16} />
                <Text>{formatDate(student.startdato)}</Text>
              </Group>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Text size="sm" c="dimmed">Slutdato</Text>
              <Group gap="xs">
                <IconCalendar size={16} />
                <Text>{formatDate(student.slutdato || '')}</Text>
              </Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Vejlederoplysninger */}
        {(student.vejlederNavn || student.vejlederTlf || student.vejlederEmail) && (
          <Card withBorder>
            <Title order={4} mb="md">
              <Group gap="xs">
                <IconUser size={20} />
                Vejlederoplysninger
              </Group>
            </Title>
            
            <Grid>
              <Grid.Col span={4}>
                <Text size="sm" c="dimmed">Vejleder navn</Text>
                <Text>{student.vejlederNavn || '-'}</Text>
              </Grid.Col>
              
              <Grid.Col span={4}>
                <Text size="sm" c="dimmed">Vejleder telefon</Text>
                <Group gap="xs">
                  <IconPhone size={16} />
                  <Text>{student.vejlederTlf || '-'}</Text>
                </Group>
              </Grid.Col>
              
              <Grid.Col span={4}>
                <Text size="sm" c="dimmed">Vejleder email</Text>
                <Group gap="xs">
                  <IconMail size={16} />
                  <Text>{student.vejlederEmail || '-'}</Text>
                </Group>
              </Grid.Col>
            </Grid>
          </Card>
        )}
      </Stack>
    </Modal>
  )
}
