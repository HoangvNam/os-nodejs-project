import User from "../models/models.User.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { SECRET_KEY } from "../index.js"


export class UserController {
    static showRegister(req, res) {
        res.render("user-register", { message: null }); // Chuyển message sang null để rõ ràng
    }
    
    static showLogin(req, res) {
        res.render("user-login", { message: null }); // Chuyển message sang null để rõ ràng
    }
    
    static async register(req, res) {
        try {
            const { username, password, confirmPassword } = req.body;
    
            // Kiểm tra xem username đã tồn tại chưa
            const existingUser = await User.findOne({ username: username });
            if (existingUser) {
                return res.render("user-register", {
                    message: "Username is already taken. Please choose another one.",
                });
            }
    
            // Kiểm tra xem password và confirmPassword có khớp nhau không
            if (password !== confirmPassword) {
                return res.render("user-register", {
                    message: "Passwords do not match. Please try again.",
                });
            }
    
            // Mã hóa password
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Tạo người dùng mới
            const newUser = new User({
                username,
                password: hashedPassword,
            });
    
            await newUser.save();
    
            // Điều hướng người dùng đến trang đăng nhập sau khi đăng ký thành công
            res.redirect("/login");
        } catch (error) {
            // Render lại trang đăng ký với thông báo lỗi nếu xảy ra lỗi
            res.render("user-register", {
                message: "An error occurred during registration. Please try again later.",
            });
        }
    }
    

    static async login(req, res) {
        try {
            const { username, password } = req.body;

            const user = await User.findOne({ username })
            if (!user) {
                return res.render("user-login", {
                    message: "User not found!",
                });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password)
            if (!isPasswordValid) {
                return res.render("user-login",{
                    message: "Invalid username or password!",
                })
            }

            // Tạo JWT token
            const token = jwt.sign({ id: user._id, username: user.username }, SECRET_KEY, {
                expiresIn: "2h",
            })

            res.cookie("token", token, {
                httpOnly: true,        
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",    
                maxAge: 2 * 60 * 60 * 1000,
            })

            res.redirect("/user-rooms")
        } catch (error) {
            res.status(500).json({
                message: error,
          
            })
        }
    }
    static logout(req, res) {
        // Xóa các cookie
        res.clearCookie('token', { httpOnly: true, secure: true });
        res.clearCookie('refreshToken', { httpOnly: true, secure: true });
        res.clearCookie('adminToken', { httpOnly: true, secure: true });
        
        // Chuyển hướng đến trang đăng nhập
        res.redirect('/login');
    }
    
}
