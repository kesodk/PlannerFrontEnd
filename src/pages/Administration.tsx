import { Container, Title, Tabs, rem } from '@mantine/core'
import { IconUsers, IconSchool, IconCertificate, IconReportAnalytics } from '@tabler/icons-react'
import { Students } from './Students'
import { Classes } from './Classes'
import { Assessments } from './Assessments'

export function Administration() {
  const iconStyle = { width: rem(16), height: rem(16) }

  return (
    <Container size="xl">
      <Title order={1} mb="lg">Administration</Title>
      
      <Tabs defaultValue="students" variant="outline">
        <Tabs.List>
          <Tabs.Tab value="students" leftSection={<IconUsers style={iconStyle} />}>
            Elever
          </Tabs.Tab>
          <Tabs.Tab value="classes" leftSection={<IconSchool style={iconStyle} />}>
            Hold
          </Tabs.Tab>
          <Tabs.Tab value="assessments" leftSection={<IconCertificate style={iconStyle} />}>
            Bedømmelser
          </Tabs.Tab>
          <Tabs.Tab value="overviews" leftSection={<IconReportAnalytics style={iconStyle} />}>
            Oversigter
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="students" pt="md">
          <Students />
        </Tabs.Panel>

        <Tabs.Panel value="classes" pt="md">
          <Classes />
        </Tabs.Panel>

        <Tabs.Panel value="assessments" pt="md">
          <Assessments />
        </Tabs.Panel>

        <Tabs.Panel value="overviews" pt="md">
          <Title order={3} mb="md">Fagprioritering - Næste Modul</Title>
          <p>Her vil der være en oversigt over alle elevers fagønsker til næste modul med prioriteret rækkefølge (1., 2., og 3. prioritet).</p>
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}

export default Administration
