import { Header } from "@/components/Header";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
          <div className="max-w-4xl mx-auto">
             <div className="flex items-center gap-4 mb-8">
                <Mail className="h-8 w-8 text-primary" />
                <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                    Nous contacter
                </h1>
            </div>
            <div className="space-y-6 text-base md:text-lg text-foreground/90">
                <p>
                    Pour toute question ou demande d'information, vous pouvez nous joindre à l'adresse e-mail suivante :
                </p>
                <div className="p-6 bg-card border rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="25" viewBox="0 0 200 25" className="w-[180px] h-auto sm:w-[200px]">
                      <text x="0" y="20" fontFamily="Arial, sans-serif" fontSize="16" fill="hsl(var(--foreground))">
                        happypeople31@free.fr
                      </text>
                    </svg>
                </div>
                 <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800">
                    <h2 className="font-headline text-lg md:text-xl font-semibold mb-3 flex items-center gap-2">
                        Rappel
                    </h2>
                    <p className="text-sm md:text-base">
                        Pour les discussions, l'organisation des sorties et la vie de la communauté, nous vous invitons à rejoindre notre serveur <strong>Discord</strong>.
                    </p>
                </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
