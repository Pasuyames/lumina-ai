/**
 * Supabase veritabanı tipleri (el ile, şema ile senkron tutulur).
 * supabase/schema.sql ile aynı yapıyı yansıtır.
 * İleride `supabase gen types typescript` ile otomatik üretilebilir.
 */

export type GenerationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type PurchaseStatus = "pending" | "paid" | "failed" | "refunded";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      credits: {
        Row: {
          user_id: string;
          balance: number;
          total_earned: number;
          total_spent: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          balance?: number;
          total_earned?: number;
          total_spent?: number;
        };
        Update: Partial<Database["public"]["Tables"]["credits"]["Insert"]>;
        Relationships: [];
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number; // pozitif = yükleme, negatif = harcama
          reason: string;
          generation_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          amount: number;
          reason: string;
          generation_id?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["credit_transactions"]["Insert"]
        >;
        Relationships: [];
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          status: GenerationStatus;
          source_image_path: string | null;
          source_image_url: string | null;
          category: string | null;
          concept_title: string | null;
          prompt: string | null;
          template_id: string | null;
          result_image_path: string | null;
          result_image_url: string | null;
          model: string | null;
          credits_spent: number;
          error: string | null;
          created_at: string;
          completed_at: string | null;
          /** Satış Seti (C10): aynı üretimden doğan 4 karenin ortak kimliği; tekil üretimlerde null. */
          set_id: string | null;
        };
        Insert: {
          user_id: string;
          status?: GenerationStatus;
          source_image_path?: string | null;
          source_image_url?: string | null;
          category?: string | null;
          concept_title?: string | null;
          prompt?: string | null;
          template_id?: string | null;
          result_image_path?: string | null;
          result_image_url?: string | null;
          model?: string | null;
          credits_spent?: number;
          error?: string | null;
          completed_at?: string | null;
          set_id?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["generations"]["Insert"]
        >;
        Relationships: [];
      };
      packages: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          credits: number;
          price_cents: number;
          currency: string;
          is_active: boolean;
          is_popular: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          credits: number;
          price_cents: number;
          currency?: string;
          is_active?: boolean;
          is_popular?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["packages"]["Insert"]>;
        Relationships: [];
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          package_id: string | null;
          credits: number;
          amount_cents: number;
          currency: string;
          status: PurchaseStatus;
          provider: string | null;
          provider_ref: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          package_id?: string | null;
          credits: number;
          amount_cents: number;
          currency?: string;
          status?: PurchaseStatus;
          provider?: string | null;
          provider_ref?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["purchases"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      spend_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_reason: string;
          p_generation_id: string | null;
        };
        Returns: number; // kalan bakiye
      };
      grant_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_reason: string;
        };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Kısayol tipler
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Credits = Database["public"]["Tables"]["credits"]["Row"];
export type Generation = Database["public"]["Tables"]["generations"]["Row"];
export type Package = Database["public"]["Tables"]["packages"]["Row"];
export type Purchase = Database["public"]["Tables"]["purchases"]["Row"];
export type CreditTransaction =
  Database["public"]["Tables"]["credit_transactions"]["Row"];
