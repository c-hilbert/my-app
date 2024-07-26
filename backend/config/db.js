const mysql = require('mysql2');

let pool;

if (process.env.JAWSDB_URL) {
  // If running on Heroku with JawsDB
  pool = mysql.createPool(process.env.JAWSDB_URL);
} else {
  // If running locally
  pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Use the password you set for your MySQL root user
    database: 'pharmacy_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

module.exports = pool.promise();