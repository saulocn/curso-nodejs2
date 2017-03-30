module.exports = function(app){
    app.post('/correios/calculo-prazo', function(req, res){
        var dadosDaEntrega = req.body;
        console.log(dadosDaEntrega);
        var correiosSOAPClient = new app.servicos.correiosSOAPClient();
        correiosSOAPClient.calculaPrazo(
            dadosDaEntrega,
            function(erro, resultado){
                if(erro){
                    res.status(500).send(erro);
                    return;
                }
                console.log('Prazo Calculado!');
                res.json(resultado);
            }
        );


    });
};