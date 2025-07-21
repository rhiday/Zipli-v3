-- Enable RLS for the tables
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

-- Grant update permission for food_items table
CREATE POLICY "Allow users to update their own food items"
ON public.food_items
FOR UPDATE
USING (auth.uid() IN (SELECT donor_id FROM donations WHERE food_item_id = id));

-- Grant update permission for donations table
CREATE POLICY "Allow users to update their own donations"
ON public.donations
FOR UPDATE
USING (auth.uid() = donor_id); 