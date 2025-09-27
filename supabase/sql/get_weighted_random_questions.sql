-- Create weighted selection RPC for TCO exams
create or replace function public.get_weighted_random_questions(question_count integer)
returns table (question_data jsonb)
language plpgsql
as $$
declare
  n_aq int; n_rq int; n_ta int; n_nb int; n_rd int;
  remainder int;
begin
  if question_count is null or question_count <= 0 then
    question_count := 105;
  end if;

  -- TCO blueprint weights: 22%, 23%, 15%, 23%, 17%
  n_aq := round(question_count * 0.22);
  n_rq := round(question_count * 0.23);
  n_ta := round(question_count * 0.15);
  n_nb := round(question_count * 0.23);
  n_rd := round(question_count * 0.17);

  remainder := question_count - (n_aq + n_rq + n_ta + n_nb + n_rd);
  if remainder <> 0 then
     n_aq := n_aq + remainder; -- adjust to ensure exact count
  end if;

  return query
  with selected as (
    select q.* from public.questions q
    where q.domain = 'Asking Questions'
    order by random() limit n_aq
    union all
    select q.* from public.questions q
    where q.domain = 'Refining Questions & Targeting'
    order by random() limit n_rq
    union all
    select q.* from public.questions q
    where q.domain = 'Taking Action'
    order by random() limit n_ta
    union all
    select q.* from public.questions q
    where q.domain = 'Navigation and Basic Module Functions'
    order by random() limit n_nb
    union all
    select q.* from public.questions q
    where q.domain = 'Report Generation and Data Export'
    order by random() limit n_rd
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

