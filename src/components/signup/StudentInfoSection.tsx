
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile, SCHOOL_YEARS } from '@/types/signup';

interface StudentInfoSectionProps {
  profile: UserProfile;
  email: string;
  password: string;
  confirmPassword: string;
  onProfileChange: (profile: Partial<UserProfile>) => void;
  onBasicInfoChange: (data: { email?: string; password?: string; confirmPassword?: string }) => void;
  step: number;
}

const StudentInfoSection = ({ 
  profile, 
  email, 
  password, 
  confirmPassword, 
  onProfileChange, 
  onBasicInfoChange,
  step 
}: StudentInfoSectionProps) => {
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">📧 Dados Básicos</h2>
          <p className="text-gray-600">Vamos começar com suas informações de login</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => onBasicInfoChange({ email: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700 font-medium">
              Senha *
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => onBasicInfoChange({ password: e.target.value })}
              className="mt-1"
              required
              minLength={6}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
              Confirmar Senha *
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => onBasicInfoChange({ confirmPassword: e.target.value })}
              className="mt-1"
              required
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-500 mt-1">As senhas não coincidem</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">👤 Suas Informações</h2>
          <p className="text-gray-600">Conte-nos um pouco sobre você</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="text-gray-700 font-medium">
              Nome Completo *
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Digite seu nome completo"
              value={profile.full_name}
              onChange={(e) => onProfileChange({ full_name: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="dateOfBirth" className="text-gray-700 font-medium">
              Data de Nascimento *
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={profile.date_of_birth}
              onChange={(e) => onProfileChange({ date_of_birth: e.target.value })}
              className="mt-1"
              required
            />
            {profile.is_minor && (
              <p className="text-sm text-blue-600 mt-1">
                🔒 Como você é menor de 18 anos, precisaremos das informações do seu responsável
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="schoolYear" className="text-gray-700 font-medium">
              Série/Ano Escolar
            </Label>
            <Select value={profile.school_year} onValueChange={(value) => onProfileChange({ school_year: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione sua série (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {SCHOOL_YEARS.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StudentInfoSection;
