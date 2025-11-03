# Supabase Setup Guide for Task Management

## Database Column Names

**Tasks Table:**

- `id` (int8, auto-increment)
- `title` (text)
- `description` (text)
- `due_date` (timestamptz)
- `is_complete` (bool)
- `created_at` (timestamptz)
- `assign_to_profile_id` (int8, foreign key to profiles.id)
- `created_by_profile_id` (int8, foreign key to profiles.id)

**Profiles Table:**

- `id` (int8, auto-increment)
- `username` (text)
- `expo_push_token` (text)
- `created_at` (timestamptz)
- `name` (text, optional - for displaying user name)
- `email` (text, optional - for displaying user email)

## Row Level Security (RLS) Policies

To enable task creation and management, you need to set up RLS policies in Supabase:

### Option 1: Allow All Authenticated Users (Recommended for Development)

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all tasks
CREATE POLICY "Allow authenticated read tasks" ON tasks
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert tasks
CREATE POLICY "Allow authenticated insert tasks" ON tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update tasks
CREATE POLICY "Allow authenticated update tasks" ON tasks
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete tasks
CREATE POLICY "Allow authenticated delete tasks" ON tasks
  FOR DELETE USING (auth.role() = 'authenticated');

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all profiles
CREATE POLICY "Allow authenticated read profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');
```

### Option 2: Disable RLS for Testing (Not Recommended for Production)

```sql
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

## API Key Configuration

1. Go to Supabase Dashboard → Settings → API
2. Use the **anon/public** key for `EXPO_PUBLIC_SUPABASE_KEY`
3. The anon key works with RLS policies
4. Never expose the **service_role** key in client-side code

## Environment Variables

Make sure you have these in your `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
```

## Testing

After setting up RLS policies:

1. Restart your Expo app
2. Try creating a task
3. Check Supabase Dashboard → Table Editor → tasks to verify the task was created
