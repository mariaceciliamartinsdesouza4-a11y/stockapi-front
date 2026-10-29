"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ListarPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [itensPedido, setItensPedido] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const [resPedidos, resClientes, resProdutos, resItens] = await Promise.all([
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/pedidos"),
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/clientes"),
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/produtos"),
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/itens_pedido")
        ]);

        if (!resPedidos.ok || !resClientes.ok || !resProdutos.ok || !resItens.ok) {
          throw new Error("Erro ao carregar os dados da API.");
        }

        const dadosPedidos = await resPedidos.json();
        const dadosClientes = await resClientes.json();
        const dadosProdutos = await resProdutos.json();
        const dadosItens = await resItens.json();

        setPedidos(Array.isArray(dadosPedidos) ? dadosPedidos : []);
        setClientes(Array.isArray(dadosClientes) ? dadosClientes : []);
        setProdutos(Array.isArray(dadosProdutos) ? dadosProdutos : []);
        setItensPedido(Array.isArray(dadosItens) ? dadosItens : []);
      } catch (e) {
        setErro("Não foi possível carregar os pedidos. Verifique sua conexão.");
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  function obterNomeCliente(clienteId) {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? cliente.nome : `Cliente #${clienteId}`;
  }

  function obterNomeProduto(produtoId) {
    const produto = produtos.find((p) => p.id === produtoId);
    return produto ? produto.nome : `Produto #${produtoId}`;
  }

  function obterItensDoPedido(pedidoId) {
    return itensPedido.filter(
      (item) => item.pedido_numero === pedidoId || item.pedido_id === pedidoId
    );
  }

  function formatarData(dataString) {
    if (!dataString) return "-";
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR") + " " + data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div>
      <div className="card">
        <div className="acoes-topo">
          <h1>Listar Pedidos</h1>
          <Link href="/pedidos/criar" className="btn">
            + Criar Novo Pedido
          </Link>
        </div>

        {carregando && <p>Carregando pedidos...</p>}

        {erro && <div className="alerta-erro">{erro}</div>}

        {!carregando && !erro && pedidos.length === 0 && (
          <p>Nenhum pedido cadastrado no momento.</p>
        )}

        {!carregando && !erro && pedidos.length > 0 && (
          <div className="tabela-container">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Itens do Pedido (Produto e Quantidade)</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => {
                  const itens = obterItensDoPedido(pedido.id);
                  return (
                    <tr key={pedido.id}>
                      <td>#{pedido.id}</td>
                      <td>{obterNomeCliente(pedido.cliente_id)}</td>
                      <td>{formatarData(pedido.data_pedido)}</td>
                      <td>
                        <span className="badge">{pedido.status}</span>
                      </td>
                      <td>
                        {itens.length === 0 ? (
                          <span>Sem itens</span>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {itens.map((item) => (
                              <div key={item.id} className="item-pedido-bloco">
                                <strong>{obterNomeProduto(item.produto_id)}</strong>
                                <div>Quantidade: {item.quantidade}</div>
                                <div>Preço un.: R$ {Number(item.preco_unitario).toFixed(2)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

