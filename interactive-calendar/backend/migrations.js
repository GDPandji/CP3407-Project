const db = require('./db');

async function createTables() {
    try {
        const exists = await db.schema.hasTable('tasks');
        if (!exists) {
            await db.schema.createTable('tasks', (table) => {
                table.increments('id').primary();
                table.string('title').notNullable();
                table.date('date').notNullable();
            });
            console.log('✅ Tasks table created successfully.');
        } else {
            console.log('⚠️ Tasks table already exists.');
        }
        process.exit();
    } catch (error) {
        console.error('❌ Error creating table:', error);
        process.exit(1);
    }
}

createTables();

