const { execSync } = require("child_process");

try {
  execSync("git remote remove origin", { stdio: "inherit" });
  console.log('✅ Git remote "origin" has been removed.');
} catch (error) {
  console.error(' Failed to remove git remote "origin":', error.message);
}
