import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => <div className="p-2">Welcome to Recipe Collection!</div>,
})