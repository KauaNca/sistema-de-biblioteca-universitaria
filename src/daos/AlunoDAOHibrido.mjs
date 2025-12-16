// daos/AlunosDAOHibrido.mjs
import Aluno from "../objetos/Aluno.mjs";

export default class AlunosDAOHibrido {
  constructor(id = null) {
    this.backendUrl =
      "https://sistema-de-biblioteca-universitaria.onrender.com/api/alunos";
    this.localStorageKey = "alunos_biblioteca";
    this.cache = [];
    this.useBackend = true; // Flag para controlar qual usar
    this.backendAvailable = true; // Começa assumindo que backend está disponível

    if (id) {
      this.buscarPorId(id);
    }
  }

  // 🔹 Verifica se backend está disponível
  async verificarBackend() {
    try {
      const response = await fetch(this.backendUrl, { method: "GET" });
      this.backendAvailable = response.ok;
      return response.ok;
    } catch (error) {
      this.backendAvailable = false;
      return false;
    }
  }

  // 🔹 Tenta backend, se falhar usa localStorage
  async carregarAlunos() {
    // Tenta backend primeiro
    if (this.backendAvailable) {
      try {
        const response = await fetch(this.backendUrl);

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            this.cache = result.data.map((aluno) => this.mapAluno(aluno));

            // Sincroniza localStorage com dados do backend
            this.salvarNoLocalStorage(this.cache);

            console.log("✅ Dados carregados do backend");
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
        "📂 Dados carregados do localStorage:",
        this.cache.length,
        "alunos"
      );
      return this.cache;
    } catch (error) {
      console.error("❌ Erro ao carregar do localStorage:", error);
      this.cache = [];
      return [];
    }
  }

  // 🔹 Salva no localStorage
  salvarNoLocalStorage(alunos) {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(alunos));
    } catch (error) {
      console.error("❌ Erro ao salvar no localStorage:", error);
    }
  }

  // 🔹 Salva aluno (tenta backend primeiro)
  async salvarAluno(aluno) {
    const alunoData = this.toBackendFormat(aluno);

    // Tenta backend
    if (this.backendAvailable) {
      try {
        const response = await fetch(this.backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(alunoData),
        });

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            const novoAluno = this.mapAluno(result.data);
            this.cache.push(novoAluno);

            // Atualiza localStorage também
            this.salvarNoLocalStorage(this.cache);

            console.log("✅ Aluno salvo no backend");
            return novoAluno;
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou, salvando localmente...");
        this.backendAvailable = false;
      }
    }

    // Fallback: salva no localStorage
    return this.salvarLocalmente(alunoData);
  }

  // 🔹 Salva localmente (localStorage)
  salvarLocalmente(alunoData) {
    // Gera ID local se não tiver
    if (!alunoData.id) {
      alunoData.id =
        "local_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    }

    const novoAluno = this.mapAluno(alunoData);
    this.cache.push(novoAluno);
    this.salvarNoLocalStorage(this.cache);

    console.log("💾 Aluno salvo localmente (ID:", alunoData.id, ")");
    return novoAluno;
  }

  // 🔹 Atualiza aluno
  async atualizarAluno(id, dados) {
    const alunoData = this.toBackendFormat(dados);

    // Tenta backend
    if (this.backendAvailable && !id.startsWith("local_")) {
      try {
        const response = await fetch(`${this.backendUrl}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(alunoData),
        });

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            const alunoAtualizado = this.mapAluno(result.data);

            // Atualiza no cache
            const index = this.cache.findIndex((a) => a.id === id);
            if (index !== -1) {
              this.cache[index] = alunoAtualizado;
            }

            // Atualiza localStorage
            this.salvarNoLocalStorage(this.cache);

            console.log("✅ Aluno atualizado no backend");
            return alunoAtualizado;
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou, atualizando localmente...");
        this.backendAvailable = false;
      }
    }

    // Fallback: atualiza localmente
    return this.atualizarLocalmente(id, alunoData);
  }

  // 🔹 Atualiza localmente
  atualizarLocalmente(id, alunoData) {
    const index = this.cache.findIndex((a) => a.id === id);

    if (index !== -1) {
      const alunoAtualizado = {
        ...this.cache[index],
        ...alunoData,
        id: id, // Mantém o ID original
      };

      this.cache[index] = alunoAtualizado;
      this.salvarNoLocalStorage(this.cache);

      console.log("📝 Aluno atualizado localmente");
      return alunoAtualizado;
    }

    console.error("❌ Aluno não encontrado para atualização");
    return null;
  }

  // 🔹 Exclui aluno
  async excluirAluno(id) {
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
            this.cache = this.cache.filter((a) => a.id !== id);

            // Atualiza localStorage
            this.salvarNoLocalStorage(this.cache);

            console.log("✅ Aluno excluído do backend");
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
    this.cache = this.cache.filter((a) => a.id !== id);

    if (this.cache.length < inicialLength) {
      this.salvarNoLocalStorage(this.cache);
      console.log("🗑️ Aluno excluído localmente");
      return true;
    }

    console.error("❌ Aluno não encontrado para exclusão");
    return false;
  }

  // 🔹 Busca por ID
  async buscarPorId(id) {
    // Tenta cache primeiro
    const cacheAluno = this.cache.find((a) => a.id === id);
    if (cacheAluno) return cacheAluno;

    // Tenta backend (se não for ID local)
    if (this.backendAvailable && !id.startsWith("local_")) {
      try {
        const response = await fetch(`${this.backendUrl}/${id}`);

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            const aluno = this.mapAluno(result.data);
            this.cache.push(aluno);
            return aluno;
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou na busca por ID");
      }
    }

    // Tenta localStorage
    const localAlunos = this.carregarDoLocalStorage();
    const localAluno = localAlunos.find((a) => a.id === id);

    return localAluno || null;
  }

  // 🔹 Converte para formato do backend
  toBackendFormat(aluno) {
    return {
      nome: aluno.nome ?? aluno.getNome?.(),
      email: aluno.email ?? aluno.getEmail?.(),
      matricula: aluno.matricula ?? aluno.getMatricula?.(),
      curso: aluno.curso ?? aluno.getCurso?.(),
      telefone: aluno.telefone ?? aluno.getTelefone?.(),
      status: aluno.status ?? "ativo",
    };
  }

  // 🔹 Mapeia dados do backend/local para formato frontend
  mapAluno(aluno) {
    // Se for do backend (MongoDB)
    if (aluno._id) {
      return {
        id: aluno._id,
        nome: aluno.nome,
        email: aluno.email,
        matricula: aluno.matricula,
        curso: aluno.curso || "",
        telefone: aluno.telefone
          ? aluno.telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3")
          : "",

        dataCadastro: aluno.dataCadastro || new Date().toISOString(),
        status: aluno.status || "ativo",
        __v: aluno.__v || 0,
      };
    }

    // Se for local
    return {
      id: aluno.id,
      nome: aluno.nome,
      email: aluno.email,
      matricula: aluno.matricula,
      curso: aluno.curso || "",
      telefone: aluno.telefone || "",
      dataCadastro: aluno.dataCadastro || new Date().toISOString(),
      status: aluno.status || "ativo",
      __v: aluno.__v || 0,
    };
  }

  // 🔹 Lista alunos (síncrono - do cache)
  listar() {
    return this.cache;
  }

  // 🔹 Sincroniza dados locais com backend (quando disponível)
  async sincronizar() {
    if (!this.backendAvailable) {
      console.log("Backend indisponível para sincronização");
      return false;
    }

    const localAlunos = this.carregarDoLocalStorage();
    const alunosLocaisNaoSincronizados = localAlunos.filter((a) =>
      a.id.startsWith("local_")
    );

    if (alunosLocaisNaoSincronizados.length === 0) {
      console.log("✅ Nenhum dado local para sincronizar");
      return true;
    }

    console.log(
      `🔄 Sincronizando ${alunosLocaisNaoSincronizados.length} alunos locais...`
    );

    try {
      for (const alunoLocal of alunosLocaisNaoSincronizados) {
        // Remove o prefixo 'local_' para enviar ao backend
        const { id, __v, dataCadastro, ...alunoLimpo } = alunoLocal;

        const response = await fetch(this.backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(alunoLimpo),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Remove do localStorage após sincronizar
            this.excluirLocalmente(alunoLocal.id);
            console.log(`✅ Aluno ${alunoLocal.nome} sincronizado`);
          }
        }
      }

      // Recarrega dados atualizados do backend
      await this.carregarAlunos();

      console.log("🎉 Sincronização concluída!");
      return true;
    } catch (error) {
      console.error("❌ Erro na sincronização:", error);
      return false;
    }
  }
}
