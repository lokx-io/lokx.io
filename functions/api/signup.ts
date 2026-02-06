interface Env {
  SIGNUPS: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers,
      });
    }

    const key = email.toLowerCase().trim();
    const existing = await env.SIGNUPS.get(key);
    if (existing) {
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        headers,
      });
    }

    await env.SIGNUPS.put(
      key,
      JSON.stringify({
        email: key,
        signed_up: new Date().toISOString(),
        source: request.headers.get("Referer") || "direct",
      })
    );

    return new Response(JSON.stringify({ ok: true }), { headers });
  } catch {
    return new Response(JSON.stringify({ error: "Bad request" }), {
      status: 400,
      headers,
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
