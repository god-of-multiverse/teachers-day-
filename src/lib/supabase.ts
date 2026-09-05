import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "https://brsvgrrmbapttjxrpcyw.supabase.co";
const anonKey =
	import.meta.env.VITE_SUPABASE_ANON_KEY ||
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyc3ZncnJtYmFwdHRqeHJwY3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTI0MzUsImV4cCI6MjEwNDE4ODQzNX0.Vr5wz68I07Rje9K-1VtN8OPmt-mkCvFr_LYmczxy42A";

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
