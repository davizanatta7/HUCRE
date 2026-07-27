import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

export function AdminRoute({ children }) {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div className="min-h-screen bg-zinc-950 text-white p-8 font-mono">Verificando permissões...</div>;
  }

  // Se não estiver logado ou não tiver a tag admin no publicMetadata
  if (!isSignedIn || user?.publicMetadata?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}