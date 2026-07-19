-- Dodaj tę funkcję w SQL Editor w Supabase (opcjonalnie, dla listy konwersacji)
-- Jeśli nie chcesz używać RPC, lista konwersacji będzie pusta ale czat dalej działa

create or replace function public.get_conversations(user_uuid uuid)
returns table (
  other_user_id uuid,
  other_username text,
  last_message text,
  last_message_at timestamp with time zone,
  unread_count bigint
) as $$
begin
  return query
  with convs as (
    select 
      case when sender_id = user_uuid then receiver_id else sender_id end as uid,
      max(created_at) as max_at
    from public.messages
    where sender_id = user_uuid or receiver_id = user_uuid
    group by case when sender_id = user_uuid then receiver_id else sender_id end
  )
  select 
    c.uid as other_user_id,
    p.username as other_username,
    m.content as last_message,
    c.max_at as last_message_at,
    (select count(*) from public.messages where receiver_id = user_uuid and sender_id = c.uid and read = false) as unread_count
  from convs c
  left join public.profiles p on p.id = c.uid
  left join public.messages m on m.created_at = c.max_at and (m.sender_id = c.uid or m.receiver_id = c.uid)
  order by c.max_at desc;
end;
$$ language plpgsql security definer;