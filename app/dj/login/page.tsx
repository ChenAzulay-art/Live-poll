import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { DisplayTitle } from "@/components/display-title";
import { LoginForm } from "@/components/login-form";
import { getDjPin } from "@/lib/auth/session";

export default function DjLoginPage() {
  const pin = getDjPin();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <main className="flex w-full max-w-md flex-col gap-8">
        <BrandMark />
        <div className="flex flex-col gap-4">
          <DisplayTitle text="DJ login." />
          <p className="text-sm text-mute">
            Enter your PIN to manage tonight&apos;s poll.
          </p>
          <p className="w-fit rotate-[-2deg] rounded-sm bg-acid px-3 py-1 text-sm font-semibold tracking-[0.18em] text-night">
            Guest PIN {pin}
          </p>
        </div>
        <LoginForm />
        <Link
          href="/"
          className="text-center text-sm font-medium text-mute underline-offset-4 hover:text-paper hover:underline"
        >
          User login
        </Link>
      </main>
    </div>
  );
}
