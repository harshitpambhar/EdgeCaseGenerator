import { Outlet } from 'react-router-dom';
import { HeroGeometric } from '../components/ui/shape-landing-hero';

export default function AuthLayout() {
  return (
    <HeroGeometric>
      <div className="min-h-screen flex items-center justify-center p-6">
        <Outlet />
      </div>
    </HeroGeometric>
  );
}
