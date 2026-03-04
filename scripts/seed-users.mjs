import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load variables from .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            process.env[match[1]] = match[2].trim();
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
}

// Initialize Supabase with the Service Role Key to bypass RLS and use Admin API
const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

const defaultPassword = "Test@1234";

const usersToCreate = [
    { email: "admin@freshcart.com", role: "admin" },
    { email: "vendor1@freshcart.com", role: "vendor" },
    { email: "vendor2@freshcart.com", role: "vendor" },
    { email: "agent1@freshcart.com", role: "agent" },
    { email: "agent2@freshcart.com", role: "agent" },
    { email: "agent3@freshcart.com", role: "agent" },
];

async function seedUsers() {
    console.log("Starting test accounts creation...");

    for (const user of usersToCreate) {
        console.log(`\nCreating ${user.email}...`);

        let userId = null;

        // 1. Create the user in auth.users
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: defaultPassword,
            email_confirm: true,
        });

        if (authError) {
            if (authError.message.includes("already registered")) {
                console.log(`User ${user.email} already exists.`);
                // Find existing user to update their role just in case
                const { data: listUserRes } = await supabase.auth.admin.listUsers();
                if (listUserRes && listUserRes.users) {
                    const found = listUserRes.users.find(u => u.email === user.email);
                    if (found) {
                        userId = found.id;
                    }
                }
            } else {
                console.error(`Error creating ${user.email}:`, authError.message);
                continue; // skip trying to set roles if auth failed entirely
            }
        } else if (authData?.user) {
            console.log(`Auth user created: ${authData.user.id}`);
            userId = authData.user.id;
        }

        if (userId) {
            // 2. Update their role in the public.users table (trigger might have created it)
            await updatePublicRole(userId, user.role);
        }
    }

    console.log("\nFinished seeding users!");
}

async function updatePublicRole(userId, role) {
    const { error } = await supabase
        .from("users")
        .update({ role })
        .eq("id", userId);

    if (error) {
        console.error(`Failed to update role for ${userId}:`, error.message);
    } else {
        console.log(`Updated profile role to: ${role}`);
    }
}

seedUsers().catch(console.error);
