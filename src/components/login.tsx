import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Zod schemas for validation
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const {
    control: loginControl,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    control: signupControl,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors, isSubmitting: isSignupSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    console.log("Login data:", data);
    // TODO Handle login logic here
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    console.log("Signup data:", data);
    // TODO Handle signup logic here
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <Card className="m-auto w-full max-w-sm overflow-auto border">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "login" | "signup")}
        className="mx-2"
      >
        <TabsList className="mx-auto mb-4 grid w-fit grid-cols-2 px-2">
          <TabsTrigger value="login" className="px-4">
            Login
          </TabsTrigger>
          <TabsTrigger value="signup" className="px-4">
            Sign Up
          </TabsTrigger>
        </TabsList>

        {/* LOGIN TAB */}
        <TabsContent value="login">
          <form onSubmit={handleLoginSubmit(onLoginSubmit)}>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription className="mb-2">
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Controller
                  name="email"
                  control={loginControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="login-email"
                      type="email"
                      placeholder="m@example.com"
                      aria-invalid={loginErrors.email ? "true" : "false"}
                    />
                  )}
                />
                {loginErrors.email && (
                  <p className="text-sm text-red-500">
                    {loginErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs"
                    type="button"
                  >
                    Forgot your password?
                  </Button>
                </div>
                <Controller
                  name="password"
                  control={loginControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="login-password"
                      type="password"
                      aria-invalid={loginErrors.password ? true : false}
                    />
                  )}
                />
                {loginErrors.password && (
                  <p className="text-sm text-red-500">
                    {loginErrors.password.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="mt-4 flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoginSubmitting}
              >
                {isLoginSubmitting ? "Logging in..." : "Login"}
              </Button>
              <Button variant="outline" className="w-full" type="button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="256"
                  height="262"
                  viewBox="0 0 256 262"
                >
                  <path
                    fill="#4285f4"
                    d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                  />
                  <path
                    fill="#34a853"
                    d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                  />
                  <path
                    fill="#fbbc05"
                    d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                  />
                  <path
                    fill="#eb4335"
                    d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                  />
                </svg>{" "}
                Login with Google
              </Button>
            </CardFooter>
          </form>
        </TabsContent>

        {/* SIGNUP TAB */}
        <TabsContent value="signup">
          <form onSubmit={handleSignupSubmit(onSignupSubmit)}>
            <CardHeader className="mb-4">
              <CardTitle>Create an account</CardTitle>
              <CardDescription>
                Enter your information below to create your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Controller
                  name="name"
                  control={signupControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="signup-name"
                      placeholder="John Doe"
                      aria-invalid={signupErrors.name ? true : false}
                    />
                  )}
                />
                {signupErrors.name && (
                  <p className="text-sm text-red-500">
                    {signupErrors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Controller
                  name="email"
                  control={signupControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="signup-email"
                      type="email"
                      placeholder="m@example.com"
                      aria-invalid={signupErrors.email ? true : false}
                    />
                  )}
                />
                {signupErrors.email && (
                  <p className="text-sm text-red-500">
                    {signupErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Controller
                  name="password"
                  control={signupControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="signup-password"
                      type="password"
                      aria-invalid={signupErrors.password ? "true" : "false"}
                    />
                  )}
                />
                {signupErrors.password && (
                  <p className="text-sm text-red-500">
                    {signupErrors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">
                  Confirm Password
                </Label>
                <Controller
                  name="confirmPassword"
                  control={signupControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="signup-confirm-password"
                      type="password"
                      aria-invalid={
                        signupErrors.confirmPassword ? "true" : "false"
                      }
                    />
                  )}
                />
                {signupErrors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {signupErrors.confirmPassword.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="mt-4 flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isSignupSubmitting}
              >
                {isSignupSubmitting ? "Creating account..." : "Sign Up"}
              </Button>
              <Button variant="outline" className="w-full" type="button">
                Sign up with Google
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
