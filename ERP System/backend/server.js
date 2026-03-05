const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;
const SECRET = "training_secret_key";

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ================== ENSURE FOLDERS ================== */

if (!fs.existsSync("data")) fs.mkdirSync("data");
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

/* ================= FILE PATHS ================= */

const employeesFile = "./data/employees.json";
const attendanceFile = "./data/attendance.json";
const leavesFile = "./data/leaves.json";
const payslipsFile = "./data/payslips.json";
const holidaysFile = "./data/holidays.json";

/* ================= FILE HELPERS ================= */

const loadData = (file) => {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file));
};

const saveData = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

const loadEmployees = () => loadData(employeesFile);
const saveEmployees = (data) => saveData(employeesFile, data);

/* ================= MULTER CONFIG ================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files allowed"));
    }
    cb(null, true);
  }
});

/* ================= AUTH ================= */

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Token missing" });

  jwt.verify(token, SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: "Token invalid" });
    req.user = user;
    next();
  });
};

/* ================= LOGIN ================= */

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const employees = loadEmployees();

  const user = employees.find(
    (e) => e.email === email && e.password === password
  );

  if (!user)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

/* ================= EMPLOYEES ================= */

app.post("/api/register", authenticateToken, (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin only" });

  const { name, email, phone, address, password } = req.body;

  if (!name || !email || !phone || !address || !password)
    return res.status(400).json({ message: "All fields required" });

  const employees = loadEmployees();

  if (employees.find((e) => e.email === email))
    return res.status(400).json({ message: "Employee exists" });

  const newEmployee = {
    id: Date.now(),
    name,
    email,
    phone,
    address,
    password,
    role: "employee"
  };

  employees.push(newEmployee);
  saveEmployees(employees);

  res.json({ message: "Employee registered", newEmployee });
});

app.get("/api/employees", authenticateToken, (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin only" });

  res.json(loadEmployees().filter(e => e.role === "employee"));
});

app.delete("/api/employees/:id", authenticateToken, (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin only" });

  let employees = loadEmployees();
  employees = employees.filter(e => e.id !== Number(req.params.id));
  saveEmployees(employees);

  res.json({ message: "Employee deleted" });
});

/* ================= ATTENDANCE ================= */

app.get("/api/attendance", authenticateToken, (req, res) => {
  const attendance = loadData(attendanceFile);

  if (req.user.role === "admin")
    return res.json(attendance);

  res.json(attendance.filter(a => a.employeeId === req.user.id));
});

app.post("/api/checkin", authenticateToken, (req, res) => {
  const attendance = loadData(attendanceFile);
  const today = new Date().toISOString().split("T")[0];

  if (attendance.find(a => a.employeeId === req.user.id && a.date === today))
    return res.status(400).json({ message: "Already checked in" });

  const record = {
    employeeId: req.user.id,
    date: today,
    login: new Date().toTimeString().slice(0, 5),
    logout: null
  };

  attendance.push(record);
  saveData(attendanceFile, attendance);

  res.json({ message: "Checked in", record });
});

app.post("/api/checkout", authenticateToken, (req, res) => {
  const attendance = loadData(attendanceFile);
  const today = new Date().toISOString().split("T")[0];

  const record = attendance.find(
    a => a.employeeId === req.user.id && a.date === today
  );

  if (!record)
    return res.status(400).json({ message: "Not checked in" });

  if (record.logout)
    return res.status(400).json({ message: "Already checked out" });

  record.logout = new Date().toTimeString().slice(0, 5);
  saveData(attendanceFile, attendance);

  res.json({ message: "Checked out", record });
});

/* ================= LEAVES ================= */

app.post("/api/leaves", authenticateToken, (req, res) => {
  if (req.user.role !== "employee")
    return res.status(403).json({ message: "Employees only" });

  const { type, startDate, endDate, reason } = req.body;

  const leaves = loadData(leavesFile);
  const employees = loadEmployees();
  const employee = employees.find(e => e.id === req.user.id);

  const newLeave = {
    id: Date.now(),
    employeeId: req.user.id,
    employeeName: employee.name,
    type,
    startDate,
    endDate,
    reason,
    status: "Pending"
  };

  leaves.push(newLeave);
  saveData(leavesFile, leaves);

  res.json({ message: "Leave applied", newLeave });
});

app.get("/api/leaves", authenticateToken, (req, res) => {
  const leaves = loadData(leavesFile);

  if (req.user.role === "admin")
    return res.json(leaves);

  res.json(leaves.filter(l => l.employeeId === req.user.id));
});

app.put("/api/leaves/:id", authenticateToken, (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin only" });

  const leaves = loadData(leavesFile);
  const leave = leaves.find(l => l.id === Number(req.params.id));

  if (!leave)
    return res.status(404).json({ message: "Leave not found" });

  leave.status = req.body.status;
  saveData(leavesFile, leaves);

  res.json({ message: "Leave updated", leave });
});

/* ================= PAYSLIPS ================= */

app.post(
  "/api/payslips",
  authenticateToken,
  upload.single("file"),
  (req, res) => {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admin only" });

    const payslips = loadData(payslipsFile);

    const employees = loadEmployees();
    const employee = employees.find(e => e.id === Number(req.body.employeeId));

    const newPayslip = {
      id: Date.now(),
      employeeId: Number(req.body.employeeId),
      employeeName: employee.name,
      month: req.body.month,
      year: req.body.year,
      fileUrl: `http://localhost:5000/uploads/${req.file.filename}`
    };

    payslips.push(newPayslip);
    saveData(payslipsFile, payslips);

    res.json({ message: "Payslip uploaded", newPayslip });
  }
);

app.get("/api/payslips", authenticateToken, (req, res) => {
  const payslips = loadData(payslipsFile);

  if (req.user.role === "admin") {
    return res.json(payslips);
  }

  res.json(payslips.filter(p => p.employeeId === req.user.id));
});

app.delete("/api/payslips/:id", authenticateToken, (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin only" });

  const payslips = loadData(payslipsFile);

  const updatedPayslips = payslips.filter(
    p => p.id !== Number(req.params.id)
  );

  saveData(payslipsFile, updatedPayslips);

  res.json({ message: "Payslip deleted" });
});

/* ================= HOLIDAYS ================= */

app.get("/api/holidays", authenticateToken, (req, res) => {
  res.json(loadData(holidaysFile));
});

app.post("/api/holidays", authenticateToken, (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin only" });

  const { date, name } = req.body;

  const holidays = loadData(holidaysFile);

  const newHoliday = {
    id: Date.now(),
    date,
    name
  };

  holidays.push(newHoliday);
  saveData(holidaysFile, holidays);

  res.json({ message: "Holiday added", newHoliday });
});

app.delete("/api/holidays/:id", authenticateToken, (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin only" });

  let holidays = loadData(holidaysFile);
  holidays = holidays.filter(h => h.id !== Number(req.params.id));
  saveData(holidaysFile, holidays);

  res.json({ message: "Holiday deleted" });
});

/* ================= START ================= */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});