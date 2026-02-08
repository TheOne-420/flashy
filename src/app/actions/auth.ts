"use server";

import { auth } from "@/lib/auth";
import { signUpSchema, signInSchema } from "@/lib/schema";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };
  const validatedData = signUpSchema.safeParse(rawData);
  if (!validatedData.success) {
    console.error(validatedData.error);
    return;
  }
  await auth.api.signUpEmail({
    body: {
      name: validatedData.data.name,
      email: validatedData.data.email,
      password: validatedData.data.password,
    },
  });
  redirect("/home");
}
export async function signInAction(formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const validatedData = signInSchema.safeParse(rawData);
  if (!validatedData.success) {
    console.error(validatedData.error);
    return;
  }
  await auth.api.signInEmail({
    body: {
      email: validatedData.data.email,
      password: validatedData.data.password,
    },
  });
  
  redirect("/home");
}
