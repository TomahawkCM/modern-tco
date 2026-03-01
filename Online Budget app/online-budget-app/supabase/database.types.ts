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
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          merchant_name: string;
          amount_minor: number;
          currency: string;
          frequency: string;
          category_id: string | null;
          next_billing_date: string | null;
          is_active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          merchant_name: string;
          amount_minor: number;
          currency?: string;
          frequency?: string;
          category_id?: string | null;
          next_billing_date?: string | null;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          merchant_name?: string;
          amount_minor?: number;
          currency?: string;
          frequency?: string;
          category_id?: string | null;
          next_billing_date?: string | null;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_subscriptions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      excluded_subscription_merchants: {
        Row: {
          id: string;
          user_id: string;
          merchant_token: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          merchant_token: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          merchant_token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "excluded_subscription_merchants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      loans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          loan_type: string;
          original_balance_minor: number;
          current_balance_minor: number;
          interest_rate: number;
          minimum_payment_minor: number;
          start_date: string | null;
          end_date: string | null;
          status: string;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          loan_type: string;
          original_balance_minor: number;
          current_balance_minor: number;
          interest_rate: number;
          minimum_payment_minor?: number;
          start_date?: string | null;
          end_date?: string | null;
          status?: string;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          loan_type?: string;
          original_balance_minor?: number;
          current_balance_minor?: number;
          interest_rate?: number;
          minimum_payment_minor?: number;
          start_date?: string | null;
          end_date?: string | null;
          status?: string;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loans_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      loan_payments: {
        Row: {
          id: string;
          user_id: string;
          loan_id: string;
          amount_minor: number;
          payment_date: string;
          principal_minor: number | null;
          interest_minor: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          loan_id: string;
          amount_minor: number;
          payment_date: string;
          principal_minor?: number | null;
          interest_minor?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          loan_id?: string;
          amount_minor?: number;
          payment_date?: string;
          principal_minor?: number | null;
          interest_minor?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loan_payments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loan_payments_loan_id_fkey";
            columns: ["loan_id"];
            isOneToOne: false;
            referencedRelation: "loans";
            referencedColumns: ["id"];
          },
        ];
      };
      investment_accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          account_type: string;
          institution: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          account_type: string;
          institution?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          account_type?: string;
          institution?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "investment_accounts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      holdings: {
        Row: {
          id: string;
          user_id: string;
          investment_account_id: string;
          symbol: string;
          name: string | null;
          shares: number;
          purchase_price_minor: number;
          purchase_date: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          investment_account_id: string;
          symbol: string;
          name?: string | null;
          shares: number;
          purchase_price_minor: number;
          purchase_date?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          investment_account_id?: string;
          symbol?: string;
          name?: string | null;
          shares?: number;
          purchase_price_minor?: number;
          purchase_date?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "holdings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "holdings_investment_account_id_fkey";
            columns: ["investment_account_id"];
            isOneToOne: false;
            referencedRelation: "investment_accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      properties: {
        Row: {
          id: string;
          user_id: string;
          address: string;
          purchase_price_minor: number | null;
          current_value_minor: number | null;
          mortgage_balance_minor: number | null;
          monthly_expenses_minor: number | null;
          purchase_date: string | null;
          currency: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          address: string;
          purchase_price_minor?: number | null;
          current_value_minor?: number | null;
          mortgage_balance_minor?: number | null;
          monthly_expenses_minor?: number | null;
          purchase_date?: string | null;
          currency?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          address?: string;
          purchase_price_minor?: number | null;
          current_value_minor?: number | null;
          mortgage_balance_minor?: number | null;
          monthly_expenses_minor?: number | null;
          purchase_date?: string | null;
          currency?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "properties_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      net_worth_snapshots: {
        Row: {
          id: string;
          user_id: string;
          snapshot_date: string;
          total_assets_minor: number;
          total_liabilities_minor: number;
          net_worth_minor: number;
          breakdown: Json | null;
          currency: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          snapshot_date: string;
          total_assets_minor: number;
          total_liabilities_minor: number;
          net_worth_minor: number;
          breakdown?: Json | null;
          currency?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          snapshot_date?: string;
          total_assets_minor?: number;
          total_liabilities_minor?: number;
          net_worth_minor?: number;
          breakdown?: Json | null;
          currency?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "net_worth_snapshots_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      future_purchases: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount_minor: number;
          current_savings_minor: number;
          monthly_savings_minor: number;
          target_date: string | null;
          priority: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount_minor: number;
          current_savings_minor?: number;
          monthly_savings_minor?: number;
          target_date?: string | null;
          priority?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_amount_minor?: number;
          current_savings_minor?: number;
          monthly_savings_minor?: number;
          target_date?: string | null;
          priority?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "future_purchases_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      retirement_plans: {
        Row: {
          id: string;
          user_id: string;
          current_age: number;
          retirement_age: number;
          current_savings_minor: number;
          monthly_contribution_minor: number;
          expected_return_percent: number;
          currency: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_age: number;
          retirement_age?: number;
          current_savings_minor?: number;
          monthly_contribution_minor?: number;
          expected_return_percent?: number;
          currency?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_age?: number;
          retirement_age?: number;
          current_savings_minor?: number;
          monthly_contribution_minor?: number;
          expected_return_percent?: number;
          currency?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "retirement_plans_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      paycheck_plans: {
        Row: {
          id: string;
          user_id: string;
          schedule_type: string;
          pay_amount_minor: number;
          next_pay_date: string;
          currency: string;
          allocations: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          schedule_type: string;
          pay_amount_minor: number;
          next_pay_date: string;
          currency?: string;
          allocations?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          schedule_type?: string;
          pay_amount_minor?: number;
          next_pay_date?: string;
          currency?: string;
          allocations?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "paycheck_plans_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      debt_scenarios: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          strategy: string;
          extra_payment_minor: number;
          config: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          strategy: string;
          extra_payment_minor?: number;
          config?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          strategy?: string;
          extra_payment_minor?: number;
          config?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "debt_scenarios_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      financial_scenarios: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          config: Json;
          results: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          config?: Json;
          results?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          config?: Json;
          results?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "financial_scenarios_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      event_budgets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          total_budget_minor: number;
          start_date: string | null;
          end_date: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          total_budget_minor: number;
          start_date?: string | null;
          end_date?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          total_budget_minor?: number;
          start_date?: string | null;
          end_date?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_budgets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      event_budget_items: {
        Row: {
          id: string;
          event_budget_id: string;
          category_name: string;
          budget_minor: number;
          spent_minor: number;
          notes: string | null;
        };
        Insert: {
          id?: string;
          event_budget_id: string;
          category_name: string;
          budget_minor: number;
          spent_minor?: number;
          notes?: string | null;
        };
        Update: {
          id?: string;
          event_budget_id?: string;
          category_name?: string;
          budget_minor?: number;
          spent_minor?: number;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "event_budget_items_event_budget_id_fkey";
            columns: ["event_budget_id"];
            isOneToOne: false;
            referencedRelation: "event_budgets";
            referencedColumns: ["id"];
          },
        ];
      };
      split_persons: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "split_persons_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      expense_splits: {
        Row: {
          id: string;
          user_id: string;
          transaction_id: string | null;
          person_id: string;
          amount_minor: number;
          is_settled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          transaction_id?: string | null;
          person_id: string;
          amount_minor: number;
          is_settled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          transaction_id?: string | null;
          person_id?: string;
          amount_minor?: number;
          is_settled?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expense_splits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expense_splits_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expense_splits_person_id_fkey";
            columns: ["person_id"];
            isOneToOne: false;
            referencedRelation: "split_persons";
            referencedColumns: ["id"];
          },
        ];
      };
      receipts: {
        Row: {
          id: string;
          user_id: string;
          transaction_id: string | null;
          storage_path: string;
          extracted_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          transaction_id?: string | null;
          storage_path: string;
          extracted_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          transaction_id?: string | null;
          storage_path?: string;
          extracted_data?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "receipts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "receipts_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
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
