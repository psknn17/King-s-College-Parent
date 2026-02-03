import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Receipt, CreditCard, DollarSign, FileText, Calendar, ExternalLink, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface UsedCreditNote {
  id: string;
  amount: number;
  appliedTo: string;
  used_at: string;
}

interface Receipt {
  id: string;
  invoice_id: string;
  student_id: number;
  studentName: string;
  year: string;
  amount: number;
  payment_method: 'credit_card' | 'bank_transfer' | 'credit_note' | 'cash';
  paid_at: string;
  receipt_url: string;
  status: 'completed' | 'processing' | 'failed';
  description: string;
  reference_number: string;
  type?: 'tuition' | 'activity' | 'camp' | 'event' | 'exam';
  usedCreditNotes?: UsedCreditNote[];
}

interface ReceiptListProps {
  receipts: Receipt[];
  onDownload?: (receiptId: string) => void;
}

export const ReceiptList = ({ receipts, onDownload }: ReceiptListProps) => {
  const { language, formatCurrency, t } = useLanguage();
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(undefined);

  // Extract unique years and students for filters
  const years = Array.from(new Set(receipts.map(r => r.year))).sort((a, b) => b.localeCompare(a));
  const students = Array.from(new Set(receipts.map(r => ({ id: r.student_id, name: r.studentName }))))
    .sort((a, b) => a.name.localeCompare(b.name));

  const typeLabels: Record<string, string> = {
    tuition: t('receipt.typeTuition'),
    activity: t('receipt.typeActivity'),
    camp: t('receipt.typeCamp'),
    event: t('receipt.typeEvent'),
    exam: t('receipt.typeExam'),
  };

  // Filter receipts based on selected filters
  const filteredReceipts = receipts.filter(receipt => {
    const yearMatch = selectedYear === "all" || receipt.year === selectedYear;
    const studentMatch = selectedStudent === "all" || receipt.student_id.toString() === selectedStudent;
    const typeMatch = selectedType === "all" || receipt.type === selectedType;
    const monthMatch = !selectedMonth || (
      new Date(receipt.paid_at).getMonth() === selectedMonth.getMonth() &&
      new Date(receipt.paid_at).getFullYear() === selectedMonth.getFullYear()
    );
    return yearMatch && studentMatch && typeMatch && monthMatch;
  });

  const paymentMethodConfig = {
    credit_card: { 
      label: t('payment.creditCard'), 
      icon: CreditCard, 
      gradient: 'from-blue-500 to-purple-600' 
    },
    bank_transfer: { 
      label: t('payment.bankTransfer'), 
      icon: DollarSign, 
      gradient: 'from-green-500 to-emerald-600' 
    },
    credit_note: { 
      label: t('payment.creditNote'), 
      icon: FileText, 
      gradient: 'from-orange-500 to-amber-600' 
    },
    cash: { 
      label: t('payment.cash'), 
      icon: DollarSign, 
      gradient: 'from-gray-500 to-slate-600' 
    },
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'th' ? 'th-TH' : language === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'th' ? 'th-TH' : language === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFontClass = () => {
    return language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Month Filter */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${getFontClass()}`}>
            {t('receipt.month')}:
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[160px] justify-start text-left font-normal",
                  !selectedMonth && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {selectedMonth ? format(selectedMonth, "MMM yyyy") : t('receipt.pickMonth')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedMonth}
                onSelect={setSelectedMonth}
                initialFocus
                className="p-3 pointer-events-auto"
              />
              {selectedMonth && (
                <div className="p-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setSelectedMonth(undefined)}
                  >
                    {t('receipt.clearMonth')}
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Student Filter */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${getFontClass()}`}>
            {t('receipt.student')}:
          </span>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">{t('receipt.allStudents')}</SelectItem>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id.toString()}>{student.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${getFontClass()}`}>
            {t('receipt.type')}:
          </span>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">{t('receipt.allTypes')}</SelectItem>
              <SelectItem value="tuition">{t('receipt.typeTuition')}</SelectItem>
              <SelectItem value="activity">{t('receipt.typeActivity')}</SelectItem>
              <SelectItem value="camp">{t('receipt.typeCamp')}</SelectItem>
              <SelectItem value="event">{t('receipt.typeEvent')}</SelectItem>
              <SelectItem value="exam">{t('receipt.typeExam')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={`text-sm text-muted-foreground ml-auto ${getFontClass()}`}>
          {t('receipt.showing')} {filteredReceipts.length} {t('receipt.of')} {receipts.length}
        </div>
      </div>

      {filteredReceipts.length === 0 ? (
        <div className={`text-center py-8 text-muted-foreground ${getFontClass()}`}>
          <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('portal.noReceipts')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReceipts.map((receipt) => {
            const PaymentIcon = paymentMethodConfig[receipt.payment_method].icon;
            const iconGradient = paymentMethodConfig[receipt.payment_method].gradient;

            return (
              <div
                key={receipt.id}
                className="bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  {/* Left Section - Receipt Info */}
                  <div className="p-4 border-b lg:border-b-0 lg:border-r">
                    {/* Header with Student & Type Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className={`font-medium ${getFontClass()}`}>
                        {receipt.studentName}
                      </Badge>
                      {receipt.type && (
                        <Badge 
                          variant="outline" 
                          className={`${getFontClass()} ${
                            receipt.type === 'tuition' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                            receipt.type === 'activity' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                            receipt.type === 'camp' ? 'border-green-200 text-green-700 bg-green-50' :
                            receipt.type === 'event' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                            'border-pink-200 text-pink-700 bg-pink-50'
                          }`}
                        >
                          {typeLabels[receipt.type]}
                        </Badge>
                      )}
                    </div>

                    {/* Receipt Details */}
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${iconGradient} flex-shrink-0`}>
                        <Receipt className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-base ${getFontClass()}`}>
                          {receipt.description}
                        </p>
                        <p className={`text-sm text-muted-foreground ${getFontClass()}`}>
                          Ref: {receipt.reference_number}
                        </p>
                      </div>
                    </div>

                    {/* Amount & Payment Method */}
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className={`text-2xl font-bold ${getFontClass()}`}>
                          {formatCurrency(receipt.amount)}
                        </p>
                        <p className={`text-sm text-muted-foreground ${getFontClass()}`}>
                          {formatDate(receipt.paid_at)}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`gap-1.5 px-3 py-1 ${
                          receipt.payment_method === 'credit_card' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                          receipt.payment_method === 'bank_transfer' ? 'border-green-200 text-green-700 bg-green-50' :
                          receipt.payment_method === 'credit_note' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                          'border-gray-200 text-gray-700 bg-gray-50'
                        }`}
                      >
                        <PaymentIcon className="h-4 w-4" />
                        <span className={`text-sm ${getFontClass()}`}>
                          {paymentMethodConfig[receipt.payment_method].label}
                        </span>
                      </Badge>
                    </div>

                    {/* Download Button */}
                    {receipt.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={`mt-4 gap-2 ${getFontClass()}`}
                        onClick={() => onDownload?.(receipt.id)}
                      >
                        <Download className="h-4 w-4" />
                        {t('portal.downloadReceipt')}
                      </Button>
                    )}
                  </div>

                  {/* Right Section - Transaction Timeline */}
                  <div className="p-4 bg-muted/30">
                    <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${getFontClass()}`}>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {t('receipt.transactionTimeline')}
                    </h4>

                    {receipt.usedCreditNotes && receipt.usedCreditNotes.length > 0 ? (
                      <div className="space-y-3">
                        {receipt.usedCreditNotes.map((cn, index) => (
                          <div 
                            key={cn.id}
                            className="relative pl-4 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-amber-500 before:rounded-full"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className={`text-sm font-medium ${getFontClass()}`}>
                                  {t('receipt.usedCreditNote')}
                                </p>
                                <p className={`text-xs text-muted-foreground ${getFontClass()}`}>
                                  {formatDateTime(cn.used_at)}
                                </p>
                              </div>
                              <span className={`text-sm font-semibold text-amber-600 ${getFontClass()}`}>
                                -{formatCurrency(cn.amount)}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-1">
                              <span className={`text-xs text-muted-foreground ${getFontClass()}`}>
                                ({cn.id})
                              </span>
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <p className={`text-xs text-muted-foreground mt-0.5 ${getFontClass()}`}>
                              {t('receipt.appliedTo')} {cn.appliedTo}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-sm text-muted-foreground italic ${getFontClass()}`}>
                        {t('receipt.noCreditNotesUsed')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
