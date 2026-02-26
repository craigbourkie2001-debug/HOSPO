import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import WorkerProfileBuilder from "../components/profile/WorkerProfileBuilder";
import { createPageUrl } from "@/utils";

export default function ProfileBuilder() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--cream)" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-2" style={{ borderColor: "var(--sand)", borderTopColor: "var(--terracotta)" }} />
      </div>
    );
  }

  return (
    <WorkerProfileBuilder
      user={user}
      onSave={() => { window.location.href = createPageUrl("Profile"); }}
      onClose={() => { window.location.href = createPageUrl("Profile"); }}
    />
  );
}