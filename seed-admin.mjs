import { createClient } from "@supabase/supabase-js";

const url = process.env.SB_URL;
const key = process.env.SB_SERVICE;
const email = process.env.SB_EMAIL ?? "admin@lumina.test";
const password = process.env.SB_PASS ?? "lumina123";

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Var olan kullanıcıyı temizle (idempotent çalışsın)
const { data: list } = await admin.auth.admin.listUsers();
const existing = list?.users?.find((u) => u.email === email);
if (existing) {
  await admin.auth.admin.deleteUser(existing.id);
  console.log("Eski test kullanıcısı silindi.");
}

const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: "Lumina Admin" },
});
if (error) {
  console.error("createUser HATA:", error.message);
  process.exit(1);
}
const uid = data.user.id;
console.log("Kullanıcı oluşturuldu:", email, uid);

// Trigger 3 kredi verir; rahat test için +50 daha yükle
const { data: bal, error: gErr } = await admin.rpc("grant_credits", {
  p_user_id: uid,
  p_amount: 50,
  p_reason: "admin_seed",
});
if (gErr) console.error("grant_credits HATA:", gErr.message);
else console.log("Toplam kredi bakiyesi:", bal);
