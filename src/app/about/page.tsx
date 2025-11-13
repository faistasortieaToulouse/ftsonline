import { Header } from "@/components/Header";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

export default function AboutPage() {
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
                <Users className="h-8 w-8 text-primary" />
                <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                    À Propos
                </h1>
            </div>
            <div className="space-y-6 text-base md:text-lg text-foreground/90">
                <p>
                    Bienvenue sur votre application de sorties à Toulouse !
                </p>
                <div className="p-6 bg-card border rounded-lg">
                    <h2 className="font-headline text-xl md:text-2xl font-semibold mb-3 text-primary">Notre Objectif</h2>
                    <p>
                        Notre mission est simple : vous permettre de faire des sorties à Toulouse, d'échanger, de vous informer, mais aussi de pouvoir créer vos propres sorties et de vous y inscrire.
                    </p>
                    <p className="mt-2 font-medium">
                        Tout est entièrement gratuit et sans aucune limite !
                    </p>
                </div>

                <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800">
                    <h2 className="font-headline text-xl md:text-2xl font-semibold mb-3 flex items-center gap-2">
                        Attention !
                    </h2>
                    <p>
                        Pour discuter, échanger et organiser vos sorties, nous utilisons <strong>Discord</strong>. C'est le cœur de notre communauté.
                    </p>
                </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
