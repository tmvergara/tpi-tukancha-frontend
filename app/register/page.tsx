"use client";

import { SignupForm } from "@/components/register-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <img src="Logo1.png" alt="" className="h-16" />
        </a>
        <SignupForm />
      </div>
    </div>
  );
}
