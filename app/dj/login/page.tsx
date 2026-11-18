import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { getDjPin } from "@/lib/auth/session";

export default function DjLoginPage() {
  const pin = getDjPin();

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
          <p className="text-sm text-zinc-500">
            Guest DJ PIN:{" "}
            <span className="font-semibold tracking-[0.2em] text-zinc-200">
              {pin}
            </span>
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
