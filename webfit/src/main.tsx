import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('webfit-app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
