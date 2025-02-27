const db = require('./db');

db.schema.hasTable('tasks').then((exists) => {
  if (!exists) {
    return db.schema.createTable('tasks', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.date('date').notNullable();
    }).then(() => {
      console.log('Tasks table created.');
    });
  }
});
