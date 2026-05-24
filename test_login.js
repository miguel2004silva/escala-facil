const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iatrrmgjevzgerlqjnnt.supabase.co';
const supabaseAnonKey = 'sb_publishable_P83Y-PRRvCqDsqXB6nTI-g_dZrDvGjE';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

async function run() {
  console.log('Testando signInWithPassword...');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@escala.com',
      password: '123456',
    });

    if (error) {
      console.error('Erro na autenticação:', error);
      return;
    }

    console.log('Autenticado com sucesso!', data.user.id);

    console.log('Buscando perfil na tabela public.profiles...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError);
    } else {
      console.log('Perfil encontrado:', profile);
    }
  } catch (err) {
    console.error('Erro inesperado:', err);
  }
}

run();
