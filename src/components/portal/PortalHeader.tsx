import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, LogOut, DollarSign, Clock, Sun, Receipt, ShoppingCart, Calendar, Settings, User } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import sisbLogo from "@/assets/kings-college-logo.jpg";
import { ParentAccountSelector } from "./ParentAccountSelector";
import { AccountSettingsDialog } from "./AccountSettingsDialog";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CountdownTimer } from "./CountdownTimer";
interface PortalHeaderProps {
  onLogout?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  cartItemCount?: number;
  onGoToCart?: () => void;
  showCountdown?: boolean;
  onCountdownExpired?: () => void;
  onCancelCountdown?: () => void;
  additionalCourses?: number;
  unpaidInvoicesCount?: number;
}
export const PortalHeader = ({
  onLogout,
  activeTab = "dashboard",
  onTabChange,
  cartItemCount = 0,
  onGoToCart,
  showCountdown = false,
  onCountdownExpired,
  onCancelCountdown,
  additionalCourses = 0,
  unpaidInvoicesCount = 0
}: PortalHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    t,
    language
  } = useLanguage();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['day.sunday', 'day.monday', 'day.tuesday', 'day.wednesday', 'day.thursday', 'day.friday', 'day.saturday'];
    const months = ['month.january', 'month.february', 'month.march', 'month.april', 'month.may', 'month.june', 'month.july', 'month.august', 'month.september', 'month.october', 'month.november', 'month.december'];
    const dayName = t(days[date.getDay()]);
    const monthName = t(months[date.getMonth()]);
    if (language === 'en') {
      return `${dayName}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`;
    } else if (language === 'th') {
      return `${dayName}ที่ ${date.getDate()} ${monthName} ${date.getFullYear() + 543}`;
    } else if (language === 'zh') {
      return `${date.getFullYear()}年${monthName}${date.getDate()}日 ${dayName}`;
    }
    return dateString;
  };
  const today = new Date();
  const formattedToday = formatDate(today.toISOString().split('T')[0]);
  return <>
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <img src={sisbLogo} alt="SISB Logo" className="h-10 w-auto" />
            <div>
              <h1 className={`text-lg font-bold text-foreground ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>Payment Portal</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            <ParentAccountSelector onLogout={onLogout} />
            <LanguageSelector />

          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="px-2 py-4 space-y-4">

            {/* User Info */}
            <div className="px-2 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">JS</AvatarFallback>
              </Avatar>
              <div>
                <p className={`font-semibold text-sm ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>John Smith</p>
                <p className="text-xs text-muted-foreground">john.smith@email.com</p>
              </div>
            </div>
            <Separator />

            {/* Navigation Menu */}
            <div className="px-2">
              <h4 className={`font-medium mb-3 text-sm text-muted-foreground ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>{t('nav.home')}</h4>
              <div className="space-y-1">
                <button onClick={() => { onTabChange?.("dashboard"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === "dashboard" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"} ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                  <GraduationCap className="h-4 w-4" />
                  Dashboard
                </button>
                <button onClick={() => { onTabChange?.("tuition"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === "tuition" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"} ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4" />
                    Tuition
                  </div>
                  {unpaidInvoicesCount > 0 && (
                    <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unpaidInvoicesCount}
                    </Badge>
                  )}
                </button>
                <button onClick={() => { onTabChange?.("afterschool"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === "afterschool" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"} ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                  <Clock className="h-4 w-4" />
                  ECA & EAS
                </button>
                <button onClick={() => { onTabChange?.("summer"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === "summer" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"} ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                  <Sun className="h-4 w-4" />
                  Camp
                </button>

                {/* Event with Sub-items */}
                <div className="space-y-1">
                  <button onClick={() => { onTabChange?.("event"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === "event" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"} ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                    <Calendar className="h-4 w-4" />
                    Event
                  </button>
                </div>

                <button onClick={() => { onTabChange?.("transaction"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === "transaction" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"} ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                  <Receipt className="h-4 w-4" />
                  {language === 'th' ? 'ประวัติธุรกรรม' : 'Transaction History'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-2 pt-3 border-t border-border">
              <LanguageSelector />
              <div className="flex items-center gap-2">
                {cartItemCount > 0 && (
                  <Button variant="ghost" size="sm" className="relative" onClick={onGoToCart}>
                    <ShoppingCart className="h-4 w-4" />
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {cartItemCount}
                    </Badge>
                  </Button>
                )}
              </div>
            </div>

            {/* Account Actions */}
            <div className="px-2 pt-3 border-t border-border space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSettingsOpen(true); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-center gap-2 ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}
              >
                <Settings className="h-4 w-4" />
                {language === 'th' ? 'ตั้งค่าบัญชี' : language === 'zh' ? '账户设置' : 'Account Settings'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => { onLogout?.(); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-center gap-2 ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}
              >
                <LogOut className="h-4 w-4" />
                {t('nav.logout')}
              </Button>
            </div>
          </div>
        </div>}
      </div>
    </header>

    <AccountSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

    {/* Welcome Section */}
    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className={`text-xl font-semibold text-primary ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                {t('portal.welcome')}, John Smith
              </h2>
              <p className={`text-sm text-muted-foreground ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                {t('portal.today')}: {formattedToday}
              </p>
            </div>

            {/* Countdown Timer */}
            {showCountdown && onCountdownExpired && onCancelCountdown && <CountdownTimer onTimeExpired={onCountdownExpired} onCancel={onCancelCountdown} additionalCourses={additionalCourses} />}
          </div>
        </div>
      </div>
    </div>
  </>;
};