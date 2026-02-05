"use server";

import { auth } from "@/lib/auth";
import { signupSchema } from "@/lib/schema";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData) {
  
  console.error("Form",formData)
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };
  const validatedData = signupSchema.safeParse(rawData);
  if (!validatedData.success) {
    console.error(validatedData.error)
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
