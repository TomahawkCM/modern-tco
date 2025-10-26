-- Normalize numeric correct_answer_id to letter IDs expected by the app
-- Run in Supabase SQL Editor after reviewing a backup if needed.

update public.questions
set correct_answer_id = case correct_answer_id
  when '0' then 'a'
  when '1' then 'b'
  when '2' then 'c'
  when '3' then 'd'
  else correct_answer_id
end
where correct_answer_id in ('0','1','2','3');

