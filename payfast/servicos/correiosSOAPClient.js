var soap = require('soap');

function CorreiosSoapClient() {
    this._url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx?wsdl';
}


CorreiosSoapClient.prototype.calculaPrazo = function(args, callback){
    soap.createClient(this._url, 
        function(erro, cliente){
            console.log("Cliente SOAP criado!");
            cliente.CalcPrazo(
                args,
                callback
            );
        }
    );

};



module.exports = function(){
	return CorreiosSoapClient;
};
