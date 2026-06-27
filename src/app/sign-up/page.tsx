import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import AuthForm from "@/components/shared/auth-form";

export const metadata: Metadata = {
  title: "Create Account — SteerClub",
  description: "Create your SteerClub account to track your Steer Score, book programs, and join the community.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-asphalt flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-block mb-10">
          <span className="font-heading font-black text-2xl text-white tracking-tight">
            STEER<span className="text-lime">CLUB</span>
          </span>
        </Link>

        <h1 className="font-heading font-black text-4xl text-white uppercase mb-2">
          Start here.
        </h1>
        <p className="text-white/60 font-body mb-10">
          Create your account. Then find out where you stand.
        </p>

        <Suspense fallback={<div className="glass rounded-2xl p-8 h-48" />}>
          <AuthForm mode="sign-up" />
        </Suspense>

        <p className="text-center text-sm text-steel font-ui mt-8">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-lime hover:underline">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-steel font-ui mt-6 leading-relaxed">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-white/60 hover:text-lime">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-white/60 hover:text-lime">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
