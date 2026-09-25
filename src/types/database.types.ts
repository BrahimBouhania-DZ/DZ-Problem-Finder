
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "answers": {
                  Row: {
                    "created_at": string,"id": string,"question_id": string,"response_id": string,"value": NonNullable<Json>
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"question_id": string,"response_id": string,"value": NonNullable<Json>
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"question_id"?: string,"response_id"?: string,"value"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "answers_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "answers_response_id_fkey"
      columns: ["response_id"]
isOneToOne: false
      referencedRelation: "survey_responses"
      referencedColumns: ["id"]
    }
                  ]
                },"branching_rules": {
                  Row: {
                    "action": Database["public"]['Enums']["rule_action"],"combinator": string,"compare_value": (string)[],"id": string,"is_active": boolean,"operator": Database["public"]['Enums']["rule_operator"],"priority": number,"question_id": string,"survey_id": string,"target_question_id": string | null,"target_section_id": string | null
                  }
                  Insert: {
                    "action": Database["public"]['Enums']["rule_action"],"combinator"?: string,"compare_value"?: (string)[],"id"?: string,"is_active"?: boolean,"operator": Database["public"]['Enums']["rule_operator"],"priority"?: number,"question_id": string,"survey_id": string,"target_question_id"?: string | null,"target_section_id"?: string | null
                  }
                  Update: {
                    "action"?: Database["public"]['Enums']["rule_action"],"combinator"?: string,"compare_value"?: (string)[],"id"?: string,"is_active"?: boolean,"operator"?: Database["public"]['Enums']["rule_operator"],"priority"?: number,"question_id"?: string,"survey_id"?: string,"target_question_id"?: string | null,"target_section_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "branching_rules_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "branching_rules_survey_id_fkey"
      columns: ["survey_id"]
isOneToOne: false
      referencedRelation: "surveys"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "branching_rules_target_question_id_fkey"
      columns: ["target_question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "branching_rules_target_section_id_fkey"
      columns: ["target_section_id"]
isOneToOne: false
      referencedRelation: "survey_sections"
      referencedColumns: ["id"]
    }
                  ]
                },"evidence": {
                  Row: {
                    "created_at": string,"description": string | null,"evidence_strength": number,"evidence_type": Database["public"]['Enums']["evidence_type"],"id": string,"interview_id": string | null,"organization_id": string | null,"problem_id": string,"respondent_id": string | null,"source": string | null
                  }
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"evidence_strength"?: number,"evidence_type": Database["public"]['Enums']["evidence_type"],"id"?: string,"interview_id"?: string | null,"organization_id"?: string | null,"problem_id": string,"respondent_id"?: string | null,"source"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"evidence_strength"?: number,"evidence_type"?: Database["public"]['Enums']["evidence_type"],"id"?: string,"interview_id"?: string | null,"organization_id"?: string | null,"problem_id"?: string,"respondent_id"?: string | null,"source"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "evidence_interview_id_fkey"
      columns: ["interview_id"]
isOneToOne: false
      referencedRelation: "validation_interviews"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "evidence_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "evidence_problem_id_fkey"
      columns: ["problem_id"]
isOneToOne: false
      referencedRelation: "problems"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "evidence_respondent_id_fkey"
      columns: ["respondent_id"]
isOneToOne: false
      referencedRelation: "respondents"
      referencedColumns: ["id"]
    }
                  ]
                },"organizations": {
                  Row: {
                    "age_range": string | null,"created_at": string,"current_tools": (string)[],"id": string,"sector_id": string,"size_range": string,"wilaya_id": number | null
                  }
                  Insert: {
                    "age_range"?: string | null,"created_at"?: string,"current_tools"?: (string)[],"id"?: string,"sector_id": string,"size_range": string,"wilaya_id"?: number | null
                  }
                  Update: {
                    "age_range"?: string | null,"created_at"?: string,"current_tools"?: (string)[],"id"?: string,"sector_id"?: string,"size_range"?: string,"wilaya_id"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "organizations_sector_id_fkey"
      columns: ["sector_id"]
isOneToOne: false
      referencedRelation: "sectors"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "organizations_wilaya_id_fkey"
      columns: ["wilaya_id"]
isOneToOne: false
      referencedRelation: "wilayas"
      referencedColumns: ["id"]
    }
                  ]
                },"problem_sources": {
                  Row: {
                    "answer_id": string | null,"created_at": string,"id": string,"interview_id": string | null,"notes": string | null,"problem_id": string,"response_id": string | null,"source_type": string
                  }
                  Insert: {
                    "answer_id"?: string | null,"created_at"?: string,"id"?: string,"interview_id"?: string | null,"notes"?: string | null,"problem_id": string,"response_id"?: string | null,"source_type": string
                  }
                  Update: {
                    "answer_id"?: string | null,"created_at"?: string,"id"?: string,"interview_id"?: string | null,"notes"?: string | null,"problem_id"?: string,"response_id"?: string | null,"source_type"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "problem_sources_answer_id_fkey"
      columns: ["answer_id"]
isOneToOne: false
      referencedRelation: "answers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "problem_sources_interview_id_fkey"
      columns: ["interview_id"]
isOneToOne: false
      referencedRelation: "validation_interviews"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "problem_sources_problem_id_fkey"
      columns: ["problem_id"]
isOneToOne: false
      referencedRelation: "problems"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "problem_sources_response_id_fkey"
      columns: ["response_id"]
isOneToOne: false
      referencedRelation: "survey_responses"
      referencedColumns: ["id"]
    }
                  ]
                },"problems": {
                  Row: {
                    "affected_people": number | null,"category_id": string | null,"created_at": string,"current_solution": string | null,"description": string | null,"discovered_at": string,"feasibility": number | null,"financial_impact_dzd": number | null,"frequency_level": number | null,"id": string,"sector_id": string | null,"severity_level": number | null,"solution_gap": string | null,"status": Database["public"]['Enums']["problem_status"],"time_impact_hours": number | null,"title": string,"updated_at": string,"validated_at": string | null
                  }
                  Insert: {
                    "affected_people"?: number | null,"category_id"?: string | null,"created_at"?: string,"current_solution"?: string | null,"description"?: string | null,"discovered_at"?: string,"feasibility"?: number | null,"financial_impact_dzd"?: number | null,"frequency_level"?: number | null,"id"?: string,"sector_id"?: string | null,"severity_level"?: number | null,"solution_gap"?: string | null,"status"?: Database["public"]['Enums']["problem_status"],"time_impact_hours"?: number | null,"title": string,"updated_at"?: string,"validated_at"?: string | null
                  }
                  Update: {
                    "affected_people"?: number | null,"category_id"?: string | null,"created_at"?: string,"current_solution"?: string | null,"description"?: string | null,"discovered_at"?: string,"feasibility"?: number | null,"financial_impact_dzd"?: number | null,"frequency_level"?: number | null,"id"?: string,"sector_id"?: string | null,"severity_level"?: number | null,"solution_gap"?: string | null,"status"?: Database["public"]['Enums']["problem_status"],"time_impact_hours"?: number | null,"title"?: string,"updated_at"?: string,"validated_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "problems_sector_id_fkey"
      columns: ["sector_id"]
isOneToOne: false
      referencedRelation: "sectors"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"full_name": string | null,"id": string,"role": Database["public"]['Enums']["user_role"]
                  }
                  Insert: {
                    "created_at"?: string,"full_name"?: string | null,"id": string,"role"?: Database["public"]['Enums']["user_role"]
                  }
                  Update: {
                    "created_at"?: string,"full_name"?: string | null,"id"?: string,"role"?: Database["public"]['Enums']["user_role"]
                  }
                  Relationships: [
                    
                  ]
                },"question_options": {
                  Row: {
                    "id": string,"label": string,"question_id": string,"sort_order": number,"value": string
                  }
                  Insert: {
                    "id"?: string,"label": string,"question_id": string,"sort_order"?: number,"value": string
                  }
                  Update: {
                    "id"?: string,"label"?: string,"question_id"?: string,"sort_order"?: number,"value"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "question_options_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    }
                  ]
                },"questions": {
                  Row: {
                    "created_at": string,"description": string | null,"id": string,"is_active": boolean,"key": string,"required": boolean,"section_id": string,"sort_order": number,"survey_id": string,"title": string,"type": Database["public"]['Enums']["question_type"],"updated_at": string
                  }
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"is_active"?: boolean,"key": string,"required"?: boolean,"section_id": string,"sort_order"?: number,"survey_id": string,"title": string,"type": Database["public"]['Enums']["question_type"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"is_active"?: boolean,"key"?: string,"required"?: boolean,"section_id"?: string,"sort_order"?: number,"survey_id"?: string,"title"?: string,"type"?: Database["public"]['Enums']["question_type"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "questions_section_id_fkey"
      columns: ["section_id"]
isOneToOne: false
      referencedRelation: "survey_sections"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "questions_survey_id_fkey"
      columns: ["survey_id"]
isOneToOne: false
      referencedRelation: "surveys"
      referencedColumns: ["id"]
    }
                  ]
                },"respondents": {
                  Row: {
                    "contact_email": string | null,"id": string,"organization_id": string | null,"role": string
                  }
                  Insert: {
                    "contact_email"?: string | null,"id"?: string,"organization_id"?: string | null,"role": string
                  }
                  Update: {
                    "contact_email"?: string | null,"id"?: string,"organization_id"?: string | null,"role"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "respondents_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"sectors": {
                  Row: {
                    "color": string,"icon": string,"id": string,"label": string,"sort_order": number
                  }
                  Insert: {
                    "color": string,"icon"?: string,"id": string,"label": string,"sort_order"?: number
                  }
                  Update: {
                    "color"?: string,"icon"?: string,"id"?: string,"label"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    
                  ]
                },"survey_responses": {
                  Row: {
                    "completed_at": string | null,"current_question_id": string | null,"id": string,"is_completed": boolean,"organization_id": string | null,"respondent_id": string | null,"sector_id": string,"started_at": string,"survey_id": string,"visited_question_ids": (string)[]
                  }
                  Insert: {
                    "completed_at"?: string | null,"current_question_id"?: string | null,"id"?: string,"is_completed"?: boolean,"organization_id"?: string | null,"respondent_id"?: string | null,"sector_id": string,"started_at"?: string,"survey_id": string,"visited_question_ids"?: (string)[]
                  }
                  Update: {
                    "completed_at"?: string | null,"current_question_id"?: string | null,"id"?: string,"is_completed"?: boolean,"organization_id"?: string | null,"respondent_id"?: string | null,"sector_id"?: string,"started_at"?: string,"survey_id"?: string,"visited_question_ids"?: (string)[]
                  }
                  Relationships: [
                    {
      foreignKeyName: "survey_responses_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "survey_responses_respondent_id_fkey"
      columns: ["respondent_id"]
isOneToOne: false
      referencedRelation: "respondents"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "survey_responses_sector_id_fkey"
      columns: ["sector_id"]
isOneToOne: false
      referencedRelation: "sectors"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "survey_responses_survey_id_fkey"
      columns: ["survey_id"]
isOneToOne: false
      referencedRelation: "surveys"
      referencedColumns: ["id"]
    }
                  ]
                },"survey_sections": {
                  Row: {
                    "id": string,"sector_ids": (string)[] | null,"sort_order": number,"survey_id": string,"title": string
                  }
                  Insert: {
                    "id"?: string,"sector_ids"?: (string)[] | null,"sort_order"?: number,"survey_id": string,"title": string
                  }
                  Update: {
                    "id"?: string,"sector_ids"?: (string)[] | null,"sort_order"?: number,"survey_id"?: string,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "survey_sections_survey_id_fkey"
      columns: ["survey_id"]
isOneToOne: false
      referencedRelation: "surveys"
      referencedColumns: ["id"]
    }
                  ]
                },"surveys": {
                  Row: {
                    "created_at": string,"id": string,"status": Database["public"]['Enums']["survey_status"],"title": string,"updated_at": string,"version": number
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"status"?: Database["public"]['Enums']["survey_status"],"title": string,"updated_at"?: string,"version"?: number
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"status"?: Database["public"]['Enums']["survey_status"],"title"?: string,"updated_at"?: string,"version"?: number
                  }
                  Relationships: [
                    
                  ]
                },"validation_interviews": {
                  Row: {
                    "created_at": string,"current_solution": string | null,"duration_min": number | null,"happened_on": string,"id": string,"notes": string | null,"organization_id": string | null,"pain_level": number | null,"past_spending_dzd": number | null,"problem_id": string,"respondent_id": string | null,"summary": string | null,"validation_result": string | null,"willing_to_pay_dzd": number | null,"willing_to_test": boolean | null
                  }
                  Insert: {
                    "created_at"?: string,"current_solution"?: string | null,"duration_min"?: number | null,"happened_on"?: string,"id"?: string,"notes"?: string | null,"organization_id"?: string | null,"pain_level"?: number | null,"past_spending_dzd"?: number | null,"problem_id": string,"respondent_id"?: string | null,"summary"?: string | null,"validation_result"?: string | null,"willing_to_pay_dzd"?: number | null,"willing_to_test"?: boolean | null
                  }
                  Update: {
                    "created_at"?: string,"current_solution"?: string | null,"duration_min"?: number | null,"happened_on"?: string,"id"?: string,"notes"?: string | null,"organization_id"?: string | null,"pain_level"?: number | null,"past_spending_dzd"?: number | null,"problem_id"?: string,"respondent_id"?: string | null,"summary"?: string | null,"validation_result"?: string | null,"willing_to_pay_dzd"?: number | null,"willing_to_test"?: boolean | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "validation_interviews_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "validation_interviews_problem_id_fkey"
      columns: ["problem_id"]
isOneToOne: false
      referencedRelation: "problems"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "validation_interviews_respondent_id_fkey"
      columns: ["respondent_id"]
isOneToOne: false
      referencedRelation: "respondents"
      referencedColumns: ["id"]
    }
                  ]
                },"validation_scores": {
                  Row: {
                    "calculated_at": string,"feasibility": number | null,"financial_impact": number | null,"frequency": number | null,"problem_id": string,"reach": number | null,"severity": number | null,"time_loss": number | null,"willingness_to_pay": number | null
                  }
                  Insert: {
                    "calculated_at"?: string,"feasibility"?: number | null,"financial_impact"?: number | null,"frequency"?: number | null,"problem_id": string,"reach"?: number | null,"severity"?: number | null,"time_loss"?: number | null,"willingness_to_pay"?: number | null
                  }
                  Update: {
                    "calculated_at"?: string,"feasibility"?: number | null,"financial_impact"?: number | null,"frequency"?: number | null,"problem_id"?: string,"reach"?: number | null,"severity"?: number | null,"time_loss"?: number | null,"willingness_to_pay"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "validation_scores_problem_id_fkey"
      columns: ["problem_id"]
isOneToOne: true
      referencedRelation: "problems"
      referencedColumns: ["id"]
    }
                  ]
                },"wilayas": {
                  Row: {
                    "code": number,"id": number,"name_ar": string,"name_fr": string
                  }
                  Insert: {
                    "code": number,"id": number,"name_ar": string,"name_fr": string
                  }
                  Update: {
                    "code"?: number,"id"?: number,"name_ar"?: string,"name_fr"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "compute_opportunity_score":
{ Args: { "p_feasibility": number,"p_financial_impact": number,"p_frequency": number,"p_reach": number,"p_severity": number,"p_time_loss": number,"p_willingness_to_pay": number }; Returns: number
                           },
"dearmor":
{ Args: { "": string }; Returns: string
                           },
"dzpf_role":
{ Args: Record<PropertyKey, never>; Returns: Database["public"]['Enums']["user_role"]
                           },
"gen_random_uuid":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"gen_salt":
{ Args: { "": string }; Returns: string
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_staff":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"pgp_armor_headers":
{ Args: { "": string }; Returns: Record<string, unknown>[]
                           }
          }
          Enums: {
            "evidence_type": "survey"|"interview"|"observation"|"existing_solution"|"customer_request"|"prototype_test"|"quote_request"|"payment","problem_status": "DISCOVERED"|"REPEATED"|"EVIDENCED"|"VALIDATED"|"DEMAND_CONFIRMED"|"PAYMENT_VALIDATED","question_type": "single_choice"|"multi_choice"|"open_text"|"number"|"scale","rule_action": "show"|"hide"|"jump_to_section"|"skip","rule_operator": "equals"|"not_equals"|"contains"|"greater_than"|"greater_or_equal"|"less_than"|"less_or_equal"|"in"|"not_in","survey_status": "draft"|"published"|"closed","user_role": "admin"|"researcher"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "evidence_type": ["survey", "interview", "observation", "existing_solution", "customer_request", "prototype_test", "quote_request", "payment"],"problem_status": ["DISCOVERED", "REPEATED", "EVIDENCED", "VALIDATED", "DEMAND_CONFIRMED", "PAYMENT_VALIDATED"],"question_type": ["single_choice", "multi_choice", "open_text", "number", "scale"],"rule_action": ["show", "hide", "jump_to_section", "skip"],"rule_operator": ["equals", "not_equals", "contains", "greater_than", "greater_or_equal", "less_than", "less_or_equal", "in", "not_in"],"survey_status": ["draft", "published", "closed"],"user_role": ["admin", "researcher"]
          }
        }
} as const

