const fs = require("fs");
const path = require("path");
const pngToIco = require("png-to-ico").default || require("png-to-ico");

async function main() {
  const srcPng = path.join(__dirname, "..", "TimerLogo.png");
  const outIco = path.join(__dirname, "..", "TimerLogo.ico");

  if (!fs.existsSync(srcPng)) {
    console.error("Missing source logo:", srcPng);
    process.exit(1);
  }

  try {
    const buf = await pngToIco(srcPng);
    fs.writeFileSync(outIco, buf);
    console.log("Icon written:", outIco, "(", buf.length, "bytes )");
  } catch (err) {
    console.error("Icon build failed:", err);
    process.exit(1);
  }
}

main();
