export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          primary_currency: string;
          locale: string;
          timezone: string;
          language: string;
          ai_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          primary_currency?: string;
          locale?: string;
          timezone?: string;
          language?: string;
          ai_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          primary_currency?: string;
          locale?: string;
          timezone?: string;
          language?: string;
          ai_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status: "trialing" | "active" | "past_due" | "canceled";
          tier: "premium";
          trial_end: string | null;
          current_period_end: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: "trialing" | "active" | "past_due" | "canceled";
          tier?: "premium";
          trial_end?: string | null;
          current_period_end?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: "trialing" | "active" | "past_due" | "canceled";
          tier?: "premium";
          trial_end?: string | null;
          current_period_end?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      institutions: {
        Row: {
          id: string;
          provider_id: string | null;
          name: string;
          country_code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id?: string | null;
          name: string;
          country_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string | null;
          name?: string;
          country_code?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          institution_id: string | null;
          provider_account_id: string | null;
          name: string;
          type: "checking" | "savings" | "credit" | "investment" | "loan" | "other";
          currency: string;
          balance_minor: number;
          is_manual: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          institution_id?: string | null;
          provider_account_id?: string | null;
          name: string;
          type?: "checking" | "savings" | "credit" | "investment" | "loan" | "other";
          currency?: string;
          balance_minor?: number;
          is_manual?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          institution_id?: string | null;
          provider_account_id?: string | null;
          name?: string;
          type?: "checking" | "savings" | "credit" | "investment" | "loan" | "other";
          currency?: string;
          balance_minor?: number;
          is_manual?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_institution_id_fkey";
            columns: ["institution_id"];
            isOneToOne: false;
            referencedRelation: "institutions";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          provider_transaction_id: string | null;
          amount_minor: number;
          currency: string;
          description: string | null;
          merchant_name: string | null;
          category_id: string | null;
          transaction_date: string;
          posted_at: string | null;
          is_pending: boolean;
          confidence_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          provider_transaction_id?: string | null;
          amount_minor: number;
          currency: string;
          description?: string | null;
          merchant_name?: string | null;
          category_id?: string | null;
          transaction_date: string;
          posted_at?: string | null;
          is_pending?: boolean;
          confidence_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          provider_transaction_id?: string | null;
          amount_minor?: number;
          currency?: string;
          description?: string | null;
          merchant_name?: string | null;
          category_id?: string | null;
          transaction_date?: string;
          posted_at?: string | null;
          is_pending?: boolean;
          confidence_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          key: string;
          parent_id: string | null;
          is_system: boolean;
          type: "income" | "expense" | "transfer";
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          parent_id?: string | null;
          is_system?: boolean;
          type?: "income" | "expense" | "transfer";
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          parent_id?: string | null;
          is_system?: boolean;
          type?: "income" | "expense" | "transfer";
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      category_translations: {
        Row: {
          id: string;
          category_id: string;
          locale: string;
          display_name: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          locale: string;
          display_name: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          locale?: string;
          display_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "category_translations_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      user_category_overrides: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          custom_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          custom_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          custom_name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_category_overrides_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_category_overrides_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      merchant_mappings: {
        Row: {
          id: string;
          user_id: string;
          merchant_token: string;
          display_name: string;
          category_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          merchant_token: string;
          display_name: string;
          category_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          merchant_token?: string;
          display_name?: string;
          category_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "merchant_mappings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "merchant_mappings_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount_minor: number;
          currency: string;
          period: "monthly";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          amount_minor: number;
          currency?: string;
          period?: "monthly";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          amount_minor?: number;
          currency?: string;
          period?: "monthly";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budgets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "budgets_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      import_metadata: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          bank_slug: string | null;
          row_count: number;
          imported_count: number;
          skipped_count: number;
          imported_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          filename: string;
          bank_slug?: string | null;
          row_count: number;
          imported_count: number;
          skipped_count?: number;
          imported_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          filename?: string;
          bank_slug?: string | null;
          row_count?: number;
          imported_count?: number;
          skipped_count?: number;
          imported_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "import_metadata_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      imported_fitids: {
        Row: {
          id: string;
          user_id: string;
          fitid: string;
          account_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          fitid: string;
          account_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          fitid?: string;
          account_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "imported_fitids_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "imported_fitids_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      category_type: "income" | "expense" | "transfer";
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
