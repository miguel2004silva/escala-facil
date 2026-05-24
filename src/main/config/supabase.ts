import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iatrrmgjevzgerlqjnnt.supabase.co';
const supabaseAnonKey = 'sb_publishable_P83Y-PRRvCqDsqXB6nTI-g_dZrDvGjE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
