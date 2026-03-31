const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

// 🔐 Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mytodoaap@gmail.com",
    pass: "takczjghwnmdwsfo"
  }
});

// 🚀 Trigger on new user signup
exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
  
  const email = user.email;
  const name = user.displayName || email.split("@")[0];

  const mailOptions = {
    from: "MyTodoApp <mytodoaap@gmail.com>",
    to: email,
    subject: "Welcome to MyTodoApp 🎉",
    html: `
      <div style="font-family:sans-serif">
        <h2>Welcome ${name} 👋</h2>
        <p>We are excited to have you on MyTodoApp 🚀</p>
        <p>Start managing your tasks and boost productivity 💪</p>
        <br/>
        <a href="https://new1todoapp.netlify.app/"
           style="padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;border-radius:5px;">
           Start Now
        </a>
      </div>
    `
  };

  return transporter.sendMail(mailOptions)
    .then(() => console.log("Email sent ✅"))
    .catch(err => console.log("Error:", err));
});