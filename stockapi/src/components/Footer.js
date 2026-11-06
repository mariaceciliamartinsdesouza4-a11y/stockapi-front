import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.conteudo}>
        <p className={styles.titulo}>Controle de Estoque &bull; 4º Bimestre</p>
        <p className={styles.integrantes}>
          <strong>Integrantes:</strong> Maria Cecília Martins de Souza &bull; Danilo Magalhães Medeiro
        </p>
        <p className={styles.info}>
          IFRO &bull; Campus Vilhena &bull; Front-End
        </p>
      </div>
    </footer>
  );
}

