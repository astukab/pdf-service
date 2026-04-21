import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";

const app = express(); // ✅ primeiro cria o app

app.use(cors());       // ✅ depois usa
app.use(express.json());

console.log("SERVIDOR INICIANDO...");

app.post("/generate-pdf", async (req, res) => {
  const { url } = req.body;

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle0" });

    await page.evaluateHandle("document.fonts.ready");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao gerar PDF");
  }
});

app.listen(3001, () => {
  console.log("Rodando em http://localhost:3001");
});