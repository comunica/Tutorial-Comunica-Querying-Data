const express = require('express');
const newEngineDynamic = require('@comunica/actor-init-sparql').newEngineDynamic;
const RdfString = require('rdf-string');

const app = express();
const port = 3000;

const query = `
SELECT *
{ 
    ?s dbpedia-owl:birthPlace <http://dbpedia.org/resource/Belgium> 
}
`;
const sources = [ { type: 'hypermedia', value: 'http://fragments.dbpedia.org/2015/en' } ];

app.get('/', (req, res) => {
    newEngineDynamic().then(function (myEngine) {
        myEngine.query(query, { sources: sources })
            .then((result) => {

                result.bindingsStream.on('data', data => res.write(RdfString.termToString(data.get('?s')) + '\n') );
                result.bindingsStream.on('end', () => res.end());

            });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));