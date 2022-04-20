// Put your database code here
const database = require('better-sqlite3')

const db = new database("./data/db/log.db")

const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`)
let row = stmt.get();

if(row === undefined) {
    console.log("Log database appears to be missing. Create log database.")

    const sqlInit = `
    CREATE TABLE accesslog ( 
        id INTEGER PRIMARY KEY, 
        remoteaddr VARCHAR,
        remoteuser VARCHAR,
        time NUMERIC,
        method VARCHAR,
        url VARCHAR,
        protocol VARCHAR,
        httpversion NUMERIC,
        status VARCHAR, 
        referrer VARCHAR,
        useragent TEVARCHARXT
    );
`

db.exec(sqlInit)
} else {
    console.log("Log database exists.")
}

module.exports = db