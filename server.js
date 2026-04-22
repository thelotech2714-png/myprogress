import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Importações do MyProgress
import authRouter from "./backend/routes/auth.js";
import studentsRouter from "./backend/routes/students.js";
import financialRouter from "./backend/routes/financial.js";
import plansRouter from "./backend/routes/plans.js";
import webhooksRouter from "./backend/routes/webhooks.js";
import alertsRouter from "./backend/routes/alerts.js";
import dietRouter from "./backend/routes/diet.js";
import pixRouter from "./backend/routes/pix.js";
import pixRoutesPro from "./backend/routes/pixRoutes.js";
import webhooksPixRouter from "./backend/routes/webhooksPix.js";
import pixWebhook from "./backend/webhooks/pixWebhook.js";
import { generateAI } from "./backend/services/aiService.js";
import billingRouter, { stripeWebhookHandler } from "./backend/routes/billing.js";

dotenv.config({ path: './backend/.env' });

const app = express();

// CORS
app.use(cors({
  origin: "*"
}));

// Webhook PIX (antes do json)
app.post("/api/webhooks/pix", express.raw({ type: "application/json" }), (req, res) => {
  // Redirecionar para o router de webhooks
  req.url = '/pix';
  webhooksRouter(req, res);
});

// Webhook Stripe (mantido)
app.post("/api/billing/webhook", express.raw({ type: "application/json" }), stripeWebhookHandler);

// JSON normal
app.use(express.json());

const PORT = process.env.PORT || 5000;

// __dirname fix (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ROTA RAIZ
app.get("/", (req, res) => {
  res.send("MyProgress Backend - Sistema de Gestão para Instrutores de Academia");
});

// API INFO
app.get("/api", (req, res) => {
  res.json({ 
    message: "MyProgress API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      students: "/api/students",
      financial: "/api/financial",
      plans: "/api/plans",
      webhooks: "/api/webhooks",
      alerts: "/api/alerts",
      ai: "/api/ai"
    }
  });
});

// ROTAS DO MYPROGRESS
app.use("/api/auth", authRouter);
app.use("/api/students", studentsRouter);
app.use("/api/financial", financialRouter);
app.use("/api/plans", plansRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api/diet", dietRouter);
app.use("/api/pix", pixRouter);
app.use("/api/pix-pro", pixRoutesPro);
app.use("/api/webhooks-pix", webhooksPixRouter);
app.post("/api/webhook/pix", express.json(), pixWebhook);

// ROTA IA (mantida)
app.post("/api/ai", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { message, steps } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Mensagem não enviada" });
    }

    const result = await generateAI(message, steps);

    res.json({ response: result });

  } catch (error) {
    console.error("ERRO BACKEND:", error);

    res.status(500).json({
      error: error.message || "Erro interno no servidor"
    });
  }
});

// BILLING (mantido)
app.use("/api/billing", billingRouter);

// START
app.listen(PORT, () => {
  console.log(`MyProgress Backend rodando na porta ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});
