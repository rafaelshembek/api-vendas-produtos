require('dotenv').config();
const fastify = require('fastify');
const createCliente = require('@supabase/supabase-js')
const crypto = require('node:crypto');
const { resolvePtr } = require('node:dns');

const server = fastify();

if(!process.env.SUPABASE_KEY || !process.env.SUPABASE_URL)
{
    throw new Error('Não foi encontrado as variaveis de anbiente no arquivo .env')
}

const supabase = createCliente.createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const produtos = [
    {id: '1', name: "Primeiro produto", preco: 0.00, description: "qualquere descrição aquir"},
    {id: '2', name: "Segundo produto", preco: 0.00, description: "qualquere descrição aquir"},
    {id: '3', name: "Terceiro produto", preco: 0.00, description: "qualquere descrição aquir"},
    {id: '4', name: "Quarto produto", preco: 0.00, description: "qualquere descrição aquir"},
    {id: '5', name: "Quinto produto", preco: 0.00, description: "qualquere descrição aquir"},
    
]
// obter todos os produtos
server.get('/', async (request, reply) => {
    const  { data, err} = await supabase.from('produtos').select("*");
    if(err)
    {
        return reply.code(500).send({error: error.message})
    }
    // return reply.send({data})
    // return reply.send(
    //     data.forEach((item) => {
    //        return( <h1>item.name</h1>)
    //     })
    // )
    const html = `
        ${data.map(item => `<p>${item.name}</p>`).join('')}
    `;
    reply.type('text/html').send(html);
})

// obter o produtos por id
server.get('/produto/:id', async (request, reply) => {

    // const paramsId = request.params.id;
    const {id} = request.params;

    // Regex para validar o UUID v4
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if(!uuidRegex.test(id))
    {
        return reply.code(400).send({ message: `ID inválido: ${id}. O ID deve ser um UUID.` });
    }


    const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (
            error.message === 'Cannot coerce the result to a single JSON object' ||
            error.code === 'PGRST116' // código de erro do PostgREST para not found
        ) {
            return reply.code(404).send({ message: `Produto com id ${id} não encontrado.` });
        }
        return reply.code(500).send({ error: error.message });
    }
    if (!data) {
        return reply.code(404).send({ message: `Id: ${id} nao encontrado` });
    }
    // mostra o nome do produto buscado pelo ID
    const html = `<p>${data.name}</p>`;
    return reply.type('text/html').send(html);

    // return reply.send({ itemProduto: data });
})

// posta novos produtos

server.post('/produto', async (request,reply) => {

    const  { name, preco, description} = request.body;

    const { data, err} = await supabase
    .from('produtos')
    .insert([{name, preco, description}])
    .select();

    if(err)
    {
        return reply.code(500).send({error: error.message});
    }
    return reply.code(201).send(data[0]);

} )

server.listen({port: 3000}).then(()=>{
    console.log(`Http server running!`);
})