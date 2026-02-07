-- Add mind_map action type to credits config
INSERT INTO public.action_credits_config (action_type, credits_per_action, ai_provider, ai_model, estimated_tokens, cost_per_1k_tokens_usd, profit_margin_percentage)
VALUES ('mind_map', 3, 'anthropic', 'claude-3-haiku-20240307', 2000, 0.00025, 50)
ON CONFLICT DO NOTHING;