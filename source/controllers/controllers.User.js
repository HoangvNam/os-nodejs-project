import User from "../models/models.User.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { SECRET_KEY } from "../index.js"


export class UserController {
    static showRegister(req, res) {
        res.render("user-register", { title: "Register" })
    }

    static showLogin(req, res) {
        res.render("user-login", { title: "Login" })
    }

    static async register(req, res) {
        try {
            const { username, password, confirmPassword } = req.body

            if (password !== confirmPassword) {
                return res.status(400).json({
                    message: "Passwords do not match!",
                })
            }

            const hashedPassword = await bcrypt.hash(password, 10)

            const newUser = new User({
                username,
                password: hashedPassword,
            })

            await newUser.save()

            res.status(201).json({
                message: "User registered successfully!",
                user: { id: newUser._id, username: newUser.username },
            })
        } catch (error) {
            res.status(400).json({
                message: "User registration failed!",
                error: error.message,
            })
        }
    }

    static async login(req, res) {
        try {
            const { username, password } = req.body;

            const user = await User.findOne({ username })
            if (!user) {
                return res.status(404).json({
                    message: "User not found!",
                });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password)
            if (!isPasswordValid) {
                return res.status(401).json({
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

            res.status(200).json({
                message: "Login successful!",
                token,
                user: { id: user._id, username: user.username },
            })
        } catch (error) {
            res.status(500).json({
                message: "Login failed!",
                error: error.message,
            })
        }
    }
}
