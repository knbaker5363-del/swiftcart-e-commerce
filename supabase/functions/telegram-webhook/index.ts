import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TelegramUpdate {
  message?: {
    chat: {
      id: number;
    };
    text?: string;
    from?: {
      first_name?: string;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Telegram webhook received");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch settings
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("telegram_bot_token, telegram_chat_id, telegram_bot_password")
      .maybeSingle();

    if (settingsError || !settings) {
      console.error("Error fetching settings:", settingsError);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const BOT_TOKEN = settings.telegram_bot_token;
    const STORED_PASSWORD = settings.telegram_bot_password;
    const AUTHORIZED_CHAT_ID = settings.telegram_chat_id;

    if (!BOT_TOKEN) {
      console.log("Bot token not configured");
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const update: TelegramUpdate = await req.json();
    console.log("Telegram update:", JSON.stringify(update));

    if (!update.message) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const chatId = update.message.chat.id;
    const messageText = update.message.text?.trim() || "";
    const firstName = update.message.from?.first_name || "صديق";

    // Helper function to send message
    const sendMessage = async (text: string) => {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "Markdown",
        }),
      });
    };

    // Check if this chat is already authorized
    if (AUTHORIZED_CHAT_ID && String(chatId) === String(AUTHORIZED_CHAT_ID)) {
      // Already authorized
      if (messageText === "/start") {
        await sendMessage(`مرحباً ${firstName}! 👋\n\nأنت مسجل بالفعل لاستلام إشعارات الطلبات الجديدة. ✅`);
      } else {
        await sendMessage(`أنت مسجل بالفعل! سيصلك إشعار عند وصول أي طلب جديد. 📦`);
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Not authorized - check password
    if (!STORED_PASSWORD) {
      // No password set, auto-authorize and save chat_id
      const { error: updateError } = await supabase
        .from("settings")
        .update({ telegram_chat_id: String(chatId) })
        .not("id", "is", null);

      if (updateError) {
        console.error("Error saving chat_id:", updateError);
        await sendMessage("❌ حدث خطأ في التسجيل. يرجى المحاولة لاحقاً.");
      } else {
        await sendMessage(`مرحباً ${firstName}! 👋\n\n✅ تم تسجيلك بنجاح لاستلام إشعارات الطلبات الجديدة!\n\nستصلك رسالة فورية عند كل طلب جديد. 📦`);
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Password is set - verify it
    if (messageText === "/start") {
      await sendMessage(`مرحباً ${firstName}! 👋\n\n🔐 هذا البوت محمي بكلمة سر.\n\nأرسل كلمة السر للتسجيل:`);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if the message is the password
    if (messageText === STORED_PASSWORD) {
      // Correct password - save chat_id
      const { error: updateError } = await supabase
        .from("settings")
        .update({ telegram_chat_id: String(chatId) })
        .not("id", "is", null);

      if (updateError) {
        console.error("Error saving chat_id:", updateError);
        await sendMessage("❌ حدث خطأ في التسجيل. يرجى المحاولة لاحقاً.");
      } else {
        await sendMessage(`✅ كلمة السر صحيحة!\n\nمرحباً ${firstName}! تم تسجيلك بنجاح لاستلام إشعارات الطلبات الجديدة! 🎉\n\nستصلك رسالة فورية عند كل طلب جديد. 📦`);
      }
    } else {
      // Wrong password
      await sendMessage("❌ كلمة السر غير صحيحة.\n\nحاول مرة أخرى:");
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in telegram-webhook:", error);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }
};

serve(handler);
