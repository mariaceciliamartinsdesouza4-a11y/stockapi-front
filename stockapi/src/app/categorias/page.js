"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarCategorias() {
      try {
        setCarregando(true);
        const res = await fetch("https://stock.dev.vilhena.ifro.edu.br/api/categorias");
        if (!res.ok) {
          throw new Error("Erro na resposta da API");
        }
        const dados = await res.json();
        setCategorias(Array.isArray(dados) ? dados : []);
      } catch (e) {
        setErro("Não foi possível carregar as categorias.");
      } finally {
        setCarregando(false);
      }
    }

    carregarCategorias();
  }, []);

  return (
    <div className="card">
      <div className="acoes-topo">
        <h1>Categorias</h1>
        <Link href="/" className="btn btn-secundario">
          Voltar ao Início
        </Link>
      </div>

      {carregando && <p>Carregando categorias...</p>}
      {erro && <div className="alerta-erro">{erro}</div>}

      {!carregando && !erro && categorias.length === 0 && (
        <p>Nenhuma categoria encontrada.</p>
      )}

      {!carregando && !erro && categorias.length > 0 && (
        <div className="tabela-container">
          <table className="tabela">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome da Categoria</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => (
                <tr key={cat.id}>
                  <td>#{cat.id}</td>
                  <td>{cat.nome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

