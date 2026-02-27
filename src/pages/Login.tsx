import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { SignUp } from "@/components/auth/SignUp";
import { ForgotPassword } from "@/components/auth/ForgotPassword";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogoBadge } from "@/components/LogoBadge";
import schoolBuilding from "@/assets/school-building-new.jpg";

interface LoginProps {
  onLogin: () => void;
}

type AuthView = "email" | "otp" | "signup" | "forgot";

export const Login = ({ onLogin }: LoginProps) => {
  const [currentView, setCurrentView] = useState<AuthView>("email");
  const [userEmail, setUserEmail] = useState<string>("");
  const { t, getFontClass } = useLanguage();

  const handleEmailSubmit = (email: string, _password: string) => {
    setUserEmail(email);
    setCurrentView("otp");
  };

  const handleOTPVerify = () => {
    onLogin();
  };

  const handleSignUp = () => {
    setCurrentView("email");
  };

  const renderAuthView = () => {
    switch (currentView) {
      case "otp":
        return (
          <OTPVerification
            email={userEmail}
            onVerify={handleOTPVerify}
            onBackToEmail={() => setCurrentView("email")}
          />
        );
      case "signup":
        return (
          <SignUp
            onSignUp={handleSignUp}
            onBackToLogin={() => setCurrentView("email")}
          />
        );
      case "forgot":
        return (
          <ForgotPassword
            onBackToLogin={() => setCurrentView("email")}
          />
        );
      default:
        return (
          <LoginForm
            onSubmitEmail={handleEmailSubmit}
            onSignUp={() => setCurrentView("signup")}
            onForgotPassword={() => setCurrentView("forgot")}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side — 65% */}
      <div
        className="hidden lg:block lg:w-[65%] fixed h-screen left-0 top-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${schoolBuilding})` }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white z-10 max-w-lg px-4">
          <h2 className="text-2xl font-bold mb-2">Parent Portal</h2>
          <p className="text-lg mb-2">Manage your child's education journey</p>
          <p className="text-xs opacity-70">© 2024 Schooney Educational System</p>
        </div>
      </div>

      {/* Right Side — 35% */}
      <div className={`w-full lg:w-[35%] lg:ml-[65%] flex flex-col min-h-screen bg-gray-50 ${getFontClass()}`}>

        {/* Language Selector */}
        <div className="flex justify-end px-6 pt-5">
          <LanguageSelector />
        </div>

        {/* Centered Card */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div
            className="w-full bg-white rounded-2xl"
            style={{
              maxWidth: 400,
              boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
              padding: "32px 40px",
            }}
          >
            {/* Logo */}
            <div className="flex justify-center mb-5 mt-10">
              <LogoBadge imgClassName="h-[190px] w-auto scale-125" />
            </div>

            {/* Title */}
            <div className="text-center mb-5">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentView === "signup" ? t('auth.signupTitle') :
                 currentView === "otp" ? t('auth.verifyOTP') :
                 currentView === "forgot" ? t('auth.resetPasswordTitle') :
                 t('portal.loginTitle')}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {currentView === "email" && t('portal.loginSubtitle')}
                {currentView === "otp" && t('auth.otpSubtitle')}
                {currentView === "signup" && t('auth.signupSubtitle')}
                {currentView === "forgot" && t('auth.resetPasswordSubtitle')}
              </p>
            </div>

            {renderAuthView()}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-6 space-y-0.5">
          <p>Secure authentication powered by your school</p>
          <p>© 2024 Schooney Educational System</p>
        </div>
      </div>
    </div>
  );
};
