const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Bring in Models & Helpers
const User = require("../../models/user");
const Brand = require("../../models/brand");
const auth = require("../../middleware/auth");
const role = require("../../middleware/role");

// search users api
router.get(
  "/search",
  auth,
  role.checkRole(role.ROLES.Admin),
  async (req, res) => {
    try {
      const { search } = req.query;

      const regex = new RegExp(search, "i");

      const users = await User.find(
        {
          $or: [
            { firstName: { $regex: regex } },
            { lastName: { $regex: regex } },
            { email: { $regex: regex } },
          ],
        },
        { password: 0, _id: 0 }
      ).populate("merchant", "name");

      res.status(200).json({
        users,
      });
    } catch (error) {
      res.status(400).json({
        error: "Your request could not be processed. Please try again.",
      });
    }
  }
);

router.get("/", auth, async (req, res) => {
  try {
    const user = req.user?._id;
    const userDoc = await User.findById(user, { password: 0 });

    res.status(200).json({
      user: userDoc,
    });
  } catch (error) {
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
});

router.put("/", auth, async (req, res) => {
  try {
    const user = req.user._id;
    const update = req.body.profile;
    const query = { _id: user };

    const userDoc = await User.findOneAndUpdate(query, update, {
      new: true,
    });

    if (update?.password) {
      const { password } = update;
      const isMatch = await bcrypt.compare(password, userDoc.password);
      console.log(isMatch, password);

      if (isMatch) {
        return res
          .status(400)
          .json({ error: "Please enter your correct old password." });
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      userDoc.password = hash;
      await userDoc.save();
    }

    res.status(200).json({
      success: true,
      message: "Your profile is successfully updated!",
      user: userDoc,
    });
  } catch (error) {
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
});

module.exports = router;
