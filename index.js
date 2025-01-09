const mongoose = require('mongoose');
const express = require('express');

const app = express();
app.use(express.json());

// Conexão ao MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/projeto-unidade-II', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conexão com MongoDB bem-sucedida!'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Porta do servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Função para auxiliar nas criacoes de entidades de forma
function getEntityModel(entityType) {
  if (mongoose.models[entityType]) {
    return mongoose.models[entityType];  
  }

  // Registra o modelo dinâmico se não estiver registrado, não estava funcionando sem essa funcao em questão.
  return mongoose.model(entityType, new mongoose.Schema({
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  }), entityType);
}

// Rota POST para criar uma nova entidade
app.post('/entities', async (req, res) => {
  try {
    const { entityType, data } = req.body;

    if (!entityType || !data) {
      return res.status(400).json({ message: 'Tipo de entidade e dados são obrigatórios!' });
    }

    const Entity = getEntityModel(entityType); // Atribui o Modelo dinâmico

    const entity = new Entity({ data });
    const result = await entity.save();

    res.status(201).json({
      message: 'Entidade criada com sucesso!',
      entity: result,
    });
  } catch (err) {
    console.error('Erro ao criar entidade:', err);
    res.status(400).json({ message: 'Erro ao criar entidade', error: err.message });
  }
});


// Rota GET para listar todos as entidades de uma determinada colecao
app.get('/entities/:entityType', async (req, res) => {
  try {
    const { entityType } = req.params;  
 
    const Entity = getEntityModel(entityType); 
    
    const entities = await Entity.find();
    
    if (entities.length === 0) {
      return res.status(404).json({ message: `Nenhuma entidade do tipo ${entityType} encontrada` });
    }
    
    res.status(200).json(entities);
  } catch (err) {
    console.error('Erro ao listar entidades:', err);
    res.status(500).json({ message: 'Erro ao listar entidades', error: err.message });
  }
});


// Rota GET para listar uma entidade pelo ID
app.get('/entities/:entityType/:id', async (req, res) => {
  try {
    const { entityType, id } = req.params;
    const Entity = getEntityModel(entityType); 

    const entity = await Entity.findById(id);
    if (!entity) {
      return res.status(404).json({ message: 'Entidade não encontrada' });
    }
    res.status(200).json(entity);
  } catch (err) {
    console.error('Erro ao buscar entidade:', err);
    res.status(500).json({ message: 'Erro ao buscar entidade', error: err.message });
  }
});


// Rota PUT para atualizar os dados de um determinado item
app.put('/entities/:entityType/:id', async (req, res) => {
  try {
    const { entityType, id } = req.params;
    const { data } = req.body;

    const Entity = getEntityModel(entityType); 

    const updatedEntity = await Entity.findByIdAndUpdate(
      id,
      { data },
      { new: true }
    );

    if (!updatedEntity) {
      return res.status(404).json({ message: 'Entidade não encontrada' });
    }

    res.status(200).json({
      message: 'Entidade atualizada com sucesso!',
      entity: updatedEntity,
    });
  } catch (err) {
    console.error('Erro ao atualizar entidade:', err);
    res.status(500).json({ message: 'Erro ao atualizar entidade', error: err.message });
  }
});

// Rota GET para buscar com filtros, paginação e projeção
app.get('/entities', async (req, res) => {
  const { entityType, limit, skip, fields, query } = req.query;

  // Verifica se o tipo de entidade foi fornecido
  if (!entityType) {
    return res.status(400).json({ message: 'Tipo de entidade é obrigatório!' });
  }

  // Obtém o modelo dinâmico para a entidade
  const Entity = getEntityModel(entityType);

  let filter = {};  // Filtro inicial vazio

  // Se query estiver presente, tenta analisar a string JSON
  if (query) {
    try {
      filter = JSON.parse(query); 
    } catch (e) {
      return res.status(400).json({ message: 'Query inválida!', error: e.message });
    }
  }

  // Paginamento (limit e skip)
  const pageLimit = parseInt(limit) || 10;  
  const pageSkip = parseInt(skip) || 0;     

  // Projeção (seleção de campos)
  const projection = fields ? fields.split(',').join(' ') : '';  

  // Consulta no banco de dados com filtros, projeção, limite e deslocamento
  const entities = await Entity.find(filter)  
    .select(projection)                      
    .limit(pageLimit)                       
    .skip(pageSkip);                         

  // Retorna as entidades encontradas
  res.status(200).json(entities);  
});



