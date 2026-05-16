/**
 * Google Workspace user provisioning.
 *
 * When admin adds a new student/teacher, call provisionWorkspaceUser() to
 * create their @yourdomain workspace email. Returns { provisioned: false }
 * with no error if env vars aren't set (so dev/staging without Workspace
 * still works).
 *
 * Setup steps documented in README under "Google Workspace".
 */

type ProvisionInput = {
  givenName: string;
  familyName: string;
  primaryEmail: string;          // e.g. "ahmed.khan@vipschoolnizamabad.com"
  password: string;              // temporary password — user resets on first login
  orgUnitPath?: string;          // e.g. "/Students" or "/Teachers"
};

type ProvisionResult =
  | { provisioned: true; email: string }
  | { provisioned: false; error?: string };

export async function provisionWorkspaceUser(input: ProvisionInput): Promise<ProvisionResult> {
  const domain = process.env.GOOGLE_WORKSPACE_DOMAIN;
  const saEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const saKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const adminEmail = process.env.GOOGLE_WORKSPACE_ADMIN_EMAIL;

  if (!domain || !saEmail || !saKey || !adminEmail) {
    return {
      provisioned: false,
      error: "Google Workspace not configured (set GOOGLE_WORKSPACE_* env vars)",
    };
  }

  try {
    const token = await getAccessToken({
      saEmail,
      privateKey: saKey.replace(/\\n/g, "\n"),
      adminEmail,
      scopes: ["https://www.googleapis.com/auth/admin.directory.user"],
    });

    const res = await fetch("https://admin.googleapis.com/admin/directory/v1/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        primaryEmail: input.primaryEmail,
        name: { givenName: input.givenName, familyName: input.familyName },
        password: input.password,
        changePasswordAtNextLogin: true,
        orgUnitPath: input.orgUnitPath ?? "/",
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { provisioned: false, error: `Workspace ${res.status}: ${body}` };
    }
    return { provisioned: true, email: input.primaryEmail };
  } catch (err) {
    return {
      provisioned: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/**
 * Minimal JWT-bearer flow for Google service-account → access token.
 * (Avoids pulling in the full googleapis SDK; we just need one endpoint.)
 */
async function getAccessToken(opts: {
  saEmail: string;
  privateKey: string;
  adminEmail: string;
  scopes: string[];
}): Promise<string> {
  const { createSign } = await import("node:crypto");
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: opts.saEmail,
    sub: opts.adminEmail,
    scope: opts.scopes.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const b64 = (o: object) =>
    Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64(header)}.${b64(payload)}`;
  const signer = createSign("RSA-SHA256").update(unsigned);
  const signature = signer.sign(opts.privateKey, "base64url");
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}
