import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/generate-pdf", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).send("URL não fornecida");
  }

  let browser;

  try {
    console.log("🌐 Gerando PDF para:", url);

    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ]
    });

    const page = await browser.newPage();

    // Timeout maior para evitar falhas em páginas lentas
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 60000
    });

    // Garante que fontes carregaram
    await page.evaluateHandle("document.fonts.ready");

    // (Opcional) Espera elemento chave da página
    // await page.waitForSelector("#pdf-ready", { timeout: 5000 });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    console.log("✅ PDF gerado com sucesso");

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);

  } catch (err) {
    console.error("❌ ERRO AO GERAR PDF:", err);

    if (browser) {
      await browser.close();
    }

    res.status(500).send("Erro ao gerar PDF");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});