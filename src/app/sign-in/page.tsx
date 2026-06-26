import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/shared/auth-form";

export const metadata: Metadata = {
  title: "Sign In — SteerClub",
  description: "Sign in to your SteerClub account to view your Steer Score, programs, and dashboard.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-asphalt flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-block mb-10">
          <span className="font-heading font-black text-2xl text-white tracking-tight">
            STEER<span className="text-lime">CLUB</span>
          </span>
        </Link>

        <h1 className="font-heading font-black text-4xl text-white uppercase mb-2">
          Welcome back.
        </h1>
        <p className="text-white/60 font-body mb-10">
          Sign in to see your score, your progress, and what&apos;s next.
        </p>

        <AuthForm mode="sign-in" />

        <p className="text-center text-sm text-steel font-ui mt-8">
          New to SteerClub?{" "}
          <Link href="/sign-up" className="text-lime hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
