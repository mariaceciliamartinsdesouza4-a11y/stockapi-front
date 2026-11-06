"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  async function buscarClientes() {
    try {
      setCarregando(true);
      setErro("");
      const res = await fetch("https://stock.dev.vilhena.ifro.edu.br/api/clientes", {
        cache: "no-store"
      });
      if (!res.ok) {
        throw new Error("Erro na resposta da API");
      }
      const dados = await res.json();
      setClientes(Array.isArray(dados) ? dados : []);
    } catch (e) {
      setErro("Não foi possível carregar os clientes. Verifique sua conexão.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    let ativo = true;

    async function carregarInicial() {
      try {
        const res = await fetch("https://stock.dev.vilhena.ifro.edu.br/api/clientes", {
          cache: "no-store"
        });
        if (!res.ok) {
          throw new Error("Erro na resposta da API");
        }
        const dados = await res.json();
        if (ativo) {
          setClientes(Array.isArray(dados) ? dados : []);
        }
      } catch (e) {
        if (ativo) {
          setErro("Não foi possível carregar os clientes. Verifique sua conexão.");
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

  const clientesFiltrados = clientes.filter((cli) => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return true;
    return (
      String(cli.nome || "").toLowerCase().includes(termo) ||
      String(cli.email || "").toLowerCase().includes(termo) ||
      String(cli.telefone || "").toLowerCase().includes(termo)
    );
  });

  return (
    <div className={styles.card}>
      <div className={styles.acoesTopo}>
        <div>
          <h1>Clientes</h1>
          <p className={styles.subtitulo}>
            Tabela de todos os clientes cadastrados na API
          </p>
        </div>
        <div className={styles.botoesTopo}>
          <button
            type="button"
            onClick={buscarClientes}
            className={styles.btnSecundario}
            disabled={carregando}
            title="Recarregar clientes"
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
        <label htmlFor="buscaCliente">Buscar Cliente:</label>
        <input
          id="buscaCliente"
          type="text"
          placeholder="Digite o nome, e-mail ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className={styles.inputBusca}
        />
      </div>

      {carregando && <p className={styles.avisoCarregando}>Carregando clientes da API...</p>}

      {erro && (
        <div className={styles.alertaErro}>
          <p>{erro}</p>
          <button type="button" onClick={buscarClientes} className={styles.btnTentar}>
            Tentar Novamente
          </button>
        </div>
      )}

      {!carregando && !erro && clientes.length === 0 && (
        <p className={styles.avisoVazio}>Nenhum cliente cadastrado.</p>
      )}

      {!carregando && !erro && clientes.length > 0 && clientesFiltrados.length === 0 && (
        <p className={styles.avisoVazio}>Nenhum cliente encontrado para &quot;{busca}&quot;.</p>
      )}

      {!carregando && !erro && clientesFiltrados.length > 0 && (
        <div className={styles.tabelaContainer}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cli) => (
                <tr key={cli.id}>
                  <td>
                    <strong>#{cli.id}</strong>
                  </td>
                  <td>
                    <strong>{cli.nome}</strong>
                  </td>
                  <td>{cli.email || "-"}</td>
                  <td>{cli.telefone || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
