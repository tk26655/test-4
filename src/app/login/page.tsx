import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Vintera</h1>
          <p className="mt-2 text-sm text-gray-600">Zaloguj się, aby kupować i sprzedawać</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}