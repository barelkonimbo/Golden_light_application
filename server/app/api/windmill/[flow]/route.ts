import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FLOW_PATHS = {
  lookups: "u/barelh/lookups_goldenlight",
  attributes: "u/barelh/attributes_goldenlight_app",
  listProducts: "u/barelh/list_products_goldenlight_app",
  upsertProduct: "u/barelh/upsert_product_goldenlight",
  deleteProduct: "u/barelh/delete_product_goldenlight_app",
  uploadImage: "u/barelh/upload_image_goldenlight_app",
} as const;

type FlowName = keyof typeof FLOW_PATHS;

interface RouteContext {
  params: Promise<{
    flow: string;
  }>;
}

function isFlowName(value: string): value is FlowName {
  return Object.prototype.hasOwnProperty.call(FLOW_PATHS, value);
}

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normaliseBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * The SPA and this proxy always live on different origins now (S3/CloudFront
 * vs. wherever this is deployed), so every request needs CORS headers.
 * Requests never carry credentials (no cookies, no Authorization header from
 * the browser), so allowing "*" when CORS_ALLOWED_ORIGIN is unset is safe.
 */
function corsHeaders(origin: string | null): HeadersInit {
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGIN;

  if (!allowedOrigins || allowedOrigins === "*") {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
  }

  const allowList = allowedOrigins.split(",").map((value) => value.trim());
  const allowOrigin =
    origin && allowList.includes(origin) ? origin : allowList[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

async function parseRequestBody(request: NextRequest): Promise<unknown> {
  const contentType = request.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return {};
  }

  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function parseWindmillResponse(
  response: Response
): Promise<{
  text: string;
  json: unknown | null;
}> {
  const text = await response.text();

  if (!text) {
    return {
      text: "",
      json: null,
    };
  }

  try {
    return {
      text,
      json: JSON.parse(text),
    };
  } catch {
    return {
      text,
      json: null,
    };
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { flow } = await context.params;
  const headers = corsHeaders(request.headers.get("origin"));

  if (!isFlowName(flow)) {
    return NextResponse.json(
      {
        error: `Unknown flow "${flow}".`,
      },
      {
        status: 404,
        headers,
      }
    );
  }

  let windmillBaseUrl: string;
  let windmillWorkspace: string;
  let windmillToken: string;

  try {
    windmillBaseUrl = normaliseBaseUrl(
      getRequiredEnvironmentVariable("WINDMILL_BASE_URL")
    );

    windmillWorkspace = getRequiredEnvironmentVariable(
      "WINDMILL_WORKSPACE"
    );

    windmillToken = getRequiredEnvironmentVariable("WINDMILL_TOKEN");
  } catch (error) {
    console.error("Windmill configuration error:", error);

    return NextResponse.json(
      {
        error: "The Windmill connection is not configured correctly.",
      },
      {
        status: 500,
        headers,
      }
    );
  }

  const payload = await parseRequestBody(request);
  const flowPath = FLOW_PATHS[flow];

  const windmillUrl =
    `${windmillBaseUrl}/api/w/${encodeURIComponent(windmillWorkspace)}` +
    `/jobs/run_wait_result/f/${flowPath}`;

  try {
    const windmillResponse = await fetch(windmillUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${windmillToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload ?? {}),
      cache: "no-store",
    });

    const parsedResponse = await parseWindmillResponse(windmillResponse);

    if (!windmillResponse.ok) {
      console.error("Windmill flow request failed", {
        flow,
        flowPath,
        status: windmillResponse.status,
        response: parsedResponse.text,
      });

      return NextResponse.json(
        {
          error: `Windmill flow "${flow}" failed.`,
          upstreamStatus: windmillResponse.status,
          details: parsedResponse.json ?? parsedResponse.text,
        },
        {
          status: windmillResponse.status === 401 ? 502 : 502,
          headers,
        }
      );
    }

    if (!parsedResponse.text) {
      return NextResponse.json(null, { headers });
    }

    if (parsedResponse.json === null) {
      console.error("Windmill returned non-JSON content", {
        flow,
        response: parsedResponse.text,
      });

      return NextResponse.json(
        {
          error: `Windmill flow "${flow}" returned invalid JSON.`,
          details: parsedResponse.text.slice(0, 1000),
        },
        {
          status: 502,
          headers,
        }
      );
    }

    return NextResponse.json(parsedResponse.json, { headers });
  } catch (error) {
    console.error("Unable to contact Windmill", {
      flow,
      error,
    });

    return NextResponse.json(
      {
        error: `Unable to execute Windmill flow "${flow}".`,
        details:
          error instanceof Error
            ? error.message
            : "Unknown Windmill connection error.",
      },
      {
        status: 502,
        headers,
      }
    );
  }
}