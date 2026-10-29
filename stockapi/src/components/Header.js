"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  function alternarMenu() {
    setMenuAberto(!menuAberto);
  }

  function fecharMenu() {
    setMenuAberto(false);
  }

  return (
    <header className="header">
      <Link href="/" className="logo" onClick={fecharMenu}>
        Controle de Estoque
      </Link>

      <button className="menu-btn" onClick={alternarMenu} aria-label="Abrir menu">
        {menuAberto ? "✕" : "☰"}
      </button>

      <nav className={`nav-links ${menuAberto ? "aberto" : ""}`}>
        <Link href="/" className="nav-link" onClick={fecharMenu}>
          Início
        </Link>
        <Link href="/categorias" className="nav-link" onClick={fecharMenu}>
          Categorias
        </Link>
        <Link href="/produtos" className="nav-link" onClick={fecharMenu}>
          Produtos
        </Link>
        <Link href="/clientes" className="nav-link" onClick={fecharMenu}>
          Clientes
        </Link>
        <Link href="/pedidos" className="nav-link" onClick={fecharMenu}>
          Listar Pedidos
        </Link>
        <Link href="/pedidos/criar" className="nav-link" onClick={fecharMenu}>
          Criar Pedido
        </Link>
      </nav>
    </header>
  );
}

