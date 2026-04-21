// 유저 프로필 / 선호 / 알러지 / 동의 / 알람 관련 Supabase 호출.
// RLS가 auth.uid() = user_id를 강제하므로 명시적 user_id 필요 없음.
import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

// DB 스키마 enums. gen-types 전까지 inline.
export type PreferKind =
  | "korean"
  | "western"
  | "chinese"
  | "japanese"
  | "other";
export type ExerciseKind = "cutting" | "bulking" | "maintenance";

export async function fetchProfile() {
  const sb = createSupabaseBrowserClient();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) throw new Error("unauthorized");

  const [profile, allergies, prefers, agreement] = await Promise.all([
    sb.from("profiles").select("*").eq("id", user.user.id).single(),
    sb
      .from("user_allergy")
      .select("allergy_id, allergy_min(allergy)")
      .eq("user_id", user.user.id),
    sb.from("prefer").select("prefer").eq("user_id", user.user.id),
    sb
      .from("agreement_consent")
      .select("*")
      .eq("user_id", user.user.id)
      .maybeSingle(),
  ]);

  if (profile.error) throw profile.error;

  return {
    profile: profile.data,
    allergies: allergies.data ?? [],
    prefers: (prefers.data ?? []).map((r) => r.prefer),
    agreement: agreement.data ?? null,
  };
}

export async function updateProfile(input: {
  nickname?: string;
  phone_num?: string;
  exercise?: ExerciseKind | null;
}) {
  const sb = createSupabaseBrowserClient();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) throw new Error("unauthorized");

  const { data, error } = await sb
    .from("profiles")
    .update(input)
    .eq("id", user.user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function setPreferences(prefers: PreferKind[]) {
  const sb = createSupabaseBrowserClient();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) throw new Error("unauthorized");
  const userId = user.user.id;

  await sb.from("prefer").delete().eq("user_id", userId);
  if (prefers.length === 0) return [];
  const { data, error } = await sb
    .from("prefer")
    .insert(prefers.map((p) => ({ user_id: userId, prefer: p })))
    .select();
  if (error) throw error;
  return data;
}

export async function setAllergies(allergyIds: number[]) {
  const sb = createSupabaseBrowserClient();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) throw new Error("unauthorized");
  const userId = user.user.id;

  await sb.from("user_allergy").delete().eq("user_id", userId);
  if (allergyIds.length === 0) return [];
  const { data, error } = await sb
    .from("user_allergy")
    .insert(allergyIds.map((id) => ({ user_id: userId, allergy_id: id })))
    .select();
  if (error) throw error;
  return data;
}

export async function submitInquiry(title: string, content: string) {
  const sb = createSupabaseBrowserClient();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) throw new Error("unauthorized");
  const { data, error } = await sb
    .from("inquiry")
    .insert({ user_id: user.user.id, title, content })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function saveAgreement(input: {
  terms_of_service: boolean;
  privacy_policy: boolean;
  location_service?: boolean;
  is_over14?: boolean;
  marketing_consent?: boolean;
}) {
  const sb = createSupabaseBrowserClient();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) throw new Error("unauthorized");
  const { data, error } = await sb
    .from("agreement_consent")
    .upsert({ user_id: user.user.id, ...input }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}
