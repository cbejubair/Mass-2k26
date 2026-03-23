import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ALLOWED_STALL_TYPES = new Set(["food", "product"]);

function parseBoolean(value: unknown): boolean {
  return value === true || value === "true";
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^\+?[0-9\s-]{8,15}$/.test(phone);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const applicantName = normalizeText(body.applicantName);
    const phoneNumber = normalizeText(body.phoneNumber);
    const email = normalizeText(body.email).toLowerCase();
    const stallType = normalizeText(body.stallType).toLowerCase();
    const stallBrandName = normalizeText(body.stallBrandName);
    const itemsToSell = normalizeText(body.itemsToSell);
    const expectedSpace = normalizeText(body.expectedSpace);
    const previousExperience = normalizeText(body.previousExperience);
    const specialRequirements = normalizeText(body.specialRequirements);

    const rawMemberCount = Number(body.memberCount);
    const memberCount = Number.isFinite(rawMemberCount)
      ? Math.trunc(rawMemberCount)
      : NaN;

    const cookingOnSite = parseBoolean(body.cookingOnSite);
    const powerRequired = parseBoolean(body.powerRequired);
    const acceptedTerms = parseBoolean(body.acceptedTerms);

    if (
      !applicantName ||
      !phoneNumber ||
      !email ||
      !stallType ||
      !stallBrandName ||
      !itemsToSell ||
      !expectedSpace
    ) {
      return NextResponse.json(
        { error: "Please fill all required fields." },
        { status: 400 },
      );
    }

    if (!ALLOWED_STALL_TYPES.has(stallType)) {
      return NextResponse.json(
        { error: "Invalid stall type selected." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    if (!isValidPhone(phoneNumber)) {
      return NextResponse.json(
        { error: "Please provide a valid phone number." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(memberCount) || memberCount <= 0) {
      return NextResponse.json(
        { error: "Member count must be a valid positive number." },
        { status: 400 },
      );
    }

    if (!acceptedTerms) {
      return NextResponse.json(
        { error: "You must accept the stall terms before submitting." },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin.from("stall_applications").insert({
      applicant_name: applicantName,
      phone_number: phoneNumber,
      email,
      stall_type: stallType,
      stall_brand_name: stallBrandName,
      items_to_sell: itemsToSell,
      member_count: memberCount,
      cooking_on_site: cookingOnSite,
      power_required: powerRequired,
      expected_space: expectedSpace,
      previous_experience: previousExperience || null,
      special_requirements: specialRequirements || null,
      accepted_terms: true,
    });

    if (error) {
      console.error("Stall application insert error:", error);
      return NextResponse.json(
        { error: "Failed to submit stall application." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
