import Admin from "../models/models.Admin.js"
import User from "../models/models.User.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { SECRET_KEY } from "../index.js"


export function verifyAdminToken(req, res, next) {
    const adminToken = req.cookies.adminToken

    if (!adminToken) {
        return res.redirect("admin-login")
        // return res.status(401).json({
        //     message: "Access denied! Token missing.",
        // })
    }

    try {
        const verified = jwt.verify(adminToken, SECRET_KEY)
        req.adminToken = verified
        next()
    } catch (error) {
        return res.status(403).json({
            message: "Invalid or expired token!",
        })
    }
}



export class AdminController {
    static showRegister(req, res) {
        res.render("admin-register", { title: "Admin Register" })
    }

    static showLogin(req, res) {
        res.render("admin-login", { title: "Admin Login" })
    }

    static async showEditUser(req, res) {
        try {
            const { id } = req.params
            const user = await User.findById(id).lean()
            if (!user) {
                return res.status(404).send("User not found");
            }
            res.render("user-edit", { title: "Edit User Information", user })
        } catch (error) {
            res.status(500).send("Error fetching user: " + error.message)
        }
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

            const newAdmin = new Admin({
                username,
                password: hashedPassword,
            })

            await newAdmin.save()

            res.status(201).json({
                message: "Admin registered successfully!",
                admin: { id: newAdmin._id, username: newAdmin.username },
            })
        } catch (error) {
            res.status(400).json({
                message: "Admin registration failed!",
                error: error.message,
            })
        }
    }

    static async login(req, res) {
        try {
            const { username, password } = req.body

            const admin = await Admin.findOne({ username })
            if (!admin) {
                return res.status(404).json({
                    message: "Admin not found!",
                })
            }

            const isPasswordValid = await bcrypt.compare(password, admin.password)
            if (!isPasswordValid) {
                return res.status(401).json({
                    message: "Invalid username or password!",
                })
            }

            // Tạo JWT token
            const adminToken = jwt.sign({ id: admin._id, username: admin.username }, SECRET_KEY, {
                expiresIn: "2h",
            })

            res.cookie("adminToken", adminToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 2 * 60 * 60 * 1000,
            })

            res.status(200).json({
                message: "Login successful!",
                adminToken,
                admin: { id: admin._id, username: admin.username },
            })
        } catch (error) {
            res.status(500).json({
                message: "Login failed!",
                error: error.message,
            })
        }
    }

    static async showUsers(req, res) {
        try {
            const users = await User.find({}, { password: 0 })
            
            res.render("admin-users", { title: "User", users })
            // res.status(200).json({
            //     message: "Users retrieved successfully!",
            //     users,
            // })
        } catch (error) {
            res.status(500).json({
                message: "Failed to retrieve users!",
                error: error.message,
            })
        }
    }

    static async updateUser(req, res) {
        try {
            const { id } = req.params
            const { username, password } = req.body

            const updateData = {}
            if (username) updateData.username = username
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10)
                updateData.password = hashedPassword
            }

            const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true })
            if (!updatedUser) {
                return res.status(404).json({
                    message: "User not found!",
                })
            }

            res.redirect("/admin/users")
            // res.status(200).json({
            //     message: "User updated successfully!",
            //     user: { id: updatedUser._id, username: updatedUser.username },
            // })
        } catch (error) {
            res.status(500).json({
                message: "Failed to update user!",
                error: error.message,
            })
        }
    }

    static async deleteUser(req, res) {
        try {
            const { id } = req.params

            const deletedUser = await User.findByIdAndDelete(id)
            if (!deletedUser) {
                return res.status(404).json({
                    message: "User not found!",
                })
            }
            
            res.redirect("/admin/users")
            // res.status(200).json({
            //     message: "User deleted successfully!",
            // })
        } catch (error) {
            res.status(500).json({
                message: "Failed to delete user!",
                error: error.message,
            })
        }
    }
}
