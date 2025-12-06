import express from "express";
import { PORT, connection } from "./db/config.js";
import UserRoutes from "./routes/Userroutes.js";
import BookingRoutes from "./routes/BookingRoute.js";
import ServiceRoutes from "./routes/ServiceRoute.js";
import welcomeRoutes from "./routes/WelcomeMail.js";
import EmployeeRoutes from "./routes/EmployeeRoutes.js";
import InvoiceRoutes from "./routes/InvoiceRoute.js";
import EmailRoutes from "./routes/emailRoutes.js";
import LeadRoutes from "./routes/LeadRoute.js";
import AdminRoutes from "./routes/AdminRoute.js";
import dotenv from "dotenv";
dotenv.config();
import morganMiddleware from "./middlewares/logger.js";
import logger from "./logger/index.js";
import errorLogger from "./logger/errorLogger.js"
import PaymentRoutes from "./routes/PaymentRoutes.js";
import "./cron/deleteDuplicates.js";



import cors from "cors";
const app = express();
// Morgan → logs every request
app.use(morganMiddleware);

// Log server start
logger.info("Server started");
app.use((err, req, res, next) => {
  errorLogger.error({
    message: err.message,
    stack: err.stack,
    route: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({ error: "Internal Server Error" });
});

// Uncaught & unhandled errors
process.on("uncaughtException", (err) => {
  errorLogger.error("Uncaught Exception: " + err.message, err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  errorLogger.error("Unhandled Promise Rejection: " + reason);
});


app.use(express.json());
app.use(cors());

const corsOptions = {
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allow only these HTTP methods
  allowedHeaders: ["Content-Type", "Authorization", "user-role"], // Allow only these headers
  credentials: true, // Allow cookies to be included in the requests
};

app.use(cors(corsOptions));
app.use("/user", UserRoutes);
app.use("/booking", BookingRoutes);
app.use("/services", ServiceRoutes);
app.use("/mail", welcomeRoutes);
app.use("/employee", EmployeeRoutes);
app.use("/invoice", InvoiceRoutes);
app.use("/email", EmailRoutes);
app.use("/leads", LeadRoutes);
app.use("/admin", AdminRoutes);
app.use("/payments", PaymentRoutes);



app.get("/", (req, res) => {
  res.send("<h1>server is running successfully</h1>");
});

connection()
  .then(() => {
    console.log("connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running at http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
