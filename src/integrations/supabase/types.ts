export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          bg_color: string | null
          created_at: string
          icon_name: string | null
          id: string
          image_url: string | null
          name: string
          sort_order: number | null
        }
        Insert: {
          bg_color?: string | null
          created_at?: string
          icon_name?: string | null
          id?: string
          image_url?: string | null
          name: string
          sort_order?: number | null
        }
        Update: {
          bg_color?: string | null
          created_at?: string
          icon_name?: string | null
          id?: string
          image_url?: string | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_offers: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          minimum_amount: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          minimum_amount?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          minimum_amount?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      gift_products: {
        Row: {
          created_at: string
          gift_offer_id: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          gift_offer_id: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string
          gift_offer_id?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_products_gift_offer_id_fkey"
            columns: ["gift_offer_id"]
            isOneToOne: false
            referencedRelation: "gift_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_at_purchase: number
          product_id: string | null
          quantity: number
          selected_options: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price_at_purchase: number
          product_id?: string | null
          quantity: number
          selected_options?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_at_purchase?: number
          product_id?: string | null
          quantity?: number
          selected_options?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_address: string
          customer_name: string
          customer_phone: string
          id: string
          status: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          customer_address: string
          customer_name: string
          customer_phone: string
          id?: string
          status?: string
          total_amount: number
        }
        Update: {
          created_at?: string
          customer_address?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          status?: string
          total_amount?: number
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          page_path: string
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_path: string
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
          user_agent?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          product_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          product_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_views: {
        Row: {
          created_at: string
          id: string
          product_id: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          additional_images: Json | null
          brand_id: string | null
          category_id: string | null
          created_at: string
          description: string | null
          discount_end_date: string | null
          discount_percentage: number | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          options: Json | null
          price: number
        }
        Insert: {
          additional_images?: Json | null
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_end_date?: string | null
          discount_percentage?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          options?: Json | null
          price: number
        }
        Update: {
          additional_images?: Json | null
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_end_date?: string | null
          discount_percentage?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          options?: Json | null
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          discount_percentage: number
          expires_at: string
          id: string
          is_active: boolean
        }
        Insert: {
          code: string
          created_at?: string
          discount_percentage: number
          expires_at: string
          id?: string
          is_active?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          discount_percentage?: number
          expires_at?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      settings: {
        Row: {
          accent_color: string | null
          animation_effect: string | null
          background_image_url: string | null
          background_pattern: string | null
          background_style: string | null
          banner_images: Json | null
          cart_button_style: string | null
          cart_button_text: string | null
          cart_icon_style: string | null
          category_display_style: string | null
          created_at: string
          delivery_inside: number | null
          delivery_jerusalem: number | null
          delivery_west_bank: number | null
          favicon_url: string | null
          font_family: string | null
          header_layout: string | null
          header_logo_position: string | null
          hide_header_store_info: boolean | null
          id: string
          location: string | null
          logo_shape: string | null
          logo_url: string | null
          show_brands_button: boolean | null
          show_image_border: boolean | null
          site_style: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_media_position: string | null
          social_snapchat: string | null
          social_tiktok: string | null
          social_whatsapp: string | null
          store_name: string
          store_name_black: boolean | null
          store_phone: string | null
          telegram_bot_password: string | null
          telegram_bot_token: string | null
          telegram_chat_id: string | null
          text_style: string | null
          theme: string
          updated_at: string
          whatsapp_country_code: string | null
          whatsapp_number: string | null
        }
        Insert: {
          accent_color?: string | null
          animation_effect?: string | null
          background_image_url?: string | null
          background_pattern?: string | null
          background_style?: string | null
          banner_images?: Json | null
          cart_button_style?: string | null
          cart_button_text?: string | null
          cart_icon_style?: string | null
          category_display_style?: string | null
          created_at?: string
          delivery_inside?: number | null
          delivery_jerusalem?: number | null
          delivery_west_bank?: number | null
          favicon_url?: string | null
          font_family?: string | null
          header_layout?: string | null
          header_logo_position?: string | null
          hide_header_store_info?: boolean | null
          id?: string
          location?: string | null
          logo_shape?: string | null
          logo_url?: string | null
          show_brands_button?: boolean | null
          show_image_border?: boolean | null
          site_style?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_media_position?: string | null
          social_snapchat?: string | null
          social_tiktok?: string | null
          social_whatsapp?: string | null
          store_name?: string
          store_name_black?: boolean | null
          store_phone?: string | null
          telegram_bot_password?: string | null
          telegram_bot_token?: string | null
          telegram_chat_id?: string | null
          text_style?: string | null
          theme?: string
          updated_at?: string
          whatsapp_country_code?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          accent_color?: string | null
          animation_effect?: string | null
          background_image_url?: string | null
          background_pattern?: string | null
          background_style?: string | null
          banner_images?: Json | null
          cart_button_style?: string | null
          cart_button_text?: string | null
          cart_icon_style?: string | null
          category_display_style?: string | null
          created_at?: string
          delivery_inside?: number | null
          delivery_jerusalem?: number | null
          delivery_west_bank?: number | null
          favicon_url?: string | null
          font_family?: string | null
          header_layout?: string | null
          header_logo_position?: string | null
          hide_header_store_info?: boolean | null
          id?: string
          location?: string | null
          logo_shape?: string | null
          logo_url?: string | null
          show_brands_button?: boolean | null
          show_image_border?: boolean | null
          site_style?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_media_position?: string | null
          social_snapchat?: string | null
          social_tiktok?: string | null
          social_whatsapp?: string | null
          store_name?: string
          store_name_black?: boolean | null
          store_phone?: string | null
          telegram_bot_password?: string | null
          telegram_bot_token?: string | null
          telegram_chat_id?: string | null
          text_style?: string | null
          theme?: string
          updated_at?: string
          whatsapp_country_code?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
