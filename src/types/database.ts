export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      categories: {
        Row: {
          color: string;
          created_at: string;
          household_id: string;
          icon: string;
          id: string;
          is_default: boolean;
          kind: string;
          name: string;
          sort_order: number;
        };
        Insert: {
          color?: string;
          created_at?: string;
          household_id: string;
          icon?: string;
          id?: string;
          is_default?: boolean;
          kind: string;
          name: string;
          sort_order?: number;
        };
        Update: {
          color?: string;
          created_at?: string;
          household_id?: string;
          icon?: string;
          id?: string;
          is_default?: boolean;
          kind?: string;
          name?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "categories_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          }
        ];
      };
      household_members: {
        Row: {
          display_name: string;
          household_id: string;
          id: string;
          joined_at: string;
          role: string;
          user_id: string;
          avatar_url: string | null;
        };
        Insert: {
          display_name: string;
          household_id: string;
          id?: string;
          joined_at?: string;
          role?: string;
          user_id: string;
          avatar_url?: string | null;
        };
        Update: {
          display_name?: string;
          household_id?: string;
          id?: string;
          joined_at?: string;
          role?: string;
          user_id?: string;
          avatar_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          }
        ];
      };
      households: {
        Row: { created_at: string; id: string; invite_code: string; name: string };
        Insert: { created_at?: string; id?: string; invite_code?: string; name: string };
        Update: { created_at?: string; id?: string; invite_code?: string; name?: string };
        Relationships: [];
      };
      monthly_goals: {
        Row: {
          category_id: string | null;
          created_at: string;
          household_id: string;
          id: string;
          limit_cents: number;
          month: string;
          updated_at: string;
          goal_kind: string;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string;
          household_id: string;
          id?: string;
          limit_cents: number;
          month: string;
          updated_at?: string;
          goal_kind?: string;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          household_id?: string;
          id?: string;
          limit_cents?: number;
          month?: string;
          updated_at?: string;
          goal_kind?: string;
        };
        Relationships: [
          {
            foreignKeyName: "monthly_goals_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "monthly_goals_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          }
        ];
      };
      transactions: {
        Row: {
          amount_cents: number;
          category_id: string | null;
          created_at: string;
          created_by: string;
          created_via: string;
          description: string;
          household_id: string;
          id: string;
          installment_group: string | null;
          installment_index: number | null;
          installment_total: number | null;
          is_recurring: boolean;
          kind: string;
          occurred_on: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          amount_cents: number;
          category_id?: string | null;
          created_at?: string;
          created_by: string;
          created_via?: string;
          description: string;
          household_id: string;
          id?: string;
          installment_group?: string | null;
          installment_index?: number | null;
          installment_total?: number | null;
          is_recurring?: boolean;
          kind: string;
          occurred_on: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          category_id?: string | null;
          created_at?: string;
          created_by?: string;
          created_via?: string;
          description?: string;
          household_id?: string;
          id?: string;
          installment_group?: string | null;
          installment_index?: number | null;
          installment_total?: number | null;
          is_recurring?: boolean;
          kind?: string;
          occurred_on?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "household_members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          }
        ];
      };
      dreams: {
        Row: {
          id: string;
          household_id: string;
          created_by: string | null;
          title: string;
          description: string;
          image_url: string | null;
          target_cents: number;
          current_cents: number;
          deadline: string;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          created_by?: string | null;
          title: string;
          description?: string;
          image_url?: string | null;
          target_cents: number;
          current_cents?: number;
          deadline: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          created_by?: string | null;
          title?: string;
          description?: string;
          image_url?: string | null;
          target_cents?: number;
          current_cents?: number;
          deadline?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dreams_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          }
        ];
      };
      dream_updates: {
        Row: {
          id: string;
          dream_id: string;
          household_id: string;
          amount_cents: number;
          delta_cents: number | null;
          note: string;
          occurred_on: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          dream_id: string;
          household_id: string;
          amount_cents: number;
          delta_cents?: number | null;
          note?: string;
          occurred_on?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          dream_id?: string;
          household_id?: string;
          amount_cents?: number;
          delta_cents?: number | null;
          note?: string;
          occurred_on?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dream_updates_dream_id_fkey";
            columns: ["dream_id"];
            isOneToOne: false;
            referencedRelation: "dreams";
            referencedColumns: ["id"];
          }
        ];
      };
      monthly_profits: {
        Row: {
          id: string;
          household_id: string;
          month: string;
          income_cents: number;
          expense_cents: number;
          net_cents: number;
          notes: string;
          is_auto: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          month: string;
          income_cents?: number;
          expense_cents?: number;
          net_cents?: number;
          notes?: string;
          is_auto?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          month?: string;
          income_cents?: number;
          expense_cents?: number;
          net_cents?: number;
          notes?: string;
          is_auto?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "monthly_profits_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_invite_code: { Args: never; Returns: string };
      user_household_ids: { Args: never; Returns: string[] };
      email_for_login_name: { Args: { p_name: string }; Returns: string };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tx = Database["public"]["Tables"]["transactions"]["Row"];
export type TxInsert = Database["public"]["Tables"]["transactions"]["Insert"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Goal = Database["public"]["Tables"]["monthly_goals"]["Row"];
export type Household = Database["public"]["Tables"]["households"]["Row"];
export type Member = Database["public"]["Tables"]["household_members"]["Row"];
export type Dream = Database["public"]["Tables"]["dreams"]["Row"];
export type DreamUpdate = Database["public"]["Tables"]["dream_updates"]["Row"];
export type Profit = Database["public"]["Tables"]["monthly_profits"]["Row"];

export type TxKind = "expense" | "income";
export type TxStatus = "realized" | "forecast";
export type GoalKind = "expense" | "income";
