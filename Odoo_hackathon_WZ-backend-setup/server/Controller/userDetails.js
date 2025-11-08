import User from "../models/user.model.js";

export const getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from JWT middleware

    // 🔁 Sequelize equivalent of findById
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        phone: user.phoneNumber || null, // optional, if you add a phone field later
        isAccountVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
