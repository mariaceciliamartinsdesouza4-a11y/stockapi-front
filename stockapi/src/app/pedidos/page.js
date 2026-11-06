"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function ListarPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [itensPedido, setItensPedido] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  async function buscarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [resPedidos, resClientes, resProdutos, resItens] = await Promise.all([
        fetch("https://stock.dev.vilhena.ifro.edu.br/api/pedidos", { cache: "no-store" }),
        fetch("https://stock.dev.vilhena.ifro.edu.br/api/clientes", { cache: "no-store" }),
        fetch("https://stock.dev.vilhena.ifro.edu.br/api/produtos", { cache: "no-store" }),
        fetch("https://stock.dev.vilhena.ifro.edu.br/api/itens_pedido", { cache: "no-store" })
      ]);

      if (!resPedidos.ok || !resClientes.ok || !resProdutos.ok || !resItens.ok) {
        throw new Error("Erro ao carregar os dados da API.");
      }

      const dadosPedidos = await resPedidos.json();
      const dadosClientes = await resClientes.json();
      const dadosProdutos = await resProdutos.json();
      const dadosItens = await resItens.json();

      const listaPedidos = Array.isArray(dadosPedidos) ? dadosPedidos : [];
      listaPedidos.sort((a, b) => Number(b.id) - Number(a.id));

      setPedidos(listaPedidos);
      setClientes(Array.isArray(dadosClientes) ? dadosClientes : []);
      setProdutos(Array.isArray(dadosProdutos) ? dadosProdutos : []);
      setItensPedido(Array.isArray(dadosItens) ? dadosItens : []);
    } catch (e) {
      setErro("Não foi possível carregar os pedidos. Verifique sua conexão com a API.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    let ativo = true;

    async function carregarInicial() {
      try {
        const [resPedidos, resClientes, resProdutos, resItens] = await Promise.all([
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/pedidos", { cache: "no-store" }),
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/clientes", { cache: "no-store" }),
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/produtos", { cache: "no-store" }),
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/itens_pedido", { cache: "no-store" })
        ]);

        if (!resPedidos.ok || !resClientes.ok || !resProdutos.ok || !resItens.ok) {
          throw new Error("Erro ao carregar os dados da API.");
        }

        const dadosPedidos = await resPedidos.json();
        const dadosClientes = await resClientes.json();
        const dadosProdutos = await resProdutos.json();
        const dadosItens = await resItens.json();

        if (ativo) {
          const listaPedidos = Array.isArray(dadosPedidos) ? dadosPedidos : [];
          listaPedidos.sort((a, b) => Number(b.id) - Number(a.id));

          setPedidos(listaPedidos);
          setClientes(Array.isArray(dadosClientes) ? dadosClientes : []);
          setProdutos(Array.isArray(dadosProdutos) ? dadosProdutos : []);
          setItensPedido(Array.isArray(dadosItens) ? dadosItens : []);
        }
      } catch (e) {
        if (ativo) {
          setErro("Não foi possível carregar os pedidos. Verifique sua conexão com a API.");
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

  function obterNomeCliente(clienteId) {
    const cliente = clientes.find((c) => String(c.id) === String(clienteId));
    return cliente ? cliente.nome : `Cliente #${clienteId}`;
  }

  function obterNomeProduto(produtoId) {
    const produto = produtos.find((p) => String(p.id) === String(produtoId));
    return produto ? produto.nome : `Produto #${produtoId}`;
  }

  function obterItensDoPedido(pedidoId) {
    return itensPedido.filter(
      (item) => String(item.pedido_numero) === String(pedidoId) || String(item.pedido_id) === String(pedidoId)
    );
  }

  function calcularTotalPedido(itens) {
    const total = itens.reduce((acc, item) => {
      const preco = Number(item.preco_unitario || 0);
      const qtd = Number(item.quantidade || 0);
      return acc + preco * qtd;
    }, 0);
    return total.toFixed(2);
  }

  function formatarData(dataString) {
    if (!dataString) return "-";
    const data = new Date(dataString);
    return (
      data.toLocaleDateString("pt-BR") +
      " " +
      data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
  }

  function obterClasseBadge(status) {
    const s = String(status || "").toLowerCase();
    if (s === "concluido") return styles.badgeConcluido;
    if (s === "enviado") return styles.badgeEnviado;
    if (s === "cancelado") return styles.badgeCancelado;
    return styles.badgePendente;
  }

  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (filtroStatus === "todos") return true;
    return String(pedido.status || "").toLowerCase() === filtroStatus;
  });

  return (
    <div>
      <div className={styles.card}>
        <div className={styles.acoesTopo}>
          <div>
            <h1>Listar Pedidos</h1>
            <p className={styles.subtitulo}>
              Tabela de todos os pedidos cadastrados na API com seus respectivos itens
            </p>
          </div>
          <div className={styles.botoesTopo}>
            <button
              type="button"
              onClick={buscarDados}
              className={styles.btnSecundario}
              disabled={carregando}
              title="Recarregar lista da API"
            >
              ↻ Atualizar
            </button>
            <Link href="/pedidos/criar" className={styles.btn}>
              + Criar Novo Pedido
            </Link>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className={styles.barraFiltros}>
          <label htmlFor="filtroStatus" className={styles.labelFiltro}>
            Filtrar por Status:
          </label>
          <select
            id="filtroStatus"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className={styles.selectFiltro}
          >
            <option value="todos">Todos ({pedidos.length})</option>
            <option value="pendente">Pendente</option>
            <option value="concluido">Concluído</option>
            <option value="enviado">Enviado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {carregando && <p className={styles.avisoCarregando}>Carregando pedidos da API...</p>}

        {erro && (
          <div className={styles.alertaErro}>
            <p>{erro}</p>
            <button type="button" onClick={buscarDados} className={styles.btnTentarNovamente}>
              Tentar Novamente
            </button>
          </div>
        )}

        {!carregando && !erro && pedidos.length === 0 && (
          <div className={styles.vazioBloco}>
            <p>Nenhum pedido cadastrado no momento.</p>
            <Link href="/pedidos/criar" className={styles.btn}>
              Criar o Primeiro Pedido
            </Link>
          </div>
        )}

        {!carregando && !erro && pedidos.length > 0 && pedidosFiltrados.length === 0 && (
          <p className={styles.avisoCarregando}>
            Nenhum pedido com status &quot;{filtroStatus}&quot; encontrado.
          </p>
        )}

        {!carregando && !erro && pedidosFiltrados.length > 0 && (
          <div className={styles.tabelaContainer}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Itens do Pedido (Produtos e Quantidades)</th>
                  <th>Total do Pedido</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map((pedido) => {
                  const itens = obterItensDoPedido(pedido.id);
                  const totalPedido = calcularTotalPedido(itens);
                  return (
                    <tr key={pedido.id}>
                      <td className={styles.colunaId}>
                        <strong>#{pedido.id}</strong>
                      </td>
                      <td>{obterNomeCliente(pedido.cliente_id)}</td>
                      <td className={styles.colunaData}>{formatarData(pedido.data_pedido)}</td>
                      <td>
                        <span className={`${styles.badge} ${obterClasseBadge(pedido.status)}`}>
                          {pedido.status}
                        </span>
                      </td>
                      <td>
                        {itens.length === 0 ? (
                          <span className={styles.semItens}>Sem itens vinculados</span>
                        ) : (
                          <div className={styles.itensLista}>
                            {itens.map((item) => (
                              <div key={item.id} className={styles.itemBloco}>
                                <div className={styles.itemProduto}>
                                  <strong>{obterNomeProduto(item.produto_id)}</strong>
                                </div>
                                <div className={styles.itemDetalhes}>
                                  <span>Qtd: <strong>{item.quantidade}</strong></span>
                                  <span>Preço un.: R$ {Number(item.preco_unitario || 0).toFixed(2)}</span>
                                  <span className={styles.subtotalItem}>
                                    Subtotal: R$ {(Number(item.quantidade) * Number(item.preco_unitario || 0)).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className={styles.colunaTotal}>
                        <strong>R$ {totalPedido}</strong>
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
