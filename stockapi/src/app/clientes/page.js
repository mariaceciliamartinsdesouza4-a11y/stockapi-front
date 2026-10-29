"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarClientes() {
      try {
        setCarregando(true);
        const res = await fetch("https://stock.dev.vilhena.ifro.edu.br/api/clientes");
        if (!res.ok) {
          throw new Error("Erro na resposta da API");
        }
        const dados = await res.json();
        setClientes(Array.isArray(dados) ? dados : []);
      } catch (e) {
        setErro("Não foi possível carregar os clientes.");
      } finally {
        setCarregando(false);
      }
    }

    carregarClientes();
  }, []);

  return (
    <div className="card">
      <div className="acoes-topo">
        <h1>Clientes</h1>
        <Link href="/" className="btn btn-secundario">
          Voltar ao Início
        </Link>
      </div>

      {carregando && <p>Carregando clientes...</p>}
      {erro && <div className="alerta-erro">{erro}</div>}

      {!carregando && !erro && clientes.length === 0 && (
        <p>Nenhum cliente cadastrado.</p>
      )}

      {!carregando && !erro && clientes.length > 0 && (
        <div className="tabela-container">
          <table className="tabela">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cli) => (
                <tr key={cli.id}>
                  <td>#{cli.id}</td>
                  <td>{cli.nome}</td>
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

