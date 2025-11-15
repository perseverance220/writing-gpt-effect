import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_create_thesis_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Connecting to Supabase project:', supabaseUrl);
    console.log('Running migration...');

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }

    console.log('Migration completed successfully!');

    // Verify tables were created
    console.log('\nVerifying tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'thesis_%');

    if (tablesError) {
      console.error('Error verifying tables:', tablesError);
    } else {
      console.log('Created tables:', tables);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

runMigration();
