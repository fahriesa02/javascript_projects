// import mongoose untuk koneksi ke mongodb
import mongoose from "mongoose";


// bikin skema atau tabel ke database yg terkoneksi
const Schema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: {
        type: Number
    },
    updatedAt: {
        type: Number
    }
},
{
    timestamps: {
        currentTime: () => Math.floor(Date.now() / 1000) 
    } 
});
// timestamps harus pake arrow function biar updated dan created bisa masuk nilainya

// export skema 
var User = mongoose.model('User', Schema);
export default User;