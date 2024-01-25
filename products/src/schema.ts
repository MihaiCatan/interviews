import { buildSchema } from "graphql";

const schema = buildSchema(`
    type Producer {
        _id: ID!
        name: String!
        country: String
        region: String
    }

    input ProducerInput {
        name: String!
        country: String
        region: String
    }

    type Product {
        _id: ID!
        vintage: String!
        name: String!
        producerId: ID!
        producer: Producer
    }

    input ProductInput {
        vintage: String!
        name: String!
        producerId: ID!
    }

    type Query {
        getProducers: [Producer]
        getProducer(_id: ID!): Producer
        getProducts: [Product]
        getProductsByProducerId(producerId: ID!): [Product]

        getProducerByIdFromMongoDB(_id: ID!): Producer
        getProductsByProducerIdFromMongoDB(producerId: ID!): [Product]
    }

    type Mutation {
        createProducer(producer: ProducerInput!): Producer!
        createProducts(products: [ProductInput!]!): [Product!]!
        createProducerInMongoDB(producer: ProducerInput!): Producer!
        createProductsInMongoDB([ProductInput!]!): [Product!]!

        importMassiveData(source: String!): Boolean
    }
    `);

export default schema;
