
const formEmail = document.getElementById("formEmail");
const formCodigo = document.getElementById("formCodigo");
const formSenha = document.getElementById("formSenha");

const mensagem = document.getElementById("mensagem");

let emailUsuario = "";
let codigoValidado = "";

// ETAPA 1 - Solicitar código por e-mail
formEmail.addEventListener("submit", async (event) => {
    event.preventDefault();

    emailUsuario = document.getElementById("email").value;

    try {
        const resposta = await fetch(
            "http://localhost:3000/api/forgot-password",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: emailUsuario
                })
            }
        );

        const dados = await resposta.json();

        mensagem.textContent = dados.mensagem;

        if (resposta.ok) {
            formEmail.hidden = true;
            formCodigo.hidden = false;
        }

    } catch (erro) {
        mensagem.textContent = "Erro ao conectar com o servidor.";
    }
});


// ETAPA 2 - Validar código recebido
formCodigo.addEventListener("submit", async (event) => {
    event.preventDefault();

    const codigo = document.getElementById("codigo").value;

    try {
        const resposta = await fetch(
            "http://localhost:3000/api/verify-reset-code",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: emailUsuario,
                    codigo: codigo
                })
            }
        );

        const dados = await resposta.json();

        mensagem.textContent = dados.mensagem;

        if (resposta.ok) {
            codigoValidado = dados.token;
            formCodigo.hidden = true;
            formSenha.hidden = false;
        }

    } catch (erro) {
        mensagem.textContent = "Erro ao validar o código.";
    }
});


// ETAPA 3 - Redefinir senha
formSenha.addEventListener("submit", async (event) => {
    event.preventDefault();

    const novaSenha = document.getElementById("novaSenha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if (novaSenha !== confirmarSenha) {
        mensagem.textContent = "As senhas não são iguais.";
        return;
    }

    try {
        const resposta = await fetch(
            "http://localhost:3000/api/reset-password",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: emailUsuario,
                    token: codigoValidado,
                    novaSenha: novaSenha
                })
            }
        );

        const dados = await resposta.json();

        mensagem.textContent = dados.mensagem;

        if (resposta.ok) {
            formSenha.hidden = true;
        }

    } catch (erro) {
        mensagem.textContent = "Erro ao redefinir a senha.";
    }
});
function enviarCodigo(){
    const codigo = Number(document.getElementById("codigo").value)

    const email = document.getElementById("email").value

    if (email === )
}