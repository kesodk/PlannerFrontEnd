import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './services/notificationBackdrop'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/code-highlight/styles.css'
import '@mantine/charts/styles.css'
import '@mantine/carousel/styles.css'
import './styles/notifications.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MantineProvider>
          <ModalsProvider>
            <Notifications position="top-center" />
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
          </ModalsProvider>
        </MantineProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
