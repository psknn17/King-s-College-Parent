import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { SignUp } from "@/components/auth/SignUp";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import schoolBuilding from "@/assets/school-building-new.jpg";
import sisbLogo from "@/assets/kings-college-logo.jpg";

interface LoginProps {
  onLogin: () => void;
}

type AuthView = "email" | "otp" | "signup";

export const Login = ({ onLogin }: LoginProps) => {
  const [currentView, setCurrentView] = useState<AuthView>("email");
  const [userEmail, setUserEmail] = useState<string>("");
  const { t, getFontClass } = useLanguage();

  const handleEmailSubmit = (email: string) => {
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
      default:
        return (
          <LoginForm
            onSubmitEmail={handleEmailSubmit}
            onSignUp={() => setCurrentView("signup")}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-20 lg:top-6 lg:right-6">
        <LanguageSelector />
      </div>

      {/* Left Side - School Building Image (Desktop Only) */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center lg:fixed lg:h-screen lg:left-0 lg:top-0"
        style={{ backgroundImage: `url(${schoolBuilding})` }}
      >
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* SISB Logo - Top Left */}
        <div className="absolute top-6 left-6 z-10">
          <img 
            src={sisbLogo} 
            alt="SISB International Schools"
            className="h-20 w-auto"
          />
        </div>
        
        {/* Content - Bottom Center */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-white z-10 max-w-md px-4">
          <h2 className="text-2xl font-bold mb-2">Parent Portal</h2>
          <p className="text-lg mb-4">Manage your child's education journey</p>
          <p className="text-sm mb-6">Secure authentication powered by your school</p>
          <p className="text-xs opacity-80">© 2024 Schooney Educational System</p>
        </div>
      </div>

      {/* Mobile/Tablet: Full Screen Layout */}
      <div className={`w-full lg:w-1/2 lg:ml-[50%] flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white lg:bg-background ${getFontClass()}`}>
        
        {/* Mobile/Tablet Hero Section */}
        <div 
          className="lg:hidden relative h-[35vh] min-h-[280px] bg-cover bg-center animate-fade-in"
          style={{ backgroundImage: `url(${schoolBuilding})` }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-transparent"></div>
          
          {/* Hero Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 px-6">
            <img 
              src={sisbLogo} 
              alt="SISB International Schools"
              className="h-20 w-auto mb-4 drop-shadow-lg animate-scale-in"
            />
            <h1 className="text-2xl font-bold tracking-tight drop-shadow-md animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Parent Portal
            </h1>
            <p className="text-sm opacity-90 mt-1 drop-shadow animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Manage your child's education journey
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="flex-1 flex items-start lg:items-center justify-center px-4 lg:p-6 -mt-12 lg:mt-0 relative z-10">
          <Card className="w-full max-w-md border-0 shadow-none lg:shadow-lg lg:border 
            lg:bg-card lg:backdrop-blur-none
            bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl
            animate-fade-in lg:animate-none"
            style={{ animationDelay: '0.15s' }}
          >
            <CardHeader className="text-center space-y-3 pb-6 pt-8 lg:pt-6 lg:pb-8">
              {/* Desktop: Show logo in card */}
              <div className="hidden lg:block mb-6">
                <div className="mx-auto flex items-center justify-center">
                  <img
                    src={sisbLogo}
                    alt="SISB International Schools"
                    className="h-32 w-auto"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-foreground animate-fade-in lg:animate-none" style={{ animationDelay: '0.25s' }}>
                  {currentView === "signup" ? t('auth.signupTitle') : 
                   currentView === "otp" ? t('auth.verifyOTP') :
                   t('portal.loginTitle')}
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground animate-fade-in lg:animate-none" style={{ animationDelay: '0.3s' }}>
                  {currentView === "email" && t('portal.loginSubtitle')}
                  {currentView === "otp" && t('auth.otpSubtitle')}
                  {currentView === "signup" && t('auth.signupSubtitle')}
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="pb-8">
              <div className="animate-fade-in lg:animate-none" style={{ animationDelay: '0.35s' }}>
                {renderAuthView()}
              </div>
              
              {currentView === "email" && (
                <div className="lg:hidden text-xs text-muted-foreground/80 text-center mt-8 space-y-1 animate-fade-in" style={{ animationDelay: '0.45s' }}>
                  <p>Secure authentication powered by your school</p>
                  <p>© 2024 Schooney Educational System</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
