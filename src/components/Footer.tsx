import Link from "next/link";

export function Footer() {
  const footerLinks = [
    { name: "À propos", href: "/about" },
    { name: "Politique de confidentialité", href: "/privacy-policy" },
    { name: "Mentions légales", href: "/legal-notice" },
    { name: "Charte d'utilisation", href: "/terms-of-use" },
    { name: "Nous contacter", href: "/contact" },
  ];

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <p className="text-muted-foreground order-2 md:order-1">
            © {new Date().getFullYear()} Happy People 31. Tous droits réservés.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 order-1 md:order-2">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
