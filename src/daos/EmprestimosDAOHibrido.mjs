import Emprestimo from "../objetos/Emprestimo.mjs";
// daos/EmprestimosDAOHibrido.mjs
export default class EmprestimosDAOHibrido {
  constructor(id = null) {
    this.backendUrl =
      "https://sistema-de-biblioteca-universitaria.onrender.com/api/emprestimos";
    this.localStorageKey = "emprestimos_biblioteca";
    this.cache = [];
    this.backendAvailable = true;

    if (id) {
      this.buscarPorId(id);
    }
  }

  // 🔹 Verifica se backend está disponível
  async verificarBackend() {
    try {
      const response = await fetch(this.backendUrl, { method: "HEAD" });
      this.backendAvailable = response.ok;
      return response.ok;
    } catch (error) {
      this.backendAvailable = false;
      return false;
    }
  }

  // 🔹 Carrega empréstimos (tenta backend primeiro)
  async carregarEmprestimos() {
    // Tenta backend
    if (this.backendAvailable) {
      try {
        const response = await fetch(this.backendUrl);

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            this.cache = result.data.map((emprestimo) =>
              this.mapEmprestimo(emprestimo)
            );

            // Sincroniza localStorage
            this.salvarNoLocalStorage(this.cache);

            console.log("✅ Empréstimos carregados do backend");
            return this.cache;
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend indisponível, usando localStorage...");
        this.backendAvailable = false;
      }
    }

    // Fallback para localStorage
    return this.carregarDoLocalStorage();
  }

  // 🔹 Carrega do localStorage
  carregarDoLocalStorage() {
    try {
      const dados = localStorage.getItem(this.localStorageKey);
      this.cache = dados ? JSON.parse(dados) : [];
      console.log(
        "📂 Empréstimos carregados do localStorage:",
        this.cache.length,
        "empréstimos"
      );
      return this.cache;
    } catch (error) {
      console.error("❌ Erro ao carregar do localStorage:", error);
      this.cache = [];
      return [];
    }
  }

  // 🔹 Salva no localStorage
  salvarNoLocalStorage(emprestimos) {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(emprestimos));
    } catch (error) {
      console.error("❌ Erro ao salvar no localStorage:", error);
    }
  }

  // 🔹 Salva empréstimo
  async salvarEmprestimo(emprestimo) {
    console.log("📝 Iniciando salvamento de empréstimo:", emprestimo);

    // Normaliza os dados para o formato do backend
    const emprestimoData = this.toBackendFormat(emprestimo);
    console.log("📦 Dados normalizados para backend:", emprestimoData);

    // Tenta backend primeiro
    if (this.backendAvailable) {
      try {
        console.log("🌐 Tentando conectar ao backend...");

        const response = await fetch(this.backendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(emprestimoData),
        });

        console.log(
          "📡 Resposta do backend:",
          response.status,
          response.statusText
        );

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Resposta JSON do backend:", result);

          if (result.success && result.data) {
            const novoEmprestimo = this.mapEmprestimo(result.data);
            this.cache.push(novoEmprestimo);

            // Atualiza localStorage
            this.salvarNoLocalStorage(this.cache);

            console.log("✅ Empréstimo salvo no backend:", novoEmprestimo);
            return novoEmprestimo;
          } else {
            console.error("❌ Backend retornou success=false:", result);
          }
        } else {
          console.error("❌ Erro HTTP do backend:", response.status);
          const errorText = await response.text();
          console.error("❌ Detalhes do erro:", errorText);
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou, salvando localmente...", error);
        this.backendAvailable = false;
      }
    }

    // Fallback: salva localmente
    console.log("💾 Salvando localmente...");
    return this.salvarLocalmente(emprestimoData);
  }

  toBackendFormat(emprestimo) {
    console.log("🔄 Convertendo para formato do backend:", emprestimo);

    // Se vier do formulário (Caixa.jsx)
    if (emprestimo.alunosSelecionados && emprestimo.livrosSelecionados) {
      console.log("📋 Formato: Dados do formulário");
      return {
        usuario: emprestimo.alunosSelecionados,
        livro: emprestimo.livrosSelecionados,
        dataEmprestimo: new Date().toISOString(),
        dataDevolucaoPrevista: this.calcularDataPrevista(),
        status: "ativo",
      };
    }

    // Se já estiver no formato correto
    if (emprestimo.usuario && emprestimo.livro) {
      console.log("📋 Formato: Já formatado");
      return emprestimo;
    }

    // Formato padrão
    console.log("📋 Formato: Padrão");
    return {
      usuario: emprestimo.idAluno || emprestimo.aluno,
      livro: emprestimo.idLivro || emprestimo.livro,
      dataEmprestimo: emprestimo.dataEmprestimo || new Date().toISOString(),
      dataDevolucaoPrevista:
        emprestimo.dataDevolucaoPrevista || this.calcularDataPrevista(),
      status: emprestimo.status || "ativo",
    };
  }

  // 🔹 Salva localmente
  salvarLocalmente(emprestimoData) {
    // Gera ID local
    if (!emprestimoData.id) {
      emprestimoData.id =
        "local_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    }

    const novoEmprestimo = this.mapEmprestimo(emprestimoData);
    this.cache.push(novoEmprestimo);
    this.salvarNoLocalStorage(this.cache);

    console.log("💾 Empréstimo salvo localmente");
    return novoEmprestimo;
  }

  // 🔹 Atualiza empréstimo (devolução)
  async atualizarEmprestimo(id, dados) {
    const emprestimoData = this.toBackendFormat(dados);

    // Tenta backend
    if (this.backendAvailable && !id.startsWith("local_")) {
      try {
        const response = await fetch(`${this.backendUrl}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emprestimoData),
        });

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            const emprestimoAtualizado = this.mapEmprestimo(result.data);

            // Atualiza cache
            const index = this.cache.findIndex((e) => e.id === id);
            if (index !== -1) {
              this.cache[index] = emprestimoAtualizado;
            }

            // Atualiza localStorage
            this.salvarNoLocalStorage(this.cache);

            console.log("✅ Empréstimo atualizado no backend");
            return emprestimoAtualizado;
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou, atualizando localmente...");
        this.backendAvailable = false;
      }
    }

    // Fallback: atualiza localmente
    return this.atualizarLocalmente(id, emprestimoData);
  }

  // 🔹 Atualiza localmente
  atualizarLocalmente(id, emprestimoData) {
    const index = this.cache.findIndex((e) => e.id === id);

    if (index !== -1) {
      const emprestimoAtualizado = {
        ...this.cache[index],
        ...emprestimoData,
        id: id,
      };

      this.cache[index] = emprestimoAtualizado;
      this.salvarNoLocalStorage(this.cache);

      console.log("📝 Empréstimo atualizado localmente");
      return emprestimoAtualizado;
    }

    console.error("❌ Empréstimo não encontrado");
    return null;
  }

  // 🔹 Registra devolução
  async devolverEmprestimo(id) {
    const emprestimo = this.cache.find((e) => e.id === id);

    if (!emprestimo) {
      console.error("❌ Empréstimo não encontrado");
      return false;
    }

    const dadosAtualizados = {
      ...emprestimo,
      dataDevolucaoReal: new Date().toISOString(),
      pendente: false,
      status: "devolvido",
    };

    // Remove campos específicos do frontend antes de enviar
    delete dadosAtualizados.id;
    delete dadosAtualizados.isLocal;
    delete dadosAtualizados.livroNome;
    delete dadosAtualizados.alunoNome;

    // Tenta backend
    if (this.backendAvailable && !id.startsWith("local_")) {
      try {
        const response = await fetch(`${this.backendUrl}/${id}/devolver`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dataDevolucaoReal: new Date().toISOString(),
            status: "devolvido",
          }),
        });

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            // Atualiza cache
            const index = this.cache.findIndex((e) => e.id === id);
            if (index !== -1) {
              this.cache[index] = this.mapEmprestimo(result.data);
            }

            // Atualiza localStorage
            this.salvarNoLocalStorage(this.cache);

            console.log("✅ Devolução registrada no backend");
            return true;
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou, devolvendo localmente...");
        this.backendAvailable = false;
      }
    }

    // Fallback: devolve localmente
    return this.devolverLocalmente(id);
  }

  // 🔹 Devolve localmente
  devolverLocalmente(id) {
    const index = this.cache.findIndex((e) => e.id === id);

    if (index !== -1) {
      this.cache[index] = {
        ...this.cache[index],
        dataDevolucaoReal: new Date().toISOString(),
        pendente: false,
        status: "devolvido",
      };

      this.salvarNoLocalStorage(this.cache);
      console.log("📚 Devolução registrada localmente");
      return true;
    }

    console.error("❌ Empréstimo não encontrado para devolução");
    return false;
  }

  // 🔹 Exclui empréstimo
  async excluirEmprestimo(id) {
    // Tenta backend
    if (this.backendAvailable && !id.startsWith("local_")) {
      try {
        const response = await fetch(`${this.backendUrl}/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            // Remove do cache
            this.cache = this.cache.filter((e) => e.id !== id);

            // Atualiza localStorage
            this.salvarNoLocalStorage(this.cache);

            console.log("✅ Empréstimo excluído do backend");
            return true;
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou, excluindo localmente...");
        this.backendAvailable = false;
      }
    }

    // Fallback: exclui localmente
    return this.excluirLocalmente(id);
  }

  // 🔹 Exclui localmente
  excluirLocalmente(id) {
    const inicialLength = this.cache.length;
    this.cache = this.cache.filter((e) => e.id !== id);

    if (this.cache.length < inicialLength) {
      this.salvarNoLocalStorage(this.cache);
      console.log("🗑️ Empréstimo excluído localmente");
      return true;
    }

    console.error("❌ Empréstimo não encontrado");
    return false;
  }

  // 🔹 Busca por ID
  async buscarPorId(id) {
    // Tenta cache primeiro
    const cacheEmprestimo = this.cache.find((e) => e.id === id);
    if (cacheEmprestimo) return cacheEmprestimo;

    // Tenta backend
    if (this.backendAvailable && !id.startsWith("local_")) {
      try {
        const response = await fetch(`${this.backendUrl}/${id}`);

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            const emprestimo = this.mapEmprestimo(result.data);
            this.cache.push(emprestimo);
            return emprestimo;
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou na busca por ID");
      }
    }

    // Tenta localStorage
    const localEmprestimos = this.carregarDoLocalStorage();
    const localEmprestimo = localEmprestimos.find((e) => e.id === id);

    return localEmprestimo || null;
  }

  // 🔹 Busca empréstimos por aluno
  async buscarPorAluno(alunoId) {
    // Tenta backend
    if (this.backendAvailable) {
      try {
        const response = await fetch(`${this.backendUrl}/aluno/${alunoId}`);

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            return result.data.map((emprestimo) =>
              this.mapEmprestimo(emprestimo)
            );
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou na busca por aluno");
      }
    }

    // Fallback: busca localmente
    return this.cache.filter(
      (e) => e.idAluno === alunoId || e.aluno?._id === alunoId
    );
  }

  // 🔹 Busca empréstimos pendentes
  async buscarPendentes() {
    // Tenta backend
    if (this.backendAvailable) {
      try {
        const response = await fetch(`${this.backendUrl}?status=ativo`);

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            return result.data.map((emprestimo) =>
              this.mapEmprestimo(emprestimo)
            );
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou na busca por pendentes");
      }
    }

    // Fallback: busca localmente
    return this.cache.filter(
      (e) =>
        e.pendente === true || e.status === "ativo" || e.status === "atrasado"
    );
  }

  // 🔹 Formato para backend
  toBackendFormat(emprestimo) {
    if (!emprestimo) return {};

    // Se já estiver no formato correto
    if (emprestimo.livro && emprestimo.aluno) {
      return {
        livro: emprestimo.livro || emprestimo.idLivro,
        usuario: emprestimo.aluno || emprestimo.idAluno,
        dataEmprestimo: emprestimo.dataEmprestimo || new Date().toISOString(),
        dataDevolucaoPrevista:
          emprestimo.dataDevolucaoPrevista || this.calcularDataPrevista(),
        status: emprestimo.status || "ativo",
      };
    }

    // Se for dos selects do frontend
    if (emprestimo.livrosSelecionados && emprestimo.alunosSelecionados) {
      return {
        livro: emprestimo.livrosSelecionados,
        usuario: emprestimo.alunosSelecionados,
        dataEmprestimo: new Date().toISOString(),
        dataDevolucaoPrevista: this.calcularDataPrevista(),
        status: "ativo",
      };
    }

    // Formato padrão
    return {
      livro: emprestimo.idLivro || emprestimo.livro,
      usuario: emprestimo.idAluno || emprestimo.aluno,
      dataEmprestimo: emprestimo.dataEmprestimo || new Date().toISOString(),
      dataDevolucaoPrevista:
        emprestimo.dataDevolucaoPrevista || this.calcularDataPrevista(),
      status: emprestimo.status || "ativo",
    };
  }

  // 🔹 Calcula data de devolução prevista (15 dias)
  calcularDataPrevista() {
    const data = new Date();
    data.setDate(data.getDate() + 15);
    return data.toISOString();
  }

  mapEmprestimo(emprestimo) {
    console.log("🗺️ Mapeando empréstimo:", emprestimo);

    // Backend (MongoDB) - formato principal
    if (emprestimo._id) {
      console.log("🗺️ Formato: MongoDB");
      return {
        id: emprestimo._id,
        idLivro: emprestimo.livro?._id || emprestimo.livro,
        idAluno: emprestimo.usuario?._id || emprestimo.usuario,
        livroNome: emprestimo.livro?.titulo || "",
        alunoNome: emprestimo.usuario?.nome || "",
        dataEmprestimo: emprestimo.dataEmprestimo,
        dataDevolucaoPrevista: emprestimo.dataDevolucaoPrevista,
        dataDevolucaoReal: emprestimo.dataDevolucaoReal,
        status: emprestimo.status || "ativo",
        pendente:
          !emprestimo.dataDevolucaoReal && emprestimo.status !== "devolvido",
        __v: emprestimo.__v || 0,
      };
    }

    // Dados locais ou do formulário
    console.log("🗺️ Formato: Local/Formulário");
    return {
      id:
        emprestimo.id ||
        `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      idLivro:
        emprestimo.livrosSelecionados || emprestimo.idLivro || emprestimo.livro,
      idAluno:
        emprestimo.alunosSelecionados || emprestimo.idAluno || emprestimo.aluno,
      dataEmprestimo: emprestimo.dataEmprestimo || new Date().toISOString(),
      dataDevolucaoPrevista:
        emprestimo.dataDevolucaoPrevista || this.calcularDataPrevista(),
      dataDevolucaoReal: emprestimo.dataDevolucaoReal || null,
      status: emprestimo.status || "ativo",
      pendente: true,
    };
  }

  // 🔹 Lista empréstimos (síncrono)
  listar() {
    return this.cache;
  }

  // 🔹 Sincroniza dados locais
  async sincronizar() {
    if (!this.backendAvailable) {
      console.log("Backend indisponível para sincronização");
      return false;
    }

    const localEmprestimos = this.carregarDoLocalStorage();
    const emprestimosLocaisNaoSincronizados = localEmprestimos.filter((e) =>
      e.id.startsWith("local_")
    );

    if (emprestimosLocaisNaoSincronizados.length === 0) {
      console.log("✅ Nenhum empréstimo local para sincronizar");
      return true;
    }

    console.log(
      `🔄 Sincronizando ${emprestimosLocaisNaoSincronizados.length} empréstimos locais...`
    );

    try {
      for (const emprestimoLocal of emprestimosLocaisNaoSincronizados) {
        const emprestimoParaEnviar = { ...emprestimoLocal };
        delete emprestimoParaEnviar.id;
        delete emprestimoParaEnviar.livroNome;
        delete emprestimoParaEnviar.alunoNome;

        const response = await fetch(this.backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emprestimoParaEnviar),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            this.excluirLocalmente(emprestimoLocal.id);
            console.log(
              `✅ Empréstimo do livro "${emprestimoLocal.livroNome}" sincronizado`
            );
          }
        }
      }

      await this.carregarEmprestimos();
      console.log("🎉 Sincronização de empréstimos concluída!");
      return true;
    } catch (error) {
      console.error("❌ Erro na sincronização:", error);
      return false;
    }
  }
}
