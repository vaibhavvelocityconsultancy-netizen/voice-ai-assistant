import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import ReceptionSelector from './components/ReceptionSelector';
import VoiceReceptionist from './components/AppointmentReceptionist';
import InsuranceReception from './components/InsuranceReception';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route path='' element={<ReceptionSelector />} />
      <Route path='insurance-receptionist' element={<InsuranceReception />} />
      <Route path='voice-receptionist' element={<VoiceReceptionist />} />
    </Route>
  )
)

createRoot(document.getElementById('root')!).render(
 <RouterProvider router={router} />
);
