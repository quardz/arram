import type { ServerFunctionClient } from "payload";
import config from "@payload-config";
import "@payloadcms/next/css";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import React from "react";
import { importMap } from "./admin/importMap.js";
import { flags } from "@/lib/env";

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // Graceful degradation: without a DB + secret, don't mount Payload at all —
  // show a friendly notice instead of crashing. The public site is unaffected.
  if (!flags.payloadEnabled) {
    return (
      <html lang="en">
        <body
          style={{
            fontFamily: "system-ui, sans-serif",
            display: "grid",
            placeItems: "center",
            minHeight: "100vh",
            margin: 0,
            background: "#faf8f4",
            color: "#333",
          }}
        >
          <main style={{ maxWidth: 460, padding: 24, textAlign: "center" }}>
            <h1 style={{ fontSize: 20, marginBottom: 8 }}>Admin not configured</h1>
            <p style={{ fontSize: 14, lineHeight: 1.6 }}>
              Set <code>DATABASE_URI</code> and <code>PAYLOAD_SECRET</code> to enable
              the admin panel. The public website runs without them.
            </p>
          </main>
        </body>
      </html>
    );
  }

  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
