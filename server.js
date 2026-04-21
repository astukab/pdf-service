import express from "express";
import cors from "cors";
import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/generate-pdf", async (req, res) => {
  const { url } = req.body;

  try {
    const isProd = process.env.NODE_ENV === "production";

    const browser = await puppeteer.launch(
      isProd
        ? {
            args: chromium.args,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
          }
        : {
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
          }
    );

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Rodando na porta ${PORT}`);
});