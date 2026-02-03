import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowDownCircle, ArrowUpCircle, Calendar, User, Filter } from "lucide-react";
import { mockStudents } from "@/data/mockData";

export interface CreditNoteHistoryItem {
  id: string;
  student_id: number;
  studentName: string;
  amount: number;
  description: string;
  issued_at: string;
  type: 'refund' | 'discount' | 'overpayment' | 'cancellation';
  status: 'active' | 'used' | 'expired';
  academicYear: string;
  usedAmount?: number;
}

interface CreditNoteHistoryProps {
  creditNotes: CreditNoteHistoryItem[];
}

export const CreditNoteHistory = ({ creditNotes }: CreditNoteHistoryProps) => {
  const { language, formatCurrency, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");

  // Extract unique years from credit notes
  const years = [...new Set(creditNotes.map(cn => cn.academicYear))].sort((a, b) => b.localeCompare(a));
  
  // Get unique students from credit notes
  const students = mockStudents;

  // Filter credit notes
  const filteredCreditNotes = creditNotes.filter(cn => {
    const matchesSearch = searchQuery === '' || 
      cn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cn.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = selectedYear === 'all' || cn.academicYear === selectedYear;
    const matchesType = selectedType === 'all' || cn.status === selectedType;
    const matchesStudent = selectedStudent === 'all' || cn.student_id.toString() === selectedStudent;
    
    return matchesSearch && matchesYear && matchesType && matchesStudent;
  });

  // Calculate totals
  const availableCredit = filteredCreditNotes
    .filter(cn => cn.status === 'active')
    .reduce((sum, cn) => sum + (cn.amount - (cn.usedAmount || 0)), 0);
    
  const usedCredit = filteredCreditNotes
    .reduce((sum, cn) => sum + (cn.usedAmount || 0), 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'th' ? 'th-TH' : language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">{t('creditNote.active')}</Badge>;
      case 'used':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">{t('creditNote.used')}</Badge>;
      case 'expired':
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/30">{t('creditNote.expired')}</Badge>;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'refund':
        return t('creditNote.typeRefund');
      case 'discount':
        return t('creditNote.typeDiscount');
      case 'overpayment':
        return t('creditNote.typeOverpayment');
      case 'cancellation':
        return t('creditNote.typeCancellation');
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle className={`text-sm font-medium ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
              {t('creditNote.filters')}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('creditNote.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className={language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}>
                <SelectValue placeholder={t('creditNote.academicYear')} />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                <SelectItem value="all">{t('creditNote.allYears')}</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className={language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}>
                <SelectValue placeholder={t('creditNote.type')} />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                <SelectItem value="all">{t('creditNote.allTypes')}</SelectItem>
                <SelectItem value="active">{t('creditNote.active')}</SelectItem>
                <SelectItem value="used">{t('creditNote.used')}</SelectItem>
                <SelectItem value="expired">{t('creditNote.expired')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className={language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}>
                <SelectValue placeholder={t('portal.allStudents')} />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                <SelectItem value="all">{t('portal.allStudents')}</SelectItem>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.avatar} {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-500/20">
                <ArrowDownCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className={`text-sm text-muted-foreground ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                  {t('creditNote.availableCredit')}
                </p>
                <p className={`text-2xl font-bold text-emerald-600 ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                  {formatCurrency(availableCredit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-500/20">
                <ArrowUpCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className={`text-sm text-muted-foreground ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                  {t('creditNote.usedCredit')}
                </p>
                <p className={`text-2xl font-bold text-amber-600 ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                  {formatCurrency(usedCredit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Note List */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className={`flex items-center gap-2 ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
              <ArrowDownCircle className="h-5 w-5 text-primary" />
              {t('creditNote.history')}
            </CardTitle>
            <p className={`text-sm text-muted-foreground ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
              * {t('creditNote.perStudentNote')}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCreditNotes.length === 0 ? (
            <div className="text-center py-12">
              <ArrowDownCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className={`text-muted-foreground ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                {t('creditNote.noResults')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCreditNotes.map((creditNote) => (
                <div
                  key={creditNote.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full ${creditNote.status === 'active' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                        <ArrowDownCircle className={`h-4 w-4 ${creditNote.status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                            {creditNote.id}
                          </span>
                          {getStatusBadge(creditNote.status)}
                        </div>
                        <p className={`text-sm text-muted-foreground mt-1 ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                          {creditNote.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {t('creditNote.issued')}: {formatDate(creditNote.issued_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {creditNote.studentName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-lg font-bold ${creditNote.status === 'active' ? 'text-emerald-600' : 'text-muted-foreground'} ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                        +{formatCurrency(creditNote.amount)}
                      </p>
                      {creditNote.usedAmount && creditNote.usedAmount > 0 && (
                        <p className={`text-sm text-amber-600 ${language === 'th' ? 'font-sukhumvit' : language === 'zh' ? 'font-noto-sc' : 'font-lato'}`}>
                          -{formatCurrency(creditNote.usedAmount)} {t('creditNote.used')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
