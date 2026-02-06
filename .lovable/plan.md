
# Plano: Adicionar Login com Google

## Resumo

Adicionar a opcao de login com conta Google na pagina de Login e na pagina de Signup, usando o Supabase Auth com o provider OAuth do Google.

## Pre-requisitos (configuracao no Google e Supabase)

Antes que o login com Google funcione, voce precisara configurar dois servicos:

### Passo 1: Criar credenciais no Google Cloud Console
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto (ou use um existente)
3. Va em **APIs e Servicos** > **Tela de consentimento OAuth**
   - Adicione o dominio `wevafattotpzozkmgpwm.supabase.co` como dominio autorizado
4. Va em **APIs e Servicos** > **Credenciais** > **Criar Credenciais** > **ID do cliente OAuth**
   - Tipo: **Aplicativo da Web**
   - **Origens JavaScript autorizadas**: adicione `https://estudaflash.lovable.app`
   - **URIs de redirecionamento autorizados**: adicione `https://wevafattotpzozkmgpwm.supabase.co/auth/v1/callback`
5. Copie o **Client ID** e **Client Secret** gerados

### Passo 2: Configurar no Supabase Dashboard
1. Acesse o [Supabase Dashboard - Auth Providers](https://supabase.com/dashboard/project/wevafattotpzozkmgpwm/auth/providers)
2. Encontre o provider **Google** e ative-o
3. Cole o **Client ID** e **Client Secret** do Google
4. Salve

### Passo 3: Configurar URLs de redirecionamento no Supabase
1. Acesse [Authentication > URL Configuration](https://supabase.com/dashboard/project/wevafattotpzozkmgpwm/auth/url-configuration)
2. Defina o **Site URL** como: `https://estudaflash.lovable.app`
3. Em **Redirect URLs**, adicione:
   - `https://estudaflash.lovable.app`
   - `https://estudaflash.lovable.app/`
   - A URL de preview do Lovable: `https://id-preview--749a0c0b-978b-4fc9-9e00-c70854beef31.lovable.app`

---

## Mudancas no Codigo

### 1. Adicionar funcao `signInWithGoogle` no hook useAuth

**Arquivo**: `src/hooks/useAuth.tsx`

Adicionar uma nova funcao que chama `supabase.auth.signInWithOAuth` com o provider Google:

```typescript
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });

  if (error) throw error;
  return data;
};
```

Exportar a funcao junto com as demais no return do hook.

---

### 2. Adicionar botao "Entrar com Google" na pagina de Login

**Arquivo**: `src/pages/Login.tsx`

Adicionar um botao estilizado abaixo do formulario de login, com um separador visual "ou":

- Separador com texto "ou continue com"
- Botao com icone do Google (SVG inline) e texto "Entrar com Google"
- Ao clicar, chama `signInWithGoogle()` do hook `useAuth`
- Estado de loading especifico para o botao Google

---

### 3. Adicionar botao "Cadastrar com Google" na pagina de Signup

**Arquivo**: `src/components/signup/NewSignupForm.tsx`

No primeiro passo do formulario (step 1), adicionar a opcao de cadastro com Google como alternativa ao preenchimento manual:

- Separador com texto "ou cadastre-se com"
- Botao com icone do Google e texto "Cadastrar com Google"
- Ao clicar, chama a mesma funcao `signInWithGoogle()` (o Supabase cria a conta automaticamente se nao existir)

---

### 4. Atualizar o AuthModal (modal de autenticacao rapida)

**Arquivo**: `src/components/AuthModal.tsx`

Adicionar a opcao de Google login tambem no modal, para consistencia.

---

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/hooks/useAuth.tsx` | Adicionar funcao `signInWithGoogle` |
| `src/pages/Login.tsx` | Adicionar botao Google + separador |
| `src/components/signup/NewSignupForm.tsx` | Adicionar botao Google no step 1 |
| `src/components/AuthModal.tsx` | Adicionar botao Google no modal |

---

## Detalhes Tecnicos

### useAuth.tsx - Nova funcao

```typescript
const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      console.error('Google sign in error:', error);
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('signInWithGoogle error:', error);
    throw error;
  }
};

// No return, adicionar:
return {
  ...authState,
  signIn,
  signUp,
  signOut,
  signInWithGoogle,  // NOVO
};
```

### Login.tsx - Botao Google

Apos o formulario existente e antes do link "Nao tem conta", adicionar:

```typescript
{/* Separador */}
<div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t border-gray-300" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-white px-2 text-gray-500">ou continue com</span>
  </div>
</div>

{/* Botao Google */}
<Button
  type="button"
  variant="outline"
  className="w-full"
  onClick={handleGoogleLogin}
  disabled={loading}
>
  <GoogleIcon /> Entrar com Google
</Button>
```

### NewSignupForm.tsx - Botao Google no Step 1

No `renderCurrentStep`, quando `currentStep === 1`, apos o `StudentInfoSection`, adicionar o botao Google como alternativa rapida.

---

## Resultado Esperado

1. Botao "Entrar com Google" na pagina de login
2. Botao "Cadastrar com Google" na pagina de signup (step 1)
3. Botao Google no modal de autenticacao
4. Ao clicar, o usuario e redirecionado para a tela de consentimento do Google
5. Apos autorizar, o usuario e redirecionado de volta ao app ja autenticado
6. Se for um novo usuario, a conta e criada automaticamente pelo Supabase
7. O `onAuthStateChange` no `useAuth` detecta a sessao e atualiza o estado do app
