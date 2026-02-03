import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LoginFormProps {
  onSubmitEmail: (email: string) => void;
  onSignUp: () => void;
}

export const LoginForm = ({ onSubmitEmail, onSignUp }: LoginFormProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const { t } = useLanguage();

  const emailSchema = z.object({
    email: z.string().email(t('auth.errors.emailInvalid')),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    setEmail(data.email);
    
    // Mock sending OTP delay
    setTimeout(() => {
      setLoading(false);
      onSubmitEmail(data.email);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            {t('auth.email')}
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
            <Input
              id="email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              {...register("email")}
              className={`h-12 pl-12 text-base rounded-xl border-border/60 
                bg-background/50 lg:bg-background
                focus:ring-2 focus:ring-primary/20 focus:border-primary
                transition-all duration-200
                ${errors.email ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : ""}`}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold rounded-xl
            bg-gradient-to-r from-primary to-primary/85
            hover:from-primary/95 hover:to-primary/80
            shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30
            transition-all duration-300
            active:scale-[0.98]
            group"
          disabled={isSubmitting || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t('auth.sendingOTP')}
            </>
          ) : (
            <>
              {t('auth.continue')}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-sm pt-2">
        <span className="text-muted-foreground">{t('auth.noAccount')} </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSignUp}
          className="text-primary hover:text-primary/80 hover:bg-primary/5 p-0 h-auto font-semibold underline underline-offset-4"
        >
          {t('auth.signUpHere')}
        </Button>
      </div>
    </div>
  );
};
