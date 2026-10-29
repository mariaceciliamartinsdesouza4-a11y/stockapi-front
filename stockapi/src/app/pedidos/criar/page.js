"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CriarPedido() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [status, setStatus] = useState("pendente");

  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState("1");

  const [itens, setItens] = useState([]);

  const [carregandoDados, setCarregandoDados] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    async function carregarClientesEProdutos() {
      try {
        setCarregandoDados(true);
        const [resClientes, resProdutos] = await Promise.all([
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/clientes"),
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/produtos")
        ]);

        const dadosClientes = await resClientes.json();
        const dadosProdutos = await resProdutos.json();

        setClientes(Array.isArray(dadosClientes) ? dadosClientes : []);
        setProdutos(Array.isArray(dadosProdutos) ? dadosProdutos : []);
      } catch (e) {
        setMensagemErro("Erro ao carregar clientes e produtos da API.");
      } finally {
        setCarregandoDados(false);
      }
    }

    carregarClientesEProdutos();
  }, []);

  function adicionarItem(e) {
    e.preventDefault();
    setMensagemErro("");

    if (!produtoSelecionado) {
      setMensagemErro("Selecione um produto para adicionar.");
      return;
    }

    const qtdNumero = Number(quantidade);
    if (!qtdNumero || qtdNumero <= 0) {
      setMensagemErro("Informe uma quantidade válida maior que zero.");
      return;
    }

    const produtoEncontrado = produtos.find((p) => String(p.id) === String(produtoSelecionado));
    if (!produtoEncontrado) {
      setMensagemErro("Produto não encontrado.");
      return;
    }

    const novoItem = {
      produto_id: produtoEncontrado.id,
      nome: produtoEncontrado.nome,
      quantidade: qtdNumero,
      preco_unitario: Number(produtoEncontrado.preco) || 0
    };

    setItens([...itens, novoItem]);
    setProdutoSelecionado("");
    setQuantidade("1");
  }

  function removerItem(indexParaRemover) {
    setItens(itens.filter((_, index) => index !== indexParaRemover));
  }

  async function salvarPedido(e) {
    e.preventDefault();
    setMensagemErro("");
    setMensagemSucesso("");

    if (!clienteSelecionado) {
      setMensagemErro("Selecione um cliente para o pedido.");
      return;
    }

    if (itens.length === 0) {
      setMensagemErro("Adicione pelo menos um produto ao pedido.");
      return;
    }

    try {
      setSalvando(true);

      const resPedido = await fetch("https://stock.dev.vilhena.ifro.edu.br/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: Number(clienteSelecionado),
          status: status || "pendente"
        })
      });

      if (!resPedido.ok) {
        const erroJson = await resPedido.json().catch(() => null);
        throw new Error(erroJson?.erro || "Erro ao salvar pedido na API.");
      }

      const pedidoCriado = await resPedido.json();

      for (const item of itens) {
        await fetch("https://stock.dev.vilhena.ifro.edu.br/api/itens_pedido", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pedido_id: Number(pedidoCriado.id),
            produto_id: Number(item.produto_id),
            quantidade: Number(item.quantidade),
            preco_unitario: Number(item.preco_unitario)
          })
        });
      }

      setMensagemSucesso(`Pedido #${pedidoCriado.id} criado com sucesso com ${itens.length} produto(s)!`);
      setClienteSelecionado("");
      setItens([]);
    } catch (e) {
      setMensagemErro(e.message || "Erro ao realizar o pedido.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="card">
        <div className="acoes-topo">
          <h1>Criar Pedido</h1>
          <Link href="/pedidos" className="btn btn-secundario">
            Voltar para Pedidos
          </Link>
        </div>

        {mensagemSucesso && <div className="alerta-sucesso">{mensagemSucesso}</div>}
        {mensagemErro && <div className="alerta-erro">{mensagemErro}</div>}

        {carregandoDados ? (
          <p>Carregando dados da loja...</p>
        ) : (
          <div>
            <form onSubmit={salvarPedido}>
              <div className="campo">
                <label htmlFor="cliente">Cliente *</label>
                <select
                  id="cliente"
                  value={clienteSelecionado}
                  onChange={(e) => setClienteSelecionado(e.target.value)}
                  required
                >
                  <option value="">Selecione um cliente...</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      #{cliente.id} - {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label htmlFor="status">Status do Pedido</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pendente">Pendente</option>
                  <option value="concluido">Concluído</option>
                  <option value="enviado">Enviado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div className="card" style={{ marginTop: "20px", background: "#f8fafc" }}>
                <h2>Adicionar Produtos ao Pedido</h2>

                <div className="campo">
                  <label htmlFor="produto">Produto</label>
                  <select
                    id="produto"
                    value={produtoSelecionado}
                    onChange={(e) => setProdutoSelecionado(e.target.value)}
                  >
                    <option value="">Selecione um produto...</option>
                    {produtos.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} (R$ {Number(produto.preco).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="campo">
                  <label htmlFor="quantidade">Quantidade</label>
                  <input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                  />
                </div>

                <button type="button" onClick={adicionarItem} className="btn">
                  + Adicionar Item ao Pedido
                </button>
              </div>

              <div style={{ marginTop: "20px" }}>
                <h2>Produtos no Pedido Atual ({itens.length})</h2>

                {itens.length === 0 ? (
                  <p style={{ marginTop: "10px", color: "#666" }}>
                    Nenhum produto adicionado ainda. Adicione pelo menos um produto acima.
                  </p>
                ) : (
                  <div className="tabela-container">
                    <table className="tabela">
                      <thead>
                        <tr>
                          <th>Produto</th>
                          <th>Quantidade</th>
                          <th>Preço Unitário</th>
                          <th>Subtotal</th>
                          <th>Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itens.map((item, index) => (
                          <tr key={index}>
                            <td>{item.nome}</td>
                            <td>{item.quantidade}</td>
                            <td>R$ {item.preco_unitario.toFixed(2)}</td>
                            <td>R$ {(item.quantidade * item.preco_unitario).toFixed(2)}</td>
                            <td>
                              <button
                                type="button"
                                onClick={() => removerItem(index)}
                                className="btn btn-perigo"
                              >
                                Remover
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div style={{ marginTop: "25px" }}>
                <button
                  type="submit"
                  className="btn"
                  disabled={salvando}
                  style={{ width: "100%", padding: "12px", fontSize: "16px" }}
                >
                  {salvando ? "Salvando Pedido..." : "Finalizar e Salvar Pedido"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

