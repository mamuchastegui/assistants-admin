
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { MongoClient, ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";

// Configuración de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Función para conectar a MongoDB
async function connectToMongoDB() {
  const mongoURI = Deno.env.get("MONGODB_URI");
  if (!mongoURI) {
    throw new Error("MONGODB_URI no está configurado");
  }
  
  const client = new MongoClient();
  await client.connect(mongoURI);
  return client;
}

// Manejador principal
serve(async (req) => {
  // Manejar solicitudes OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Procesar la solicitud según el método
    if (req.method === 'POST') {
      const body = await req.json();
      const action = body.action;

      switch (action) {
        case 'getMessages':
          return await getMessages(body);
        case 'getAssistants':
          return await getAssistantConfigs();
        case 'updateAssistant':
          return await updateAssistantConfig(body.config);
        case 'getTenants':
          return await getTenants();
        case 'getThreads':
          return await getThreads(body);
        default:
          return new Response(
            JSON.stringify({ error: "Acción no reconocida" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
      }
    }

    return new Response(
      JSON.stringify({ error: "Método no permitido" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Obtener mensajes de WhatsApp
async function getMessages(params) {
  const client = await connectToMongoDB();
  const db = client.database("whatsapp_db");
  const messagesCollection = db.collection("messages");
  
  // Parámetros de paginación
  const limit = parseInt(params.limit || "20");
  const skip = parseInt(params.skip || "0");
  
  // Obtener mensajes con paginación
  const messages = await messagesCollection
    .find({}, { sort: { timestamp: -1 }, limit, skip })
    .toArray();
  
  await client.close();
  
  return new Response(
    JSON.stringify(messages),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Obtener configuraciones de asistentes
async function getAssistantConfigs() {
  const client = await connectToMongoDB();
  const db = client.database("whatsapp_db");
  const assistantsCollection = db.collection("assistant_configs");
  
  const assistants = await assistantsCollection.find({}).toArray();
  
  await client.close();
  
  return new Response(
    JSON.stringify(assistants),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Actualizar configuración de asistente
async function updateAssistantConfig(config) {
  const client = await connectToMongoDB();
  const db = client.database("whatsapp_db");
  const assistantsCollection = db.collection("assistant_configs");
  
  let result;
  if (config._id) {
    // Actualizar existente
    const id = new ObjectId(config._id);
    delete config._id; // Eliminar el _id del objeto para evitar errores
    result = await assistantsCollection.updateOne(
      { _id: id },
      { $set: config }
    );
  } else {
    // Crear nuevo
    result = await assistantsCollection.insertOne(config);
  }
  
  await client.close();
  
  return new Response(
    JSON.stringify({ success: true, result }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Obtener tenants
async function getTenants() {
  const client = await connectToMongoDB();
  const db = client.database("whatsapp_db");
  const tenantsCollection = db.collection("tenants");
  
  const tenants = await tenantsCollection.find({}).toArray();
  
  await client.close();
  
  return new Response(
    JSON.stringify(tenants),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Obtener threads
async function getThreads(params) {
  const client = await connectToMongoDB();
  const db = client.database("whatsapp_db");
  const threadsCollection = db.collection("threads");
  
  // Parámetros de paginación
  const limit = parseInt(params.limit || "20");
  const skip = parseInt(params.skip || "0");
  
  // Obtener threads con paginación
  const threads = await threadsCollection
    .find({}, { sort: { updatedAt: -1 }, limit, skip })
    .toArray();
  
  await client.close();
  
  return new Response(
    JSON.stringify(threads),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
