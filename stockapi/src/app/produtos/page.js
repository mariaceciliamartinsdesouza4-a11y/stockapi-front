"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarProdutos() {
      try {
        setCarregando(true);
        const [resProdutos, resCategorias] = await Promise.all([
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/produtos"),
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/categorias")
        ]);

        if (!resProdutos.ok || !resCategorias.ok) {
          throw new Error("Erro na resposta da API");
        }

        const dadosProdutos = await resProdutos.json();
        const dadosCategorias = await resCategorias.json();

        setProdutos(Array.isArray(dadosProdutos) ? dadosProdutos : []);
        setCategorias(Array.isArray(dadosCategorias) ? dadosCategorias : []);
      } catch (e) {
        setErro("Não foi possível carregar os produtos.");
      } finally {
        setCarregando(false);
      }
    }

    carregarProdutos();
  }, []);

  function obterNomeCategoria(categoriaId) {
    const cat = categorias.find((c) => c.id === categoriaId);
    return cat ? cat.nome : "-";
  }

  return (
    <div className={styles.card}>
      <div className={styles.acoesTopo}>
        <div>
          <h1>Produtos</h1>
          <p className={styles.subtitulo}>Tabela de todos os produtos cadastrados</p>
        </div>
        <Link href="/" className={styles.btnSecundario}>
          Voltar ao Início
        </Link>
      </div>

      {carregando && <p>Carregando produtos...</p>}
      {erro && <div className={styles.alertaErro}>{erro}</div>}

      {!carregando && !erro && produtos.length === 0 && (
        <p>Nenhum produto encontrado.</p>
      )}

      {!carregando && !erro && produtos.length > 0 && (
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
              {produtos.map((prod) => (
                <tr key={prod.id}>
                  <td>#{prod.id}</td>
                  <td>{prod.nome}</td>
                  <td>{prod.descricao || "-"}</td>
                  <td>R$ {Number(prod.preco || 0).toFixed(2)}</td>
                  <td>{prod.quantidade_estoque}</td>
                  <td>{obterNomeCategoria(prod.categoria_id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
