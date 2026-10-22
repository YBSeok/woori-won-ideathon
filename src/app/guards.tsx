import { Navigate, Outlet } from 'react-router-dom';
import { getProduct } from '../mock/products';
import { useDemoStore } from '../store/useDemoStore';

export function RequirePersona() {
  const personaId = useDemoStore((state) => state.personaId);
  if (!personaId) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function RequireInvest({ step }: { step: 'profile' | 'explain' | 'quiz' | 'cooling' | 'final' }) {
  const allowed = useDemoStore((state) => {
    const kind = getProduct(state.selectedProductId).kind;
    if (kind !== 'invest') return false;
    if (step === 'profile') return true;
    if (step === 'explain') return state.invest.profile;
    if (step === 'quiz') return state.invest.explain;
    if (step === 'cooling') return state.invest.quiz;
    return state.invest.cooling && state.invest.nextDay;
  });
  if (!allowed) return <Navigate to="/navi/options" replace />;
  return <Outlet />;
}

export function RequireCompletion() {
  const completion = useDemoStore((state) => state.completion);
  if (!completion) return <Navigate to="/home" replace />;
  return <Outlet />;
}
