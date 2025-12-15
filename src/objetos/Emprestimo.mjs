export default class Emprestimo {
    #dataEmprestimo;
    #dataDevolucao;
    #idAluno;
    #idLivro;

    // Adicione propriedades adicionais necessárias
    #dataDevolucaoPrevista;
    #dataDevolucaoReal;
    #status;
    #id;

    constructor() {
        this.#status = 'ativo'; // valor padrão
        this.#id = ''; // id do empréstimo
    }

    // Métodos originais
    setDataEmprestimo(dataEmprestimo) {
        this.#dataEmprestimo = dataEmprestimo;
    }

    getDataEmprestimo() {
        return this.#dataEmprestimo;
    }

    setDataDevolucao(dataDevolucao) {
        this.#dataDevolucao = dataDevolucao;
    }

    getDataDevolucao() {
        return this.#dataDevolucao;
    }

    setIdAluno(idAluno) {
        this.#idAluno = idAluno;
    }

    getIdAluno() {
        return this.#idAluno;
    }

    setIdLivro(idLivro) {
        this.#idLivro = idLivro;
    }

    getIdLivro() {
        return this.#idLivro;
    }

    // Novos métodos para compatibilidade
    setDataDevolucaoPrevista(dataDevolucaoPrevista) {
        this.#dataDevolucaoPrevista = dataDevolucaoPrevista;
    }

    getDataDevolucaoPrevista() {
        return this.#dataDevolucaoPrevista;
    }

    setDataDevolucaoReal(dataDevolucaoReal) {
        this.#dataDevolucaoReal = dataDevolucaoReal;
    }

    getDataDevolucaoReal() {
        return this.#dataDevolucaoReal;
    }

    setStatus(status) {
        this.#status = status;
    }

    getStatus() {
        return this.#status;
    }

    setId(id) {
        this.#id = id;
    }

    getId() {
        return this.#id;
    }

    // Método para converter para o formato do MongoDB
    toMongoFormat() {
        return {
            usuario: this.#idAluno,  // No MongoDB usa 'usuario' em vez de 'idAluno'
            livro: this.#idLivro,
            dataEmprestimo: this.#dataEmprestimo,
            dataDevolucaoPrevista: this.#dataDevolucaoPrevista,
            dataDevolucaoReal: this.#dataDevolucaoReal,
            status: this.#status,
            _id: this.#id || undefined
        };
    }

    // Método estático para criar a partir do formato do MongoDB
    static fromMongoFormat(mongoData) {
        const emprestimo = new Emprestimo();
        
        emprestimo.setId(mongoData._id);
        emprestimo.setIdAluno(mongoData.usuario); // MongoDB usa 'usuario'
        emprestimo.setIdLivro(mongoData.livro);
        emprestimo.setDataEmprestimo(mongoData.dataEmprestimo);
        emprestimo.setDataDevolucaoPrevista(mongoData.dataDevolucaoPrevista);
        emprestimo.setDataDevolucaoReal(mongoData.dataDevolucaoReal);
        emprestimo.setStatus(mongoData.status);
        
        return emprestimo;
    }

    // Método para criar a partir do formulário
    static fromFormData(formData) {
        const emprestimo = new Emprestimo();
        
        // Mapeia os campos do formulário para os campos da classe
        emprestimo.setIdAluno(formData.alunosSelecionados); // Do campo 'alunosSelecionados' do formulário
        emprestimo.setIdLivro(formData.livrosSelecionados); // Do campo 'livrosSelecionados' do formulário
        
        // Define as datas
        const agora = new Date();
        emprestimo.setDataEmprestimo(agora.toISOString());
        
        // 15 dias a partir de hoje
        const devolucaoPrevista = new Date(agora);
        devolucaoPrevista.setDate(devolucaoPrevista.getDate() + 15);
        emprestimo.setDataDevolucaoPrevista(devolucaoPrevista.toISOString());
        
        emprestimo.setStatus('ativo');
        
        return emprestimo;
    }
}