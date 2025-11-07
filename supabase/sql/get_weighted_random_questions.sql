-- Create weighted selection RPC for TCO exams
-- Updated to work with available domains only
create or replace function public.get_weighted_random_questions(question_count integer)
returns table (question_data jsonb)
language plpgsql
security definer  -- Run with the privileges of the function creator
set search_path = public  -- Security best practice
as $$
begin
  if question_count is null or question_count <= 0 then
    question_count := 105;
  end if;

  -- Simple approach: Select random questions from all available domains
  -- If/when more domains are added, they'll automatically be included
  return query
  with selected as (
    select * from public.questions q
    order by random()
    limit question_count
  )
  select jsonb_build_object(
    'id', s.id,
    'question', s.question,
    'choices', coalesce(s.options, '[]'::jsonb),
    'correctAnswerId', case
      when s.correct_answer = 0 then 'a'
      when s.correct_answer = 1 then 'b'
      when s.correct_answer = 2 then 'c'
      when s.correct_answer = 3 then 'd'
      else coalesce(s.correct_answer::text, 'a')
    end,
    'domain', s.domain,
    'difficulty', case when lower(coalesce(s.difficulty, '')) in ('beginner','intermediate','advanced','expert')
                       then initcap(s.difficulty)
                       else coalesce(s.difficulty, 'Intermediate') end,
    'category', coalesce(s.category, 'Platform Fundamentals'),
    'explanation', s.explanation,
    'tags', coalesce(s.tags, array[]::text[])
  )::jsonb
  from selected s
  order by random();
end$$;

grant execute on function public.get_weighted_random_questions(integer) to anon, authenticated;

