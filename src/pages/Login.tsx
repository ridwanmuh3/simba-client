import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import logoBgn from "@/assets/sppg.webp";
import { useAuth } from "@/features/auth/context";
import { LoginFormInputs, loginSchema } from "@/features/auth/schemas";
import dayjs from "dayjs";

const APP_VERSION = import.meta.env.VITE_APP_VERSION!;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { login, isLoading } = useAuth();

  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleSubmit = async (data: LoginFormInputs) => {
    setErrorMsg("");

    await login(data, (message) => {
      setErrorMsg(message);
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary-foreground/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center mb-8">
              <img
                src={logoBgn}
                alt="Logo BGN"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold mb-4">SIMBA</h1>
            <p className="text-xl text-primary-foreground/80 max-w-md">
              Sistem Informasi Manajemen Barang dan Anggaran
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img
              src={logoBgn}
              alt="Logo BGN"
              className="w-12 h-12 rounded-xl object-contain"
            />
            <span className="text-2xl font-bold">SIMBA</span>
          </div>

          <Card className="border-0 shadow-lifted">
            <CardHeader className="space-y-1 pb-4 text-center">
              <CardTitle className="text-2xl font-bold">Login</CardTitle>
              <CardDescription>
                Selamat datang di aplikasi SIMBA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...form.register("username")}
                      id="username"
                      className="pl-9"
                      disabled={isLoading}
                    />
                  </div>
                  {form.formState.errors.username && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...form.register("password")}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="pl-9 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      {...form.register("rememberMe")}
                      type="checkbox"
                      className="rounded border-input"
                    />
                    <span className="text-muted-foreground">Ingat saya</span>
                  </label>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-8 w-8" />
                  ) : (
                    "Login"
                  )}
                </Button>
                {errorMsg && (
                  <p className="text-red-500 text-sm text-center mt-2 font-medium">
                    {errorMsg}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            © {dayjs().year()} SIMBA {APP_VERSION}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
