const fs = require("fs-extra");
const { exec } = require("child_process");
const path = require("path");

async function build() {
  try {
    console.log("🔨 Compiling TypeScript...");
    await new Promise((resolve, reject) => {
      exec("tsc", (error, stdout, stderr) => {
        if (error) {
          console.error("TypeScript compilation failed:", error);
          reject(error);
          return;
        }
        if (stderr) console.log(stderr);
        if (stdout) console.log(stdout);
        resolve();
      });
    });

    console.log("📁 Copying public folder...");
    await fs.copy("public", "dist/public", {
      filter: (src) => {
        // Exclude any file or folder under public/scripts
        if (src.includes(path.join("public", "scripts"))) {
          return false;
        }
        return true;
      },
    });

    console.log("✅ Build completed successfully!");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

build();
