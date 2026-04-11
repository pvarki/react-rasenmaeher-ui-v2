import { http, HttpResponse } from "msw";
import {
  getState,
  updateState,
  generateMockJwt,
  generateInviteCode,
  generateApproveCode,
} from "./state";
import { getMockProducts } from "./data/products";

// In-memory poll counter for waiting-room auto-approve (no sessionStorage in SW)
const enrollmentPollCounts = new Map<string, number>();

// Demo HLS stream for MTX mock — rickroll
const RICKROLL_HLS = "https://www.youtube.com/watch?v=xvFZjo5PgG0";

export const handlers = [
  // ──── Health ────
  http.get("/api/v1/healthcheck", () => {
    return HttpResponse.json({
      dns: "demo.pvarki.fi",
      version: "mock-2.0.0",
      deployment: "MOCK DEMO",
    });
  }),

  http.get("/api/v1/healthcheck/services", async () => {
    // Dynamically determine which products are available from product-integrations.json
    try {
      const resp = await fetch("/product-integrations.json");
      if (resp.ok) {
        const integrations = await resp.json();
        const products: Record<string, boolean> = {};
        if (Array.isArray(integrations)) {
          for (const p of integrations) {
            if (p.shortname) products[p.shortname] = true;
          }
        }
        return HttpResponse.json({
          all_ok: Object.keys(products).length > 0,
          products,
        });
      }
    } catch {
      // fallthrough
    }
    return HttpResponse.json({ all_ok: false, products: {} });
  }),

  // ──── Auth ────
  http.get("/api/v1/check-auth/mtls_or_jwt", () => {
    const state = getState();
    if (!state.isAuthenticated || !state.currentCallsign) {
      return new HttpResponse(null, { status: 403 });
    }
    return HttpResponse.json({
      type: "jwt",
      userid: state.currentCallsign,
      payload: { CN: state.currentCallsign },
    });
  }),

  http.get("/api/v1/check-auth/validuser", () => {
    const state = getState();
    if (!state.isAuthenticated || !state.currentCallsign) {
      return new HttpResponse(null, { status: 403 });
    }
    return HttpResponse.json({
      isValidUser: true,
      userid: state.currentCallsign,
    });
  }),

  http.get("/api/v1/check-auth/validuser/admin", () => {
    const state = getState();
    if (state.currentRole === "admin") {
      return HttpResponse.json({ isAdmin: true });
    }
    return new HttpResponse(null, { status: 403 });
  }),

  // ──── Code Check (Login) ────
  http.get("/api/v1/firstuser/check-code", ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("temp_admin_code") || "";
    // Accept "ADMIN" or any code starting with "ADMIN" as admin code
    const isAdmin =
      code.toUpperCase() === "ADMIN" || code.toUpperCase().startsWith("ADMIN-");
    return HttpResponse.json({ code_ok: isAdmin });
  }),

  http.get("/api/v1/enrollment/invitecode", ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("invitecode") || "";
    const state = getState();
    const found = state.inviteCodes.find(
      (c) => c.invitecode === code && c.active,
    );
    // Also accept any non-empty code for demo purposes
    return HttpResponse.json({
      invitecode_is_active: !!found || code.length > 2,
    });
  }),

  // ──── First User / Admin Login ────
  http.post("/api/v1/token/code/exchange", async ({ request }) => {
    const body = (await request.json()) as { code: string };
    const jwt = generateMockJwt("pending-admin");
    return HttpResponse.json({ jwt: body.code ? jwt : "" });
  }),

  http.post("/api/v1/firstuser/add-admin", async ({ request }) => {
    const body = (await request.json()) as { callsign: string };
    const state = getState();
    const jwt = generateMockJwt(body.callsign);

    // Add admin user if not exists
    if (!state.users.find((u) => u.callsign === body.callsign)) {
      state.users.push({
        callsign: body.callsign,
        roles: ["admin"],
        extre: null,
      });
    }
    if (!state.enrollments.find((e) => e.callsign === body.callsign)) {
      state.enrollments.push({
        callsign: body.callsign,
        approvecode: generateApproveCode(body.callsign),
        state: 1,
      });
    }

    updateState({
      currentCallsign: body.callsign,
      currentRole: "admin",
      isAuthenticated: true,
      jwt,
      users: state.users,
      enrollments: state.enrollments,
    });

    localStorage.setItem("token", jwt);
    localStorage.setItem("callsign", body.callsign);

    return HttpResponse.json({
      admin_added: true,
      jwt_exchange_code: "mock-exchange-code",
    });
  }),

  // ──── Enrollment (User Sign-up) ────
  http.post("/api/v1/enrollment/invitecode/enroll", async ({ request }) => {
    const body = (await request.json()) as {
      callsign: string;
      invite_code: string;
    };
    const state = getState();
    const approveCode = generateApproveCode(body.callsign);
    const jwt = generateMockJwt(body.callsign);

    // Add enrollment as PENDING
    state.enrollments.push({
      callsign: body.callsign,
      approvecode: approveCode,
      state: 0, // PENDING
    });

    // Store JWT + callsign but NOT fully authenticated yet (pending approval)
    updateState({
      currentCallsign: body.callsign,
      currentRole: null,
      isAuthenticated: false,
      jwt,
      enrollments: state.enrollments,
    });

    localStorage.setItem("token", jwt);
    localStorage.setItem("callsign", body.callsign);
    localStorage.setItem("approveCode", approveCode);

    return HttpResponse.json({
      callsign: body.callsign,
      approvecode: approveCode,
      jwt,
    });
  }),

  http.get("/api/v1/enrollment/have-i-been-accepted", () => {
    const state = getState();
    const enrollment = state.enrollments.find(
      (e) => e.callsign === state.currentCallsign,
    );
    const accepted = enrollment?.state === 1;

    // Auto-approve after 3 polls (~15s at 5s interval)
    if (enrollment && enrollment.state === 0 && state.currentCallsign) {
      const key = state.currentCallsign;
      const polls = (enrollmentPollCounts.get(key) ?? 0) + 1;
      enrollmentPollCounts.set(key, polls);

      if (polls >= 3) {
        enrollment.state = 1;
        enrollmentPollCounts.delete(key);
        if (!state.users.find((u) => u.callsign === enrollment.callsign)) {
          state.users.push({
            callsign: enrollment.callsign,
            roles: [],
            extre: null,
          });
        }
        updateState({
          isAuthenticated: true,
          currentRole: "user",
          users: state.users,
          enrollments: state.enrollments,
        });
        return HttpResponse.json({ have_i_been_accepted: true });
      }
      updateState({ enrollments: state.enrollments });
    }

    return HttpResponse.json({ have_i_been_accepted: accepted });
  }),

  http.post("/api/v1/enrollment/accept", async ({ request }) => {
    const body = (await request.json()) as {
      callsign: string;
      approvecode: string;
    };
    const state = getState();
    const enrollment = state.enrollments.find(
      (e) => e.callsign === body.callsign,
    );

    if (enrollment) {
      enrollment.state = 1;
      if (!state.users.find((u) => u.callsign === body.callsign)) {
        state.users.push({ callsign: body.callsign, roles: [], extre: null });
      }
      updateState({ enrollments: state.enrollments, users: state.users });
    }

    return HttpResponse.json({ success: true });
  }),

  http.post("/api/v1/enrollment/lock", async ({ request }) => {
    const body = (await request.json()) as {
      callsign: string;
      lock_reason: string;
    };
    const state = getState();
    const enrollment = state.enrollments.find(
      (e) => e.callsign === body.callsign,
    );
    if (enrollment) {
      enrollment.state = 2;
      updateState({ enrollments: state.enrollments });
    }
    return HttpResponse.json({ success: true });
  }),

  http.post("/api/v1/enrollment/promote", async ({ request }) => {
    const body = (await request.json()) as { callsign: string };
    const state = getState();
    const user = state.users.find((u) => u.callsign === body.callsign);
    if (user && !user.roles.includes("admin")) {
      user.roles.push("admin");
      updateState({ users: state.users });
    }
    return HttpResponse.json({ success: true });
  }),

  http.post("/api/v1/enrollment/demote", async ({ request }) => {
    const body = (await request.json()) as { callsign: string };
    const state = getState();
    const user = state.users.find((u) => u.callsign === body.callsign);
    if (user) {
      user.roles = user.roles.filter((r) => r !== "admin");
      updateState({ users: state.users });
    }
    return HttpResponse.json({ success: true });
  }),

  http.get("/api/v1/enrollment/list", () => {
    const state = getState();
    return HttpResponse.json({
      callsign_list: state.enrollments.map((e) => ({
        approvecode: e.approvecode,
        callsign: e.callsign,
        state: e.state,
      })),
    });
  }),

  http.get("/api/v1/enrollment/show-verification-code-info", ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("verification_code") || "";
    const state = getState();
    const enrollment = state.enrollments.find((e) => e.approvecode === code);
    if (enrollment) {
      return HttpResponse.json({
        state: String(enrollment.state),
        callsign: enrollment.callsign,
        accepted: enrollment.state === 1 ? "true" : "false",
        locked: enrollment.state === 2 ? "true" : "false",
      });
    }
    return HttpResponse.json({
      state: "0",
      callsign: "Unknown",
      accepted: "false",
      locked: "false",
    });
  }),

  // ──── People ────

  http.get("/api/v1/people/list", () => {
    const state = getState();
    return HttpResponse.json({
      callsign_list: state.users.map((u) => ({
        callsign: u.callsign,
        roles: u.roles,
        extre: u.extre,
      })),
    });
  }),

  http.delete("/api/v1/people/:callsign", ({ params }) => {
    const { callsign } = params;
    const state = getState();
    const newUsers = state.users.filter((u) => u.callsign !== callsign);
    const newEnrollments = state.enrollments.filter(
      (e) => e.callsign !== callsign,
    );
    updateState({ users: newUsers, enrollments: newEnrollments });
    return HttpResponse.json({ invite_code: "mock-released-code" });
  }),

  // ──── Certificate (mocked — no file download) ────

  http.get("/api/v1/enduserpfx/:callsign", () => {
    const fakeContent = new Uint8Array([0x00]);
    return new HttpResponse(fakeContent, {
      headers: {
        "Content-Type": "application/x-pkcs12",
        "Content-Disposition": "attachment; filename=mock-cert.pfx",
      },
    });
  }),

  http.get("/api/v1/instructions/user", () => {
    return HttpResponse.json({
      files: {
        tak: [
          {
            title: "ATAK Data Package",
            filename: "mock-atak-package.zip",
            data: "data:application/zip;base64,UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==",
          },
          {
            title: "iTAK Data Package",
            filename: "mock-itak-package.zip",
            data: "data:application/zip;base64,UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==",
          },
          {
            title: "Tracker Package",
            filename: "mock-tracker-package.zip",
            data: "data:application/zip;base64,UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==",
          },
        ],
      },
    });
  }),

  // ──── Invite Codes ────
  http.get("/api/v1/enrollment/pools", () => {
    const state = getState();
    return HttpResponse.json({
      pools: state.inviteCodes.map((c) => ({
        invitecode: c.invitecode,
        active: c.active,
        owner_cs: c.owner_cs,
        created: c.created,
      })),
    });
  }),

  http.post("/api/v1/enrollment/invitecode/create", () => {
    const state = getState();
    const newCode = generateInviteCode();
    state.inviteCodes.push({
      invitecode: newCode,
      active: true,
      owner_cs: state.currentCallsign || "JanneJaeger",
      created: new Date().toISOString(),
    });
    updateState({ inviteCodes: state.inviteCodes });
    return HttpResponse.json({ invite_code: newCode });
  }),

  http.delete("/api/v1/enrollment/invitecode/:code", ({ params }) => {
    const { code } = params;
    const state = getState();
    const newCodes = state.inviteCodes.filter((c) => c.invitecode !== code);
    updateState({ inviteCodes: newCodes });
    return HttpResponse.json({ invite_code: code as string });
  }),

  http.put("/api/v1/enrollment/invitecode/deactivate", async ({ request }) => {
    const body = (await request.json()) as { invite_code: string };
    const state = getState();
    const code = state.inviteCodes.find(
      (c) => c.invitecode === body.invite_code,
    );
    if (code) {
      code.active = false;
      updateState({ inviteCodes: state.inviteCodes });
    }
    return HttpResponse.json({ success: true });
  }),

  http.put("/api/v1/enrollment/invitecode/activate", async ({ request }) => {
    const body = (await request.json()) as { invite_code: string };
    const state = getState();
    const code = state.inviteCodes.find(
      (c) => c.invitecode === body.invite_code,
    );
    if (code) {
      code.active = true;
      updateState({ inviteCodes: state.inviteCodes });
    }
    return HttpResponse.json({ success: true });
  }),

  // ──── Products ────
  http.get("/api/v2/descriptions/:language", async ({ params }) => {
    const lang = (params.language as string) || "en";
    const products = await getMockProducts(lang);
    return HttpResponse.json(products);
  }),

  http.get("/api/v2/admin/descriptions/:language", async ({ params }) => {
    const lang = (params.language as string) || "en";
    const products = await getMockProducts(lang);
    return HttpResponse.json(products);
  }),

  http.get("/api/v2/instructions/data/:product", ({ params }) => {
    const product = params.product as string;
    const instructionsMap: Record<string, Record<string, unknown>> = {
      tak: {
        server_url: "tak.demo.pvarki.fi",
        server_port: 8089,
        protocol: "ssl",
        status: "online",
        connected_clients: 12,
      },
      mtx: {
        streams: [
          {
            name: "fighter420",
            url: "rtsp://mtx.demo.pvarki.fi/fighter420",
            viewers: 42,
            status: "live",
          },
        ],
      },
      battlelog: {
        recent_events: [
          {
            id: 1,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            callsign: "TacticalTina",
            event: "Patrol started at Grid 12345678",
            type: "movement",
          },
          {
            id: 2,
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            callsign: "fighter420",
            event: "Contact report: 3 vehicles spotted NE",
            type: "observation",
          },
          {
            id: 3,
            timestamp: new Date(Date.now() - 900000).toISOString(),
            callsign: "JanneJaeger",
            event: "Checkpoint ALPHA secured",
            type: "status",
          },
        ],
      },
    };
    return HttpResponse.json({
      data: instructionsMap[product] || {},
    });
  }),

  // MTX: Stream listing — HLS links point to rickroll for demo
  http.get("/api/v1/product/proxy/mtx/api/v1/proxy/streams", () => {
    return HttpResponse.json([
      {
        path: "/live/hls/fighter420",
        urls: {
          hls: RICKROLL_HLS,
          webrtc: "wss://demo.pvarki.fi/live/webrtc/fighter420",
          rtsps: "rtsps://demo.pvarki.fi:8322/live/hls/fighter420",
          rtmps: "rtmps://demo.pvarki.fi:1936/live/hls/fighter420",
          srt: "srt://demo.pvarki.fi:8890?streamid=read:live/hls/fighter420",
        },
      },
      {
        path: "/live/hls/drone-recon",
        urls: {
          hls: RICKROLL_HLS,
          webrtc: "wss://demo.pvarki.fi/live/webrtc/drone-recon",
          rtsps: "rtsps://demo.pvarki.fi:8322/live/hls/drone-recon",
          rtmps: "rtmps://demo.pvarki.fi:1936/live/hls/drone-recon",
          srt: "srt://demo.pvarki.fi:8890?streamid=read:live/hls/drone-recon",
        },
      },
    ]);
  }),

  // MTX: Credentials
  http.get("/api/v1/product/proxy/mtx/api/v1/proxy/credentials", () => {
    return HttpResponse.json({
      username: "Fighter01",
      password: Math.random().toString(36).slice(-12),
    });
  }),

  // TAK: Ephemeral download URL
  http.get(
    "/api/v1/product/proxy/tak/api/v1/tak-missionpackages/ephemeral/atak.zip",
    () => {
      return HttpResponse.json({
        ephemeral_url: "https://demo.pvarki.fi/demo-not-available",
      });
    },
  ),

  // TAK: Catch-all for other proxy paths
  http.get("/api/v1/product/proxy/tak/*", () => {
    return HttpResponse.json({
      demo: true,
      message: "Downloads are not available in demo mode",
    });
  }),

  // Generic catch-all for any product proxy path not explicitly handled
  http.get("/api/v1/product/proxy/:product/*", () => {
    return HttpResponse.json({
      demo: true,
      message: "This endpoint is not available in demo mode",
    });
  }),
];
