import { NextResponse } from "next/server"

import { type BillingRules, normalizeBillingRules } from "@/lib/billing-rules"
import {
  getBillingRulesFromServerStore,
  saveBillingRulesToServerStore,
} from "@/lib/billing-rules-server-store"

type SaveBillingRulesRequest = {
  rules?: Partial<BillingRules>
}

export async function GET() {
  return NextResponse.json({
    rules: getBillingRulesFromServerStore(),
  })
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as SaveBillingRulesRequest

    if (!body.rules) {
      return NextResponse.json(
        {
          message: "Billing rules payload is required.",
        },
        { status: 400 }
      )
    }

    const rules = normalizeBillingRules(body.rules)

    return NextResponse.json({
      rules: saveBillingRulesToServerStore(rules),
    })
  } catch {
    return NextResponse.json(
      {
        message: "Billing rules save failed.",
      },
      { status: 500 }
    )
  }
}
