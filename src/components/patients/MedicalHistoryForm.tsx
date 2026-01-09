import { useState } from 'react';
import { Plus, Trash2, AlertTriangle, Pill, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MedicalHistoryFormProps {
  patientId: string;
  allergies?: Array<{
    id: string;
    allergen: string;
    allergy_type: string;
    severity: string;
    reaction: string | null;
    notes: string | null;
  }>;
  medications?: Array<{
    id: string;
    medication_name: string;
    dosage: string | null;
    frequency: string | null;
    start_date: string | null;
    is_current: boolean | null;
    notes: string | null;
  }>;
  medicalHistory?: Array<{
    id: string;
    condition_name: string;
    condition_type: string;
    diagnosis_date: string | null;
    is_active: boolean | null;
    notes: string | null;
  }>;
  onRefresh: () => void;
}

export default function MedicalHistoryForm({
  patientId,
  allergies = [],
  medications = [],
  medicalHistory = [],
  onRefresh,
}: MedicalHistoryFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [addingAllergy, setAddingAllergy] = useState(false);
  const [addingMedication, setAddingMedication] = useState(false);
  const [addingCondition, setAddingCondition] = useState(false);
  const [loading, setLoading] = useState(false);

  // Allergy form state
  const [allergen, setAllergen] = useState('');
  const [allergyType, setAllergyType] = useState('');
  const [allergySeverity, setAllergySeverity] = useState('');
  const [allergyReaction, setAllergyReaction] = useState('');

  // Medication form state
  const [medicationName, setMedicationName] = useState('');
  const [medicationDosage, setMedicationDosage] = useState('');
  const [medicationFrequency, setMedicationFrequency] = useState('');
  const [medicationNotes, setMedicationNotes] = useState('');

  // Condition form state
  const [conditionName, setConditionName] = useState('');
  const [conditionType, setConditionType] = useState('');
  const [conditionDate, setConditionDate] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');

  const resetAllergyForm = () => {
    setAllergen('');
    setAllergyType('');
    setAllergySeverity('');
    setAllergyReaction('');
    setAddingAllergy(false);
  };

  const resetMedicationForm = () => {
    setMedicationName('');
    setMedicationDosage('');
    setMedicationFrequency('');
    setMedicationNotes('');
    setAddingMedication(false);
  };

  const resetConditionForm = () => {
    setConditionName('');
    setConditionType('');
    setConditionDate('');
    setConditionNotes('');
    setAddingCondition(false);
  };

  const handleAddAllergy = async () => {
    if (!allergen || !allergyType || !allergySeverity) {
      toast({ title: 'خطأ', description: 'الرجاء ملء جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('patient_allergies').insert({
        patient_id: patientId,
        allergen,
        allergy_type: allergyType,
        severity: allergySeverity,
        reaction: allergyReaction || null,
        created_by: user?.id,
      });

      if (error) throw error;

      toast({ title: 'تم بنجاح', description: 'تم إضافة الحساسية' });
      resetAllergyForm();
      onRefresh();
    } catch (error) {
      console.error(error);
      toast({ title: 'خطأ', description: 'فشل في إضافة الحساسية', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = async () => {
    if (!medicationName) {
      toast({ title: 'خطأ', description: 'الرجاء إدخال اسم الدواء', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('patient_medications').insert({
        patient_id: patientId,
        medication_name: medicationName,
        dosage: medicationDosage || null,
        frequency: medicationFrequency || null,
        notes: medicationNotes || null,
        is_current: true,
        created_by: user?.id,
      });

      if (error) throw error;

      toast({ title: 'تم بنجاح', description: 'تم إضافة الدواء' });
      resetMedicationForm();
      onRefresh();
    } catch (error) {
      console.error(error);
      toast({ title: 'خطأ', description: 'فشل في إضافة الدواء', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCondition = async () => {
    if (!conditionName || !conditionType) {
      toast({ title: 'خطأ', description: 'الرجاء ملء جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('patient_medical_history').insert({
        patient_id: patientId,
        condition_name: conditionName,
        condition_type: conditionType,
        diagnosis_date: conditionDate || null,
        notes: conditionNotes || null,
        is_active: true,
        created_by: user?.id,
      });

      if (error) throw error;

      toast({ title: 'تم بنجاح', description: 'تم إضافة الحالة المرضية' });
      resetConditionForm();
      onRefresh();
    } catch (error) {
      console.error(error);
      toast({ title: 'خطأ', description: 'فشل في إضافة الحالة المرضية', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllergy = async (id: string) => {
    try {
      await supabase.from('patient_allergies').delete().eq('id', id);
      toast({ title: 'تم الحذف' });
      onRefresh();
    } catch (error) {
      toast({ title: 'خطأ', variant: 'destructive' });
    }
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      await supabase.from('patient_medications').delete().eq('id', id);
      toast({ title: 'تم الحذف' });
      onRefresh();
    } catch (error) {
      toast({ title: 'خطأ', variant: 'destructive' });
    }
  };

  const handleDeleteCondition = async (id: string) => {
    try {
      await supabase.from('patient_medical_history').delete().eq('id', id);
      toast({ title: 'تم الحذف' });
      onRefresh();
    } catch (error) {
      toast({ title: 'خطأ', variant: 'destructive' });
    }
  };

  const severityColors: Record<string, string> = {
    mild: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    moderate: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    severe: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="space-y-6">
      {/* Allergies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            الحساسية
          </CardTitle>
          <Dialog open={addingAllergy} onOpenChange={setAddingAllergy}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 ml-1" />
                إضافة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة حساسية</DialogTitle>
                <DialogDescription>أضف معلومات الحساسية للمريض</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>المادة المسببة للحساسية *</Label>
                  <Input value={allergen} onChange={(e) => setAllergen(e.target.value)} placeholder="مثال: البنسلين" />
                </div>
                <div>
                  <Label>نوع الحساسية *</Label>
                  <Select value={allergyType} onValueChange={setAllergyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drug">دوائية</SelectItem>
                      <SelectItem value="food">غذائية</SelectItem>
                      <SelectItem value="environmental">بيئية</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>الشدة *</Label>
                  <Select value={allergySeverity} onValueChange={setAllergySeverity}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الشدة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">خفيفة</SelectItem>
                      <SelectItem value="moderate">متوسطة</SelectItem>
                      <SelectItem value="severe">شديدة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>رد الفعل التحسسي</Label>
                  <Input value={allergyReaction} onChange={(e) => setAllergyReaction(e.target.value)} placeholder="مثال: طفح جلدي" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetAllergyForm}>إلغاء</Button>
                  <Button onClick={handleAddAllergy} disabled={loading}>
                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {allergies.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">لا توجد حساسية مسجلة</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy) => (
                <Badge key={allergy.id} variant="outline" className={`gap-1 ${severityColors[allergy.severity] || ''}`}>
                  {allergy.allergen}
                  <button onClick={() => handleDeleteAllergy(allergy.id)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Medications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-500" />
            الأدوية الحالية
          </CardTitle>
          <Dialog open={addingMedication} onOpenChange={setAddingMedication}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 ml-1" />
                إضافة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة دواء حالي</DialogTitle>
                <DialogDescription>أضف الأدوية التي يتناولها المريض حالياً</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>اسم الدواء *</Label>
                  <Input value={medicationName} onChange={(e) => setMedicationName(e.target.value)} placeholder="اسم الدواء" />
                </div>
                <div>
                  <Label>الجرعة</Label>
                  <Input value={medicationDosage} onChange={(e) => setMedicationDosage(e.target.value)} placeholder="مثال: 500mg" />
                </div>
                <div>
                  <Label>التكرار</Label>
                  <Input value={medicationFrequency} onChange={(e) => setMedicationFrequency(e.target.value)} placeholder="مثال: مرتين يومياً" />
                </div>
                <div>
                  <Label>ملاحظات</Label>
                  <Textarea value={medicationNotes} onChange={(e) => setMedicationNotes(e.target.value)} placeholder="ملاحظات إضافية" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetMedicationForm}>إلغاء</Button>
                  <Button onClick={handleAddMedication} disabled={loading}>
                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">لا توجد أدوية مسجلة</p>
          ) : (
            <div className="space-y-2">
              {medications.map((med) => (
                <div key={med.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div>
                    <span className="font-medium">{med.medication_name}</span>
                    {med.dosage && <span className="text-muted-foreground text-sm mr-2">- {med.dosage}</span>}
                    {med.frequency && <span className="text-muted-foreground text-sm">({med.frequency})</span>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteMedication(med.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medical History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-500" />
            التاريخ المرضي
          </CardTitle>
          <Dialog open={addingCondition} onOpenChange={setAddingCondition}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 ml-1" />
                إضافة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة حالة مرضية</DialogTitle>
                <DialogDescription>أضف معلومات التاريخ المرضي للمريض</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>اسم الحالة *</Label>
                  <Input value={conditionName} onChange={(e) => setConditionName(e.target.value)} placeholder="مثال: السكري" />
                </div>
                <div>
                  <Label>النوع *</Label>
                  <Select value={conditionType} onValueChange={setConditionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chronic">مرض مزمن</SelectItem>
                      <SelectItem value="acute">مرض حاد</SelectItem>
                      <SelectItem value="surgery">عملية جراحية</SelectItem>
                      <SelectItem value="family">تاريخ عائلي</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>تاريخ التشخيص</Label>
                  <Input type="date" value={conditionDate} onChange={(e) => setConditionDate(e.target.value)} />
                </div>
                <div>
                  <Label>ملاحظات</Label>
                  <Textarea value={conditionNotes} onChange={(e) => setConditionNotes(e.target.value)} placeholder="ملاحظات إضافية" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetConditionForm}>إلغاء</Button>
                  <Button onClick={handleAddCondition} disabled={loading}>
                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {medicalHistory.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">لا يوجد تاريخ مرضي مسجل</p>
          ) : (
            <div className="space-y-2">
              {medicalHistory.map((condition) => (
                <div key={condition.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div>
                    <span className="font-medium">{condition.condition_name}</span>
                    <span className="text-muted-foreground text-sm mr-2">
                      ({condition.condition_type === 'chronic' ? 'مزمن' : 
                        condition.condition_type === 'surgery' ? 'جراحة' :
                        condition.condition_type === 'family' ? 'عائلي' : 'حاد'})
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCondition(condition.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
