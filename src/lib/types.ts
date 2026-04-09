export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  image_url: string | null;
  cooking_time: number | null;
  difficulty: string | null;
  servings: number | null;
  source_url: string | null;
  source_name: string | null;
  category: string[];
  created_at: string;
  updated_at: string;
}
