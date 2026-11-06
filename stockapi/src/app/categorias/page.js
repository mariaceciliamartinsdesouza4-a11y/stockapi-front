"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  async function buscarCategorias() {
    try {
      setCarregando(true);
      setErro("");
      const res = await fetch("https://stock.dev.vilhena.ifro.edu.br/api/categorias", {
        cache: "no-store"
      });
      if (!res.ok) {
        throw new Error("Erro na resposta da API");
      }
      const dados = await res.json();
      setCategorias(Array.isArray(dados) ? dados : []);
    } catch (e) {
      setErro("Não foi possível carregar as categorias. Verifique sua conexão.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    let ativo = true;

    async function carregarInicial() {
      try {
        const res = await fetch("https://stock.dev.vilhena.ifro.edu.br/api/categorias", {
          cache: "no-store"
        });
        if (!res.ok) {
          throw new Error("Erro na resposta da API");
        }
        const dados = await res.json();
        if (ativo) {
          setCategorias(Array.isArray(dados) ? dados : []);
        }
      } catch (e) {
        if (ativo) {
          setErro("Não foi possível carregar as categorias. Verifique sua conexão.");
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

  const categoriasFiltradas = categorias.filter((cat) => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return true;
    return String(cat.nome || "").toLowerCase().includes(termo);
  });

  return (
    <div className={styles.card}>
      <div className={styles.acoesTopo}>
        <div>
          <h1>Categorias</h1>
          <p className={styles.subtitulo}>
            Tabela de todas as categorias cadastradas na API
          </p>
        </div>
        <div className={styles.botoesTopo}>
          <button
            type="button"
            onClick={buscarCategorias}
            className={styles.btnSecundario}
            disabled={carregando}
            title="Recarregar categorias"
          >
            ↻ Atualizar
          </button>
          <Link href="/" className={styles.btnVoltar}>
            Voltar ao Início
          </Link>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className={styles.barraFiltros}>
        <label htmlFor="buscaCategoria">Buscar Categoria:</label>
        <input
          id="buscaCategoria"
          type="text"
          placeholder="Digite o nome da categoria..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className={styles.inputBusca}
        />
      </div>

      {carregando && <p className={styles.avisoCarregando}>Carregando categorias da API...</p>}

      {erro && (
        <div className={styles.alertaErro}>
          <p>{erro}</p>
          <button type="button" onClick={buscarCategorias} className={styles.btnTentar}>
            Tentar Novamente
          </button>
        </div>
      )}

      {!carregando && !erro && categorias.length === 0 && (
        <p className={styles.avisoVazio}>Nenhuma categoria encontrada.</p>
      )}

      {!carregando && !erro && categorias.length > 0 && categoriasFiltradas.length === 0 && (
        <p className={styles.avisoVazio}>Nenhuma categoria encontrada para &quot;{busca}&quot;.</p>
      )}

      {!carregando && !erro && categoriasFiltradas.length > 0 && (
        <div className={styles.tabelaContainer}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome da Categoria</th>
              </tr>
            </thead>
            <tbody>
              {categoriasFiltradas.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <strong>#{cat.id}</strong>
                  </td>
                  <td>
                    <strong>{cat.nome}</strong>
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
