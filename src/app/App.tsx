import { motion } from 'framer-motion';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { DemoBadge } from '../components/ui/DemoBadge';
import { Toast } from '../components/ui/Toast';
import { EnginePanel } from '../features/engine-panel/EnginePanel';
import { HandoffPage } from '../features/handoff/HandoffPage';
import { HomePage } from '../features/home/HomePage';
import { CoolingPage } from '../features/invest/CoolingPage';
import { ExplainPage } from '../features/invest/ExplainPage';
import { FinalPage } from '../features/invest/FinalPage';
import { ProfilePage } from '../features/invest/ProfilePage';
import { QuizPage } from '../features/invest/QuizPage';
import { LauncherPage } from '../features/launcher/LauncherPage';
import { ChatPage } from '../features/navi/ChatPage';
import { ConfirmDepositPage } from '../features/navi/ConfirmDepositPage';
import { DonePage } from '../features/navi/DonePage';
import { NoResponsePage } from '../features/navi/NoResponsePage';
import { OptionsPage } from '../features/navi/OptionsPage';
import { SummaryPage } from '../features/navi/SummaryPage';
import { SimulatorPage } from '../features/simulator/SimulatorPage';
import { useDemoStore } from '../store/useDemoStore';
import { PhoneFrame } from './PhoneFrame';
import { RequireCompletion, RequireInvest, RequirePersona } from './guards';

function AnimatedOutlet() {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      className="h-full"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Outlet />
    </motion.div>
  );
}

function Shell() {
  const toast = useDemoStore((state) => state.toast);
  return (
    <>
      <DemoBadge />
      <div className="relative min-h-0 flex-1">
        <AnimatedOutlet />
      </div>
      <EnginePanel />
      <Toast message={toast} />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <PhoneFrame>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<LauncherPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/navi/no-response" element={<NoResponsePage />} />
            <Route element={<RequirePersona />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/navi/summary" element={<SummaryPage />} />
              <Route path="/navi/chat" element={<ChatPage />} />
              <Route path="/navi/options" element={<OptionsPage />} />
              <Route path="/navi/confirm-deposit" element={<ConfirmDepositPage />} />
              <Route path="/navi/handoff" element={<HandoffPage />} />
              <Route element={<RequireCompletion />}>
                <Route path="/navi/done" element={<DonePage />} />
              </Route>
              <Route element={<RequireInvest step="profile" />}>
                <Route path="/navi/invest/profile" element={<ProfilePage />} />
              </Route>
              <Route element={<RequireInvest step="explain" />}>
                <Route path="/navi/invest/explain" element={<ExplainPage />} />
              </Route>
              <Route element={<RequireInvest step="quiz" />}>
                <Route path="/navi/invest/quiz" element={<QuizPage />} />
              </Route>
              <Route element={<RequireInvest step="cooling" />}>
                <Route path="/navi/invest/cooling" element={<CoolingPage />} />
              </Route>
              <Route element={<RequireInvest step="final" />}>
                <Route path="/navi/invest/final" element={<FinalPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </PhoneFrame>
    </BrowserRouter>
  );
}
