import Admin from "../models/models.Admin.js"
import User from "../models/models.User.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { SECRET_KEY } from "../index.js"


export function verifyAdminToken(req, res, next) {
    const adminToken = req.cookies.adminToken

    if (!adminToken) {
        return res.redirect("/admin-login")
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
        res.render("admin-register", { message: "" })
    }

    static showLogin(req, res) {
        res.render("admin-login", { message: "" })
    }

    static async showEditUser(req, res) {
        try {
            const { id } = req.params
            const user = await User.findById(id).lean()
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.render("user-edit", { title: "Edit User Information", user, id })
        } catch (error) {
            res.status(500).json({ message: "Error fetching user: " + error.message })
        }
    }

    static async register(req, res) {
        try {
            const { username, password, confirmPassword } = req.body

            const adminold = await Admin.findOne({ username: username })
            if (adminold.username == username) return res.render("admin-register", { message: "Admin is valid" })

            if (password !== confirmPassword) {
                return res.status(400).render("admin-register", {
                    message: "Passwords do not match!",
                })
            }

            const hashedPassword = await bcrypt.hash(password, 10)

            const newAdmin = new Admin({
                username,
                password: hashedPassword,
            })

            await newAdmin.save()

            res.redirect("/admin-login")
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
                return res.status(404).render("admin-login", {
                    message: "Admin not found!",
                })
            }

            const isPasswordValid = await bcrypt.compare(password, admin.password)
            if (!isPasswordValid) {
                return res.status(401).render("admin-login", {
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

            res.redirect("/admin/dashboard")
        } catch (error) {
            res.status(500).json({
                message: "Login failed!",
                error: error.message,
            })
        }
    }
    static async showUsers(req, res) {
        try {
            // Lấy giá trị tìm kiếm từ query parameters
            const searchQuery = req.query.search || ''; // Lấy từ query hoặc mặc định là rỗng

            // Lấy trang hiện tại từ query parameters (mặc định là trang 1)
            const page = parseInt(req.query.page) || 1;
            const perPage = 10; // Số lượng người dùng mỗi trang

            // Tính toán số người dùng cần bỏ qua dựa trên trang hiện tại
            const skip = (page - 1) * perPage;

            // Tìm kiếm chỉ theo trường `username` (hoặc trường khác nếu cần)
            const filter = {
                username: { $regex: searchQuery, $options: 'i' } // Tìm kiếm theo username
            };

            // Fetch users với phân trang và tìm kiếm
            const users = await User.find(filter).skip(skip).limit(perPage).lean();

            // Đếm tổng số người dùng để tính phân trang
            const totalUsers = await User.countDocuments(filter);

            // Tính tổng số trang
            const totalPages = Math.ceil(totalUsers / perPage);

            // Render lại trang với dữ liệu phân trang và kết quả tìm kiếm
            res.render("admin-users", {
                title: "Users",
                users,
                currentPage: page,
                totalPages,
                totalUsers,
                searchQuery // Truyền lại giá trị tìm kiếm vào template
            });
        } catch (error) {
            res.status(500).json({
                message: "Failed to retrieve users!",
                error: error.message,
            });
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

        } catch (error) {
            res.status(500).json({
                message: "Failed to delete user!",
                error: error.message,
            })
        }
    }
    static adminDashboard(req, res) {
        const user = req.cookies.user || null
        res.render("admin-dashboard", { user })
    }
    static addUserDisplay(req, res) {
        res.render("add-user", { message: "" })
    }
    static async addUser(req, res) {
        try {
            const { username, password } = req.body;

            // Kiểm tra xem username đã tồn tại chưa
            const existingUser = await User.findOne({ username: username });
            if (existingUser) {
                return res.render("add-user", {
                    message: "Username is already taken. Please choose another one.",
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // Tạo người dùng mới
            const newUser = new User({
                username,
                password: hashedPassword,
            });

            await newUser.save();

            // Điều hướng người dùng đến trang đăng nhập sau khi đăng ký thành công
            res.redirect("/admin/users");
        } catch (error) {
            // Render lại trang đăng ký với thông báo lỗi nếu xảy ra lỗi
            res.render("add-user", {
                message: "An error occurred during registration. Please try again later.",
            });
        }
    }
}
