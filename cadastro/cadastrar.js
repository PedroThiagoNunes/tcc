
const formulario = document.getElementById("cadastroForm");

formulario.addEventListener("submit", function(event) {

    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    const mensagemErro = document.getElementById("mensagemErro");

    if (senha !== confirmarSenha) {

        event.preventDefault();

        mensagemErro.textContent = "As senhas não coincidem!";

    } else {

        mensagemErro.textContent = "";

        // Aqui o cadastro poderá prosseguir.

    }

});

function Cadastrar(){


    
}