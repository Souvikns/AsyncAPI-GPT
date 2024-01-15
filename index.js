require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { Document } = require('langchain/document')
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter')
const { createClient } = require('@supabase/supabase-js')
const { SupabaseVectorStore } = require('langchain/vectorstores/supabase')
const { OpenAIEmbeddings } = require('langchain/embeddings/openai')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

async function main() {
  const asyncapiDoc = fs.readFileSync(path.resolve('./asyncapi.md'), 'utf-8')
  const doc = new Document({ pageContent: asyncapiDoc })

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
  })
  const output = await splitter.createDocuments([asyncapiDoc])

  //TODO: Create embedings and upload them to supabase

  const client = createClient(SUPABASE_URL, SUPABASE_API_KEY)

  await SupabaseVectorStore.fromDocuments(
    output,
    new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY, maxConcurrency: 3, maxRetries: 1  }),
    {
      client,
      tableName: 'documents',
    }
  )
}

main().catch((e) => console.error(e))
