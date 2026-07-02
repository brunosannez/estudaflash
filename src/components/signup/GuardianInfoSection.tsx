
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Guardian, GUARDIAN_RELATIONS } from '@/types/signup';
import { formatCPF, formatPhone, validateCPF } from '@/utils/signupValidation';

interface GuardianInfoSectionProps {
  guardian: Guardian | undefined;
  onGuardianChange: (guardian: Partial<Guardian>) => void;
}

const GuardianInfoSection = ({ guardian, onGuardianChange }: GuardianInfoSectionProps) => {
  const handleCPFChange = (value: string) => {
    const formattedCPF = formatCPF(value);
    onGuardianChange({ cpf: formattedCPF });
  };

  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatPhone(value);
    onGuardianChange({ phone: formattedPhone });
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-foreground mb-1">👨‍👩‍👧 Informações do Responsável</h2>
        <p className="text-sm text-muted-foreground">Como você é menor de 18 anos, precisamos dos dados do seu responsável</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="guardianName" className="text-sm font-medium text-foreground/80">
            Nome Completo do Responsável *
          </Label>
          <Input
            id="guardianName"
            type="text"
            placeholder="Nome do responsável"
            value={guardian?.full_name || ''}
            onChange={(e) => onGuardianChange({ full_name: e.target.value })}
            className="mt-1 h-10"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="guardianEmail" className="text-sm font-medium text-foreground/80">
              Email do Responsável *
            </Label>
            <Input
              id="guardianEmail"
              type="email"
              placeholder="email@responsavel.com"
              value={guardian?.email || ''}
              onChange={(e) => onGuardianChange({ email: e.target.value })}
              className="mt-1 h-10"
              required
            />
          </div>

          <div>
            <Label htmlFor="guardianPhone" className="text-sm font-medium text-foreground/80">
              Telefone *
            </Label>
            <Input
              id="guardianPhone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={guardian?.phone || ''}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="mt-1 h-10"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="guardianCPF" className="text-sm font-medium text-foreground/80">
              CPF do Responsável
            </Label>
            <Input
              id="guardianCPF"
              type="text"
              placeholder="000.000.000-00"
              value={guardian?.cpf || ''}
              onChange={(e) => handleCPFChange(e.target.value)}
              className="mt-1 h-10"
            />
            {guardian?.cpf && guardian.cpf.length >= 14 && !validateCPF(guardian.cpf) && (
              <p className="text-sm text-red-500 mt-1">CPF inválido</p>
            )}
          </div>

          <div>
            <Label htmlFor="relation" className="text-sm font-medium text-foreground/80">
              Parentesco *
            </Label>
            <Select 
              value={guardian?.relation_to_student || ''} 
              onValueChange={(value) => onGuardianChange({ relation_to_student: value })}
            >
              <SelectTrigger className="mt-1 h-10">
                <SelectValue placeholder="Selecione o parentesco" />
              </SelectTrigger>
              <SelectContent>
                {GUARDIAN_RELATIONS.map((relation) => (
                  <SelectItem key={relation} value={relation}>
                    {relation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardianInfoSection;
