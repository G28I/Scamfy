import { ImageResponse } from "next/og";

export const alt = "Scamfy — Instant Scam Check & Cyber Threat Triage for India";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

/**
 * Generates the dynamic OpenGraph preview banner image for social shares and search previews.
 *
 * @returns ImageResponse containing the visual preview card layout
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#090d16",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#1e293b",
                border: "2px solid #ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ef4444",
                fontSize: "26px",
                fontWeight: 800,
              }}
            >
              !
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "32px",
                  fontWeight: 900,
                  color: "#f8fafc",
                  letterSpacing: "-0.03em",
                }}
              >
                Scamfy
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "14px",
                  color: "#94a3b8",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Cyber Defense • India
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 20px",
              borderRadius: "9999px",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              color: "#34d399",
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            <span style={{ display: "flex" }}>●</span>
            <span style={{ display: "flex" }}>Open Threat Intelligence Network</span>
          </div>
        </div>

        {/* Central Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "56px",
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
            }}
          >
            Check Suspicious Messages Before You Act
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "24px",
              color: "#94a3b8",
              lineHeight: 1.4,
            }}
          >
            Instant, anonymous cyber fraud triage for India. Analyze suspicious UPI VPAs, fake job offers, electricity disconnection threats, and digital arrest coercion.
          </div>
        </div>

        {/* Bottom Footer / Emergency Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #1e293b",
            paddingTop: "32px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              color: "#64748b",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            <span style={{ display: "flex" }}>Dual Heuristic + AI Engine</span>
            <span style={{ display: "flex" }}>•</span>
            <span style={{ display: "flex" }}>Community Verified Threat Indicators</span>
            <span style={{ display: "flex" }}>•</span>
            <span style={{ display: "flex" }}>100% Anonymous</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#ef4444",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            <span style={{ display: "flex" }}>National Cyber Helpline: 1930</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
