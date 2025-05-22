
import React, { createContext, useContext, useEffect, useState } from "react"

type TenantCtx = { orgId?: string; setOrgId: (id?: string) => void }
const TenantContext = createContext<TenantCtx>({ orgId: undefined, setOrgId: () => {} })

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orgId, setOrgId] = useState<string | undefined>(() => localStorage.getItem("orgId") || undefined)

  useEffect(() => {
    if (orgId) localStorage.setItem("orgId", orgId)
    else localStorage.removeItem("orgId")
  }, [orgId])

  return (
    <TenantContext.Provider value={{ orgId, setOrgId }}>
      {children}
    </TenantContext.Provider>
  )
}

export const useTenant = () => useContext(TenantContext)
