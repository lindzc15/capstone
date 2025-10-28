import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthProvider from './context/AuthContext.jsx'
import {APIProvider} from '@vis.gl/react-google-maps';

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

//wrap in auth provider to allow whole app access to authentication states/functions
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <APIProvider apiKey={`${apiKey}`} libraries={['places', 'maps']} onLoad={() => console.log('Maps API has loaded.')}>
    <AuthProvider>
    <App />
    </AuthProvider>
    </APIProvider>
  </StrictMode>,
)
