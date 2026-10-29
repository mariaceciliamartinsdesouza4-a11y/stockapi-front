"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  function alternarMenu() {
    setMenuAberto(!menuAberto);
  }

  function fecharMenu() {
    setMenuAberto(false);
  }

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo} onClick={fecharMenu}>
        Controle de Estoque
      </Link>

      <button className={styles.menuBtn} onClick={alternarMenu} aria-label="Abrir menu">
        {menuAberto ? "✕" : "☰"}
      </button>

      <nav className={`${styles.navLinks} ${menuAberto ? styles.aberto : ""}`} aria-label="Menu de navegação">
        <Link href="/" className={styles.navLink} onClick={fecharMenu}>
          Início
        </Link>
        <Link href="/categorias" className={styles.navLink} onClick={fecharMenu}>
          Categorias
        </Link>
        <Link href="/produtos" className={styles.navLink} onClick={fecharMenu}>
          Produtos
        </Link>
        <Link href="/clientes" className={styles.navLink} onClick={fecharMenu}>
          Clientes
        </Link>
        <Link href="/pedidos" className={styles.navLink} onClick={fecharMenu}>
          Pedidos
        </Link>
        <Link href="/pedidos/criar" className={styles.navLink} onClick={fecharMenu}>
          Criar Pedido
        </Link>
      </nav>
    </header>
  );
}
