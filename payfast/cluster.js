var cluster = require('cluster');
var os = require('os');


var cpus = os.cpus();
//console.log(cpus);
console.log("Executando thread!");

if(cluster.isMaster){
    console.log("Executando a thread master!");

    cpus.forEach(function(){
        cluster.fork();
    });

    cluster.on('listening', function(worker){
        console.log('Cluster conectado: '+ worker.process.pid);
    });

    cluster.on('exit', worker => {
        console.log('Cluster %d desconectado!', worker.process.pid);
        cluster.fork();
    })

    
} else {
    //console.log("Executando a thread slave!");
    require('./index.js');
}



