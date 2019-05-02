const express = require('express');
const cors = require('cors');
const newEngine = require('@comunica/actor-init-sparql').newEngine;

const app = express();
const port = 4000;
const engine = newEngine();

app.use(cors());

app.get('/', (req, res) => {
    handleData().then(result => {
        res.set('content-type', 'text/plain; charset=utf-8');
        res.send(result);
    });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));

async function handleData () {
    const query = `
    PREFIX dbpedia: <http://dbpedia.org/resource/>
    PREFIX dbbprop: <http://dbpedia.org/property/>
    
    SELECT * WHERE {
        ?s dbpprop:occupation dbpedia:Computer_scientist
    }
    `;
    const sources = [
        { type: "file", value: "http://localhost:8080/data.jsonld" },
        { type: "hypermedia", value: "http://fragments.dbpedia.org/2016-04/en" },
    ];
    const result = await engine.query(query, { sources });
    const results = [];
    result.bindingsStream.on('data', data => {
        results.push(data.get('?s').value);
    });
    return new Promise(resolve => {
        result.bindingsStream.on('end', () => {
            resolve(results);
        })
    });
}
