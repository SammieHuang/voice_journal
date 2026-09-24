/** @format */

import { createClient } from "jsr:@supabase/supabase-js@2";

const ENTITLEMENT_ID = "my_private_mind_pro";

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== Deno.env.get("REVENUECAT_WEBHOOK_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const appUserId = body?.event?.app_user_id;

  if (!appUserId) {
    return new Response("Missing app_user_id", { status: 400 });
  }

  const rcResponse = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${appUserId}`,
    {
      headers: {
        Authorization: `Bearer ${Deno.env.get("REVENUECAT_SECRET_KEY")}`,
      },
    },
  );

  if (!rcResponse.ok) {
    return new Response("Failed to fetch subscriber from RevenueCat", {
      status: 502,
    });
  }

  const rcData = await rcResponse.json();
  const entitlement = rcData?.subscriber?.entitlements?.[ENTITLEMENT_ID];

  const isActive = entitlement
    ? !entitlement.expires_date ||
      new Date(entitlement.expires_date) > new Date()
    : false;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await supabase
    .from("profiles")
    .upsert(
      { id: appUserId, tier: isActive ? "premium" : "free" },
      { onConflict: "id" },
    );

  if (error) {
    console.log(error);
    return new Response("Failed to update profile", { status: 500 });
  }

  return new Response("ok", { status: 200 });
});
