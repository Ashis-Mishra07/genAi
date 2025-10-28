-- Check if orders exist and their structure
SELECT
    id,
    order_number,
    status,
    shipping_address,
    shipping_latitude,
    shipping_longitude,
    created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;