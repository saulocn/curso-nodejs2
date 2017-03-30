var restify = require('restify');



CartoesClient.prototype.autoriza = function(cartao , callback) {
    this._cliente.post('/cartoes/autoriza', cartao, callback);
}


function CartoesClient() {
    this._cliente = restify.createJsonClient({
	    url:'http://localhost:3001'
	});
}


module.exports = function(){
	return CartoesClient;
};