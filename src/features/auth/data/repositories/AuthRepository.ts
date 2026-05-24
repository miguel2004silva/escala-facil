import { supabase } from '../../../../main/config/supabase';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { User } from '../../domain/entities/User';
import { AppError } from '../../../../core/errors/AppError';

export class AuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AppError(error.message, 401);
    }

    if (!data.user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Buscar perfil público no banco de dados para obter a role e o nome
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    let role: 'admin' | 'user' = 'user';
    let name = data.user.email || '';

    if (profile) {
      role = profile.role as 'admin' | 'user';
      name = profile.nome || data.user.email || '';
    } else {
      // Criar perfil padrão caso não exista
      const defaultName = data.user.user_metadata?.name || data.user.email || '';
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          role: 'user',
          nome: defaultName,
        })
        .select()
        .single();
      
      if (newProfile) {
        role = newProfile.role as 'admin' | 'user';
        name = newProfile.nome;
      }
    }

    return {
      id: data.user.id,
      name,
      email: data.user.email || email,
      role,
      token: data.session?.access_token,
    };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: sessionData } = await supabase.auth.getSession();

    const role: 'admin' | 'user' = (profile?.role as 'admin' | 'user') || 'user';
    const name = profile?.nome || user.email || '';

    return {
      id: user.id,
      name,
      email: user.email || '',
      role,
      token: sessionData.session?.access_token,
    };
  }

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      throw new AppError(error.message, 500);
    }

    return (data || []).map(profile => ({
      id: profile.id,
      name: profile.nome || '',
      email: profile.email || '',
      role: (profile.role as 'admin' | 'user') || 'user'
    }));
  }
}


