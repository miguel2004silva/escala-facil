-- ====================================================================
-- Script de Migração: Tabela de Cores das Roupas e Segurança (RLS)
-- Execute este script no SQL Editor do seu Dashboard Supabase.
-- ====================================================================

-- 1. Criação da tabela de Cores de Roupa por Culto/Grupo
CREATE TABLE IF NOT EXISTS public.cores_roupa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grupo TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE NOT NULL,
  cor TEXT NOT NULL,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar o Row Level Security (RLS) para segurança de acesso
ALTER TABLE public.cores_roupa ENABLE ROW LEVEL SECURITY;

-- 3. Criar Políticas de Acesso
-- Qualquer usuário autenticado (ou anônimo) pode visualizar as cores das roupas
CREATE POLICY "Permitir leitura pública de cores" 
  ON public.cores_roupa 
  FOR SELECT 
  USING (true);

-- Apenas usuários com a role 'admin' no seu perfil podem gerenciar (criar, atualizar, deletar)
CREATE POLICY "Permitir gerenciamento apenas para administradores" 
  ON public.cores_roupa 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 4. Permitir que Administradores gerenciem perfis de outros usuários na tabela public.profiles
-- IMPORTANTE: Evita erro de RLS (recursão infinita) ao cadastrar novos membros no painel
CREATE POLICY "Permitir que admins gerenciem todos os perfis" 
  ON public.profiles 
  FOR ALL 
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@escala.com'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@escala.com'
  );

-- 5. Habilitar Replicação Realtime para as tabelas do projeto no Supabase
-- IMPORTANTE: Necessário para que as notificações cheguem instantaneamente nos aparelhos
ALTER PUBLICATION supabase_realtime ADD TABLE public.membros_escala;
ALTER PUBLICATION supabase_realtime ADD TABLE public.escalas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cores_roupa;

-- 6. Função RPC para criação de novos usuários (evita rate limits de email e confirma e-mails automaticamente)
-- IMPORTANTE: Executada com SECURITY DEFINER para poder escrever nas tabelas do schema auth.
-- Possui validação interna de acesso: apenas usuários com perfil 'admin' podem executá-la.
CREATE OR REPLACE FUNCTION public.criar_usuario_admin(
  p_email TEXT,
  p_password TEXT,
  p_nome TEXT,
  p_role TEXT
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_user_id UUID;
  v_encrypted_password TEXT;
  v_identity_id UUID;
BEGIN
  -- 1. Verificar se o usuário autenticado que está chamando a função é admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem cadastrar novos usuários.';
  END IF;

  -- 2. Verificar se o e-mail já existe
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  IF v_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'Este e-mail já está cadastrado.';
  END IF;

  -- 3. Gerar IDs
  v_user_id := gen_random_uuid();
  v_identity_id := gen_random_uuid();

  -- 4. Criptografar a senha usando bcrypt do Supabase
  v_encrypted_password := crypt(p_password, gen_salt('bf'));

  -- 5. Inserir em auth.users (sem confirmed_at, e com strings vazias nos campos exigidos pelo GoTrue)
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    role,
    aud,
    is_anonymous,
    is_sso_user,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    phone_change,
    phone_change_token,
    email_change_token_current,
    reauthentication_token
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    v_encrypted_password,
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object('name', p_nome),
    false,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    false,
    false,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  );

  -- 6. Inserir em auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    provider,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    v_identity_id,
    v_user_id,
    v_user_id::text,
    'email',
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', p_email,
      'email_verified', true,
      'phone_verified', false
    ),
    NOW(),
    NOW(),
    NOW()
  );

  -- 7. Inserir em public.profiles
  INSERT INTO public.profiles (
    id,
    email,
    role,
    nome
  ) VALUES (
    v_user_id,
    p_email,
    p_role,
    p_nome
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    nome = EXCLUDED.nome;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;


