--  RUN 1st
create extension vector;

-- RUN 2nd
create table lawVault (
  id bigserial primary key,
  chapter_title text,
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
create or replace function lawVault_search (
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int
)
returns table (
  id bigint,
  chapter_title text,
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
    lawVault.id,
    lawVault.chapter_title,
    lawVault.section_title,
    lawVault.section_num,
    lawVault.section_url,
    lawVault.chunk_num,
    lawVault.content,
    lawVault.content_length,
    lawVault.content_tokens,
    1 - (lawVault.embedding <=> query_embedding) as similarity
  from lawVault
  where 1 - (lawVault.embedding <=> query_embedding) > similarity_threshold
  order by lawVault.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- RUN 4th
create index on lawVault 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);