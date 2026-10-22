import { PGlite } from '@electric-sql/pglite';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

class PGlitePoolWrapper {
  constructor(pglite) {
    this.pglite = pglite;
  }

  async connect() {
    return {
      query: (config, values) => this.query(config, values),
      on: () => {},
      removeListener: () => {},
      release: () => {}
    };
  }

  async query(config, values) {
    let sql = typeof config === 'string' ? config : config.text;
    let vals = Array.isArray(config) ? config : (values || config.values || []);
    
    // PGlite query
    const res = await this.pglite.query(sql, vals, { rowMode: 'array' });
    
    return {
      rows: res.rows,
      rowCount: res.rows.length,
      fields: res.fields.map(f => ({
        name: f.name,
        dataTypeID: f.dataTypeID
      }))
    };
  }
}

async function test() {
  const pglite = new PGlite();
  await pglite.query('CREATE TABLE test (id serial primary key, name text);');
  await pglite.query("INSERT INTO test (name) VALUES ('Atiende');");

  const pool = new PGlitePoolWrapper(pglite);
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Adapter created, executing raw query...');
  const result = await prisma.$queryRawUnsafe('SELECT * FROM test');
  console.log('SUCCESS! Result:', result);
}

test().catch(console.error);
