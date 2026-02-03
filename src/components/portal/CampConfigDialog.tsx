import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { 
  Calendar,
  Home,
  AlertCircle,
  ChevronDown,
  Check,
  User,
  Globe
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
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

interface CampConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  camp: {
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
  };
  onConfirm: (config: {
    selectedWeeks: number[];
    boardingType: string;
    allergies: string;
    medicalConditions: string;
    nationality: string;
    gender: string;
    totalPrice: number;
  }) => void;
}

export const CampConfigDialog = ({
  open,
  onOpenChange,
  camp,
  onConfirm,
}: CampConfigDialogProps) => {
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>(
    camp.campType === 'package' ? camp.availableWeeks : []
  );
  const [weekBoardingOptions, setWeekBoardingOptions] = useState<Record<number, string>>({});
  const [allergies, setAllergies] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [nationality, setNationality] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [nationalityOpen, setNationalityOpen] = useState(false);
  const { language, formatCurrency } = useLanguage();

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
    
    setSelectedWeeks(prev => {
      if (prev.includes(week)) {
        const newWeeks = prev.filter(w => w !== week);
        setWeekBoardingOptions(current => {
          const { [week]: _, ...rest } = current;
          return rest;
        });
        return newWeeks;
      } else {
        return [...prev, week];
      }
    });
  };

  const handleBoardingChange = (week: number, boardingId: string) => {
    setWeekBoardingOptions(prev => ({
      ...prev,
      [week]: boardingId
    }));
  };

  const campPrice = camp.campType === 'flexible' 
    ? selectedWeeks.length * camp.pricePerWeek 
    : camp.price;
  
  const boardingPrice = selectedWeeks.reduce((total, week) => {
    const boardingId = weekBoardingOptions[week];
    if (!boardingId) return total;
    const option = camp.boardingOptions.find(b => b.id === boardingId);
    return total + (option?.price || 0);
  }, 0);
  
  const totalPrice = campPrice + boardingPrice;

  const allWeeksHaveBoarding = selectedWeeks.every(week => weekBoardingOptions[week]);

  const canConfirm = 
    (camp.campType === 'package' || selectedWeeks.length > 0) &&
    allWeeksHaveBoarding &&
    allergies.trim() !== '' &&
    medicalConditions.trim() !== '' &&
    nationality !== '' &&
    gender !== '';

  const handleConfirm = () => {
    if (!canConfirm) return;
    
    onConfirm({
      selectedWeeks,
      boardingType: JSON.stringify(weekBoardingOptions),
      allergies,
      medicalConditions,
      nationality,
      gender,
      totalPrice,
    });
    
    // Reset form
    setSelectedWeeks(camp.campType === 'package' ? camp.availableWeeks : []);
    setWeekBoardingOptions({});
    setAllergies("");
    setMedicalConditions("");
    setNationality("");
    setGender("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form
    setSelectedWeeks(camp.campType === 'package' ? camp.availableWeeks : []);
    setWeekBoardingOptions({});
    setAllergies("");
    setMedicalConditions("");
    setNationality("");
    setGender("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`flex items-center justify-between ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
            <span>{camp.name}</span>
            <Badge className="bg-primary/20 text-primary">
              #{camp.campus}
            </Badge>
          </DialogTitle>
          <DialogDescription className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
            {language === 'th' ? 'กรุณากรอกข้อมูลสำหรับการลงทะเบียน Camp' :
             language === 'zh' ? '请填写营地注册信息' :
             'Please fill in the information for camp registration'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Week Selection */}
          <div className="space-y-3">
            <Label className={`flex items-center gap-2 text-base ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
              <Calendar className="h-4 w-4" />
              {language === 'th' ? 'เลือกสัปดาห์' : language === 'zh' ? '选择周' : 'Select Weeks'}
            </Label>
            
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
          </div>

          <Separator />

          {/* Boarding Options per Week */}
          {selectedWeeks.length > 0 && (
            <div className="space-y-4">
              <Label className={`flex items-center gap-2 text-base ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                <Home className="h-4 w-4" />
                {language === 'th' ? 'เลือกที่พักสำหรับแต่ละสัปดาห์' : language === 'zh' ? '选择每周的住宿' : 'Select Boarding for Each Week'}
                <span className="text-destructive">*</span>
              </Label>

              {selectedWeeks.map((week) => (
                <div key={week} className="space-y-2 p-4 border rounded-lg bg-muted/30">
                  <Label className={`font-semibold ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                    {getWeekLabel(week)}
                  </Label>
                  
                  <RadioGroup 
                    value={weekBoardingOptions[week] || ""} 
                    onValueChange={(value) => handleBoardingChange(week, value)}
                  >
                    <div className="space-y-2">
                      {camp.boardingOptions.map((option) => (
                        <div key={option.id} className="flex items-center justify-between p-2 border rounded hover:bg-background">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={option.id} id={`boarding-${week}-${option.id}`} />
                            <Label htmlFor={`boarding-${week}-${option.id}`} className={`cursor-pointer text-sm ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
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
                          <span className={`font-semibold text-blue-600 text-sm ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                            +{formatCurrency(option.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* Student Information - Nationality & Gender */}
          <div className="space-y-4">
            <Label className={`flex items-center gap-2 text-base ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
              <User className="h-4 w-4" />
              {language === 'th' ? 'ข้อมูลนักเรียน' : language === 'zh' ? '学生信息' : 'Student Information'}
            </Label>

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
          </div>

          <Separator />

          {/* Health Information */}
          <div className="space-y-4">
            <Label className={`text-base ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
              {language === 'th' ? 'ข้อมูลสุขภาพนักเรียน' : language === 'zh' ? '学生健康信息' : 'Student Health Information'}
            </Label>
            
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
                className={`min-h-[80px] ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}
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
                className={`min-h-[80px] ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}
              />
            </div>
          </div>

          <Separator />

          {/* Price Summary */}
          <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
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
              <>
                <div className="flex justify-between">
                  <span className={`text-sm ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                    {language === 'th' ? 'ค่าที่พัก' : language === 'zh' ? '住宿费' : 'Boarding'}
                  </span>
                  <span className={`text-sm ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                    {formatCurrency(boardingPrice)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground ml-4 space-y-1">
                  {selectedWeeks.map(week => {
                    const boardingId = weekBoardingOptions[week];
                    const option = camp.boardingOptions.find(b => b.id === boardingId);
                    if (!option) return null;
                    return (
                      <div key={week} className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                        {getWeekLabel(week)}: {formatCurrency(option.price)}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <Separator />

            <div className="flex justify-between font-bold">
              <span className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                {language === 'th' ? 'ราคารวม' : language === 'zh' ? '总价' : 'Total'}
              </span>
              <span className={`text-blue-600 ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
            {language === 'th' ? 'ยกเลิก' : language === 'zh' ? '取消' : 'Cancel'}
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm} className={`${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
            {language === 'th' ? 'เพิ่มลงตะกร้า' : language === 'zh' ? '加入购物车' : 'Add to Cart'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};