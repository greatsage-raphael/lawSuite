--  RUN 1st
create extension vector;

-- RUN 2nd
create table ugandaConstitution (
  id bigserial primary key,
  chapter_title text,
  chapter_num bigint,
  section_title text,
  section_num bigint,
  section_url text,
  chunk_num bigint,
  content text,
  content_length bigint,
  content_tokens bigint,
  embedding vector (1536)
);

-- RUN 3rd after running the scripts
create or replace function ugandaConstitution_search (
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int
)
returns table (
  id bigint,
  chapter_title text,
  chapter_num bigint,
  section_title text,
  section_num bigint,
  section_url text,
  chunk_num bigint,
  content text,
  content_length bigint,
  content_tokens bigint,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    ugandaConstitution.id,
    ugandaConstitution.chapter_title,
    ugandaConstitution.chapter_num,
    ugandaConstitution.section_title,
    ugandaConstitution.section_num,
    ugandaConstitution.section_url,
    ugandaConstitution.chunk_num,
    ugandaConstitution.content,
    ugandaConstitution.content_length,
    ugandaConstitution.content_tokens,
    1 - (ugandaConstitution.embedding <=> query_embedding) as similarity
  from ugandaConstitution
  where 1 - (ugandaConstitution.embedding <=> query_embedding) > similarity_threshold
  order by ugandaConstitution.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- RUN 4th
create index on ugandaConstitution 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);