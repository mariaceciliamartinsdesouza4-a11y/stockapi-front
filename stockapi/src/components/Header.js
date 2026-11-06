"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [dropdownPedidosAberto, setDropdownPedidosAberto] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  function alternarMenu() {
    setMenuAberto(!menuAberto);
  }

  function fecharMenu() {
    setMenuAberto(false);
    setDropdownPedidosAberto(false);
  }

  function alternarDropdownPedidos(e) {
    e.stopPropagation();
    setDropdownPedidosAberto(!dropdownPedidosAberto);
  }

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    function handleClickFora(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownPedidosAberto(false);
      }
    }
    document.addEventListener("click", handleClickFora);
    return () => {
      document.removeEventListener("click", handleClickFora);
    };
  }, []);

  const isHome = pathname === "/";
  const isCategorias = pathname === "/categorias";
  const isProdutos = pathname === "/produtos";
  const isClientes = pathname === "/clientes";
  const isPedidos = pathname === "/pedidos";
  const isCriarPedido = pathname === "/pedidos/criar";
  const isSecaoPedidos = isPedidos || isCriarPedido;

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo} onClick={fecharMenu}>
        <span className={styles.logoIcon}>📦</span> Controle de Estoque
      </Link>

      <button
        className={styles.menuBtn}
        onClick={alternarMenu}
        aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
        aria-expanded={menuAberto}
      >
        {menuAberto ? "✕" : "☰"}
      </button>

      <nav
        className={`${styles.navLinks} ${menuAberto ? styles.aberto : ""}`}
        aria-label="Menu de navegação principal"
      >
        <Link
          href="/"
          className={`${styles.navLink} ${isHome ? styles.ativo : ""}`}
          onClick={fecharMenu}
        >
          Início
        </Link>

        <Link
          href="/categorias"
          className={`${styles.navLink} ${isCategorias ? styles.ativo : ""}`}
          onClick={fecharMenu}
        >
          Categorias
        </Link>

        <Link
          href="/produtos"
          className={`${styles.navLink} ${isProdutos ? styles.ativo : ""}`}
          onClick={fecharMenu}
        >
          Produtos
        </Link>

        <Link
          href="/clientes"
          className={`${styles.navLink} ${isClientes ? styles.ativo : ""}`}
          onClick={fecharMenu}
        >
          Clientes
        </Link>

        {/* Seção Pedidos com Dropdown no Desktop e submenu no Mobile */}
        <div
          className={`${styles.dropdownContainer} ${dropdownPedidosAberto ? styles.dropdownAberto : ""}`}
          ref={dropdownRef}
          onMouseEnter={() => setDropdownPedidosAberto(true)}
          onMouseLeave={() => setDropdownPedidosAberto(false)}
        >
          <div className={styles.dropdownGatilhoWrapper}>
            <Link
              href="/pedidos"
              className={`${styles.navLink} ${isSecaoPedidos ? styles.ativo : ""}`}
              onClick={fecharMenu}
            >
              Pedidos
            </Link>
            <button
              type="button"
              className={styles.dropdownSetaBtn}
              onClick={alternarDropdownPedidos}
              aria-label="Abrir submenu de Pedidos"
              aria-expanded={dropdownPedidosAberto}
            >
              <span className={styles.seta}>{dropdownPedidosAberto ? "▲" : "▼"}</span>
            </button>
          </div>

          <div className={`${styles.dropdownMenu} ${dropdownPedidosAberto ? styles.visivel : ""}`}>
            <Link
              href="/pedidos"
              className={`${styles.dropdownItem} ${isPedidos ? styles.itemAtivo : ""}`}
              onClick={fecharMenu}
            >
              📋 Listar Pedidos
            </Link>
            <Link
              href="/pedidos/criar"
              className={`${styles.dropdownItem} ${isCriarPedido ? styles.itemAtivo : ""}`}
              onClick={fecharMenu}
            >
              ➕ Criar Pedido
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
