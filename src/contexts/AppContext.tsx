import { useCreation, useMemoizedFn } from 'ahooks'
import { isUndefined } from 'lodash'
import { createContext, ReactNode, useContext, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import * as appApi from '../api/app'
import { Application } from '../api/types'

interface AppContextType {
  applications: Application[]
  selectedApp: Application | null
  selectApp: (
    app: Application | null,
    { isNewApp }: { isNewApp?: boolean }
  ) => void
  refreshApplications: (newlyChangedId?: string) => Promise<void>
  addApplication: (app: Application) => void
  removeApplication: (appId: string) => void
  // MODIFIED: Add a function to update a single application
  updateApplication: (app: Application) => void
  loading: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()
  const { appId } = useParams<{ appId: string }>()
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshApplications = useMemoizedFn(async (newlyChangedId?: string) => {
    setLoading(true)
    try {
      const pageData = await appApi.searchApplications({
        page: 1,
        pageSize: 100,
        newlyChangedId,
      })
      setApplications(pageData.items)
      if (appId) {
        const app = pageData.items.find(app => app.id === appId)
        if (app) {
          selectApp(app)
        }
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      setApplications([])
    } finally {
      setLoading(false)
    }
  })

  const selectApp = useMemoizedFn(
    (
      app: Application | null,
      {
        isNewApp,
      }: {
        isNewApp?: boolean
      } = {}
    ) => {
      setSelectedApp(app)
      if (isNewApp && app) {
        sessionStorage.setItem('newAppId', app.id)
      } else {
        sessionStorage.removeItem('newAppId')
      }
      if (app?.id !== selectedApp?.id) {
        navigate('/' + (app?.id || ''), {
          replace: true,
        })
      }
    }
  )

  const addApplication = useMemoizedFn((app: Application) => {
    setApplications(prevApps => [app, ...prevApps])
  })

  const removeApplication = useMemoizedFn((appId: string) => {
    setApplications(prevApps => prevApps.filter(app => app.id !== appId))
  })

  // MODIFIED: Implement the function to update an application in the list
  const updateApplication = useMemoizedFn((updatedApp: Application) => {
    setApplications(prevApps =>
      prevApps.map(app => (app.id === updatedApp.id ? updatedApp : app))
    )
    selectApp(updatedApp)
  })

  useCreation(() => {
    refreshApplications()
  }, [])

  return (
    <AppContext.Provider
      value={{
        applications,
        selectedApp,
        selectApp,
        refreshApplications,
        addApplication,
        removeApplication,
        updateApplication,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApps = () => {
  const context = useContext(AppContext)
  if (isUndefined(context)) {
    throw new Error('useApps must be used within an AppProvider')
  }
  return context
}
