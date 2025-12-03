import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home({ user, loading }) {
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/rides');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="w-full min-h-[calc(100vh-10rem)] bg-transparent flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading...</p>
      </div>
    </div>
  );
}
