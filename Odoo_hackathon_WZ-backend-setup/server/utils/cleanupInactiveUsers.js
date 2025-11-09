import { Op } from "sequelize";
import { User } from "../config/db.js";

// ✅ This function deletes users who never logged in within 3 days
export const cleanupInactiveUsers = async () => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3); // 3 days earlier

    const deletedCount = await User.destroy({
      where: {
        is_first_login: false, // never logged in
        created_at: {
          [Op.lt]: threeDaysAgo, // created more than 3 days ago
        },
      },
    });

    if (deletedCount > 0) {
      console.log(`🗑️ ${deletedCount} inactive user(s) deleted successfully`);
    } else {
      console.log("✅ No inactive users to delete today");
    }
  } catch (error) {
    console.error("❌ Error cleaning up inactive users:", error);
  }
};