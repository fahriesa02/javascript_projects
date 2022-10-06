// import modul database
import dotenv from "dotenv";
import mongoose from "mongoose";

// variabel env untuk panggil isi file dotenv
const env = dotenv.config().parsed;

// variabel koneksi untuk buka koneksi ke database
const connection = function() {
    mongoose.connect(env.MONGODB_URI, {
        dbName: env.MONGODB_NAME
    });

    // koneksi ke mongodb
    const connection = mongoose.connection;
    connection.on('error', console.error.bind(console, 'Connection error : '))
    connection.once('open', function() {
        console.log(`Database ${env.MONGODB_NAME} terkoneksi`);
    });
};

// export variabel untuk digunakan di file lain
export default connection;