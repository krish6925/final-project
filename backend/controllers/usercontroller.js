import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
};


export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User Already Exists"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const targetRole = role || "employee";
    
    const isApproved = targetRole === "employee";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: targetRole,
      isApproved
    });
    if (!user.isApproved) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: false,
        message: "Registration submitted successfully. Pending administrator approval."
      });
    }
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: true,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User Not Found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Credentials"
      });
    }

    if ((user.role === "manager" || user.role === "admin") && user.isApproved === false) {
      return res.status(403).json({
        message: `Your ${user.role.toUpperCase()} account is pending database approval from an administrator.`,
        isApproved: false,
        role: user.role
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved ?? true,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User Not Found"
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};
export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ isApproved: false }).select("-password");
    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    user.isApproved = true;
    await user.save();

    res.status(200).json({
      message: `User ${user.name} (${user.role}) approved successfully.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: `Registration request for ${user.name} was rejected and removed.`
    });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const exportAchievementReport = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const csvHeaders = ["User ID", "Name", "Email", "Role", "Approved Status", "Created At"];

    const csvRows = users.map((u) => {
      const name = u.name ? u.name.replace(/"/g, '""') : "N/A";
      const email = u.email || "N/A";
      const role = u.role || "employee";
      const isApproved = u.isApproved !== false ? "Approved" : "Pending";
      const createdAt = u.createdAt ? new Date(u.createdAt).toISOString() : "N/A";

      return [
        `"${u._id}"`,
        `"${name}"`,
        `"${email}"`,
        `"${role}"`,
        `"${isApproved}"`,
        `"${createdAt}"`
      ];
    });

    const csvContent = [csvHeaders.join(","), ...csvRows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=achievement_report_${Date.now()}.csv`);

    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Error exporting achievement report:", error);
    res.status(500).json({ message: "Failed to generate CSV report" });
  }
};