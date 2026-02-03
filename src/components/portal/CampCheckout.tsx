import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { 
  CreditCard,
  ArrowLeft,
  Calendar,
  Home,
  AlertCircle,
  ChevronDown,
  Check,
  User,
  Globe,
  CalendarIcon
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PaymentProcessing } from "./PaymentProcessing";
import { PaymentProgressBar } from "./PaymentProgressBar";
import { Switch } from "@/components/ui/switch";
import { nationalities } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface BoardingOption {
  id: string;
  name: string;
  price: number;
}

interface WeekDates {
  [key: number]: { start: string; end: string };
}

interface CampItem {
  id: string;
  name: string;
  price: number;
  campType: 'flexible' | 'package';
  campus: string;
  totalWeeks: number;
  availableWeeks: number[];
  pricePerWeek: number;
  boardingOptions: BoardingOption[];
  weekDates?: WeekDates;
}

interface CampCheckoutProps {
  camp: CampItem;
  creditBalance: number;
  onPaymentSuccess: (paymentData: any) => void;
  onCancel: () => void;
}

const paymentMethods = [
  { id: 'credit_card', name: 'บัตรเครดิต', icon: CreditCard, fee: 2.9, currency: '%' },
  { id: 'promptpay', name: 'พร้อมเพย์', icon: CreditCard, fee: 0, currency: '฿' },
];

export const CampCheckout = ({ 
  camp, 
  creditBalance, 
  onPaymentSuccess, 
  onCancel 
}: CampCheckoutProps) => {
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>(
    camp.campType === 'package' ? camp.availableWeeks : []
  );
  const [selectedBoarding, setSelectedBoarding] = useState<string | null>(null);
  const [allergies, setAllergies] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [nationality, setNationality] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [dobOpen, setDobOpen] = useState(false);
  const [nationalityOpen, setNationalityOpen] = useState(false);
  const [useCreditNote, setUseCreditNote] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0]);
  const [showPaymentProcessing, setShowPaymentProcessing] = useState(false);
  const { language, formatCurrency, t } = useLanguage();

  const formatWeekDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const getWeekLabel = (week: number) => {
    const baseLabel = language === 'th' ? `สัปดาห์ ${week}` : 
                      language === 'zh' ? `第${week}周` : 
                      `Week ${week}`;
    
    if (camp.weekDates && camp.weekDates[week]) {
      const { start } = camp.weekDates[week];
      return `${baseLabel} (${formatWeekDate(start)})`;
    }
    return baseLabel;
  };

  const handleWeekToggle = (week: number) => {
    if (camp.campType === 'package') return;
    
    setSelectedWeeks(prev => 
      prev.includes(week) 
        ? prev.filter(w => w !== week)
        : [...prev, week]
    );
  };

  // Calculate amounts
  const campPrice = camp.campType === 'flexible' 
    ? selectedWeeks.length * camp.pricePerWeek 
    : camp.price;
  
  const boardingPrice = selectedBoarding 
    ? camp.boardingOptions.find(b => b.id === selectedBoarding)?.price || 0 
    : 0;
  
  const subtotalAmount = campPrice + boardingPrice;
  const creditApplied = useCreditNote ? Math.min(creditBalance, subtotalAmount) : 0;
  const amountAfterCredit = subtotalAmount - creditApplied;
  
  const paymentFee = selectedPaymentMethod.currency === '%' 
    ? amountAfterCredit * (selectedPaymentMethod.fee / 100)
    : selectedPaymentMethod.fee;
  
  const totalAmount = amountAfterCredit + paymentFee;

  const canProceed = camp.campType === 'package' 
    ? selectedBoarding !== null && allergies.trim() !== '' && medicalConditions.trim() !== '' && nationality !== '' && gender !== '' && dateOfBirth !== undefined
    : selectedWeeks.length > 0 && selectedBoarding !== null && allergies.trim() !== '' && medicalConditions.trim() !== '' && nationality !== '' && gender !== '' && dateOfBirth !== undefined;

  const handlePayment = () => {
    if (!canProceed) return;
    setShowPaymentProcessing(true);
  };

  const handlePaymentComplete = (success: boolean, paymentData?: any) => {
    if (success && paymentData) {
      const completePaymentData = {
        ...paymentData,
        campDetails: {
          campId: camp.id,
          campName: camp.name,
          campus: camp.campus,
          selectedWeeks,
          boardingType: selectedBoarding,
          allergies,
          medicalConditions,
          nationality,
          gender,
          dateOfBirth: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : null,
        },
        subtotalAmount,
        creditApplied,
        paymentFee,
      };
      onPaymentSuccess(completePaymentData);
    }
  };

  const handleBackFromPayment = () => {
    setShowPaymentProcessing(false);
  };

  if (showPaymentProcessing) {
    return (
      <div className="max-w-4xl mx-auto">
        <PaymentProgressBar currentStep={2} />
        <PaymentProcessing
          paymentMethod={selectedPaymentMethod}
          amount={totalAmount}
          onPaymentComplete={handlePaymentComplete}
          onCancel={handleBackFromPayment}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PaymentProgressBar currentStep={1} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Camp Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Back Button */}
          <Button variant="ghost" onClick={onCancel} className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'th' ? 'กลับ' : language === 'zh' ? '返回' : 'Back'}
          </Button>

          {/* Camp Info */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center justify-between ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                <span>{camp.name}</span>
                <Badge className="bg-primary/20 text-primary">
                  #{camp.campus}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Week Selection */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                <Calendar className="h-5 w-5" />
                {language === 'th' ? 'เลือกสัปดาห์' : language === 'zh' ? '选择周' : 'Select Weeks'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {camp.campType === 'package' && (
                <div className="flex items-center gap-2 p-3 bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className={`text-sm ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                    {language === 'th' ? 'แพ็คเกจนี้ต้องเรียนครบทุกสัปดาห์' : 
                     language === 'zh' ? '此套餐需要完整周数' : 
                     'This package requires all weeks'}
                  </span>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {camp.availableWeeks.map((week) => (
                  <div key={week} className="flex items-center space-x-2">
                    <Checkbox
                      id={`week-${week}`}
                      checked={selectedWeeks.includes(week)}
                      onCheckedChange={() => handleWeekToggle(week)}
                      disabled={camp.campType === 'package'}
                    />
                    <Label 
                      htmlFor={`week-${week}`}
                      className={`cursor-pointer text-sm ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}
                    >
                      {getWeekLabel(week)}
                    </Label>
                  </div>
                ))}
              </div>

              {camp.campType === 'flexible' && (
                <p className={`text-sm text-muted-foreground ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                  {language === 'th' ? `ราคา ${formatCurrency(camp.pricePerWeek)} ต่อสัปดาห์` :
                   language === 'zh' ? `每周 ${formatCurrency(camp.pricePerWeek)}` :
                   `${formatCurrency(camp.pricePerWeek)} per week`}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Boarding Options */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                <Home className="h-5 w-5" />
                {language === 'th' ? 'ที่พัก (On Boarding)' : language === 'zh' ? '住宿' : 'Boarding'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedBoarding || ""} onValueChange={setSelectedBoarding}>
                <div className="space-y-3">
                  {camp.boardingOptions.map((option) => (
                    <div key={option.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className={`cursor-pointer ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                          {language === 'th' ? 
                            (option.id === 'weekday' ? 'ที่พักวันธรรมดา' :
                             option.id === 'weekend' ? 'ที่พักวันหยุดสุดสัปดาห์' :
                             'ที่พักวันธรรมดา + สุดสัปดาห์') :
                           language === 'zh' ?
                            (option.id === 'weekday' ? '工作日住宿' :
                             option.id === 'weekend' ? '周末住宿' :
                             '工作日 + 周末住宿') :
                            option.name}
                        </Label>
                      </div>
                      <span className={`font-semibold text-blue-600 ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                        +{formatCurrency(option.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Student Information - DOB, Nationality & Gender */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                <User className="h-5 w-5" />
                {language === 'th' ? 'ข้อมูลนักเรียน' : language === 'zh' ? '学生信息' : 'Student Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date of Birth */}
              <div className="space-y-2">
                <Label className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                  <CalendarIcon className="h-4 w-4 inline mr-2" />
                  {language === 'th' ? 'วันเกิด' : language === 'zh' ? '出生日期' : 'Date of Birth'}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Popover open={dobOpen} onOpenChange={setDobOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateOfBirth && "text-muted-foreground",
                        language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateOfBirth ? format(dateOfBirth, "PPP") : (language === 'th' ? 'เลือกวันเกิด...' : language === 'zh' ? '选择出生日期...' : 'Select date of birth...')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateOfBirth}
                      onSelect={(date) => {
                        setDateOfBirth(date);
                        setDobOpen(false);
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Nationality - Searchable Dropdown */}
              <div className="space-y-2">
                <Label className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                  <Globe className="h-4 w-4 inline mr-2" />
                  {language === 'th' ? 'สัญชาติ' : language === 'zh' ? '国籍' : 'Nationality'}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Popover open={nationalityOpen} onOpenChange={setNationalityOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={nationalityOpen}
                      className={`w-full justify-between ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}
                    >
                      {nationality || (language === 'th' ? 'เลือกสัญชาติ...' : language === 'zh' ? '选择国籍...' : 'Select nationality...')}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 z-50" align="start">
                    <Command>
                      <CommandInput 
                        placeholder={language === 'th' ? 'ค้นหาสัญชาติ...' : language === 'zh' ? '搜索国籍...' : 'Search nationality...'} 
                      />
                      <CommandList>
                        <CommandEmpty>
                          {language === 'th' ? 'ไม่พบสัญชาติ' : language === 'zh' ? '未找到国籍' : 'No nationality found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {nationalities.map((nat) => (
                            <CommandItem
                              key={nat}
                              value={nat}
                              onSelect={(currentValue) => {
                                setNationality(currentValue === nationality ? "" : currentValue);
                                setNationalityOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  nationality === nat ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {nat}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                  {language === 'th' ? 'เพศ' : language === 'zh' ? '性别' : 'Gender'}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Select value={gender} onValueChange={(value: "male" | "female") => setGender(value)}>
                  <SelectTrigger className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                    <SelectValue placeholder={language === 'th' ? 'เลือกเพศ...' : language === 'zh' ? '选择性别...' : 'Select gender...'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">
                      {language === 'th' ? 'ชาย' : language === 'zh' ? '男' : 'Male'}
                    </SelectItem>
                    <SelectItem value="female">
                      {language === 'th' ? 'หญิง' : language === 'zh' ? '女' : 'Female'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Health Information */}
          <Card>
            <CardHeader>
              <CardTitle className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                {language === 'th' ? 'ข้อมูลสุขภาพนักเรียน' : language === 'zh' ? '学生健康信息' : 'Student Health Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="allergies" className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                  {language === 'th' ? 'อาการแพ้ (Allergies)' : language === 'zh' ? '过敏史' : 'Allergies'}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Textarea
                  id="allergies"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder={language === 'th' ? 'กรุณาระบุอาการแพ้ของนักเรียน (ถ้าไม่มีให้ใส่ "ไม่มี")' :
                               language === 'zh' ? '请填写学生过敏史（如无请填"无"）' :
                               'Please specify student allergies (if none, type "None")'}
                  className={`min-h-[100px] ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical" className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                  {language === 'th' ? 'โรคประจำตัว' : language === 'zh' ? '慢性病' : 'Medical Conditions'}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Textarea
                  id="medical"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder={language === 'th' ? 'กรุณาระบุโรคประจำตัวของนักเรียน (ถ้าไม่มีให้ใส่ "ไม่มี")' :
                               language === 'zh' ? '请填写学生慢性病（如无请填"无"）' :
                               'Please specify medical conditions (if none, type "None")'}
                  className={`min-h-[100px] ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                {t('processing.selectPayment')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-6 rounded-lg cursor-pointer transition-all text-center border-2 ${
                      selectedPaymentMethod.id === method.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-muted/20 hover:border-muted/40 hover:bg-muted/10'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method)}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <method.icon className="h-8 w-8" />
                      <span className={`font-medium ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                        {method.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Credit Note Application */}
          {creditBalance > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="credit-toggle"
                      checked={useCreditNote}
                      onCheckedChange={setUseCreditNote}
                    />
                    <div>
                      <Label htmlFor="credit-toggle" className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                        {t('portal.useCreditNote')}
                      </Label>
                      <p className={`text-sm text-muted-foreground ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                        {t('portal.available')}: {formatCurrency(creditBalance)}
                      </p>
                    </div>
                  </div>
                  {useCreditNote && (
                    <Badge variant="outline" className={`bg-finance-green/20 text-finance-green ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                      -{formatCurrency(creditApplied)}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Payment Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                {t('portal.paymentSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                    {language === 'th' ? 'ค่า Camp' : language === 'zh' ? '营地费用' : 'Camp Fee'}
                  </span>
                  <span className={`text-sm ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                    {formatCurrency(campPrice)}
                  </span>
                </div>

                {camp.campType === 'flexible' && selectedWeeks.length > 0 && (
                  <div className="text-xs text-muted-foreground ml-4">
                    <span className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                      {selectedWeeks.length} {language === 'th' ? 'สัปดาห์' : language === 'zh' ? '周' : 'weeks'} × {formatCurrency(camp.pricePerWeek)}
                    </span>
                  </div>
                )}

                {boardingPrice > 0 && (
                  <div className="flex justify-between">
                    <span className={`text-sm ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                      {language === 'th' ? 'ค่าที่พัก' : language === 'zh' ? '住宿费' : 'Boarding'}
                    </span>
                    <span className={`text-sm ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                      {formatCurrency(boardingPrice)}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between">
                  <span className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                    {t('portal.subtotal')}
                  </span>
                  <span className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                    {formatCurrency(subtotalAmount)}
                  </span>
                </div>
                
                {creditApplied > 0 && (
                  <div className="flex justify-between text-finance-green">
                    <span className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                      {t('portal.creditNoteApplied')}
                    </span>
                    <span className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                      -{formatCurrency(creditApplied)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                    {t('portal.paymentFee')}
                  </span>
                  <span className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                    {formatCurrency(paymentFee)}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                    {t('portal.totalAmount')}
                  </span>
                  <span className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={handlePayment} 
                  size="lg" 
                  className={`w-full ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}
                  disabled={!canProceed}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {t('portal.pay')} {formatCurrency(totalAmount)}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onCancel} 
                  className={`w-full ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}
                >
                  {t('portal.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};