const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const passport = require("passport");

const auth = require("../../middleware/auth");

// Bring in Models & Helpers
const User = require("../../models/user");
const mailchimp = require("../../services/mailchimp");
const mailgun = require("../../services/mailgun");
const keys = require("../../config/keys");

const { secret, tokenLife } = keys.jwt;

const refreshTokens = [];

router.post("/refreshToken", auth, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    const payload = {
      id: user.id,
    };

    const refreshToken = jwt.sign(payload, "refresh", { expiresIn: "14d" });
    refreshTokens.push(refreshToken);

    res.status(200).json({
      token: `Bearer ${refreshTokens[0]}`,
      refreshToken: `Bearer ${refreshTokens[1]}`,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: "You must enter an email address." });
    }

    if (!password) {
      return res.status(400).json({ error: "You must enter a password." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(400)
        .send({ error: "No user found for this email address." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Password Incorrect",
      });
    }

    const payload = {
      id: user.id,
    };

    const token = jwt.sign(payload, secret, { expiresIn: tokenLife });

    if (!token) {
      throw new Error();
    }

    res.status(200).json({
      success: true,
      token: `Bearer ${token}`,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { email, firstName, lastName, password, isSubscribed } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: "You must enter an email address." });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({ error: "You must enter your full name." });
    }

    if (!password) {
      return res.status(400).json({ error: "You must enter a password." });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "That email address is already in use." });
    }

    let subscribed = false;
    if (isSubscribed) {
      subscribed = true;
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
    });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);

    user.password = hash;
    const registeredUser = await user.save();

    const payload = {
      id: registeredUser.id,
    };

    await mailgun.sendEmail(
      registeredUser.email,
      "signup",
      null,
      registeredUser
    );

    const token = jwt.sign(payload, secret, { expiresIn: tokenLife });

    res.status(200).json({
      success: true,
      subscribed,
      token: `Bearer ${token}`,
      user: {
        id: registeredUser.id,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
        email: registeredUser.email,
        role: registeredUser.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
});

router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: "You must enter an email address." });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res
        .status(400)
        .send({ error: "No user found for this email address." });
    }

    const buffer = crypto.randomBytes(48);
    const resetToken = buffer.toString("hex");

    existingUser.resetPasswordToken = resetToken;
    existingUser.resetPasswordExpires = Date.now() + 3600000;

    existingUser.save();
    await mailgun.sendEmail(
      existingUser.email,
      "reset",
      req.headers.host,
      resetToken
    );

    res.status(200).json({
      success: true,
      message: "Please check your email for the link to reset your password.",
    });
  } catch (error) {
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
});

router.post("/reset/:token", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "You must enter a password." });
    }

    const resetUser = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!resetUser) {
      return res.status(400).json({
        error:
          "Your token has expired. Please attempt to reset your password again.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    resetUser.password = hash;
    resetUser.resetPasswordToken = undefined;
    resetUser.resetPasswordExpires = undefined;

    resetUser.save();

    await mailgun.sendEmail(resetUser.email, "reset-confirmation");

    res.status(200).json({
      success: true,
      message:
        "Password changed successfully. Please login with your new password.",
    });
  } catch (error) {
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new Error("You must enter an email address.");
    }

    const existing = await User.findOne({ email: email.toLowerCase() });

    if (!existing) {
      throw new Error("No user found for this email address.");
    }

    const code = Math.floor(100000 + Math.random() * 900000);

    existing.verifyEmailCode = code;
    existing.verifyEmailExpires = Date.now() + 3600000;
    existing.save();

    await mailgun.sendEmail(existing.email, "verify", null, existing);

    res
      .status(200)
      .json({ success: true, message: "Verification code sent successfully." });
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.log(error);
  }
});

router.post('/verify-code', async (req, res) => {
  try {
    const {code} = req.body;

    if (!code) {
      throw new Error("You must enter a verification code.");
    }

    const existing = await User.findOne({ verifyEmailCode: code });

    if (!existing) {
      throw new Error("Verification code is invalid.");
    }

    const isValidCode = existing.verifyEmailExpires ? new Date(existing.verifyEmailExpires).getTime() > Date.now() : false;

    if (!isValidCode) {
      throw new Error("Verification code is invalid or has expired.");
    }

    // Remove sensitive data before sending user object
    existing.verifyEmailCode = undefined;
    existing.verifyEmailExpires = undefined;

    const buffer = crypto.randomBytes(48);
    const resetToken = buffer.toString("hex");

    // Set reset token and expiry
    existing.resetPasswordToken = resetToken;
    existing.resetPasswordExpires = Date.now() + 3600000;

    existing.save();

    res.status(200).json({ success: true, message: "Email verified successfully.", token:  resetToken });
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.log(error);
  }
})

router.post("/reset", auth, async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const email = req.user.email;

    if (!email) {
      return res.status(401).send("Unauthenticated");
    }

    if (!password) {
      return res.status(400).json({ error: "You must enter a password." });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ error: "That email address is already in use." });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "Please enter your correct old password." });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(confirmPassword, salt);
    existingUser.password = hash;
    existingUser.save();

    await mailgun.sendEmail(existingUser.email, "reset-confirmation");

    res.status(200).json({
      success: true,
      message:
        "Password changed successfully. Please login with your new password.",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
});

router.get(
  "/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
    accessType: "offline",
    approvalPrompt: "force",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    session: false,
  }),
  (req, res) => {
    const payload = {
      id: req.user.id,
    };

    jwt.sign(payload, secret, { expiresIn: tokenLife }, (err, token) => {
      const jwt = `Bearer ${token}`;
      const htmlWithEmbeddedJWT = `
    <html>
      <script>
        // Save JWT to localStorage
        window.localStorage.setItem('token', '${jwt}');
        // Redirect browser to root of application
        window.location.href = '/auth/success';
      </script>
    </html>       
    `;

      res.send(htmlWithEmbeddedJWT);
    });
  }
);

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    session: false,
    scope: ["public_profile", "email"],
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/",
    session: false,
  }),
  (req, res) => {
    const payload = {
      id: req.user.id,
    };

    jwt.sign(payload, secret, { expiresIn: tokenLife }, (err, token) => {
      const jwt = `Bearer ${token}`;

      const htmlWithEmbeddedJWT = `
    <html>
      <script>
        // Save JWT to localStorage
        window.localStorage.setItem('token', '${jwt}');
        // Redirect browser to root of application
        window.location.href = '/auth/success';
      </script>
    </html>       
    `;

      res.send(htmlWithEmbeddedJWT);
    });
  }
);

module.exports = router;
