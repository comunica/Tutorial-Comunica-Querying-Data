const express = require('express');
const newEngineDynamic = require('@comunica/actor-init-sparql').newEngineDynamic;

const app = express();
const port = 3000;

const query = `
SELECT ?name
{ 
    ?s dbpedia-owl:birthPlace <http://dbpedia.org/resource/Belgium>.
    ?s foaf:name ?name.
}
`;
const sources = [ { type: 'hypermedia', value: 'http://fragments.dbpedia.org/2015/en' } ];

app.get('/', (req, res) => {
    newEngineDynamic().then(function (myEngine) {
        myEngine.query(query, { sources: sources })
            .then((result) => {

                res.set('content-type', 'text/plain; charset=utf-8');

                result.bindingsStream.on('data', data => res.write(data.get('?name').value + '\n') );
                result.bindingsStream.on('end', () => res.end());

            });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));