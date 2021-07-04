const http = require('http');
const express = require('express');
const path = require("path");
const { Pool, Client } = require('pg');
const toBase64 = require("number-to-base64");

const app = express();

let regBase64 = /^[A-Za-z0-9\+\/]{1,5}$/;
let link = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', function (request, response, next) {
    response.sendFile(path.join(__dirname, 'static', 'views', 'index.html'));
});

app.post('/newLink', (request, response) => {
    if (!link.test(request.body.link)) {
        response.json({
            etat: false,
            payload: 'incorrect format'
        });
        return;
    }
    let queryStr = 'INSERT INTO url(url) VALUES($1) RETURNING urlid';
    let values = [request.body.link];
    pool.connect().then(client => {
        return client.query(queryStr, values).then(result => {
            response.json({
                etat: true,
                payload: request.get('host') + '/' + toBase64.ntob(result.rows[0].urlid)
            }
            );
        }).catch(error => {
            console.log(error.message);
        }).finally(() => {
            client.release();
        });
    }).catch(error => {
        console.log(error.message);
    });
});

app.get('/error404', function (request, response) {
    response.status(404);
    response.sendFile(path.join(__dirname, 'static', 'views', 'error404.html'));

});

app.get('/:link', function (request, response) {
    if (!regBase64.test(request.params.link)) {
        console.log('not a base 64');
        response.redirect('/error404');
        return;
    }
    let urlId = toBase64.bton(request.params.link);
    console.log(urlId);
    let values = [urlId];
    let queryStr = 'SELECT * from url WHERE urlid = $1 ';
    pool.connect().then(client => {
        return client.query(queryStr, values).then(result => {
            if (result.rows.length == 0) {
                response.redirect('/error404');
                client.release();
                return;
            }
            response.redirect(result.rows[0].url);
        }).catch(error => {
            console.log(error.message);
        }).finally(() => {
            client.release();
        })
    }).catch((error) => {
        console.log(error.message);
    });
});

let port = process.env.PORT || 3000;
app.listen(port);