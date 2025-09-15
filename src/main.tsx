import React from 'react'
import ReactDOM from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { AuthProvider } from '@descope/react-sdk'
import './index.css'

import { routeTree } from './routeTree.gen'

// Create Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!)

// Create router
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider projectId={import.meta.env.VITE_DESCOPE_PROJECT_ID!}>
      <ConvexProvider client={convex}>
        <RouterProvider router={router} />
      </ConvexProvider>
    </AuthProvider>
  </React.StrictMode>,
)
