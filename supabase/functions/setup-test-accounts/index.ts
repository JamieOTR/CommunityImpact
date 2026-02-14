import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TestAccount {
  email: string;
  password: string;
  name: string;
  role: string;
  community?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Step 1: Create Communities A and B
    const { data: communityA, error: commAError } = await supabaseAdmin
      .from("communities")
      .insert({
        name: "Community A - Test",
        description: "Test community for demo purposes (Community A)",
        status: "active",
        privacy_level: "public",
      })
      .select()
      .single();

    if (commAError) throw new Error(`Failed to create Community A: ${commAError.message}`);

    const { data: communityB, error: commBError } = await supabaseAdmin
      .from("communities")
      .insert({
        name: "Community B - Test",
        description: "Test community for demo purposes (Community B)",
        status: "active",
        privacy_level: "public",
      })
      .select()
      .single();

    if (commBError) throw new Error(`Failed to create Community B: ${commBError.message}`);

    // Step 2: Define test accounts
    const testAccounts: TestAccount[] = [
      {
        email: "superadmin@test.com",
        password: "SuperAdmin2024!",
        name: "Super Admin",
        role: "super_admin",
      },
      {
        email: "adminA@test.com",
        password: "AdminA2024!",
        name: "Admin Community A",
        role: "community_admin",
        community: communityA.community_id,
      },
      {
        email: "adminB@test.com",
        password: "AdminB2024!",
        name: "Admin Community B",
        role: "community_admin",
        community: communityB.community_id,
      },
      {
        email: "memberA@test.com",
        password: "MemberA2024!",
        name: "Member Community A",
        role: "member",
        community: communityA.community_id,
      },
    ];

    // Step 3: Create auth users and user records
    const createdAccounts = [];

    for (const account of testAccounts) {
      // Create auth user
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          name: account.name,
        },
      });

      if (authError) {
        console.error(`Failed to create auth user for ${account.email}:`, authError);
        continue;
      }

      // Create user record
      const { data: user, error: userError } = await supabaseAdmin
        .from("users")
        .insert({
          auth_user_id: authUser.user.id,
          email: account.email,
          name: account.name,
          role: account.role,
          community_id: account.community || null,
          is_admin: account.role === "super_admin" || account.role === "community_admin",
          account_status: "active",
          token_balance: 100,
          email_verified_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (userError) {
        console.error(`Failed to create user record for ${account.email}:`, userError);
        continue;
      }

      // Update community admin_id if this is a community admin
      if (account.role === "community_admin" && account.community) {
        await supabaseAdmin
          .from("communities")
          .update({ admin_id: user.user_id })
          .eq("community_id", account.community);
      }

      createdAccounts.push({
        email: account.email,
        password: account.password,
        name: account.name,
        role: account.role,
        user_id: user.user_id,
        auth_user_id: authUser.user.id,
        community: account.community
          ? account.community === communityA.community_id
            ? "Community A"
            : "Community B"
          : "N/A",
      });
    }

    const response = {
      success: true,
      message: "Test accounts created successfully",
      communities: {
        communityA: {
          id: communityA.community_id,
          name: communityA.name,
          referral_code: communityA.referral_code,
        },
        communityB: {
          id: communityB.community_id,
          name: communityB.name,
          referral_code: communityB.referral_code,
        },
      },
      accounts: createdAccounts,
    };

    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating test accounts:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
