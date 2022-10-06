// import user dari user.js
import isEmailExist from "../libraries/emailExist.js";
import User from "../models/user.js";
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';

// env untuk refreshtokenkey dan tokenaccesskey
const env = dotenv.config().parsed;

// fungsi generateAccessToken dan generateRefreshToken dipake untuk method login
const generateAccessToken = async function(payload) {
    return jsonwebtoken.sign(payload, env.TOKEN_ACCESS_KEY, { expiresIn: env.TOKEN_ACCESS_EXPIRATION_TIME}); // token akses yg habis 5 menit
}

const generateRefreshToken = async function(payload) {
    return jsonwebtoken.sign(payload, env.REFRESH_TOKEN_KEY, { expiresIn: env.REFRESH_TOKEN_EXPIRATION_TIME}); // token refresh yg habis 1 jam
}

// bikin class authcontroller dengan method register untuk routes register
class AuthController {
    // method endpoint untuk routes /register
    async register(req, res) {
        try {
            // proses validasi form input

            // throw error fullname tidak diisi
            if(!req.body.fullname) {
                throw {
                    code: 400,
                    message: 'FULLNAME_IS_REQUIRED',
                }
            }
            // throw error email tidak terisi
            if(!req.body.email) {
                throw {
                    code: 400,
                    message: 'EMAIL_IS_REQUIRED',
                }
            }
            // throw error password tidak terisi
            if(!req.body.password) {
                throw {
                    code: 400,
                    message: 'PASSWORD_IS_REQUIRED',
                }
            }
            // throw error password kurang dari 6 karakter
            if(req.body.password.length < 6) {
                throw {
                    code: 400,
                    message: 'PASSWORD_MINIMUM_6_CHARACTERS'
                }
            }
            // cek apakah email sudah ada di database
            const emailExist = await isEmailExist(req.body.email);
            if(emailExist) {
                throw {
                    code: 409,
                    message: 'EMAIL_ALREADY_EXIST'
                }
            }

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(req.body.password, salt);


            const user = await User.create({
                fullname: req.body.fullname,
                email: req.body.email,
                password: hash
            });
            // throw error saat gagal registrasi
            if(!user) {
                throw {
                    code: 500,
                    message: 'USER_REGISTERED_FAILED'
                }
            }
            

            // return json saat berhasil registrasi
            return res.status(200).json({
                status: true,
                message: 'USER_REGISTER_SUCCESS',
                user
            });
        } catch (error) {
            // return status error
            return res.status(error.code || 500).json({ 
                status: false,
                message: error.message 
            });
        }
    }
    // method login untuk endpoint route /login
    async login(req,res) {
        try {
            // proses validasi proses login

            // throw error saat email kosong
            if(!req.body.email) {
                throw {
                    code: 400,
                    message: 'EMAIL_IS_REQUIRED'
                }
            }
            // throw error saat password kosong
            if(!req.body.password) {
                throw {
                    code: 400,
                    message: 'PASSWORD_IS_REQUIRED'
                }
            }
            
            const user = await User.findOne({
                email: req.body.email
            });
            // throw error saat username salah tulis
            if(!user) {
                throw {
                    code: 404,
                    message: 'USER_NOT_FOUND'
                }
            }

            const isPasswordValid = await bcrypt.compareSync(req.body.password, user.password);
            if(!isPasswordValid) {
                throw {
                    code: 400,
                    message: 'INVALID_PASSWORD'
                }
            }

            // accessToken dan refreshToken pake fungsi
            const accessToken = await generateAccessToken({ id: user._id});
            const refreshToken = await generateRefreshToken({ id: user._id});

            return res.status(200).json({
                status: true,
                message: 'USER_LOGIN_SUCCESS',
                fullname: user.fullname,
                accessToken,
                refreshToken
            });
        } catch (error) {
            return res.status(error.code || 500).json({
                status: false,
                message: error.message
            })
        }
    }
    // method refreshtoken untuk endpoint /refresh-token
    async refreshToken(req, res) {
        try {
            if(!req.body.refreshToken) {
                throw {
                    code: 400,
                    message: 'REFRESH_TOKEN_IS_REQUIRED'
                }
            }

            // verifikasi token refresh
            const verify = await jsonwebtoken.verify(req.body.refreshToken, env.REFRESH_TOKEN_KEY)
            var payload = {
                id: verify.id
            };

            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);

            return res.status(200).json({
                status: true,
                message: 'REFRESH_TOKEN_SUCCESS',
                accessToken,
                refreshToken
            });

        } catch(error) {
            if(error.message == 'jwt expired') {
                error.message = 'REFRESH_TOKEN_EXPIRED';
            } else if(error.message == 'invalid signature' || 
                        error.message == 'jwt malformed' ||
                        error.message == 'jwt must be provided' ||
                        error.message == 'invalid token') {
                            error.message = 'INVALID_REFRESH_TOKEN'
                        }

            return res.status(error.code || 500).json({
                status: false,
                message: error.message
            });
        }
    }
}

// export class authcontroller
export default new AuthController();