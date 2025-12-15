// daos/LivrosDAOHibrido.mjs
export default class LivrosDAOHibrido {
  constructor(id = null) {
    this.backendUrl =
      "https://sistema-de-biblioteca-universitaria.onrender.com/api/livros";
    this.localStorageKey = "livros_biblioteca";
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

  // 🔹 Carrega livros (tenta backend primeiro)
  async carregarLivros() {
    // Tenta backend
    if (this.backendAvailable) {
      try {
        const response = await fetch(this.backendUrl);

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            this.cache = result.data.map((livro) => this.mapLivro(livro));

            // Sincroniza localStorage
            this.salvarNoLocalStorage(this.cache);

            console.log("✅ Livros carregados do backend");
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
        "📂 Livros carregados do localStorage:",
        this.cache.length,
        "livros"
      );
      return this.cache;
    } catch (error) {
      console.error("❌ Erro ao carregar do localStorage:", error);
      this.cache = [];
      return [];
    }
  }

  // 🔹 Salva no localStorage
  salvarNoLocalStorage(livros) {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(livros));
    } catch (error) {
      console.error("❌ Erro ao salvar no localStorage:", error);
    }
  }

  // 🔹 Salva livro
  async salvarLivro(livro) {
    const livroData = this.toBackendFormat(livro);

    // Tenta backend
    if (this.backendAvailable) {
      try {
        const response = await fetch(this.backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(livroData),
        });

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            const novoLivro = this.mapLivro(result.data);
            this.cache.push(novoLivro);

            // Atualiza localStorage
            this.salvarNoLocalStorage(this.cache);

            console.log("✅ Livro salvo no backend");
            return novoLivro;
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou, salvando localmente...");
        this.backendAvailable = false;
      }
    }

    // Fallback: salva localmente
    return this.salvarLocalmente(livroData);
  }

  // 🔹 Salva localmente
  salvarLocalmente(livroData) {
    // Gera ID local
    if (!livroData.id) {
      livroData.id =
        "local_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    }

    // Gera ISBN local se não tiver
    if (!livroData.isbn) {
      livroData.isbn = "LOCAL-" + Date.now().toString().slice(-10);
    }

    const novoLivro = this.mapLivro(livroData);
    this.cache.push(novoLivro);
    this.salvarNoLocalStorage(this.cache);

    console.log("💾 Livro salvo localmente");
    return novoLivro;
  }

  // 🔹 Atualiza livro
  async atualizarLivro(id, dados) {
    const livroData = this.toBackendFormat(dados);

    // Tenta backend
    if (this.backendAvailable && !id.startsWith("local_")) {
      try {
        const response = await fetch(`${this.backendUrl}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(livroData),
        });

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            const livroAtualizado = this.mapLivro(result.data);

            // Atualiza cache
            const index = this.cache.findIndex((l) => l.id === id);
            if (index !== -1) {
              this.cache[index] = livroAtualizado;
            }

            // Atualiza localStorage
            this.salvarNoLocalStorage(this.cache);

            console.log("✅ Livro atualizado no backend");
            return livroAtualizado;
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou, atualizando localmente...");
        this.backendAvailable = false;
      }
    }

    // Fallback: atualiza localmente
    return this.atualizarLocalmente(id, livroData);
  }

  // 🔹 Atualiza localmente
  atualizarLocalmente(id, livroData) {
    const index = this.cache.findIndex((l) => l.id === id);

    if (index !== -1) {
      const livroAtualizado = {
        ...this.cache[index],
        ...livroData,
        id: id,
      };

      this.cache[index] = livroAtualizado;
      this.salvarNoLocalStorage(this.cache);

      console.log("📝 Livro atualizado localmente");
      return livroAtualizado;
    }

    console.error("❌ Livro não encontrado");
    return null;
  }

  // 🔹 Exclui livro
  async excluirLivro(id) {
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
            this.cache = this.cache.filter((l) => l.id !== id);

            // Atualiza localStorage
            this.salvarNoLocalStorage(this.cache);

            console.log("✅ Livro excluído do backend");
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
    this.cache = this.cache.filter((l) => l.id !== id);

    if (this.cache.length < inicialLength) {
      this.salvarNoLocalStorage(this.cache);
      console.log("🗑️ Livro excluído localmente");
      return true;
    }

    console.error("❌ Livro não encontrado");
    return false;
  }

  // 🔹 Busca por ID
  async buscarPorId(id) {
    // Tenta cache primeiro
    const cacheLivro = this.cache.find((l) => l.id === id);
    if (cacheLivro) return cacheLivro;

    // Tenta backend
    if (this.backendAvailable && !id.startsWith("local_")) {
      try {
        const response = await fetch(`${this.backendUrl}/${id}`);

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            const livro = this.mapLivro(result.data);
            this.cache.push(livro);
            return livro;
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou na busca por ID");
      }
    }

    // Tenta localStorage
    const localLivros = this.carregarDoLocalStorage();
    const localLivro = localLivros.find((l) => l.id === id);

    return localLivro || null;
  }

  // 🔹 Busca por título
  async buscarPorTitulo(titulo) {
    // Tenta backend
    if (this.backendAvailable) {
      try {
        const response = await fetch(
          `${this.backendUrl}?search=${encodeURIComponent(titulo)}`
        );

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            return result.data.map((livro) => this.mapLivro(livro));
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou na busca por título");
      }
    }

    // Fallback: busca localmente
    return this.cache.filter((livro) =>
      livro.titulo.toLowerCase().includes(titulo.toLowerCase())
    );
  }

  // 🔹 Busca por categoria
  async buscarPorCategoria(categoria) {
    // Tenta backend
    if (this.backendAvailable) {
      try {
        const response = await fetch(
          `${this.backendUrl}?categoria=${encodeURIComponent(categoria)}`
        );

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            return result.data.map((livro) => this.mapLivro(livro));
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend falhou na busca por categoria");
      }
    }

    // Fallback: busca localmente
    return this.cache.filter(
      (livro) => livro.categoria.toLowerCase() === categoria.toLowerCase()
    );
  }

  // 🔹 Formato para backend
  toBackendFormat(livro) {
    if (!livro) return {};

    // Se já estiver no formato correto
    if (livro.titulo) {
      return {
        titulo: livro.titulo,
        isbn: livro.isbn || "",
        autor: livro.autor || livro.autorId || null,
        categoria: livro.categoria || "",
        anoPublicacao: livro.ano || livro.anoPublicacao || null,
        disponivel: livro.disponivel !== false,
      };
    }

    // Se for instância da classe Livro
    return {
      titulo: livro.getTitulo ? livro.getTitulo() : "",
      isbn: livro.getIsbn ? livro.getIsbn() : "",
      autor: livro.getAutorId ? livro.getAutorId() : null,
      categoria: livro.getCategoria ? livro.getCategoria() : "",
      anoPublicacao: livro.getAno ? livro.getAno() : null,
      disponivel: livro.getDisponivel ? livro.getDisponivel() : true,
    };
  }

  // 🔹 Mapeia dados
  mapLivro(livro) {
    // Backend (MongoDB)
    if (livro._id) {
      return {
        id: livro._id,
        titulo: livro.titulo,
        isbn: livro.isbn || "",
        autorId: livro.autor?._id || livro.autor,
        autorNome: livro.autor?.nome || "",
        categoria: livro.categoria || "",
        ano: livro.anoPublicacao || livro.ano || null,
        disponivel: livro.disponivel !== false,
        dataCadastro: livro.dataCadastro || new Date().toISOString(),
        __v: livro.__v || 0,
      };
    }

    // Local
    return {
      id: livro.id,
      titulo: livro.titulo,
      isbn: livro.isbn || "",
      autorId: livro.autorId || livro.autor || null,
      autorNome: livro.autorNome || "",
      categoria: livro.categoria || "",
      ano: livro.ano || livro.anoPublicacao || null,
      disponivel: livro.disponivel !== false,
      dataCadastro: livro.dataCadastro || new Date().toISOString(),
      __v: livro.__v || 0,
    };
  }

  // 🔹 Lista livros (síncrono)
  listar() {
    return this.cache;
  }

  // 🔹 Sincroniza dados locais
  async sincronizar() {
    if (!this.backendAvailable) {
      console.log("Backend indisponível para sincronização");
      return false;
    }

    const localLivros = this.carregarDoLocalStorage();
    const livrosLocaisNaoSincronizados = localLivros.filter((l) =>
      l.id.startsWith("local_")
    );

    if (livrosLocaisNaoSincronizados.length === 0) {
      console.log("✅ Nenhum livro local para sincronizar");
      return true;
    }

    console.log(
      `🔄 Sincronizando ${livrosLocaisNaoSincronizados.length} livros locais...`
    );

    try {
      for (const livroLocal of livrosLocaisNaoSincronizados) {
        const livroParaEnviar = { ...livroLocal };
        delete livroParaEnviar.id;
        delete livroParaEnviar.autorNome;

        // Converte autorId para autor (formato backend)
        if (livroParaEnviar.autorId) {
          livroParaEnviar.autor = livroParaEnviar.autorId;
          delete livroParaEnviar.autorId;
        }

        const response = await fetch(this.backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(livroParaEnviar),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            this.excluirLocalmente(livroLocal.id);
            console.log(`✅ Livro "${livroLocal.titulo}" sincronizado`);
          }
        }
      }

      await this.carregarLivros();
      console.log("🎉 Sincronização de livros concluída!");
      return true;
    } catch (error) {
      console.error("❌ Erro na sincronização:", error);
      return false;
    }
  }
}
