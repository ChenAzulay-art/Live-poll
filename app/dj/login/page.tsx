import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default function DjLoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <main className="flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-purple-400">
            Booth
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">DJ login</h1>
          <p className="text-zinc-400">
            Enter your PIN to manage tonight&apos;s poll.
          </p>
        </div>
        <LoginForm />
        <Link
          href="/"
          className="text-center text-sm font-medium text-zinc-400 underline-offset-4 hover:text-zinc-200 hover:underline"
        >
          User login
        </Link>
      </main>
    </div>
  );
}
