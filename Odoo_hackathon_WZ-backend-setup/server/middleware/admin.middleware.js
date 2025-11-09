// middleware/admin.middleware.js
export const adminOnly = (req, res, next) => {
    // req.user is already added by your userAuth middleware
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: No user data found" });
    }

    if (req.user.role !== "Admin") {
        return res.status(403).json({ message: "Forbidden: Admin access only" });
    }

    next(); // ✅ Allow access to admin route
};