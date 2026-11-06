"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const [metricas, setMetricas] = useState({
    pedidos: 0,
    produtos: 0,
    clientes: 0,
    categorias: 0,
    carregando: true,
  });

  useEffect(() => {
    async function carregarMetricas() {
      try {
        const [resPedidos, resProdutos, resClientes, resCategorias] = await Promise.all([
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/pedidos", { cache: "no-store" }),
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/produtos", { cache: "no-store" }),
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/clientes", { cache: "no-store" }),
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/categorias", { cache: "no-store" }),
        ]);

        const [pedidos, produtos, clientes, categorias] = await Promise.all([
          resPedidos.ok ? resPedidos.json() : [],
          resProdutos.ok ? resProdutos.json() : [],
          resClientes.ok ? resClientes.json() : [],
          resCategorias.ok ? resCategorias.json() : [],
        ]);

        setMetricas({
          pedidos: Array.isArray(pedidos) ? pedidos.length : 0,
          produtos: Array.isArray(produtos) ? produtos.length : 0,
          clientes: Array.isArray(clientes) ? clientes.length : 0,
          categorias: Array.isArray(categorias) ? categorias.length : 0,
          carregando: false,
        });
      } catch (err) {
        setMetricas((prev) => ({ ...prev, carregando: false }));
      }
    }

    carregarMetricas();
  }, []);

  return (
    <div>
      <div className={styles.card}>
        <h1>Controle de Estoque</h1>
        <p className={styles.descricao}>
          Aplicação web responsiva para controle de estoque e pedidos, desenvolvida
          para a disciplina de Front-End (4º Bimestre).
        </p>
      </div>

      <div className={styles.card}>
        <h2>Integrantes da Dupla</h2>
        <p className={styles.subtitulo}>Alunos responsáveis pelo desenvolvimento do projeto</p>
        <ul className={styles.lista}>
          <li>Maria Cecília Martins de Souza</li>
          <li>Danilo Magalhães Medeiro</li>
        </ul>
      </div>

      <div className={styles.card}>
        <h2>Visão Geral do Sistema (Dados da API)</h2>
        <p className={styles.subtitulo}>Registros carregados em tempo real da API de referência</p>

        {metricas.carregando ? (
          <p className={styles.carregando}>Carregando métricas da API...</p>
        ) : (
          <div className={styles.gridMetricas}>
            <div className={styles.cardMetrica}>
              <span className={styles.numeroMetrica}>{metricas.pedidos}</span>
              <span className={styles.rotuloMetrica}>Pedidos</span>
            </div>
            <div className={styles.cardMetrica}>
              <span className={styles.numeroMetrica}>{metricas.produtos}</span>
              <span className={styles.rotuloMetrica}>Produtos</span>
            </div>
            <div className={styles.cardMetrica}>
              <span className={styles.numeroMetrica}>{metricas.clientes}</span>
              <span className={styles.rotuloMetrica}>Clientes</span>
            </div>
            <div className={styles.cardMetrica}>
              <span className={styles.numeroMetrica}>{metricas.categorias}</span>
              <span className={styles.rotuloMetrica}>Categorias</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.card}>
        <h2>Acesso Rápido às Seções</h2>
        <p className={styles.subtitulo}>Navegue pelas páginas do sistema</p>
        <div className={styles.botoes}>
          <Link href="/pedidos" className={styles.btn}>
            📋 Listar Pedidos
          </Link>
          <Link href="/pedidos/criar" className={styles.btnPrimario}>
            ➕ Criar Novo Pedido
          </Link>
          <Link href="/produtos" className={styles.btnSecundario}>
            📦 Produtos
          </Link>
          <Link href="/clientes" className={styles.btnSecundario}>
            👥 Clientes
          </Link>
          <Link href="/categorias" className={styles.btnSecundario}>
            🏷️ Categorias
          </Link>
        </div>
      </div>
    </div>
  );
}
