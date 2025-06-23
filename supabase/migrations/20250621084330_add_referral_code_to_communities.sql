-- Add a referral_code column to the communities table
ALTER TABLE "public"."communities"
ADD COLUMN "referral_code" TEXT UNIQUE;

-- Create a function to generate a short random string
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT string_agg(substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', floor(random() * 36 + 1)::int, 1), '')
        FROM generate_series(1, 6)
    );
END;
$$ LANGUAGE plpgsql;

-- Set a default value for the referral_code using the function
ALTER TABLE "public"."communities"
ALTER COLUMN "referral_code" SET DEFAULT generate_short_code();
