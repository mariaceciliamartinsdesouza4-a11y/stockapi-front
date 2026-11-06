"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

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
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/clientes", { cache: "no-store" }),
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/produtos", { cache: "no-store" })
        ]);

        if (!resClientes.ok || !resProdutos.ok) {
          throw new Error("Erro na resposta da API.");
        }

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
    if (e) e.preventDefault();
    setMensagemErro("");

    if (!produtoSelecionado) {
      setMensagemErro("Selecione um produto para adicionar ao pedido.");
      return;
    }

    const qtdNumero = parseInt(quantidade, 10);
    if (!qtdNumero || qtdNumero <= 0) {
      setMensagemErro("Informe uma quantidade válida maior que zero.");
      return;
    }

    const produtoEncontrado = produtos.find(
      (p) => String(p.id) === String(produtoSelecionado)
    );
    if (!produtoEncontrado) {
      setMensagemErro("Produto selecionado não encontrado na lista.");
      return;
    }

    // Se o produto já está no carrinho, incrementa a quantidade
    const indexExistente = itens.findIndex(
      (it) => String(it.produto_id) === String(produtoEncontrado.id)
    );

    if (indexExistente >= 0) {
      const novosItens = [...itens];
      novosItens[indexExistente].quantidade += qtdNumero;
      setItens(novosItens);
    } else {
      const novoItem = {
        produto_id: produtoEncontrado.id,
        nome: produtoEncontrado.nome,
        quantidade: qtdNumero,
        preco_unitario: Number(produtoEncontrado.preco) || 0
      };
      setItens([...itens, novoItem]);
    }

    setProdutoSelecionado("");
    setQuantidade("1");
  }

  function removerItem(indexParaRemover) {
    setItens(itens.filter((_, index) => index !== indexParaRemover));
  }

  function calcularTotalGeral() {
    const total = itens.reduce((acc, item) => {
      return acc + item.quantidade * item.preco_unitario;
    }, 0);
    return total.toFixed(2);
  }

  async function salvarPedido(e) {
    e.preventDefault();
    setMensagemErro("");
    setMensagemSucesso("");

    if (!clienteSelecionado) {
      setMensagemErro("Por favor, selecione um cliente para o pedido.");
      return;
    }

    if (itens.length === 0) {
      if (produtoSelecionado) {
        setMensagemErro(
          "Você selecionou um produto, mas precisa clicar no botão '+ Adicionar Item ao Pedido' para inseri-lo na lista antes de salvar."
        );
      } else {
        setMensagemErro("Adicione pelo menos um produto ao pedido antes de salvar.");
      }
      return;
    }

    try {
      setSalvando(true);

      // 1. Criação do Pedido
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
        const msg =
          erroJson?.erro ||
          (Array.isArray(erroJson?.erros) ? erroJson.erros.join(", ") : "Erro ao salvar pedido na API.");
        throw new Error(msg);
      }

      const pedidoCriado = await resPedido.json();

      // 2. Criação dos Itens de Pedido vinculados
      for (const item of itens) {
        const resItem = await fetch("https://stock.dev.vilhena.ifro.edu.br/api/itens_pedido", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pedido_id: Number(pedidoCriado.id),
            produto_id: Number(item.produto_id),
            quantidade: Number(item.quantidade),
            preco_unitario: Number(item.preco_unitario)
          })
        });

        if (!resItem.ok) {
          const erroItemJson = await resItem.json().catch(() => null);
          const msgItem =
            erroItemJson?.erro ||
            (Array.isArray(erroItemJson?.erros)
              ? erroItemJson.erros.join(", ")
              : `Erro ao salvar item '${item.nome}' na API.`);
          throw new Error(msgItem);
        }
      }

      setMensagemSucesso(
        `Pedido #${pedidoCriado.id} criado com sucesso com ${itens.length} item(ns)!`
      );
      setClienteSelecionado("");
      setStatus("pendente");
      setItens([]);
      setProdutoSelecionado("");
      setQuantidade("1");
    } catch (e) {
      setMensagemErro(e.message || "Erro ao realizar o pedido.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className={styles.card}>
        <div className={styles.acoesTopo}>
          <div>
            <h1>Criar Pedido</h1>
            <p className={styles.subtitulo}>
              Selecione o cliente e adicione produtos com suas respectivas quantidades
            </p>
          </div>
          <Link href="/pedidos" className={styles.btnSecundario}>
            Ver Todos os Pedidos
          </Link>
        </div>

        {mensagemSucesso && (
          <div className={styles.alertaSucesso}>
            <span>✓ {mensagemSucesso}</span>
            <Link href="/pedidos" className={styles.linkVerPedidos}>
              Ver na lista de pedidos →
            </Link>
          </div>
        )}

        {mensagemErro && <div className={styles.alertaErro}>{mensagemErro}</div>}

        {carregandoDados ? (
          <p className={styles.avisoCarregando}>Carregando clientes e produtos da API...</p>
        ) : (
          <form onSubmit={salvarPedido}>
            {/* Bloco 1: Seleção do Cliente e Status */}
            <div className={styles.linhaDupla}>
              <div className={styles.campo}>
                <label htmlFor="cliente">
                  Cliente <span className={styles.obrigatorio}>*</span>
                </label>
                <select
                  id="cliente"
                  value={clienteSelecionado}
                  onChange={(e) => setClienteSelecionado(e.target.value)}
                  required
                >
                  <option value="">Selecione um cliente...</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      #{cliente.id} — {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.campo}>
                <label htmlFor="status">Status Inicial do Pedido</label>
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
            </div>

            {/* Bloco 2: Adicionar Produtos ao Pedido */}
            <div className={styles.cardInterno}>
              <div className={styles.tituloInterno}>
                <h2>Adicionar Produtos ao Pedido</h2>
                <p className={styles.subtitulo}>
                  Escolha o produto e a quantidade para compor os itens do pedido
                </p>
              </div>

              <div className={styles.linhaAdicionarItem}>
                <div className={`${styles.campo} ${styles.campoProduto}`}>
                  <label htmlFor="produto">Produto</label>
                  <select
                    id="produto"
                    value={produtoSelecionado}
                    onChange={(e) => setProdutoSelecionado(e.target.value)}
                  >
                    <option value="">Selecione um produto...</option>
                    {produtos.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} — R$ {Number(produto.preco || 0).toFixed(2)} (Estoque: {produto.quantidade_estoque})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={`${styles.campo} ${styles.campoQtd}`}>
                  <label htmlFor="quantidade">Quantidade</label>
                  <input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                  />
                </div>

                <div className={styles.campoBotao}>
                  <button
                    type="button"
                    onClick={adicionarItem}
                    className={styles.btnAdicionar}
                  >
                    + Adicionar Item
                  </button>
                </div>
              </div>
            </div>

            {/* Bloco 3: Lista de Produtos Adicionados (Itens de Pedido) */}
            <div className={styles.secaoLista}>
              <div className={styles.cabecalhoLista}>
                <h2>Itens do Pedido Atual ({itens.length})</h2>
                <p className={styles.subtitulo}>
                  Produtos que serão enviados para a rota <code>/itens_pedido</code>
                </p>
              </div>

              {itens.length === 0 ? (
                <div className={styles.vazioItens}>
                  <p>Nenhum produto adicionado ainda.</p>
                  <span>
                    Utilize o formulário acima para selecionar os produtos e quantidades desejadas.
                  </span>
                </div>
              ) : (
                <div className={styles.tabelaContainer}>
                  <table className={styles.tabela}>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Qtd</th>
                        <th>Preço Unitário</th>
                        <th>Subtotal</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{item.nome}</strong>
                          </td>
                          <td>{item.quantidade}</td>
                          <td>R$ {item.preco_unitario.toFixed(2)}</td>
                          <td>
                            <strong>
                              R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                            </strong>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removerItem(index)}
                              className={styles.btnPerigo}
                              title="Remover produto do pedido"
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className={styles.linhaTotal}>
                        <td colSpan="3" className={styles.textoTotal}>
                          <strong>Total Geral do Pedido:</strong>
                        </td>
                        <td colSpan="2" className={styles.valorTotal}>
                          <strong>R$ {calcularTotalGeral()}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Bloco 4: Botão de Envio */}
            <div className={styles.blocoFinal}>
              <button
                type="submit"
                className={styles.btnSalvar}
                disabled={salvando}
              >
                {salvando ? "Salvando Pedido na API..." : "Finalizar e Salvar Pedido"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
