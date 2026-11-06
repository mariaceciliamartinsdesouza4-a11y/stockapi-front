"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [busca, setBusca] = useState("");

  async function buscarProdutos() {
    try {
      setCarregando(true);
      setErro("");
      const [resProdutos, resCategorias] = await Promise.all([
        fetch("https://stock.dev.vilhena.ifro.edu.br/api/produtos", { cache: "no-store" }),
        fetch("https://stock.dev.vilhena.ifro.edu.br/api/categorias", { cache: "no-store" })
      ]);

      if (!resProdutos.ok || !resCategorias.ok) {
        throw new Error("Erro na resposta da API");
      }

      const dadosProdutos = await resProdutos.json();
      const dadosCategorias = await resCategorias.json();

      setProdutos(Array.isArray(dadosProdutos) ? dadosProdutos : []);
      setCategorias(Array.isArray(dadosCategorias) ? dadosCategorias : []);
    } catch (e) {
      setErro("Não foi possível carregar os produtos. Verifique sua conexão.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    let ativo = true;

    async function carregarInicial() {
      try {
        const [resProdutos, resCategorias] = await Promise.all([
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/produtos", { cache: "no-store" }),
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/categorias", { cache: "no-store" })
        ]);

        if (!resProdutos.ok || !resCategorias.ok) {
          throw new Error("Erro na resposta da API");
        }

        const dadosProdutos = await resProdutos.json();
        const dadosCategorias = await resCategorias.json();

        if (ativo) {
          setProdutos(Array.isArray(dadosProdutos) ? dadosProdutos : []);
          setCategorias(Array.isArray(dadosCategorias) ? dadosCategorias : []);
        }
      } catch (e) {
        if (ativo) {
          setErro("Não foi possível carregar os produtos. Verifique sua conexão.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarInicial();

    return () => {
      ativo = false;
    };
  }, []);

  function obterNomeCategoria(categoriaId) {
    const cat = categorias.find((c) => String(c.id) === String(categoriaId));
    return cat ? cat.nome : "-";
  }

  const produtosFiltrados = produtos.filter((prod) => {
    const bateuCategoria =
      filtroCategoria === "todas" || String(prod.categoria_id) === String(filtroCategoria);
    const termoBusca = busca.toLowerCase().trim();
    const bateuBusca =
      !termoBusca ||
      String(prod.nome || "").toLowerCase().includes(termoBusca) ||
      String(prod.descricao || "").toLowerCase().includes(termoBusca);

    return bateuCategoria && bateuBusca;
  });

  return (
    <div className={styles.card}>
      <div className={styles.acoesTopo}>
        <div>
          <h1>Produtos</h1>
          <p className={styles.subtitulo}>
            Tabela de todos os produtos cadastrados na API
          </p>
        </div>
        <div className={styles.botoesTopo}>
          <button
            type="button"
            onClick={buscarProdutos}
            className={styles.btnSecundario}
            disabled={carregando}
            title="Recarregar produtos"
          >
            ↻ Atualizar
          </button>
          <Link href="/" className={styles.btnVoltar}>
            Voltar ao Início
          </Link>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className={styles.barraFiltros}>
        <div className={styles.filtroItem}>
          <label htmlFor="busca">Buscar Produto:</label>
          <input
            id="busca"
            type="text"
            placeholder="Digite o nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.inputBusca}
          />
        </div>

        <div className={styles.filtroItem}>
          <label htmlFor="filtroCategoria">Categoria:</label>
          <select
            id="filtroCategoria"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className={styles.selectFiltro}
          >
            <option value="todas">Todas ({produtos.length})</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {carregando && <p className={styles.avisoCarregando}>Carregando produtos da API...</p>}

      {erro && (
        <div className={styles.alertaErro}>
          <p>{erro}</p>
          <button type="button" onClick={buscarProdutos} className={styles.btnTentar}>
            Tentar Novamente
          </button>
        </div>
      )}

      {!carregando && !erro && produtos.length === 0 && (
        <p className={styles.avisoVazio}>Nenhum produto encontrado na API.</p>
      )}

      {!carregando && !erro && produtos.length > 0 && produtosFiltrados.length === 0 && (
        <p className={styles.avisoVazio}>Nenhum produto corresponde aos filtros aplicados.</p>
      )}

      {!carregando && !erro && produtosFiltrados.length > 0 && (
        <div className={styles.tabelaContainer}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Categoria</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <strong>#{prod.id}</strong>
                  </td>
                  <td>
                    <strong>{prod.nome}</strong>
                  </td>
                  <td className={styles.colunaDescricao}>{prod.descricao || "-"}</td>
                  <td className={styles.colunaPreco}>
                    R$ {Number(prod.preco || 0).toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={
                        prod.quantidade_estoque > 0
                          ? styles.estoqueOk
                          : styles.estoqueZerado
                      }
                    >
                      {prod.quantidade_estoque} un.
                    </span>
                  </td>
                  <td>
                    <span className={styles.badgeCategoria}>
                      {obterNomeCategoria(prod.categoria_id)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
