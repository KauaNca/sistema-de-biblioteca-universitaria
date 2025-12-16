// daos/AutoresDAOHibrido.mjs
export default class AutoresDAOHibrido {
  constructor(id = null) {
    this.backendUrl =
      "https://sistema-de-biblioteca-universitaria.onrender.com/api/autores";
    this.localStorageKey = "autores_biblioteca";
    this.cache = [];
    this.backendAvailable = true;

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

  // 🔹 Carrega autores (tenta backend primeiro)
  async carregarAutores() {
    // Tenta backend
    if (this.backendAvailable) {
      try {
        const response = await fetch(this.backendUrl);

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            this.cache = result.data.map((autor) => this.mapAutor(autor));

            // Sincroniza localStorage
            this.salvarNoLocalStorage(this.cache);

            console.log("✅ Autores carregados do backend");
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
        "📂 Autores carregados do localStorage:",
        this.cache.length,
        "autores"
      );
      return this.cache;
    } catch (error) {
      console.error("❌ Erro ao carregar do localStorage:", error);
      this.cache = [];
      return [];
    }
  }

  // 🔹 Salva no localStorage
  salvarNoLocalStorage(autores) {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(autores));
    } catch (error) {
      console.error("❌ Erro ao salvar no localStorage:", error);
    }
  }

  // 🔹 Salva autor
  async salvarAutor(autor) {
    const autorData = this.toBackendFormat(autor);

    // Tenta backend
    if (this.backendAvailable) {
      try {
        const response = await fetch(this.backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(autorData),
        });

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            const novoAutor = this.mapAutor(result.data);
            this.cache.push(novoAutor);

            // Atualiza localStorage
            this.salvarNoLocalStorage(this.cache);

            console.log("✅ Autor salvo no backend");
            return novoAutor;
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou, salvando localmente...");
        this.backendAvailable = false;
      }
    }

    // Fallback: salva localmente
    return this.salvarLocalmente(autorData);
  }

  // 🔹 Salva localmente
  salvarLocalmente(autorData) {
    // Gera ID local
    if (!autorData.id) {
      autorData.id =
        "local_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    }

    const novoAutor = this.mapAutor(autorData);
    this.cache.push(novoAutor);
    this.salvarNoLocalStorage(this.cache);

    console.log("💾 Autor salvo localmente");
    return novoAutor;
  }

  // 🔹 Atualiza autor
  async atualizarAutor(id, dados) {
    const autorData = this.toBackendFormat(dados);

    // Tenta backend
    if (this.backendAvailable && !id.startsWith("local_")) {
      try {
        const response = await fetch(`${this.backendUrl}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(autorData),
        });

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            const autorAtualizado = this.mapAutor(result.data);

            // Atualiza cache
            const index = this.cache.findIndex((a) => a.id === id);
            if (index !== -1) {
              this.cache[index] = autorAtualizado;
            }

            // Atualiza localStorage
            this.salvarNoLocalStorage(this.cache);

            console.log("✅ Autor atualizado no backend");
            return autorAtualizado;
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou, atualizando localmente...");
        this.backendAvailable = false;
      }
    }

    // Fallback: atualiza localmente
    return this.atualizarLocalmente(id, autorData);
  }

  // 🔹 Atualiza localmente
  atualizarLocalmente(id, autorData) {
    const index = this.cache.findIndex((a) => a.id === id);

    if (index !== -1) {
      const autorAtualizado = {
        ...this.cache[index],
        ...autorData,
        id: id,
      };

      this.cache[index] = autorAtualizado;
      this.salvarNoLocalStorage(this.cache);

      console.log("📝 Autor atualizado localmente");
      return autorAtualizado;
    }

    console.error("❌ Autor não encontrado");
    return null;
  }

  // 🔹 Exclui autor
  async excluirAutor(id) {
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

            console.log("✅ Autor excluído do backend");
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
      console.log("🗑️ Autor excluído localmente");
      return true;
    }

    console.error("❌ Autor não encontrado");
    return false;
  }

  // 🔹 Busca por ID
  async buscarPorId(id) {
    // Tenta cache primeiro
    const cacheAutor = this.cache.find((a) => a.id === id);
    if (cacheAutor) return cacheAutor;

    // Tenta backend
    if (this.backendAvailable && !id.startsWith("local_")) {
      try {
        const response = await fetch(`${this.backendUrl}/${id}`);

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            const autor = this.mapAutor(result.data);
            this.cache.push(autor);
            return autor;
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou na busca por ID");
      }
    }

    // Tenta localStorage
    const localAutores = this.carregarDoLocalStorage();
    const localAutor = localAutores.find((a) => a.id === id);

    return localAutor || null;
  }

  // 🔹 Busca por nome
  async buscarPorNome(nome) {
    // Tenta backend
    if (this.backendAvailable) {
      try {
        const response = await fetch(
          `${this.backendUrl}/search/${encodeURIComponent(nome)}`
        );

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            return result.data.map((autor) => this.mapAutor(autor));
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou na busca por nome");
      }
    }

    // Fallback: busca localmente
    return this.cache.filter((autor) =>
      autor.nome.toLowerCase().includes(nome.toLowerCase())
    );
  }

  // 🔹 Formato para backend
  toBackendFormat(autor) {
    return {
      nome: autor.nome ?? autor.getNome?.(),
      nacionalidade: autor.nacionalidade ?? autor.getNacionalidade?.(),
      biografia: autor.biografia ?? autor.getBiografia?.(),
      dataNascimento: autor.dataNascimento ?? null,
    };
  }

  // 🔹 Mapeia dados
  mapAutor(autor) {
    return {
      id: autor._id || autor.id,
      nome: autor.nome,
      nacionalidade: autor.nacionalidade || "",
      biografia: autor.biografia || "",
      dataNascimento: autor.dataNascimento || null,
    };
  }

  // 🔹 Lista autores (síncrono)
  listar() {
    return this.cache;
  }

  // 🔹 Sincroniza dados locais
  async sincronizar() {
    if (!this.backendAvailable) {
      console.log("Backend indisponível para sincronização");
      return false;
    }

    const localAutores = this.carregarDoLocalStorage();
    const autoresLocaisNaoSincronizados = localAutores.filter((a) =>
      a.id.startsWith("local_")
    );

    if (autoresLocaisNaoSincronizados.length === 0) {
      console.log("✅ Nenhum autor local para sincronizar");
      return true;
    }

    console.log(
      `🔄 Sincronizando ${autoresLocaisNaoSincronizados.length} autores locais...`
    );

    try {
      for (const autorLocal of autoresLocaisNaoSincronizados) {
        const { id, __v, livros, isLocal, ...autorLimpo } = autorLocal;
        delete autorParaEnviar.id;

        const response = await fetch(this.backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(autorLimpo),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            this.excluirLocalmente(autorLocal.id);
            console.log(`✅ Autor ${autorLocal.nome} sincronizado`);
          }
        }
      }

      await this.carregarAutores();
      console.log("🎉 Sincronização de autores concluída!");
      return true;
    } catch (error) {
      console.error("❌ Erro na sincronização:", error);
      return false;
    }
  }
}
