import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div>
      <div className={styles.card}>
        <h1>Controle de Estoque</h1>
        <p>Aplicação web para gerenciamento de estoque, produtos, clientes e pedidos.</p>
      </div>

      <div className={styles.card}>
        <h2>Integrantes da Dupla</h2>
        <p className={styles.subtitulo}>Lista dos integrantes do projeto</p>
        <ul className={styles.lista}>
          <li>Maria Cecília Martins de Souza</li>
          <li>Danilo Magalhães Medeiro</li>
        </ul>
      </div>

      <div className={styles.card}>
        <h2>Acesso Rápido</h2>
        <p className={styles.subtitulo}>Lista de botões para atalhos de navegação</p>
        <div className={styles.botoes}>
          <Link href="/pedidos" className={styles.btn}>
            Listar Pedidos
          </Link>
          <Link href="/pedidos/criar" className={styles.btnSecundario}>
            Criar Pedido
          </Link>
          <Link href="/produtos" className={styles.btnSecundario}>
            Produtos
          </Link>
          <Link href="/clientes" className={styles.btnSecundario}>
            Clientes
          </Link>
          <Link href="/categorias" className={styles.btnSecundario}>
            Categorias
          </Link>
        </div>
      </div>
    </div>
  );
}
