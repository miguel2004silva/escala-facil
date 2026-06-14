const { Client } = require('pg');

const connStr = 'postgresql://postgres:uoKkFH6YjfGZ0fdx@db.iatrrmgjevzgerlqjnnt.supabase.co:5432/postgres';

async function run() {
  const pgClient = new Client({ connectionString: connStr });
  await pgClient.connect();

  console.log('Listing tables in public schema:');
  try {
    const res = await pgClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log(res.rows);

    for (let row of res.rows) {
      const tableName = row.table_name;
      console.log(`\nColumns for table ${tableName}:`);
      const colRes = await pgClient.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
      `, [tableName]);
      console.log(colRes.rows);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await pgClient.end();
  }
}

run();
