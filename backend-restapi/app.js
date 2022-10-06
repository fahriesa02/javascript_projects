// import express, connection, apiRouter
import express from "express";
import dotenv from 'dotenv';
import connection from "./connection.js";
import apiRouter from "./routes/api.js";

const env = dotenv.config().parsed;
// console.log(env.APP_PORT);

// initialize express di var app
const app = express();

// koneksi db dari file connection
connection();

// use untuk panggil middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// use untuk routes
app.use('/', apiRouter);

// use untuk handle 404 error not found
app.use(function(req, res) {
    res.status(404).json({ message: '404_NOT_FOUND' });
}); // jangan lupa susunan endpoint tiap route

// server dinyalakan di port 3000
app.listen(3000, function() {
    console.log(`Server berjalan di port ${env.APP_PORT}`);
});