import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Flowbite } from 'flowbite-react'

document.documentElement.classList.add('dark')
localStorage.setItem("flowbite-theme-mode", "dark")

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Flowbite>
      <App />
    </Flowbite>
  </React.StrictMode>,
)
