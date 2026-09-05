/* =========================================================
   DODGE ARENA
   ========================================================= */


/* ================= SUPABASE ================= */

const SUPABASE_URL =
    "https://yjuwplccnklrznrgdfgx.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_xRHst0TbOBTYvQy4SeauSQ_LUex_5IC";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

