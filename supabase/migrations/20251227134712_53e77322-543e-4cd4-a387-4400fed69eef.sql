-- Create a secure function to validate and create orders with server-side price validation
CREATE OR REPLACE FUNCTION public.create_validated_order(
  p_cart_items jsonb
) RETURNS uuid
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id uuid;
  v_total decimal := 0;
  v_item jsonb;
  v_product record;
  v_quantity int;
BEGIN
  -- Validate user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Validate cart is not empty
  IF jsonb_array_length(p_cart_items) = 0 THEN
    RAISE EXCEPTION 'Cart cannot be empty';
  END IF;

  -- Calculate total with validated prices from products table
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_cart_items)
  LOOP
    v_quantity := (v_item->>'quantity')::int;
    
    -- Validate quantity
    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity for product';
    END IF;
    
    -- Fetch real-time price from products table
    SELECT id, price, name, sr_number INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::uuid;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', v_item->>'product_id';
    END IF;
    
    -- Calculate with validated price
    v_total := v_total + (v_product.price * v_quantity);
  END LOOP;
  
  -- Create order with validated total
  INSERT INTO orders (user_id, total_amount, status)
  VALUES (auth.uid(), v_total, 'Pending')
  RETURNING id INTO v_order_id;
  
  -- Insert order items with validated prices from products table
  INSERT INTO order_items (order_id, product_id, product_name, product_sr_number, quantity, unit_price, total_price)
  SELECT 
    v_order_id,
    (item->>'product_id')::uuid,
    p.name,
    p.sr_number,
    (item->>'quantity')::int,
    p.price,
    p.price * (item->>'quantity')::int
  FROM jsonb_array_elements(p_cart_items) AS item
  JOIN products p ON p.id = (item->>'product_id')::uuid;
  
  -- Clear user's cart after successful order
  DELETE FROM cart_items WHERE user_id = auth.uid();
  
  RETURN v_order_id;
END;
$$;