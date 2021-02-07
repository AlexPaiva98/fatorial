const express = require('express');
const redis = require('redis');

const calculateFactorial = (n) => {
    let result = 1;
    for (let index = n; index > 0; index--) {
        result = result * index;
    }
    return result;
};

const app = express();

const cache = redis.createClient({
    host: 'redis',
    port: 6379
});

app.listen(3000, () => {
    console.log('Aplicação iniciada na porta 3000!');
});

cache.on('connect', () => {
    console.log('Redis conectado!');
});

cache.on('error', (e) => {
    console.log('Redis error', e);
});

app.get('/fatorial/:n', (request, response) => {
    const n = parseInt(request.params.n);
    if (Number.isInteger(n) && n > 0) {
        cache.get(n, (error, reply) => {
            if (error) {
                response.status(500).send('Erro de leitura no redis!!!');
            } else {
                if (reply === null) {
                    const fatorial = JSON.stringify(calculateFactorial(n));
                    cache.set(n, fatorial, 'EX', 60 * 5);
                    response.status(200).send(fatorial);
                } else {
                    response.status(200).send(reply);
                }
            }
        });
    } else {
        response.status(500).send('Valor inválido!');
    }
});
