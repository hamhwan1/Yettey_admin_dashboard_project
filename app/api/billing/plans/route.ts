import { NextResponse } from "next/server"

import { type BillingPlan } from "@/lib/billing-plan-catalog"
import {
  listBillingPlansFromServerStore,
  saveBillingPlanToServerStore,
} from "@/lib/billing-plan-server-store"
import {
  type BillingPlanSaveMode,
  validateBillingPlan,
} from "@/lib/billing-plan-validation"

type SavePlanRequest = {
  mode?: BillingPlanSaveMode
  plan?: BillingPlan
}

export async function GET() {
  return NextResponse.json({
    plans: listBillingPlansFromServerStore(),
  })
}

export async function POST(request: Request) {
  return savePlan(request)
}

export async function PUT(request: Request) {
  return savePlan(request)
}

async function savePlan(request: Request) {
  try {
    const body = (await request.json()) as SavePlanRequest
    const validation = validateBillingPlan(body.plan)

    if (!validation.ok) {
      return NextResponse.json(
        {
          errors: validation.errors,
          message: "Validation failed.",
        },
        { status: 400 }
      )
    }

    const savedPlan = saveBillingPlanToServerStore(body.plan as BillingPlan)

    return NextResponse.json({
      mode: body.mode ?? "update",
      plan: savedPlan,
    })
  } catch {
    return NextResponse.json(
      {
        message: "Plan save failed.",
      },
      { status: 500 }
    )
  }
}
