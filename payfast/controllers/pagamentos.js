var logger = require('../servicos/logger.js');

module.exports = function(app){ 
	app.get('/pagamentos', function(req, res){
		console.log("Executado o barra teste na porta q o cara usa!");
		res.send("Olá, sua url foi executada! Ok.");
	});

	app.get('/pagamentos/pagamento/:id', function(req, res){
		var id =  req.params.id;
		console.log("Consultando o pagamento: "+id);
		logger.info("Consultando o pagamento: "+id);
		var memcachedclient = app.servicos.memcachedClient();
		memcachedclient.get('pagamento-'+id, function(erro, retorno){
			if(erro || !retorno){
				console.log('MISS - chave não encontrada!');
				var connection = app.persistence.connectionFactory();
				var pagamentoDao = new app.persistence.PagamentoDao(connection);

				pagamentoDao.buscaPorId(id, function(erro, resultado){
					if(erro){
						console.log("Erro ao consultar no banco!"+erro)
						res.status(500).send(erro);
						return;
					}
					console.log("Pagamento encontrado: " + JSON.stringify(resultado));
					res.status(200).json(resultado);
				});
			} else {
				console.log('Hit - '+JSON.stringify(retorno));
				res.json(retorno);
			}
		});


		
	});

	app.put('/pagamentos/pagamento/:id', function(req, res){
		var pagamento = {};
		var id = req.params.id;
		pagamento.id = id;
		pagamento.status = 'CONFIRMADO';

		var connection = app.persistence.connectionFactory();
		var pagamentoDao = new app.persistence.PagamentoDao(connection);

		pagamentoDao.atualiza(pagamento, function(erro, resulado){
			if(erro){
				res.status(500).send(erro);
				return;
			}
			
			console.log("Pagamento confirmado");
			res.status(200).send(pagamento);
		});

	});

	app.delete('/pagamentos/pagamento/:id', function(req, res){
		var pagamento = {};
		var id = req.params.id;
		pagamento.id = id;
		pagamento.status = 'CANCELADO';

		var connection = app.persistence.connectionFactory();
		var pagamentoDao = new app.persistence.PagamentoDao(connection);

		pagamentoDao.atualiza(pagamento, function(erro, resulado){
			if(erro){
				res.status(500).send(erro);
				return;
			}
			console.log("Pagamento cancelado");
			res.status(204).send(pagamento);
		});

	});

	app.post('/pagamentos/pagamento', function(req, res){

		req.assert("pagamento.forma_de_pagamento",
		"A forma de pagamento é obrigatória!")
		.notEmpty();

		req.assert("pagamento.valor",
		"O valor é obrigatório e deve ser um decimal!")
		.notEmpty()
		.isFloat();

		var erros = req.validationErrors();
		if(erros){
			console.log("Erros de validação encontrados");
			res.status(400).send(erros);
			return;
		}
		var pagamento = req.body["pagamento"];
		console.log("Processando requisição de um novo pagamento!");
		//res.send("Pagamento Recebido!");
		pagamento.status = 'CRIADO';
		pagamento.data = new Date();


		var connection = app.persistence.connectionFactory();
		var pagamentoDao = new app.persistence.PagamentoDao(connection);
		

		pagamentoDao.salva(pagamento, function(erro, resultado){
			console.log(erro);
			if(erro){
				console.log("Erro ao salvar no banco de dados:"+erro);
				res.status(500).send(erro);
			} else {
				console.log("Pagamento criado");

				var memcachedclient = app.servicos.memcachedClient();
				
				pagamento.id = resultado.insertId;

				memcachedclient.set('pagamento-'+pagamento.id, pagamento, 60000, function(erro){
					console.log("Nova chave adicionada ao cache!"+pagamento.id);
				});




				if(pagamento.forma_de_pagamento=='cartao'){
					var cartao = req.body["cartao"];
					console.log(cartao);
					var clienteCartoes = new app.servicos.clienteCartoes();

					clienteCartoes.autoriza(cartao, function(error, request, response, retorno){
						if(error){
							console.log(error);
							res.status(400).send(error);
							return;
						}
					    console.log('consumindo servico de cartoes');
					    console.log(retorno);






					var response = {
					dados_do_pagamento : pagamento,
					cartao:retorno,
					links: [
						{
							href:'http://localhost:3000/pagamentos/pagamento/'+pagamento.id,
							rel:'Confirmar',
							method:'PUT'
						},
						
						{
							href:'http://localhost:3000/pagamentos/pagamento/'+pagamento.id,
							rel:'Cancelar',
							method:'DELETE'
							}
						]
					};

					res.location('/pagamentos/pagamento/'+pagamento.id);



						res.status(201).json(response);
					});

					return;
				} else {
					var response = {
					dados_do_pagamento : pagamento,
					links: [
						{
							href:'http://localhost:3000/pagamentos/pagamento/'+pagamento.id,
							rel:'Confirmar',
							method:'PUT'
						},
						
						{
							href:'http://localhost:3000/pagamentos/pagamento/'+pagamento.id,
							rel:'Cancelar',
							method:'DELETE'
							}
						]
					};

					res.location('/pagamentos/pagamento/'+pagamento.id);
					res.status(201).json(response);
				}


				
			}
		});

		
	});
}