const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const connStr = 'postgresql://postgres:uoKkFH6YjfGZ0fdx@db.iatrrmgjevzgerlqjnnt.supabase.co:5432/postgres';
const supabaseUrl = 'https://iatrrmgjevzgerlqjnnt.supabase.co';
const supabaseAnonKey = 'sb_publishable_P83Y-PRRvCqDsqXB6nTI-g_dZrDvGjE';

async function run() {
  const pgClient = new Client({ connectionString: connStr });
  await pgClient.connect();

  console.log('1. Removendo usuários antigos de teste...');
  try {
    await pgClient.query("DELETE FROM public.profiles WHERE email IN ('admin@escala.com', 'user@escala.com')");
    await pgClient.query("DELETE FROM auth.users WHERE email IN ('admin@escala.com', 'user@escala.com')");
    console.log('Remoção concluída.');
  } catch (err) {
    console.error('Erro ao deletar usuários:', err.message);
  } finally {
    await pgClient.end();
  }

  // Inicializar cliente Supabase
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });

  console.log('2. Registrando admin@escala.com via Supabase Auth API...');
  let adminUserId;
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@escala.com',
      password: '123456',
      options: {
        data: { name: 'Administrador' }
      }
    });
    if (error) {
      console.error('Erro ao cadastrar admin:', error);
    } else {
      adminUserId = data.user.id;
      console.log('Admin cadastrado com sucesso. ID:', adminUserId);
    }
  } catch (err) {
    console.error('Erro inesperado no cadastro do admin:', err);
  }

  console.log('3. Registrando user@escala.com via Supabase Auth API...');
  let userUserId;
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'user@escala.com',
      password: '123456',
      options: {
        data: { name: 'Membro Comum' }
      }
    });
    if (error) {
      console.error('Erro ao cadastrar user:', error);
    } else {
      userUserId = data.user.id;
      console.log('User cadastrado com sucesso. ID:', userUserId);
    }
  } catch (err) {
    console.error('Erro inesperado no cadastro do user:', err);
  }

  // Conectar de novo ao PostgreSQL para confirmar e-mails e configurar roles
  const pgClient2 = new Client({ connectionString: connStr });
  await pgClient2.connect();

  console.log('4. Atualizando confirmação de e-mail e perfis no banco...');
  try {
    // Buscar IDs reais do banco de dados (caso os de cima falhem ou para garantir)
    const adminRes = await pgClient2.query("SELECT id FROM auth.users WHERE email = 'admin@escala.com'");
    const userRes = await pgClient2.query("SELECT id FROM auth.users WHERE email = 'user@escala.com'");

    const realAdminId = adminRes.rows[0]?.id;
    const realUserId = userRes.rows[0]?.id;

    if (!realAdminId || !realUserId) {
      throw new Error(`Não foi possível encontrar os usuários recém-criados no banco. Admin: ${realAdminId}, User: ${realUserId}`);
    }

    // Confirmar e-mails
    await pgClient2.query(`
      UPDATE auth.users SET 
        email_confirmed_at = NOW(),
        confirmed_at = NOW(),
        last_sign_in_at = NOW()
      WHERE email IN ('admin@escala.com', 'user@escala.com')
    `);
    console.log('E-mails marcados como confirmados no auth.users.');

    // Inserir perfis
    await pgClient2.query(`
      INSERT INTO public.profiles (id, email, role, nome) VALUES 
      ('${realAdminId}', 'admin@escala.com', 'admin', 'Administrador'),
      ('${realUserId}', 'user@escala.com', 'user', 'Membro Comum')
      ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, nome = EXCLUDED.nome
    `);
    console.log('Perfis criados/atualizados na tabela public.profiles.');

  } catch (err) {
    console.error('Erro na atualização pós-cadastro:', err.message);
  } finally {
    await pgClient2.end();
  }

  // Testar login final
  console.log('5. Testando login final com Supabase Auth API...');
  try {
    const { data: adminSession, error: adminErr } = await supabase.auth.signInWithPassword({
      email: 'admin@escala.com',
      password: '123456',
    });
    if (adminErr) {
      console.error('Falha no login do admin:', adminErr);
    } else {
      console.log('Login de ADMIN realizado com sucesso!');
    }

    const { data: userSession, error: userErr } = await supabase.auth.signInWithPassword({
      email: 'user@escala.com',
      password: '123456',
    });
    if (userErr) {
      console.error('Falha no login do user:', userErr);
    } else {
      console.log('Login de USER realizado com sucesso!');
    }
  } catch (err) {
    console.error('Erro durante o teste de login:', err);
  }
}

run();
