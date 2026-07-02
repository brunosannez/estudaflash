
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile, SCHOOL_YEARS } from '@/types/signup';

interface StudentInfoSectionProps {
  profile: UserProfile;
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  onProfileChange: (profile: Partial<UserProfile>) => void;
  onBasicInfoChange: (data: { email?: string; password?: string; confirmPassword?: string; username?: string }) => void;
  step: number;
}

const StudentInfoSection = ({ 
  profile, 
  email, 
  password, 
  confirmPassword,
  username,
  onProfileChange, 
  onBasicInfoChange,
  step 
}: StudentInfoSectionProps) => {
  if (step === 1) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-foreground mb-1">📧 Dados Básicos</h2>
          <p className="text-sm text-muted-foreground">Vamos começar com suas informações de login</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => onBasicInfoChange({ email: e.target.value })}
              className="mt-1 h-10"
              required
            />
          </div>

          <div>
            <Label htmlFor="username" className="text-sm font-medium text-foreground/80">
              Nome de Usuário *
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="meuusername"
              value={username}
              onChange={(e) => onBasicInfoChange({ username: e.target.value })}
              className="mt-1 h-10"
              required
              minLength={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo 3 caracteres. Este será seu nome de exibição no EstudoFácil AI.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                Senha *
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 caracteres"
                value={password}
                onChange={(e) => onBasicInfoChange({ password: e.target.value })}
                className="mt-1 h-10"
                required
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/80">
                Confirmar Senha *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite novamente"
                value={confirmPassword}
                onChange={(e) => onBasicInfoChange({ confirmPassword: e.target.value })}
                className="mt-1 h-10"
                required
              />
            </div>
          </div>
          
          {confirmPassword && password !== confirmPassword && (
            <p className="text-sm text-red-500">As senhas não coincidem</p>
          )}
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-foreground mb-1">👤 Suas Informações</h2>
          <p className="text-sm text-muted-foreground">Conte-nos um pouco sobre você</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium text-foreground/80">
              Nome Completo *
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Digite seu nome completo"
              value={profile.full_name}
              onChange={(e) => onProfileChange({ full_name: e.target.value })}
              className="mt-1 h-10"
              required
            />
          </div>

          <div>
            <Label htmlFor="dateOfBirth" className="text-sm font-medium text-foreground/80">
              Data de Nascimento *
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={profile.date_of_birth}
              onChange={(e) => onProfileChange({ date_of_birth: e.target.value })}
              className="mt-1 h-10"
              required
            />
            {profile.is_minor && (
              <div className="mt-2 p-3 bg-primary/5 border border-blue-200 rounded-lg">
                <p className="text-sm text-primary flex items-center">
                  🔒 <span className="ml-1">Como você é menor de 18 anos, precisaremos das informações do seu responsável no próximo passo</span>
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="schoolYear" className="text-sm font-medium text-foreground/80">
              Série/Ano Escolar
            </Label>
            <Select value={profile.school_year} onValueChange={(value) => onProfileChange({ school_year: value })}>
              <SelectTrigger className="mt-1 h-10">
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
