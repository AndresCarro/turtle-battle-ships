import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserService } from '@/services/user-service';
import { useAuthStore } from '@/store/auth-store';
import { useMainStore } from '@/store/main-store';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  const setPlayerInStore = useMainStore((state) => state.setPlayer);
  const setAuthTokenInStore = useAuthStore((state) => state.setToken);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const params = Route.useSearch();

  const cognitoUrl = useMemo(() => {
    const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN;
    const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const COGNITO_CALLBACK_URL = import.meta.env.VITE_COGNITO_CALLBACK_URL;
    return `https://${COGNITO_DOMAIN}.auth.us-east-1.amazoncognito.com/login?response_type=code&client_id=${COGNITO_CLIENT_ID}&redirect_uri=${encodeURIComponent(COGNITO_CALLBACK_URL)}`;
  }, []);

  useEffect(() => {
    const queryParams = params as any;
    if (queryParams.auth_success && queryParams.user.username) {
      setIsLoading(true);
      setAuthTokenInStore(queryParams.access_token);
      handleLoginRedirect(queryParams.user.username);
    } else if (queryParams.auth_error) {
      alert('Authentication failed. Please try again.');
    }
  }, [params]);

  async function handleLoginRedirect(username: string) {
    const currentUser = await UserService.createUser(username.trim());
    if (!currentUser) {
      alert('Authentication failed. Please try again.');
      return;
    }
    setPlayerInStore({
      id: currentUser.id,
      name: currentUser.name,
      totalGames: currentUser.totalGames,
      totalWins: currentUser.totalWins,
    });
    navigate({ to: '/lobby' });
  }

  return (
    <>
      {
        isLoading ? (
          <Card className="w-full max-w-4xl">
            <CardContent className="flex items-center gap-5 justify-center">
              <LoaderCircle className="size-9 animate-spin" />
              <h1 className="text-4xl font-bold">Loading...</h1>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md">
            <CardHeader>
              <h1 className="text-4xl font-bold text-center pb-4">
                🐢 Turtle Battleships
              </h1>
              <CardTitle>Welcome!</CardTitle>
              <CardDescription>
                Authenticate yourself below to enter the game lobby.
              </CardDescription>
            </CardHeader >
            <CardFooter className="flex-col gap-2">
              <Button
                className="w-full cursor-pointer"
                asChild
              >
                <a href={cognitoUrl}>
                  Authenticate with Cognito
                </a>
              </Button>
            </CardFooter>
          </Card >
        )
      }
    </>
  );
}
