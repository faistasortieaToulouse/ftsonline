import { Header } from "@/components/Header";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function LegalNoticePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
          <div className="max-w-4xl mx-auto prose dark:prose-invert">
            <div className="flex items-center gap-4 not-prose mb-8">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                Mentions Légales
              </h1>
            </div>
            
            <p className="lead">Informations légales concernant Tolosa.</p>
            
            <h2>Éditeur du site</h2>
            <address className="not-prose">
              Association Happy People 31<br />
              26, avenue de la Colonne<br />
              31500 Toulouse<br />
              France
            </address>

            <h2>Directeur de la publication</h2>
            <p>Le représentant légal de l'association Happy People 31.</p>

            <h2>Contact</h2>
            <p>Pour toute question, veuillez utiliser le formulaire de contact afin de nous contacter.</p>
            
            <h2>Hébergeur et Infrastructure du site</h2>
            <h3>Hébergement Principal et Déploiement</h3>
            <p>L'hébergement et le déploiement du site (Frontend et API Routes) sont assurés par :</p>
            <address className="not-prose">
                Vercel Inc.<br />
                340 S Lemon Ave #4133<br />
                Walnut, CA 91789, États-Unis
            </address>

            <h3>Services d'Infrastructure Complémentaires</h3>
            <p>L'application utilise également les services suivants :</p>
            <h4>Code Source (GitHub)</h4>
            <address className="not-prose">
              GitHub, Inc.<br />
              88 Colin P Kelly Jr St, San Francisco, CA 94107, États-Unis.
            </address>

            <h4>Services Cloud & API (Google/Firebase)</h4>
            <address className="not-prose">
              Google LLC / Firebase<br />
              1600 Amphitheatre Parkway, Mountain View, CA 94043, USA.
            </address>

            <h2>Note sur le Service et la Communauté</h2>
            <p className="font-bold">IMPORTANT :</p>
            <p>
              Le site sert de portail d'accès et de tableau de bord pour la communauté. L'organisation des sorties, les discussions en temps réel et la modération de la communauté sont gérées exclusivement sur notre serveur Discord. Les utilisateurs sont soumis aux conditions générales d'utilisation et à la politique de confidentialité de Discord pour toutes les activités menées sur ce serveur.
            </p>

            <h2>Propriété intellectuelle</h2>
            <p>L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.</p>

            <h2>Données personnelles</h2>
            <p>Les informations recueillies font l'objet d'un traitement informatique destiné à la gestion des comptes utilisateurs et à la mise en relation des membres. Conformément à la loi "informatique et libertés" du 6 janvier 1978 modifiée, vous bénéficiez d'un droit d'accès et de rectification aux informations qui vous concernent, que vous pouvez exercer en nous contactant à l'adresse email mentionnée ci-dessus.</p>
            
            <h2>Responsabilité</h2>
            <p>Tolosa Amical met tout en œuvre pour offrir aux utilisateurs des informations et/ou des outils disponibles et vérifiés mais ne saurait être tenu pour responsable des erreurs, d'une absence de disponibilité des fonctionnalités ou de la présence de virus sur son site. Les événements et annonces sont publiés sous la seule responsabilité de leurs auteurs.</p>

          </div>
        </div>
      </main>
    </div>
  );
}
