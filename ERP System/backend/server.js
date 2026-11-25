const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const { MongoClient } = require("mongodb");
const { v2: cloudinary } = require("cloudinary");
const { randomUUID, randomInt } = require("crypto");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const DEMO_MODE = process.env.DEMO_MODE === "true";

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set and contain at least 32 characters.");
}

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",").map((origin) => origin.trim()).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  }
}));
app.use(express.json({ limit: "32kb" }));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryReady = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let mongoClient;
let db, employees, attendance, leaves, payslips, holidays;

const newId = () => Date.now() * 1000 + randomInt(0, 1000);
const cleanText = (value) => typeof value === "string" ? value.trim() : "";
const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00.000Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const todayInIndia = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"
}).format(new Date());

const timeInIndia = () => new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false
}).format(new Date());

const publicEmployee = ({ passwordHash, ...employee }) => employee;

const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return res.status(401).json({ message: "Authentication required" });
  try {
    req.user = jwt.verify(token, JWT_SECRET, {
      issuer: "hrms-api", audience: "hrms-web"
    });
    return next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ message: "You do not have permission to perform this action" });
  }
  return next();
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    if (file.mimetype !== "application/pdf") return callback(new Error("Only PDF files are allowed"));
    return callback(null, true);
  }
});

const uploadPdf = (buffer, publicId) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({
    resource_type: "raw", type: "authenticated", public_id: publicId, overwrite: false
  }, (error, result) => error ? reject(error) : resolve(result));
  stream.end(buffer);
});

const signedPayslipUrl = (publicId) => cloudinary.utils.private_download_url(
  publicId, "pdf", {
    resource_type: "raw",
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 300,
    attachment: true
  }
);

const getPayslipsWithUrls = (records) => Promise.all(records.map(async (record) => ({
  ...record, fileUrl: signedPayslipUrl(record.publicId)
})));

async function bootstrapUsers() {
  if (await employees.countDocuments() > 0) return;

  const adminEmail = cleanText(DEMO_MODE ? process.env.DEMO_ADMIN_EMAIL : process.env.ADMIN_EMAIL).toLowerCase();
  const adminPassword = DEMO_MODE ? process.env.DEMO_ADMIN_PASSWORD : process.env.ADMIN_PASSWORD;
  const adminName = cleanText(DEMO_MODE ? process.env.DEMO_ADMIN_NAME : process.env.ADMIN_NAME) || "HRMS Admin";

  if (!adminEmail || !adminPassword || adminPassword.length < 8) {
    console.warn("No users exist. Configure ADMIN_EMAIL and ADMIN_PASSWORD (or DEMO_ADMIN_EMAIL and DEMO_ADMIN_PASSWORD in demo mode) to create the first admin.");
    return;
  }

  await employees.insertOne({
    id: newId(), name: adminName, email: adminEmail, phone: "", address: "",
    passwordHash: await bcrypt.hash(adminPassword, 12), role: "admin"
  });

  if (!DEMO_MODE) return;

  const employeeEmail = cleanText(process.env.DEMO_EMPLOYEE_EMAIL).toLowerCase();
  const employeePassword = process.env.DEMO_EMPLOYEE_PASSWORD;
  if (!employeeEmail || !employeePassword || employeePassword.length < 8) {
    console.warn("Demo admin created. Configure DEMO_EMPLOYEE_EMAIL and DEMO_EMPLOYEE_PASSWORD to seed the demo employee.");
    return;
  }

  const demoEmployee = {
    id: newId(), name: "Alex Demo", email: employeeEmail,
    phone: "9000000000", address: "Demo Office",
    passwordHash: await bcrypt.hash(employeePassword, 12), role: "employee"
  };
  await employees.insertOne(demoEmployee);
  await attendance.insertMany([
    { employeeId: demoEmployee.id, date: "2026-11-23", login: "10:02", logout: "18:58" },
    { employeeId: demoEmployee.id, date: "2026-11-24", login: "10:05", logout: "19:01" }
  ]);
  await leaves.insertOne({
    id: newId(), employeeId: demoEmployee.id, employeeName: demoEmployee.name,
    type: "PL", startDate: "2026-12-10", endDate: "2026-12-11",
    reason: "Personal work", status: "Pending"
  });
  await holidays.insertMany([
    { id: newId(), date: "2026-12-25", name: "Christmas" },
    { id: newId(), date: "2027-01-26", name: "Republic Day" }
  ]);
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: db ? "connected" : "disconnected" });
});

app.post("/api/login", async (req, res) => {
  const email = cleanText(req.body?.email).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  const user = await employees.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash || ""))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role }, JWT_SECRET,
    { expiresIn: "1h", issuer: "hrms-api", audience: "hrms-web" }
  );
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

app.post("/api/register", requireAuth, requireRole("admin"), async (req, res) => {
  const name = cleanText(req.body?.name);
  const email = cleanText(req.body?.email).toLowerCase();
  const phone = cleanText(req.body?.phone);
  const address = cleanText(req.body?.address);
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!name || !email || !phone || !address || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address" });
  if (!/^\d{10}$/.test(phone)) return res.status(400).json({ message: "Phone number must contain 10 digits" });
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
  if (await employees.findOne({ email })) return res.status(409).json({ message: "An account with this email already exists" });

  const newEmployee = {
    id: newId(), name, email, phone, address,
    passwordHash: await bcrypt.hash(password, 12), role: "employee"
  };
  await employees.insertOne(newEmployee);
  return res.status(201).json({ message: "Employee registered", newEmployee: publicEmployee(newEmployee) });
});

app.get("/api/employees", requireAuth, requireRole("admin"), async (req, res) => {
  const result = await employees.find({ role: "employee" }).sort({ name: 1 }).toArray();
  return res.json(result.map(publicEmployee));
});

app.delete("/api/employees/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid employee ID" });
  const result = await employees.deleteOne({ id, role: "employee" });
  if (!result.deletedCount) return res.status(404).json({ message: "Employee not found" });
  return res.json({ message: "Employee deleted" });
});

app.get("/api/attendance", requireAuth, async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { employeeId: req.user.id };
  return res.json(await attendance.find(filter).sort({ date: -1 }).toArray());
});

app.post("/api/checkin", requireAuth, requireRole("employee"), async (req, res) => {
  const record = { employeeId: req.user.id, date: todayInIndia(), login: timeInIndia(), logout: null };
  try {
    await attendance.insertOne(record);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Already checked in today" });
    throw error;
  }
  return res.status(201).json({ message: "Checked in", record });
});

app.post("/api/checkout", requireAuth, requireRole("employee"), async (req, res) => {
  const date = todayInIndia();
  const result = await attendance.updateOne(
    { employeeId: req.user.id, date, logout: null },
    { $set: { logout: timeInIndia() } }
  );
  if (!result.modifiedCount) {
    const record = await attendance.findOne({ employeeId: req.user.id, date });
    return res.status(400).json({ message: record ? "Already checked out" : "Not checked in" });
  }
  const record = await attendance.findOne({ employeeId: req.user.id, date });
  return res.json({ message: "Checked out", record });
});

app.post("/api/leaves", requireAuth, requireRole("employee"), async (req, res) => {
  const type = cleanText(req.body?.type);
  const startDate = cleanText(req.body?.startDate);
  const endDate = cleanText(req.body?.endDate);
  const reason = cleanText(req.body?.reason);

  if (!["PL", "SL", "EL"].includes(type) || !validDate(startDate) ||
      !validDate(endDate) || startDate > endDate || !reason) {
    return res.status(400).json({ message: "Enter a valid leave type, date range and reason" });
  }
  if (reason.length > 1000) return res.status(400).json({ message: "Reason must be 1000 characters or fewer" });

  const overlap = await leaves.findOne({
    employeeId: req.user.id, status: { $in: ["Pending", "Approved"] },
    startDate: { $lte: endDate }, endDate: { $gte: startDate }
  });
  if (overlap) return res.status(409).json({ message: "You already have a pending or approved leave during these dates" });

  const employee = await employees.findOne({ id: req.user.id, role: "employee" });
  if (!employee) return res.status(404).json({ message: "Employee account not found" });

  const newLeave = {
    id: newId(), employeeId: req.user.id, employeeName: employee.name,
    type, startDate, endDate, reason, status: "Pending"
  };
  await leaves.insertOne(newLeave);
  return res.status(201).json({ message: "Leave applied", newLeave });
});

app.get("/api/leaves", requireAuth, async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { employeeId: req.user.id };
  return res.json(await leaves.find(filter).sort({ id: -1 }).toArray());
});

app.put("/api/leaves/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const status = cleanText(req.body?.status);
  if (!Number.isSafeInteger(id) || id <= 0 || !["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid leave ID or status" });
  }
  const result = await leaves.updateOne({ id, status: "Pending" }, { $set: { status } });
  if (!result.modifiedCount) return res.status(404).json({ message: "Pending leave request not found" });
  return res.json({ message: "Leave updated", leave: await leaves.findOne({ id }) });
});

app.post("/api/payslips", requireAuth, requireRole("admin"), upload.single("file"), async (req, res) => {
  if (!cloudinaryReady) return res.status(503).json({ message: "Payslip storage is not configured" });
  if (!req.file || req.file.buffer.subarray(0, 5).toString() !== "%PDF-") {
    return res.status(400).json({ message: "Please upload a valid PDF file" });
  }

  const employeeId = Number(req.body?.employeeId);
  const month = cleanText(req.body?.month);
  const year = cleanText(req.body?.year);
  if (!Number.isSafeInteger(employeeId) || employeeId <= 0 ||
      !/^(0[1-9]|1[0-2])$/.test(month) || !/^\d{4}$/.test(year)) {
    return res.status(400).json({ message: "Select a valid employee and payslip month" });
  }

  const employee = await employees.findOne({ id: employeeId, role: "employee" });
  if (!employee) return res.status(404).json({ message: "Employee not found" });
  if (await payslips.findOne({ employeeId, month, year })) {
    return res.status(409).json({ message: "A payslip already exists for this employee and month" });
  }

  const publicId = "hrms/payslips/" + employeeId + "-" + randomUUID() + ".pdf";
  const asset = await uploadPdf(req.file.buffer, publicId);
  const newPayslip = {
    id: newId(), employeeId, employeeName: employee.name,
    month, year, publicId: asset.public_id
  };

  try {
    await payslips.insertOne(newPayslip);
  } catch (error) {
    await cloudinary.uploader.destroy(asset.public_id, { resource_type: "raw", type: "authenticated" }).catch(() => {});
    throw error;
  }

  return res.status(201).json({
    message: "Payslip uploaded",
    newPayslip: { ...newPayslip, fileUrl: signedPayslipUrl(asset.public_id) }
  });
});

app.get("/api/payslips", requireAuth, async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { employeeId: req.user.id };
  const result = await payslips.find(filter).sort({ year: -1, month: -1 }).toArray();
  return res.json(await getPayslipsWithUrls(result));
});

app.delete("/api/payslips/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid payslip ID" });
  const payslip = await payslips.findOne({ id });
  if (!payslip) return res.status(404).json({ message: "Payslip not found" });

  await cloudinary.uploader.destroy(payslip.publicId, { resource_type: "raw", type: "authenticated" });
  await payslips.deleteOne({ id });
  return res.json({ message: "Payslip deleted" });
});

app.get("/api/holidays", requireAuth, async (req, res) => {
  return res.json(await holidays.find({}).sort({ date: 1 }).toArray());
});

app.post("/api/holidays", requireAuth, requireRole("admin"), async (req, res) => {
  const date = cleanText(req.body?.date);
  const name = cleanText(req.body?.name);
  if (!validDate(date) || !name || name.length > 100) {
    return res.status(400).json({ message: "Enter a valid holiday date and name" });
  }
  if (await holidays.findOne({ date })) return res.status(409).json({ message: "A holiday already exists on this date" });
  const newHoliday = { id: newId(), date, name };
  await holidays.insertOne(newHoliday);
  return res.status(201).json({ message: "Holiday added", newHoliday });
});

app.delete("/api/holidays/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid holiday ID" });
  const result = await holidays.deleteOne({ id });
  if (!result.deletedCount) return res.status(404).json({ message: "Holiday not found" });
  return res.json({ message: "Holiday deleted" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE" ? "PDF must be 10 MB or smaller" : "File upload failed";
    return res.status(400).json({ message });
  }
  if (error.message === "Origin is not allowed by CORS") return res.status(403).json({ message: "Origin is not allowed" });
  console.error(error);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
});

async function start() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI must be configured");
  if (!cloudinaryReady) console.warn("Cloudinary is not configured; payslip uploads are disabled.");

  mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  db = mongoClient.db(process.env.MONGODB_DB || "hrms");
  employees = db.collection("employees");
  attendance = db.collection("attendance");
  leaves = db.collection("leaves");
  payslips = db.collection("payslips");
  holidays = db.collection("holidays");

  await Promise.all([
    employees.createIndex({ email: 1 }, { unique: true }),
    attendance.createIndex({ employeeId: 1, date: 1 }, { unique: true }),
    leaves.createIndex({ employeeId: 1, startDate: 1, endDate: 1 }),
    payslips.createIndex({ employeeId: 1, month: 1, year: 1 }, { unique: true }),
    holidays.createIndex({ date: 1 }, { unique: true })
  ]);

  await bootstrapUsers();
  app.listen(PORT, () => console.log("HRMS API listening on port " + PORT));
}

start().catch((error) => {
  console.error("Failed to start HRMS API:", error.message);
  process.exit(1);
});
