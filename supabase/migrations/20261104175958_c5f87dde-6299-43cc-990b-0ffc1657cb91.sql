CREATE TABLE public.verification_codes (
  session_token uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roblox_id bigint,
  username text,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
GRANT ALL ON public.verification_codes TO service_role;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.verify_rate_limits (
  id bigserial PRIMARY KEY,
  ip text NOT NULL,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX verify_rate_limits_ip_idx ON public.verify_rate_limits (ip, action, created_at);
GRANT ALL ON public.verify_rate_limits TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.verify_rate_limits_id_seq TO service_role;
ALTER TABLE public.verify_rate_limits ENABLE ROW LEVEL SECURITY;