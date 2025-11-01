-- Safe migration to add coordinate fields to orders table
-- This will only add columns if they don't already exist

DO $$ 
BEGIN
    -- Check and add latitude column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'shipping_latitude' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE orders ADD COLUMN shipping_latitude DOUBLE PRECISION;
        RAISE NOTICE 'Added shipping_latitude column';
    ELSE
        RAISE NOTICE 'shipping_latitude column already exists';
    END IF;
    
    -- Check and add longitude column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'shipping_longitude' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE orders ADD COLUMN shipping_longitude DOUBLE PRECISION;
        RAISE NOTICE 'Added shipping_longitude column';
    ELSE
        RAISE NOTICE 'shipping_longitude column already exists';
    END IF;
    
    -- Check and add geocoded timestamp column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'location_geocoded_at' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE orders ADD COLUMN location_geocoded_at TIMESTAMPTZ;
        RAISE NOTICE 'Added location_geocoded_at column';
    ELSE
        RAISE NOTICE 'location_geocoded_at column already exists';
    END IF;
END $$;