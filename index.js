require("dotenv").config();
const express = require("express");
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

const app = express();
const PORT = process.env.PORT || 3000;

const vaultUrl = process.env.AZURE_KEY_VAULT_URL;
const secretName = "username";

function secretClient() {
  return new SecretClient(vaultUrl, new DefaultAzureCredential());
}

app.get("/", (req, res) => {
  res.send("OK");
});

app.get("/secret", async (req, res) => {
  if (!vaultUrl || !secretName) {
    return res.status(503).json({
      error:
        "Missing AZURE_KEY_VAULT_URL or KEY_VAULT_SECRET_NAME in environment",
    });
  }
  try {
    const client = secretClient();
    const secret = await client.getSecret(secretName);
    res.json({
      name: secretName,
      value: secret.value,
      keyIdentifier: secret.properties.id,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message || "Failed to read secret from Key Vault",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
