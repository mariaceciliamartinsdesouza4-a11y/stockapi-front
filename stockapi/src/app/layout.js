import "./globals.css";
import styles from "./layout.module.css";
import Header from "../components/Header";

export const metadata = {
  title: "Controle de Estoque",
  description: "Aplicação para controle de estoque de loja",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <main className={styles.container}>
          {children}
        </main>
      </body>
    </html>
  );
}
