const fs = require("fs-extra");
const { exec } = require("child_process");
const path = require("path");

async function build() {
  try {
    console.log("🧹 Cleaning dist folder...");
    // Check if dist/.env exists
    const envPath = path.join("dist", ".env");
    const envExists = await fs.pathExists(envPath);

    await fs.remove("dist");

    // Always ensure dist exists after removal
    await fs.ensureDir("dist");

    // Copy .env from root to dist and set NODE_ENV to production
    const rootEnvPath = path.join(".env");
    const rootEnvExists = await fs.pathExists(rootEnvPath);
    if (rootEnvExists) {
      let envContent = await fs.readFile(rootEnvPath, "utf8");
      // Replace or add NODE_ENV
      if (envContent.includes("NODE_ENV=")) {
        envContent = envContent.replace(/NODE_ENV=.*$/m, "NODE_ENV=production");
      } else {
        envContent += "\nNODE_ENV=production";
      }
      await fs.writeFile(envPath, envContent);
    } else {
      // If no .env exists, create one with NODE_ENV=production
      await fs.writeFile(envPath, "NODE_ENV=production");
    }

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
