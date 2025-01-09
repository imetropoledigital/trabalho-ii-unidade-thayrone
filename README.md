# Projeto API MongoDB

Este é um projeto de API que utiliza MongoDB para gerenciar e manipular dados de entidades de forma dinâmica, permitindo criar, listar, buscar, atualizar e aplicar filtros nas entidades.
Os testes da API, foram feitos com o auxílio do "Postman".


# Testando a API

Use o npm install

O servidor estará disponível em http://localhost:3000.

-Criando uma nova entidade:

POST /entities

{
  "entityType": "users",
  "data": {
    "name": "Mario",
    "age": 22
  }
}


- Listar todas as entidades de uma determinada coleção: GET /entities/entidade_desejada

Ex: GET /entities/users

- Buscar um obejto de determinada entidade pelo ID: GET /entities/entidade_desejada/ID_do_Objeto

- Atualizar uma entidade: 

PUT /entities/entidade_desejada/ID_do_Objeto

{
  "data": {
    "name": "Maria",
    "age": 34
  }
}

Obs: As projeçòes, filtros e paginações também foram aplicados na API.
