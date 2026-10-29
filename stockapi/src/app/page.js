import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="card">
        <h1>Controle de Estoque</h1>
        <p>Aplicação web para gerenciamento de estoque, produtos, clientes e pedidos.</p>
      </div>

      <div className="card">
        <h2>Integrantes da Dupla</h2>
        <ul className="lista-itens">
          <li>Maria Cecília Martins de Souza</li>
          <li>Integrante da Dupla</li>
        </ul>
      </div>

      <div className="card">
        <h2>Acesso Rápido</h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
          <Link href="/pedidos" className="btn">
            Listar Pedidos
          </Link>
          <Link href="/pedidos/criar" className="btn btn-secundario">
            Criar Pedido
          </Link>
          <Link href="/produtos" className="btn btn-secundario">
            Produtos
          </Link>
          <Link href="/clientes" className="btn btn-secundario">
            Clientes
          </Link>
          <Link href="/categorias" className="btn btn-secundario">
            Categorias
          </Link>
        </div>
      </div>
    </div>
  );
}
