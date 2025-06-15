
export interface UserProfile {
  full_name: string;
  date_of_birth: string;
  school_year?: string;
  is_minor: boolean;
}

export interface Guardian {
  full_name: string;
  email: string;
  phone: string;
  cpf?: string;
  relation_to_student: string;
}

export interface SignupFormData {
  // User basic info
  email: string;
  password: string;
  confirmPassword: string;
  
  // Profile info
  profile: UserProfile;
  
  // Guardian info (conditional)
  guardian?: Guardian;
  
  // Plan selection
  selectedPlanId: string;
}

export const SCHOOL_YEARS = [
  '1º ano - Ensino Fundamental',
  '2º ano - Ensino Fundamental',
  '3º ano - Ensino Fundamental',
  '4º ano - Ensino Fundamental',
  '5º ano - Ensino Fundamental',
  '6º ano - Ensino Fundamental',
  '7º ano - Ensino Fundamental',
  '8º ano - Ensino Fundamental',
  '9º ano - Ensino Fundamental',
  '1º ano - Ensino Médio',
  '2º ano - Ensino Médio',
  '3º ano - Ensino Médio',
  'Ensino Superior',
  'Pós-graduação',
  'Outros'
];

export const GUARDIAN_RELATIONS = [
  'Mãe',
  'Pai',
  'Avó',
  'Avô',
  'Tia',
  'Tio',
  'Tutor(a)',
  'Responsável Legal',
  'Outros'
];
