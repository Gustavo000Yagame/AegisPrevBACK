require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { authMiddleware } = require("./middleware/auth");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const medicoRoutes = require("./routes/medico.routes");
const pacienteRoutes = require("./routes/paciente.routes");
const sintomaRoutes = require("./routes/sintoma.routes");
const doencaRoutes = require("./routes/doenca.routes");
const consultaRoutes = require("./routes/consulta.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    exposedHeaders: ["Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(authMiddleware);

app.get("/", (req, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);
app.use("/medicos", medicoRoutes);
app.use("/pacientes", pacienteRoutes);
app.use("/sintomas", sintomaRoutes);
app.use("/doencas", doencaRoutes);
app.use("/consultas", consultaRoutes);
app.use("/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
