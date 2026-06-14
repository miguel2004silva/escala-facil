const { Client } = require('pg');

const connStr = 'postgresql://postgres:uoKkFH6YjfGZ0fdx@db.iatrrmgjevzgerlqjnnt.supabase.co:5432/postgres';

async function run() {
  const pgClient = new Client({ connectionString: connStr });
  await pgClient.connect();

  try {
    console.log('Listing RLS status and policies for all public tables:');
    const res = await pgClient.query(`
      SELECT schemaname, tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
    `);
    
    for (let row of res.rows) {
      console.log(`\nTable: ${row.tablename} (RLS Enabled: ${row.rowsecurity})`);
      const policies = await pgClient.query(`
        SELECT policyname, roles, cmd, qual, with_check
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = $1
      `, [row.tablename]);
      console.log(JSON.stringify(policies.rows, null, 2));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await pgClient.end();
  }
}

run();
