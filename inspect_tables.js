const { Client } = require('pg');

const connStr = 'postgresql://postgres:uoKkFH6YjfGZ0fdx@db.iatrrmgjevzgerlqjnnt.supabase.co:5432/postgres';

async function run() {
  const pgClient = new Client({ connectionString: connStr });
  await pgClient.connect();

  try {
    console.log('Querying primary keys for public.membros_escala:');
    const res = await pgClient.query(`
      SELECT a.attname, format_type(a.atttypid, a.atttypmod) AS data_type
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = 'public.membros_escala'::regclass
      AND i.indisprimary;
    `);
    console.log(res.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pgClient.end();
  }
}

run();
