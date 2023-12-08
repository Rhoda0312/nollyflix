const http = require('http');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');

// MongoDB connection URI and database name
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://rhoda:ajayi@rhodacluster.wxf3mmm.mongodb.net/?authMechanism=DEFAULT&tls=false';
const dbName = 'NollyFlix';

// Create a new MongoClient
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Global variable to store the DB connection
let db;

// Connect to MongoDB
client.connect()
    .then(connection => {
        db = connection.db(dbName);
        console.log('Connected to MongoDB');
    })
    .catch(err => console.error('Failed to connect to MongoDB', err));

const server = http.createServer((request, response) => {
    const { method, url } = request;

    // Add CORS headers
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (url === '/') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf-8', (error, content) => {
            if (error) {
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end(`An error occurred: ${error.message}`);
            } else {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(content);
            }
        });
    } else if (url === '/api') {
        findAllMovies(db)
            .then(results => {
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(results));
            })
            .catch(error => {
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end(`An error occurred: ${error.message}`);
            });
    } else if (url === '/style.css') {
        fs.readFile(path.join(__dirname, 'public', 'style.css'), 'utf-8', (error, content) => {
            if (error) {
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end(`An error occurred: ${error.message}`);
            } else {
                response.writeHead(200, { 'Content-Type': 'text/css' });
                response.end(content);
            }
        });
    } else {
        //404 error
        response.writeHead(404, { 'Content-Type': 'text/html' });
        response.end('<h1>404 Not Found</h1>');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

async function findAllMovies(db) {
    //const db = client.db('NollyFlix')
    const cursor = db.collection('NollyFlixcollection').find({});
    return cursor.toArray();
}