const fs = require("fs");

const path = "app/page.tsx";
let s = fs.readFileSync(path, "utf8");

const marker = "Our AI design concierge will call you shortly";
const i = s.indexOf(marker);

if (i < 0) {
  console.error("ERROR: call screen marker not found");
  process.exit(1);
}

const end = s.indexOf("</p>", i);

if (end < 0) {
  console.error("ERROR: paragraph end not found");
  process.exit(1);
}

const insert = `
            <div className="mt-6 flex justify-center gap-3">
              <a href="/" className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-[#555] transition hover:bg-black/[0.03]">
                Back to Home
              </a>
              <a href="/dashboard" className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black/90">
                Dashboard
              </a>
            </div>`;

s = s.slice(0, end + 4) + insert + s.slice(end + 4);

fs.writeFileSync(path, s, "utf8");

console.log("Navigation buttons added successfully.");
