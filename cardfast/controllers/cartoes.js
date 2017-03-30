module.exports = function(app){ 
	app.post('/cartoes/autoriza', function(req, res){
		console.log("Processando pagamento com cartão");
		var cartao = req.body;
		req.assert("numero", "Número é obrigatorio e precisa ter 16 caracteres!")
		.notEmpty()
		.len(16,16);
		req.assert("bandeira", "Bandeira é obrigatoria!")
		.notEmpty();
		req.assert("ano_de_expiracao", "O Ano de expiração é obrigatório e deve ter 4 caracteres!")
		.notEmpty()
		.len(4,4);
		req.assert("mes_de_expiracao", "O Mês de expiração é obrigatório e deve ter 2 caracteres!")
		.notEmpty()
		.len(2,2);
		req.assert("cvv", "O CVV de expiração é obrigatório e deve ter 3 caracteres!")
		.notEmpty()
		.len(3,3);

		var erros = req.validationErrors();
		if(erros){
			console.log("Erros de validação encontrados");
			res.status(400).send(erros);
			return;
		}

		cartao.status = 'AUTORIZADO';
		
		var response = {
			dados_do_cartao: cartao,
		}
		res.status(201).json(response);
		return;
	});

	
}