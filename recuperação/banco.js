// =====================================================
// "BANCO DE DADOS" LOCAL COM localStorage
// Use somente para estudo/protótipo. Não é seguro para produção.
// =====================================================

const CHAVE_USUARIOS = "vf_usuarios";
const CHAVE_SESSAO = "vf_sessao";
const CHAVE_RECUPERACAO = "vf_recuperacao";

function normalizarEmail(email) {
    return email.trim().toLowerCase();
}

// Transforma a senha em um hash SHA-256 (não guardamos a senha pura).
// Obs.: crypto.subtle só funciona em https ou em localhost (ex.: Live Server).
async function gerarHash(texto) {
    const dados = new TextEncoder().encode(texto);
    const buffer = await crypto.subtle.digest("SHA-256", dados);
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

// ---------- Usuários ----------

function lerUsuarios() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
    } catch {
        return [];
    }
}

function salvarUsuarios(lista) {
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(lista));
}

function buscarUsuario(email) {
    const emailNormalizado = normalizarEmail(email);
    return lerUsuarios().find((u) => u.email === emailNormalizado);
}

async function cadastrarUsuario(email, senha) {
    if (buscarUsuario(email)) {
        return { ok: false, mensagem: "Este e-mail já está cadastrado." };
    }

    const usuarios = lerUsuarios();
    usuarios.push({
        email: normalizarEmail(email),
        senhaHash: await gerarHash(senha)
    });
    salvarUsuarios(usuarios);

    return { ok: true, mensagem: "Cadastro realizado com sucesso!" };
}

// ---------- Login ----------

async function validarLogin(email, senha) {
    const usuario = buscarUsuario(email);

    if (!usuario) {
        return { ok: false, mensagem: "E-mail não cadastrado." };
    }

    const hashDigitado = await gerarHash(senha);

    if (hashDigitado !== usuario.senhaHash) {
        return { ok: false, mensagem: "Senha incorreta." };
    }

    return { ok: true, mensagem: "Login realizado com sucesso!" };
}

// "Lembrar-me" marcado: fica no localStorage (persiste após fechar o navegador).
// Desmarcado: fica no sessionStorage (some ao fechar a aba).
function iniciarSessao(email, lembrar) {
    const armazenamento = lembrar ? localStorage : sessionStorage;
    armazenamento.setItem(CHAVE_SESSAO, normalizarEmail(email));
}

function usuarioLogado() {
    return localStorage.getItem(CHAVE_SESSAO) || sessionStorage.getItem(CHAVE_SESSAO);
}

function encerrarSessao() {
    localStorage.removeItem(CHAVE_SESSAO);
    sessionStorage.removeItem(CHAVE_SESSAO);
}

// ---------- Recuperação de senha ----------

function gerarCodigoRecuperacao(email) {
    if (!buscarUsuario(email)) {
        return { ok: false, mensagem: "E-mail não cadastrado." };
    }

    const codigo = String(Math.floor(100000 + Math.random() * 900000));

    localStorage.setItem(CHAVE_RECUPERACAO, JSON.stringify({
        email: normalizarEmail(email),
        codigo: codigo,
        validado: false,
        expira: Date.now() + 10 * 60 * 1000 // 10 minutos
    }));

    return { ok: true, codigo: codigo, mensagem: "Código gerado." };
}

function lerRecuperacao() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_RECUPERACAO));
    } catch {
        return null;
    }
}

function validarCodigoRecuperacao(email, codigo) {
    const dados = lerRecuperacao();

    if (!dados || dados.email !== normalizarEmail(email)) {
        return { ok: false, mensagem: "Solicite um novo código." };
    }
    if (Date.now() > dados.expira) {
        localStorage.removeItem(CHAVE_RECUPERACAO);
        return { ok: false, mensagem: "Código expirado. Solicite outro." };
    }
    if (dados.codigo !== codigo) {
        return { ok: false, mensagem: "Código incorreto." };
    }

    dados.validado = true;
    localStorage.setItem(CHAVE_RECUPERACAO, JSON.stringify(dados));
    return { ok: true, mensagem: "Código validado! Defina a nova senha." };
}

async function redefinirSenha(email, novaSenha) {
    const dados = lerRecuperacao();

    if (!dados || !dados.validado || dados.email !== normalizarEmail(email)) {
        return { ok: false, mensagem: "Valide o código antes de redefinir a senha." };
    }

    const usuarios = lerUsuarios();
    const usuario = usuarios.find((u) => u.email === normalizarEmail(email));

    if (!usuario) {
        return { ok: false, mensagem: "Usuário não encontrado." };
    }

    usuario.senhaHash = await gerarHash(novaSenha);
    salvarUsuarios(usuarios);
    localStorage.removeItem(CHAVE_RECUPERACAO);

    return { ok: true, mensagem: "Senha redefinida com sucesso!" };
}
