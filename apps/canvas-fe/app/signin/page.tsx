import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-900 dark:text-white px-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center">Sign In to Canvas</h1>
        <form className="space-y-4">
          <Input type="email" placeholder="Email" required />
          <Input type="password" placeholder="Password" required />
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don’t have an account? <Link href="/signup" className="underline">Sign up</Link>
        </p>
      </div>
    </main>
  );
}