import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderNotification {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    selectedOptions?: {
      size?: string;
      color?: string;
    };
  }>;
  deliveryArea: string;
  deliveryCost: number;
  totalAmount: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Telegram notification function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error("Missing Telegram credentials");
      return new Response(
        JSON.stringify({ error: "Telegram credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const order: OrderNotification = await req.json();
    console.log("Order received:", order.orderId);

    // Format the message for Telegram
    let message = `🛍️ *طلب جديد!*\n\n`;
    message += `📋 رقم الطلب: \`${order.orderId.substring(0, 8)}\`\n`;
    message += `━━━━━━━━━━━━━━\n`;
    message += `👤 *بيانات العميل:*\n`;
    message += `• الاسم: ${order.customerName}\n`;
    message += `• الهاتف: ${order.customerPhone}\n`;
    message += `• المدينة: ${order.customerCity}\n`;
    message += `• العنوان: ${order.customerAddress}\n\n`;
    
    message += `📦 *المنتجات:*\n`;
    order.items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}`;
      if (item.selectedOptions?.size) message += ` | مقاس: ${item.selectedOptions.size}`;
      if (item.selectedOptions?.color) message += ` | لون: ${item.selectedOptions.color}`;
      message += `\n   الكمية: ${item.quantity} × ${item.price.toFixed(2)} ₪\n`;
    });
    
    message += `\n━━━━━━━━━━━━━━\n`;
    message += `🚚 التوصيل (${order.deliveryArea}): ${order.deliveryCost.toFixed(2)} ₪\n`;
    message += `💰 *المجموع: ${order.totalAmount.toFixed(2)} ₪*`;

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const telegramResult = await telegramResponse.json();
    console.log("Telegram API response:", telegramResult);

    if (!telegramResult.ok) {
      console.error("Telegram API error:", telegramResult);
      return new Response(
        JSON.stringify({ error: "Failed to send Telegram message", details: telegramResult }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-telegram-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
