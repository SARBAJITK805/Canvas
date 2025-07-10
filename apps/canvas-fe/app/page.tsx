import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-white px-6 py-12">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        <header className="w-full flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Canvas</h1>
          <Link href="/auth">
            <Button variant="outline" className="rounded-xl">
              Sign In / Sign Up <LogIn className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </header>

        <div className="max-w-3xl">
          <h2 className="text-5xl font-extrabold tracking-tight mb-4">
            Sketch. Collaborate. Create.
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            All in one minimal space. No clutter. Just creativity.
          </p>
          <Link href="/app">
            <Button size="lg" className="px-8 py-4 text-lg rounded-2xl">
              Launch Canvas <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 max-w-6xl mx-auto">
        <Card className="rounded-2xl shadow-lg transition-transform hover:scale-105 hover:shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2">Real-Time Collaboration</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Work with your team seamlessly. Instant updates. No friction.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-lg transition-transform hover:scale-105 hover:shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2">Minimal Interface</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Focus on your ideas, not the tools. Clean and intuitive design.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-lg transition-transform hover:scale-105 hover:shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2">Open Source Core</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Free to use, modify, and extend. Built for the community.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-lg transition-transform hover:scale-105 hover:shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2">Powered by Modern Stack</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Built with Next.js, Tailwind CSS, and shadcn/ui for top performance.
            </p>
          </CardContent>
        </Card>
      </section>

      <footer className="mt-24 text-center text-sm text-gray-500 dark:text-gray-600">
        © {new Date().getFullYear()} Canvas — An open source sketching tool.
      </footer>
    </main>
  );
}